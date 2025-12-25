# better-tailwindcss/enforce-consistent-important-position

Enforce consistent important position for Tailwind CSS classes. This rule ensures that the important modifier (`!`) is placed consistently either at the beginning (legacy style) or at the end (recommended style) of class names.

Tailwind CSS v4 introduces the "recommended" position as the new standard. This rule helps you migrate to the new syntax or maintain consistency with the legacy format.

<br/>

## Options

### `position`

Controls where the important modifier (`!`) should be placed in class names.

- `legacy`: Places the important modifier at the beginning of the class name.
- `recommended`: Places the important modifier at the end of the class name.

  **Type**: `"legacy" | "recommended"`  
  **Default**: `"recommended"` in Tailwind CSS v4, `"legacy"` in Tailwind CSS v3 and earlier.  

<br/>

<details>
  <summary>Common options</summary>

  <br/>

  These options are common to all rules and can also be set globally via the [`settings` object](../settings/settings.md).

  <br/>

### `attributes`

  The name of the attribute that contains the tailwind classes.  

  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Name](../configuration/advanced.md#name-based-matching) for `"class"` and [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"class", "className"`

  <br/>

### `callees`

  List of function names which arguments should also get linted.
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Matchers](../configuration/advanced.md#types-of-matchers) for `"cc", "clb", "clsx", "cn", "cnb", "ctl", "cva", "cx", "dcnb", "objstr", "tv", "twJoin", "twMerge"`

  <br/>

### `variables`

  List of variable names whose initializer should also get linted.  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**:  [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"className", "classNames", "classes", "style", "styles"`

  <br/>

### `tags`

  List of template literal tag names whose content should get linted.  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: None

  Note: When using the `tags` option, it is recommended to use the [strings Matcher](../configuration/advanced.md#types-of-matchers) for your tag names. This will ensure that nested expressions get linted correctly.

  <br/>

### `entryPoint`

  The path to the entry file of the css based tailwind config (eg: `src/global.css`).  
  If not specified, the plugin will fall back to the default configuration.  

  **Type**: `string`  
  **Default**: `undefined`

  <br/>

### `tailwindConfig`

  The path to the `tailwind.config.js` file. If not specified, the plugin will try to find it automatically or falls back to the default configuration.  
  This can also be set globally via the [`settings` object](../settings/settings.md#tailwindConfig).  

  For tailwindcss v4 and the css based config, use the [`entryPoint`](#entrypoint) option instead.

  **Type**: `string`  
  **Default**: `undefined`

<br/>

### `tsconfig`

  The path to the `tsconfig.json` file. If not specified, the plugin will try to find it automatically.  
  This can also be set globally via the [`settings` object](../settings/settings.md#tsconfig).  

  The tsconfig is used to resolve tsconfig [`path`](https://www.typescriptlang.org/tsconfig/#paths) aliases.

  **Type**: `string`  
  **Default**: `undefined`

</details>

<br/>

## Examples

### Recommended Position

```tsx
// ❌ BAD: with option { "position": "recommended" }
<div class="!text-red-500 hover:!bg-blue-500"></div>;
```

```tsx
// ✅ GOOD: with option { "position": "recommended" }
<div class="text-red-500! hover:bg-blue-500!"></div>;
```

### Legacy Position

```tsx
// ❌ BAD: with option { "position": "legacy" }
<div class="text-red-500! hover:bg-blue-500!"></div>;
```

```tsx
// ✅ GOOD: with option { "position": "legacy" }
<div class="!text-red-500 hover:!bg-blue-500"></div>;
```
