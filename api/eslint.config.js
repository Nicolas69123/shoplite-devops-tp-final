const js = require("@eslint/js");

const nodeGlobals = {
  require: "readonly",
  module: "writable",
  process: "readonly",
  console: "readonly",
  __dirname: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly"
};

const jestGlobals = {
  describe: "readonly",
  test: "readonly",
  expect: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  jest: "readonly"
};

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: nodeGlobals
    },
    rules: {
      // Express identifie un error handler a ses 4 arguments : next est requis
      "no-unused-vars": ["error", { argsIgnorePattern: "^next$" }]
    }
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...nodeGlobals, ...jestGlobals }
    }
  }
];
