# CSS

- [ESLint](#eslint)
- [Oxlint](#oxlint)

<br/>

To use ESLint with CSS files containing Tailwind CSS `@apply` directives, first install the [@eslint/css](https://github.com/eslint/css) plugin and the [tailwind-csstree](https://www.npmjs.com/package/tailwind-csstree) custom syntax.

```sh
npm i -D @eslint/css tailwind-csstree
```

To lint Tailwind CSS classes in CSS files, ensure that:

- The `@eslint/css` plugin is installed and configured.
- The `tailwind-csstree` custom syntax is installed and configured.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

<br/>

## ESLint

### Flat config

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

```js
// eslint.config.js

import css from "@eslint/css";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "eslint/config";
import { tailwind4 } from "tailwind-csstree";

export default defineConfig({
  // enable all recommended rules
  extends: [
    eslintPluginBetterTailwindcss.configs.recommended
  ],

  // if needed, override rules to configure them individually
  // rules: {
  //   "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { printWidth: 100 }]
  // },

  settings: {
    "better-tailwindcss": {
      // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
      entryPoint: "src/global.css",
      // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
      tailwindConfig: "tailwind.config.js"
    }
  },

  files: ["**/*.css"],

  language: "css/css",

  languageOptions: {
    customSyntax: tailwind4,
    tolerant: true
  },

  plugins: {
    css
  }
});
```

<br/>

> **Note:** Legacy config is not supported for CSS files as the `@eslint/css` plugin requires the ESLint flat config format.

<br/>

## Oxlint

Oxlint currently does **not** support CSS parser integration for this use case.
Because Oxlint currently only supports JavaScript-like files, `eslint-plugin-better-tailwindcss` cannot currently lint CSS `@apply` directives through Oxlint.

You can continue using ESLint for CSS files until broader parser support is available in Oxlint.
