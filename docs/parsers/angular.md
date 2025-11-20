# Angular

To use ESLint with Angular, install [Angular ESLint](https://github.com/angular-eslint/angular-eslint?tab=readme-ov-file#quick-start). You can follow the [flat config](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_FLAT_CONFIG.md) or [legacy config](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_ESLINTRC.md) setup, which includes rules from the Angular ESLint package or you can add the parser directly by following the steps below.

```sh
npm i -D angular-eslint
```

To lint Tailwind CSS classes in Angular files, ensure that:

- The `angular-eslint` parser is enabled.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

<br/>

## Usage

### Flat config

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

```js
// eslint.config.js
import eslintParserTypeScript from "@typescript-eslint/parser";
import eslintParserAngular from "angular-eslint";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

export default [
  {
    // enable all recommended rules
    ...eslintPluginBetterTailwindcss.configs.recommended,

    // override rules to configure them individually
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
  },
];
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

    "settings": {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        "entryPoint": "src/global.css",
        // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
        "tailwindConfig": "tailwind.config.js"
      }
    },

    // override rules to configure them individually
    //  "rules": {
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
        "parser": "@angular-eslint/template-parser",
      }
    ]
  }
  ```

</details>
