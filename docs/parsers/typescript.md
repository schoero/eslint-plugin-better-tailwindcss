# TypeScript

To use ESLint with TypeScript files, first install the [@typescript-eslint/parser](https://typescript-eslint.io/packages/parser).

```sh
npm i -D @typescript-eslint/parser
```

To lint Tailwind CSS classes in TypeScript files, ensure that:

- The `@typescript-eslint/parser` is enabled.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

<br/>

## Usage

### Flat config

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

```js
// eslint.config.js
import eslintParserTypeScript from "@typescript-eslint/parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

export default [
  {
    // enable all recommended rules
    ...eslintPluginBetterTailwindcss.configs.recommended,

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

    files: ["**/*.{ts,tsx,cts,mts}"],

    languageOptions: {
      parser: eslintParserTypeScript,
      parserOptions: {
        project: true
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
    // enable all recommended rules
    "extends": [
      "plugin:better-tailwindcss/legacy-recommended"
    ],

    // override rules to configure them individually
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

    "parser": "@typescript-eslint/parser"

  }
  ```

</details>
