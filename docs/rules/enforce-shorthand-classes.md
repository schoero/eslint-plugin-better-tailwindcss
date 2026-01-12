# better-tailwindcss/enforce-shorthand-classes

This rule identifies when multiple longhand Tailwind CSS classes can be replaced with a single shorthand class, improving code readability and reducing bundle size.

<br/>

> [!NOTE]
> This rule might interfere with [`better-tailwindcss/enforce-canonical-classes`](./enforce-canonical-classes.md) if both rules are enabled. It is recommended to use only one of them to avoid conflicting fixes.

<br/>

## Options

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
// ❌ BAD: using separate padding classes
<div class="pt-4 pr-4 pb-4 pl-4" />;
```

```tsx
// ✅ GOOD: using shorthand padding class
<div class="p-4" />;
```

```tsx
// ❌ BAD: using separate width and height classes
<div class="w-4 h-4" />;
```

```tsx
// ✅ GOOD: using shorthand size class
<div class="size-4" />;
```
