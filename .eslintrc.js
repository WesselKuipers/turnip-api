module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb-base', 'plugin:eslint-comments/recommended', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  rules: {
    curly: ['error', 'all'],
    'simple-import-sort/sort': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'eslint-comments/no-unused-disable': 'error',
    'eslint-comments/no-use': ['error', { allow: ['eslint-disable-next-line'] }],
    'import/extensions': ['error', 'ignorePackages', { js: 'never', ts: 'never', tsx: 'never' }],
  },
};
