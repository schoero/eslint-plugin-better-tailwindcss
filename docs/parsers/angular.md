# Angular

- [ESLint](#eslint)
- [Oxlint](#oxlint)

<br/>

## ESLint

### Flat config

To use ESLint with Angular, install [Angular ESLint](https://github.com/angular-eslint/angular-eslint?tab=readme-ov-file#quick-start) and [TypeScript ESLint](https://typescript-eslint.io/getting-started). You can follow the [flat config](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_FLAT_CONFIG.md) setup, which includes rules from the Angular ESLint package or you can add the parser directly by following the steps below.

```sh
npm i -D angular-eslint typescript-eslint
```

To lint Tailwind CSS classes in Angular files, ensure that:

- The `angular-eslint` package is installed and configured.
- The `typescript-eslint` package is installed and configured.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

<br/>

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

```js
// eslint.config.js

import eslintParserAngular from "angular-eslint";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "eslint/config";
import { parser as eslintParserTypeScript } from "typescript-eslint";

export default defineConfig([
  {
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
    }
  },

  {

    files: ["**/*.ts"],
    languageOptions: {
      parser: eslintParserTypeScript,
      parserOptions: {
        project: true
      }
    },
    processor: eslintParserAngular.processInlineTemplates
  },

  {
    files: ["**/*.html"],
    languageOptions: {
      parser: eslintParserAngular.templateParser
    }
  }
]);
```

<br/>

<details>
  <summary>Legacy config</summary>

  <br/>
  
  To use ESLint with Angular using the legacy config, install [Angular ESLint](https://github.com/angular-eslint/angular-eslint?tab=readme-ov-file#quick-start) and [@typescript-eslint/parser](https://typescript-eslint.io/getting-started/legacy-eslint-setup). You can follow the [legacy config](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_ESLINTRC.md) setup, which includes rules from the Angular ESLint package or you can add the parser directly by following the steps below.

  ```sh
  npm i -D angular-eslint @typescript-eslint/parser
  ```

  To lint Tailwind CSS classes in TypeScript files, ensure that:

- The `angular-eslint` package is installed and configured.
- The `@typescript-eslint/parser` is installed and configured.
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

    "settings": {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        "entryPoint": "src/global.css",
        // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
        "tailwindConfig": "tailwind.config.js"
      }
    },

    // if needed, override rules to configure them individually
    // "rules": {
    //   "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { "printWidth": 100 }]
    // },

    "overrides": [
      {
        "files": ["**/*.ts"],
        "parser": "@typescript-eslint/parser",
        "extends": [
          "plugin:@angular-eslint/template/process-inline-templates"
        ]
      },
      {
        "files": ["**/*.html"],
        "parser": "@angular-eslint/template-parser"
      }
    ]
  }
  ```

</details>

<br/>

## Oxlint

Oxlint currently does **not** support Angular templates and inline template processing.
Framework-specific parsers/processors like Angular are not supported in Oxlint yet, so `eslint-plugin-better-tailwindcss` cannot currently lint Angular templates through Oxlint.

You can continue using ESLint for Angular files until Oxlint adds framework parser support.
