export default [
  {
    files: ["src/**/*.js", "src/**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        alert: "readonly",
        confirm: "readonly",
        Blob: "readonly",
        URLSearchParams: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "off",
      "eqeqeq": "error",
      "no-alert": "warn",
      "no-debugger": "error"
    }
  }
]
