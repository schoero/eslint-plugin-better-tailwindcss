# better-tailwindcss/no-unknown-classes

Disallow unknown classes in tailwindcss class strings. Unknown classes are classes that are not defined in your tailwind config file and therefore not recognized by tailwindcss.

<br/>

## Options

### `ignore`

  List of classes that should not report an error. The entries in this list are treated as regular expressions.
  
  **Type**: `string[]`  
  **Default**: `[]`

<br/>

### `detectComponentClasses`

  Tailwindcss v4 allows you to define custom [component classes](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes) like `card`, `btn`, `badge` etc.
  
  If you want to create such classes, you can set this option to `true` to allow the rule to detect those classes and not report them as unknown classes. This can also be configured via the [`settings` object](../settings/settings.md).
  
  **Type**: `boolean`  
  **Default**: `false`

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

```tsx
// ❌ BAD: unknown class
<div class="my-class" />;
```

```tsx
// ✅ GOOD: only valid tailwindcss classes
<div class="font-bold hover:underline" />;
```
