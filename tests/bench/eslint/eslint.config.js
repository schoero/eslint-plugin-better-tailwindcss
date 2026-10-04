import eslintParserTypeScript from "@typescript-eslint/parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";


export default {
  ...eslintPluginBetterTailwindcss.configs["recommended"],

  files: ["**/*.tsx"],
  languageOptions: {
    parser: eslintParserTypeScript,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  }
};
