module.exports = {
  env: {
    es2021: true,
    'jest/globals': true
  },
  extends: ['airbnb-base', 'plugin:json/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier', 'json'],
  rules: {
    'max-len': ['error', { code: 120 }],
    'prettier/prettier': 'error',
    'no-console': 'off',
    camelcase: 'off',
    'prefer-destructuring': 'off',
    'import/extensions': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-await-in-loop': 'off',
    'no-use-before-define': 'off',
    'comma-dangle': 'off',
    semi: ['error', 'never', { beforeStatementContinuationChars: 'always' }]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts']
      }
    }
  }
}
