import nextConfig from 'eslint-config-next';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'src/**/*.jsx', 'remixed-*.tsx'],
  },
  ...nextConfig,
];

export default config;
