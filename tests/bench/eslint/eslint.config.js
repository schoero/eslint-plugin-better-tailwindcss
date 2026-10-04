import eslintParserTypeScript from "@typescript-eslint/parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";


export default {
  ...eslintPluginBetterTailwindcss.configs["recommended"],

  files: ["**/*.jsx"],
  languageOptions: {
    parser: eslintParserTypeScript,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  }
};
