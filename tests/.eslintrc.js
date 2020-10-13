module.exports = {
  env: {
    mocha: true,
  },
  extends: ['plugin:mocha/recommended'],
  rules: {
    'func-names': 'off',
    'no-unused-vars': 'off',
    'mocha/no-hooks-for-single-case': 'off',
    'node/no-unpublished-require': 'off',
  },
};
