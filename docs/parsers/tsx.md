# TSX

To use ESLint with TSX files, first install the [@typescript-eslint/parser](https://typescript-eslint.io/packages/parser). Then, configure ESLint to use this parser for TypeScript files.

In addition, you need to enable `ecmaFeatures.jsx` in the parser options.

To enable eslint-plugin-better-tailwindcss, you need to add it to the plugins section of your eslint configuration and enable the rules you want to use.

```sh
npm i -D @typescript-eslint/parser
```

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
    files: ["**/*.{ts,tsx,cts,mts}"],
    languageOptions: {
      parser: eslintParserTypeScript,
      parserOptions: {
        project: true
      }
    }
  },
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
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
    "parser": "@typescript-eslint/parser",
    "extends": [
      // enable all recommended rules to report a warning
      "plugin:better-tailwindcss/recommended-warn",
      // enable all recommended rules to report an error
      "plugin:better-tailwindcss/recommended-error"
    ],
    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true
      },
      "ecmaVersion": "latest"
    },
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
