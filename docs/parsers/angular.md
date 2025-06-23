# Angular

To use ESLint with Angular, install [Angular ESLint](https://github.com/angular-eslint/angular-eslint?tab=readme-ov-file#quick-start). You can follow the [flat config](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_FLAT_CONFIG.md) or [legacy config](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_ESLINTRC.md) setup, which includes rules from the Angular ESLint package or you can add the parser directly by following the steps below.

To enable eslint-plugin-better-tailwindcss, you need to add it to the plugins section of your eslint configuration and enable the rules you want to use.

```sh
npm i -D angular-eslint
```

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
  {
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss
    },
    rules: {
      // enable all recommended rules to report a warning
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      // enable all recommended rules to report an error
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,

      // or configure rules individually
      "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { printWidth: 100 }]
    },
    settings: {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        entryPoint: "src/global.css",
        // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
        tailwindConfig: "tailwind.config.js"
      }
    }
  }
];
```

<br/>

<details>
  <summary>Legacy config</summary>

  <br/>

  ```jsonc
  // .eslintrc.json
  {
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
        "extends": [
          // enable all recommended rules to report a warning
          "plugin:better-tailwindcss/recommended-warn",
          // enable all recommended rules to report an error
          "plugin:better-tailwindcss/recommended-error"
        ],
        "parser": "@angular-eslint/template-parser",
        "plugins": ["better-tailwindcss"],
        "rules": {
          // or configure rules individually
          "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { "printWidth": 100 }]
        }
      }
    ],
    "settings": {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        "entryPoint": "src/global.css",
        // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
        "tailwindConfig": "tailwind.config.js"
      }
    }
  }
  ```

</details>

<br/>

### Editor configuration

#### VSCode

  To enable the [VSCode ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) to validate HTML files, add the following to your `.vscode/settings.json`:

  ```jsonc
  {
    // enable ESLint to validate HTML files
    "eslint.validate": [/* ...other formats */, "html"],

    // enable ESLint to fix tailwind classes on save
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  }
  ```
