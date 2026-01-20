export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    rules: {}
  },
  {
    ignores: ["node_modules/", "dist/"]
  }
];

