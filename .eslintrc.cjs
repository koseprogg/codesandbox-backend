module.exports = {
  extends: ['airbnb-base'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
  },
  env: {
    node: true,
    mocha: true,
  },
  rules: {
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: 'should|expect',
      },
    ],
    'no-underscore-dangle': [
      'error',
      { allow: ['_id'] },
    ],
  },
};
