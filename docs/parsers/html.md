# HTML

To use ESLint with HTML files, first install the [@html-eslint/parser](https://github.com/yeonjuan/html-eslint/tree/main/packages/parser). Then, configure ESLint to use this parser for HTML files.

To enable eslint-plugin-better-tailwindcss, you need to add it to the plugins section of your eslint configuration and enable the rules you want to use.

```sh
npm i -D @html-eslint/parser
```

<br/>

## Usage

### Flat config

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

```js
// eslint.config.js
import eslintParserHTML from "@html-eslint/parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

export default [
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: eslintParserHTML
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
    "extends": [
      // enable all recommended rules to report a warning
      "plugin:better-tailwindcss/recommended-warn",
      // enable all recommended rules to report an error
      "plugin:better-tailwindcss/recommended-error"
    ],
    "parser": "@html-eslint/parser",
    "plugins": ["better-tailwindcss"],
    "rules": {
      // or configure rules individually
      "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { "printWidth": 100 }]
    },
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
