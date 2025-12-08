const eslintParserHTML = require("@html-eslint/parser");
const eslintPluginBetterTailwindcss = require("eslint-plugin-better-tailwindcss");


module.exports = {
  ...eslintPluginBetterTailwindcss.configs["stylistic-warn"],

  files: ["**/*.html"],
  languageOptions: {
    parser: eslintParserHTML
  }
};
