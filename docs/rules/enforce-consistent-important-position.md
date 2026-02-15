# better-tailwindcss/enforce-consistent-important-position

Enforce consistent important position for Tailwind CSS classes. This rule ensures that the important modifier (`!`) is placed consistently either at the beginning (legacy style) or at the end (recommended style) of class names.

Tailwind CSS v4 introduces the "recommended" position as the new standard. This rule helps you migrate to the new syntax or maintain consistency with the legacy format.

<br/>

> [!NOTE]
> This rule might interfere with [`better-tailwindcss/enforce-canonical-classes`](./enforce-canonical-classes.md) if both rules are enabled. It is recommended to use only one of them to avoid conflicting fixes.

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

### `selectors`

  Flat list of selectors that determines where Tailwind class strings are linted.

  **Type**: Array of [Selectors](../configuration/advanced.md#selectors)
  **Default**: See [defaults API](../api/defaults.md)

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

  For Tailwind CSS v4 and the css based config, use the [`entryPoint`](#entrypoint) option instead.

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
