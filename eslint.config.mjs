import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: ["dist/*", "vite.config.mjs"],
  },
  {
    files: ["src/**/*.mjs", "eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.nodeBuiltin,
      },
    },
  },
  js.configs.recommended,
  {
    rules: {
      curly: "error",
      eqeqeq: "error",
      "dot-notation": "error",
      "new-cap": "error",
      "no-console": ["error", {allow: ["info", "warn", "error"]}],
      "no-unneeded-ternary": "warn",
      "no-useless-call": "error",
      "no-useless-computed-key": "error",
      "no-var": "error",
      "object-shorthand": "warn",
      "operator-assignment": "warn",
      "prefer-arrow-callback": ["error", {allowNamedFunctions: true}],
      "prefer-rest-params": "error",
    }
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/array-bracket-spacing": "error",
      "@stylistic/arrow-spacing": "error",
      "@stylistic/block-spacing": ["error", "never"],
      "@stylistic/brace-style": "error",
      "@stylistic/comma-spacing": "error",
      "@stylistic/comma-style": "error",
      "@stylistic/computed-property-spacing": "error",
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/eol-last": "error",
      "@stylistic/function-call-spacing": "error",
      "@stylistic/indent": ["error", 2],
      "@stylistic/key-spacing": "error",
      "@stylistic/keyword-spacing": "error",
      "@stylistic/linebreak-style": "error",
      "@stylistic/new-parens": "error",
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/no-trailing-spaces": "warn",
      "@stylistic/no-whitespace-before-property": "error",
      "@stylistic/object-curly-spacing": "error",
      "@stylistic/operator-linebreak": ["error", "after"],
      "@stylistic/quotes": "error",
      "@stylistic/rest-spread-spacing": "error",
      "@stylistic/semi": "error",
      "@stylistic/semi-spacing": "error",
      "@stylistic/semi-style": "error",
      "@stylistic/space-before-blocks": "error",
      "@stylistic/space-before-function-paren": ["error", {anonymous: "always", named: "never", asyncArrow: "always"}],
      "@stylistic/space-in-parens": "error",
      "@stylistic/space-infix-ops": "error",
      "@stylistic/space-unary-ops": "error",
      "@stylistic/spaced-comment": "warn",
      "@stylistic/switch-colon-spacing": "error",
      "@stylistic/template-curly-spacing": "error",
    },
  },
];
