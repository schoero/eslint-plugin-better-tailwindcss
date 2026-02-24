# JavaScript

- [ESLint](#eslint)
- [Oxlint](#oxlint)

<br/>

## ESLint

To lint Tailwind CSS classes in JavaScript files, ensure that:

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
  }
});
```

<br/>

<details>
  <summary><h3>Legacy config</h3></summary>

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
    }
  }
  ```

</details>

<br/>

## Oxlint

The Oxlint configuration currently requires setting up each rule individually.  
More info about the Oxlint configuration format can be found in the [Oxlint documentation](https://oxc.rs/docs/guide/usage/linter/config.html).

To lint Tailwind CSS classes in JavaScript files, ensure that:

- The plugin is added to the `jsPlugins` array.
- The `settings` object contains the correct Tailwind CSS configuration paths.
- All relevant rules are added to the `rules` object.

<br/>

```js
// oxlint.config.js

import { defineConfig } from "oxlint";

export default defineConfig({
  overrides: [{
    files: ["**/*.{js,cjs,mjs}"],
    jsPlugins: [
      "eslint-plugin-better-tailwindcss"
    ],
    rules: {
      "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { printWidth: 100 }],
      "better-tailwindcss/no-duplicate-classes": "warn"
      // ... add additional rules here
    }
  }],
  settings: {
    "better-tailwindcss": {
      entryPoint: "src/global.css"
    }
  }
});
```
