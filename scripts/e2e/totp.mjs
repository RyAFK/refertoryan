import crypto from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(base32) {
  let bits = '';
  for (const char of base32.replace(/=+$/, '').toUpperCase()) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * RFC 6238 TOTP, HMAC-SHA1, 30-second step (the parameters Supabase Auth
 * uses for TOTP enrollment). `timestamp` is milliseconds since epoch,
 * defaulting to now - pass a fixed value for deterministic tests.
 */
export function generateTotp(base32Secret, { digits = 6, period = 30, timestamp = Date.now() } = {}) {
  const key = base32Decode(base32Secret);
  const counter = Math.floor(timestamp / 1000 / period);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binCode % 10 ** digits;
  return otp.toString().padStart(digits, '0');
}
