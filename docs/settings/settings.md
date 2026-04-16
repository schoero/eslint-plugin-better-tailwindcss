# Settings

## Table of Contents

- [entryPoint](#entrypoint)
- [tailwindConfig](#tailwindconfig)
- [tsconfig](#tsconfig)
- [cwd](#cwd)
- [detectComponentClasses](#detectcomponentclasses)
- [rootFontSize](#rootfontsize)
- [messageStyle](#messagestyle)
- [selectors](#selectors)

<br />
<br />

The settings object can be used to globally configure shared options across all rules. Global options will always be overridden by rule-specific options.
To set the settings object, add a `settings` key to the eslint config.

<br />
<br />

```jsonc
// eslint.config.js
{
  // "plugins": {... },
  // "rules": { ... },
  "settings": {
    "better-tailwindcss": {
      // ...
    }
  }
}
```

<br />
<br />

### `entryPoint`

  The path to the entry file of the css based tailwind config (eg: `src/global.css`). If not specified, the plugin will fall back to the default configuration. Relative to the [current working directory](#cwd).  
  The tailwind config is used for various rules.

  **Type**: `string`

<br/>

### `tailwindConfig`

  The path to the `tailwind.config.js` file. If not specified, the plugin will try to find it automatically or falls back to the default configuration. Relative to the [current working directory](#cwd).  
  The tailwind config is used for various rules.

  For Tailwind CSS v4 and the css based config, use the [`entryPoint`](#entrypoint) option instead.

  **Type**: `string`
  
<br/>

### `tsconfig`

  The path to the `tsconfig.json` file. If not specified, the plugin will try to find it automatically.  
  Relative to the [current working directory](#cwd).  

  The tsconfig is used to resolve tsconfig [`path`](https://www.typescriptlang.org/tsconfig/#paths) aliases.

  **Type**: `string`  
  **Default**: `undefined`

<br/>

### `cwd`

  The working directory used to resolve `tailwindcss` and related config files (`entryPoint`, `tailwindConfig`, `tsconfig`).

  Resolved relative to the current working directory of the linter process. If not specified, defaults to the linter process working directory.

  **Type**: `string`  
  **Default**: `undefined`

  #### Monorepo support

  In monorepos, the linter process working directory often differs from where `tailwindcss` is actually installed. For example, IDE extensions typically run the linter from the repository root, while CLI scripts run from the package directory.

  The plugin handles this automatically: when `tailwindcss` cannot be found at the configured `cwd`, it falls back to resolving from the directory of the file being linted and walks up the directory tree. This means **most monorepo setups work without any `cwd` configuration**.

  You only need to set `cwd` explicitly when paths like `entryPoint` or `tailwindConfig` can't be resolved from the auto-detected location.

  ```js
  // eslint.config.js — per-package settings in a monorepo
  export default [
    {
      files: ["packages/website/**/*.{js,jsx,ts,tsx}"],
      settings: {
        "better-tailwindcss": {
          cwd: "./packages/website",
          entryPoint: "./src/globals.css"
        }
      }
    },
    {
      files: ["packages/app/**/*.{js,jsx,ts,tsx}"],
      settings: {
        "better-tailwindcss": {
          cwd: "./packages/app",
          entryPoint: "./src/globals.css"
        }
      }
    }
  ];
  ```

<br/>

### `detectComponentClasses`

  Tailwind CSS v4 allows you to define custom [component classes](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes) like `card`, `btn`, `badge` etc.
  
  If you want to create such classes, you can set this option to `true` to allow the rule to detect those classes and not report them as unknown classes.
  
  **Type**: `boolean`  
  **Default**: `false`

<br/>

### `rootFontSize`

The font size of the `<html>` element in pixels. By default, the root font size is `16px` unless it is changed with CSS.
If provided, this will be used to determine if arbitrary values can be replaced with predefined sizing scales.

**Type**: `number | undefined`  
**Default**: `undefined`

<br/>

### `messageStyle`

  Customize how linting messages are displayed.
  
  `"visual"` visualizes whitespaces and line breaks for better readability.  
  `"compact"` displays visual message on a single line, better suitable for CI environments.  
  `"raw"` shows only the raw information without whitespace or line break visualization.  

  **Type**: `"visual" | "compact" | "raw"`  
  **Default**: `"visual"`, `"compact"` in CI environments

<br/>

### `selectors`

  Flat list of selectors that determines where Tailwind class strings are linted.

  This controls what gets linted globally: only string literals matched by these selectors are treated as Tailwind class candidates.

  **Type**: Array of [Selectors](../configuration/advanced.md#selectors)  
  **Default**: See [defaults API](../api/defaults.md)
