# better-tailwindcss/enforce-consistent-class-order

Enforce the order of tailwind classes. It is possible to sort classes alphabetically or logically.

<br/>

## Options

### `order`

- `asc`: Sort classes alphabetically in ascending order.
- `desc`: Sort classes alphabetically in descending order.
- `official`: Sort classes according to the official sorting order from Tailwind CSS based on semantics.
- `strict`: Same as `official` but sorts variants more strictly:
  - Classes that share the same base variants get grouped together.
  - Classes with less variants come before classes with more variants.
  - Classes with arbitrary variants come last.

  **Type**: `"asc" | "desc" | "official" | "strict"`  
  **Default**: `"official"`

<br/>

### `detectComponentClasses`

  Tailwind CSS v4 allows you to define custom [component classes](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes) like `card`, `btn`, `badge` etc.
  
  If you want to create such classes, you can set this option to `true` to allow the rule to detect those classes and not report them as unknown classes. This can also be configured via the [`settings` object](../settings/settings.md).

  **Type**: `boolean`  
  **Default**: `false`

<br/>

### `componentClassOrder`

  Defines how component classes should be ordered among themselves.

- `asc`: Sort component classes alphabetically in ascending order.
- `desc`: Sort component classes alphabetically in descending order.
- `preserve`: Keep component classes in their original order.

  **Type**: `"asc" | "desc" | "preserve"`  
  **Default**: `"preserve"`

<br/>

### `componentClassPosition`

  Defines where component classes should be placed in relation to the whole string literal.

- `start`: Place component classes at the beginning.
- `end`: Place component classes at the end.

  **Type**: `"start" | "end"`  
  **Default**: `"start"`

<br/>

### `unknownClassOrder`

  Defines how unknown classes should be ordered among themselves.

- `asc`: Sort unknown classes alphabetically in ascending order.
- `desc`: Sort unknown classes alphabetically in descending order.
- `preserve`: Keep unknown classes in their original order.

  **Type**: `"asc" | "desc" | "preserve"`  
  **Default**: `"preserve"`

<br/>

### `unknownClassPosition`

  Defines where unknown classes should be placed in relation to the whole string literal.

- `start`: Place unknown classes at the beginning.
- `end`: Place unknown classes at the end.

  **Type**: `"start" | "end"`  
  **Default**: `"start"`

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

```tsx
// ❌ BAD: all classes are in random order
<div class="underline hover:text-opacity-70 focus:font-bold text-black hover:font-bold focus:text-opacity-70"/>;
```

```tsx
// ✅ GOOD: with option { order: 'asc' }
<div class="focus:font-bold focus:text-opacity-70 hover:font-bold hover:text-opacity-70 text-black underline"/>;
```

```tsx
// ✅ GOOD: with option { order: 'desc' }
<div class="underline text-black hover:text-opacity-70 hover:font-bold focus:text-opacity-70 focus:font-bold"/>;
```

```tsx
// ✅ GOOD: with option { order: 'official' }
<div class="text-black underline hover:font-bold hover:text-opacity-70 focus:font-bold focus:text-opacity-70"/>;
```

```tsx
// ✅ GOOD: with option { componentClassPosition: 'start' }
// 'btn' and 'card' are defined as component classes in the tailwind config
<div class="btn card text-black underline"/>;
```

```tsx
// ✅ GOOD: with option { componentClassPosition: 'end' }
// 'btn' and 'card' are defined as component classes in the tailwind config
<div class="text-black underline btn card"/>;
```

```tsx
// ✅ GOOD: with option { unknownClassPosition: 'start' }
// 'unknown-class' is not defined in the tailwind config
<div class="unknown-class text-black underline"/>;
```

```tsx
// ✅ GOOD: with option { unknownClassPosition: 'end' }
// 'unknown-class' is not defined in the tailwind config
<div class="text-black underline unknown-class"/>;
```
