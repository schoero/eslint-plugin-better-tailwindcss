# Astro

## Flat config

To use ESLint with Astro files, first install the [astro-eslint-parser](https://github.com/ota-meshi/astro-eslint-parser) and optionally [TypeScript ESLint](https://typescript-eslint.io/getting-started). Then, configure ESLint to use this parser for Astro files.

```sh
npm i -D astro-eslint-parser typescript-eslint
```

To lint Tailwind CSS classes in Astro files, ensure that:

- The `astro-eslint-parser` is installed and configured.
- The `typescript-eslint` package is installed if you want to lint TypeScript within Astro files.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

<br/>

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

```js
// eslint.config.js

import eslintParserAstro from "astro-eslint-parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { parser as eslintParserTypeScript} from "typescript-eslint";
import { defineConfig } from "eslint/config";

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

  files: ["**/*.astro"],

  languageOptions: {
    parser: eslintParserAstro,
    parserOptions: {
      // optionally use TypeScript parser within for Astro files
      parser: eslintParserTypeScript
    }
  }
});
```

<br/>

<details>
  <summary>Legacy config</summary>

  <br/>

  To use ESLint with Astro files using the legacy config, first install the [astro-eslint-parser](https://github.com/ota-meshi/astro-eslint-parser) and optionally [@typescript-eslint/parser](https://typescript-eslint.io/getting-started/legacy-eslint-setup). Then, configure ESLint to use this parser for Astro files.

  ```sh
  npm i -D astro-eslint-parser @typescript-eslint/parser
  ```

  To lint Tailwind CSS classes in TypeScript files, ensure that:

- The `astro-eslint-parser` is installed and configured.
- The `@typescript-eslint/parser` is installed and configured if you want to lint TypeScript within Astro files.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

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

    "parser": "astro-eslint-parser",

    "parserOptions": {
      // optionally use TypeScript parser within for Astro files
      "parser": "@typescript-eslint/parser"
    }

  }
  ```

</details>
