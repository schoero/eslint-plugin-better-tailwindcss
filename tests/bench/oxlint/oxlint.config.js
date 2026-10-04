import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "oxlint";


export default defineConfig({
  overrides: [{
    files: ["**/*.tsx"],
    jsPlugins: [
      "eslint-plugin-better-tailwindcss"
    ],
    rules: {
      ...eslintPluginBetterTailwindcss.configs.recommended.rules
    }
  }]
});
