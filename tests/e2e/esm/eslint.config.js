import eslintParserHTML from "@html-eslint/parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";


export default {
  ...eslintPluginBetterTailwindcss.configs["stylistic-warn"],

  files: ["**/*.html"],
  languageOptions: {
    parser: eslintParserHTML
  }
};
