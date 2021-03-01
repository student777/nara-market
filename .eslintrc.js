module.exports = {
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "no-console": "off",
  },
  extends: ["eslint:recommended", "airbnb-base", "prettier"],
};
