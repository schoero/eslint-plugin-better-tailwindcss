# Svelte

- [ESLint](#eslint)
- [Oxlint](#oxlint)

<br/>

To use ESLint with Svelte files, first install the [svelte-eslint-parser](https://github.com/sveltejs/svelte-eslint-parser).

```sh
npm i -D svelte-eslint-parser
```

To lint Tailwind CSS classes in Svelte files, ensure that:

- The `svelte-eslint-parser` is installed and configured.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

<br/>

## Flat config

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

```js
// eslint.config.js

import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "eslint/config";
import eslintParserSvelte from "svelte-eslint-parser";

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

  files: ["**/*.svelte"],

  languageOptions: {
    parser: eslintParserSvelte
  }
});
```

<br/>

<details>
  <summary>Legacy config</summary>

  <br/>

  ```jsonc
  // .eslintrc.json

  {
    // enable all recommended rules
    "extends": [
      "plugin:better-tailwindcss/legacy-recommended"
    ],

    // if needed, override rules to configure them individually
    // "rules": {
    //   "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { "printWidth": 100 }]
    // },

    "settings": {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        "entryPoint": "src/global.css",
        // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
        "tailwindConfig": "tailwind.config.js"
      }
    },

    "parser": "svelte-eslint-parser"
  }
  ```

</details>

<br/>

## Oxlint

Oxlint currently does **not** support Svelte files (`.svelte`).
Framework-specific parsers like Svelte are not supported in Oxlint yet, so `eslint-plugin-better-tailwindcss` cannot currently lint Svelte templates through Oxlint.

You can continue using ESLint for Svelte files until Oxlint adds framework parser support.
