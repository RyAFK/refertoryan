export async function register() {
  // Only the Node.js server runtime has real environment variables to
  // check; the edge runtime (middleware) and browser never run this.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertProductionReadiness } = await import('@/lib/env');
    assertProductionReadiness();
  }
}
