module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  ignorePatterns: ['/dist/*', 'supabase/functions/**'],
  rules: {
    'import/order': ['warn', { alphabetize: { order: 'asc' } }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
