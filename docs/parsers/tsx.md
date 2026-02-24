# TSX

- [ESLint](#eslint)
- [Oxlint](#oxlint)

<br/>

## ESLint

To use ESLint with TSX files, first install the [typescript-eslint](https://typescript-eslint.io/getting-started) package.

```sh
npm i -D typescript-eslint
```

To lint Tailwind CSS classes in TSX files, ensure that:

- The `typescript-eslint` package is installed and configured.
- `jsx` parsing is enabled in language options.
- The plugin is added to your configuration.
- The `settings` object contains the correct Tailwind CSS configuration paths.

<br/>

### Flat config

Read more about the [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new)

<br/>

```js
// eslint.config.js

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
    }
  }
]);
```

<br/>

<details>
  <summary><h3>Legacy config</h3></summary>

  <br/>

  To use ESLint with TypeScript files using the legacy config, first install the [@typescript-eslint/parser](https://typescript-eslint.io/getting-started/legacy-eslint-setup).

  ```sh
  npm i -D @typescript-eslint/parser
  ```

  To lint Tailwind CSS classes in TypeScript files, ensure that:

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

    "parser": "@typescript-eslint/parser",

    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true
      },
      "ecmaVersion": "latest"
    }

  }
  ```

</details>

<br/>

## Oxlint

More info about the Oxlint configuration format can be found in the [Oxlint documentation](https://oxc.rs/docs/guide/usage/linter/config.html).

To lint Tailwind CSS classes in TSX files, ensure that:

- The plugin is added to the `jsPlugins` array.
- The `settings` object contains the correct Tailwind CSS configuration paths.
- All relevant rules are added to the `rules` object.

<br/>

```ts
// oxlint.config.ts

import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "oxlint";

export default defineConfig({
  overrides: [{
    files: ["**/*.{js,cjs,mjs,ts,tsx,cts,mts}"],
    jsPlugins: [
      "eslint-plugin-better-tailwindcss"
    ],
    rules: {
      // enable all recommended rules
      ...eslintPluginBetterTailwindcss.configs.recommended.rules,

      // if needed, override rules to configure them individually
      "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { printWidth: 100 }]
    }
  }],
  settings: {
    "better-tailwindcss": {
      entryPoint: "src/global.css"
    }
  }
});
```
