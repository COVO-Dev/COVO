module.exports = {
    env: {
      commonjs: true,
      es2021: true,
      node: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    overrides: [
        {
            files: ['*.js'],
            rules: {
                'no-console': 'off',
            },
        }
    ],
  };