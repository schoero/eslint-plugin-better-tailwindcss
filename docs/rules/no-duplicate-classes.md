# better-tailwindcss/no-duplicate-classes

Disallow duplicate classes in Tailwind CSS class strings.

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
// ❌ BAD: duplicate classes
<div class="rounded underline rounded" />;
```

```tsx
// ✅ GOOD: no duplicate classes
<div class="rounded underline" />;
```

<br/>

> [!NOTE]
> This rule is smart. It is able to detect duplicates across template literal boundaries.

```tsx
// ❌ BAD: duplicate classes in conditional template literal classes and around template elements
<div class={`
  underline italic
  ${someCondition === true ? "rounded  underline font-bold" : "rounded underline font-thin"}
  italic
`} />;
```

```tsx
// ✅ GOOD: no duplicate classes
<div class={`
  underline italic
  ${someCondition === true ? "rounded  font-bold" : "rounded font-thin"}
`} />;
```
