# Settings

## Table of Contents

- [entryPoint](#entrypoint)
- [tailwindConfig](#tailwindconfig)
- [tsconfig](#tsconfig)
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
{
  "plugins": { /* ... */ },
  "rules": { /* ... */ },
  "settings": {
    "better-tailwindcss": {
      "entryPoint": "...",
      "tailwindConfig": "...",
      "selectors": [/* ... */]
    }
  }
}
```

<br />
<br />

### `entryPoint`

  The path to the entry file of the css based tailwind config (eg: `src/global.css`). If not specified, the plugin will fall back to the default configuration.  
  The tailwind config is used to determine the sorting order.

  **Type**: `string`

<br/>

### `tailwindConfig`

  The path to the `tailwind.config.js` file. If not specified, the plugin will try to find it automatically or falls back to the default configuration.  
  The tailwind config is used to determine the sorting order.

  For Tailwind CSS v4 and the css based config, use the [`entryPoint`](#entrypoint) option instead.

  **Type**: `string`
  
<br/>

### `tsconfig`

  The path to the `tsconfig.json` file. If not specified, the plugin will try to find it automatically.  
  This can also be set globally via the [`settings` object](../settings/settings.md#tsconfig).  

  The tsconfig is used to resolve tsconfig [`path`](https://www.typescriptlang.org/tsconfig/#paths) aliases.

  **Type**: `string`  
  **Default**: `undefined`

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
