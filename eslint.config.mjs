import next from 'eslint-config-next';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      'public/**',
    ],
  },
  ...next,
];

export default config;
