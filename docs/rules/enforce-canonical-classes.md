# better-tailwindcss/enforce-canonical-classes

Implements the [canonical suggestions](https://github.com/tailwindlabs/tailwindcss/pull/19059) from Tailwind CSS `^4.1.15`.
A canonical class is a simpler representation of a less optimal way of writing the same class. This can be the case when arbitrary values or variants are used while a predefined value exists for example.

> [!NOTE]
>
> - This rule is identical to `suggestCanonicalClasses` from the [TailwindCSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) VSCode extension.  
>   It is recommended to disable `suggestCanonicalClasses` in your projects `.vscode/settings.json` to avoid confusion:
>
>   ```jsonc
>   {
>     "tailwindCSS.lint.suggestCanonicalClasses": "ignore"
>   }
>   ```
>
> - The rule covers multiple other rules.  
>   It is recommended to disable the following rules to avoid duplicate reports:
>   - [`better-tailwindcss/enforce-shorthand-classes`](./enforce-shorthand-classes.md)
>   - [`better-tailwindcss/enforce-consistent-important-position`](./enforce-consistent-important-position.md)
>   - [`better-tailwindcss/enforce-consistent-variable-syntax`](./enforce-consistent-variable-syntax.md)
>
> - The canonical suggestions are based on the internal logic of Tailwind CSS and it possible that the suggestions can change in future versions of Tailwindcss.
> - Configurability is also limited to what Tailwind CSS exposes via their API.
> - The rule comes with a [startup cost of around ~1s](https://github.com/tailwindlabs/tailwindcss/pull/19059#:~:text=performance).

<br/>

## Options

<br/>

### `rootFontSize`

The root font size in pixels. If provided, this will be used to determine if arbitrary values can be replaced with predefined sizing scales.

**Type**: `number | undefined`  
**Default**: `undefined`

<br/>

### `collapse`

Whether to collapse multiple utilities into a single utility if possible.  
If set to `true`, it is recommended to disable the [`better-tailwindcss/enforce-shorthand-classes`](./enforce-shorthand-classes.md) rule to avoid duplicate reports.

**Type**: `boolean`  
**Default**: `true`

<br/>

### `logical`

Whether to convert between logical and physical properties when collapsing utilities.

**Type**: `boolean`  
**Default**: `true`

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

</details>

<br/>

## Examples

```tsx
// ❌ BAD: using unnecessary arbitrary value
<div class="[display:flex]" />;
```

```tsx
// ✅ GOOD: using canonical class for display flex
<div class="flex" />;
```

```tsx
// ❌ BAD: using unnecessary arbitrary data attribute variant
<div class="data-[is-selected]:opacity-100" />;
```

```tsx
// ✅ GOOD: using canonical data attribute variant
<div class="data-is-selected:opacity-100" />;
```

```tsx
// ❌ BAD: using arbitrary value for spacing
<div class="mt-[16px]" />;
```

```tsx
// ✅ GOOD: using canonical class for spacing (with rootFontSize: 16)
<div class="mt-4" />;
```

```tsx
// ❌ BAD: using multiple utilities for margin
<div class="mt-2 mr-2 mb-2 ml-2" />;
```

```tsx
// ✅ GOOD: using collapsed utility for margin (with collapse: true)
<div class="m-2" />;
```

```tsx
// ❌ BAD: using physical properties for margin
<div class="mr-2 ml-2" />;
```

```tsx
// ✅ GOOD: using logical properties for margin (with logicalToPhysical: true)
<div class="mx-2" />;
```
