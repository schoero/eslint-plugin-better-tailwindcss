# better-tailwindcss/enforce-consistent-variable-syntax

Enforce consistent css variable syntax in tailwindcss class strings.

<br/>

> [!NOTE]
> This rule might interfere with [`better-tailwindcss/enforce-canonical-classes`](./enforce-canonical-classes.md) if both rules are enabled. It is recommended to use only one of them to avoid conflicting fixes.

<br/>

## Options

### `syntax`

  The syntax to enforce for css variables in tailwindcss class strings.

  The `shorthand` syntax uses the `(--variable)` syntax in Tailwind CSS v4 and `[--variable]` syntax in Tailwind CSS v3.

  **Type**: `"variable"` | `"shorthand"`  
  **Default**: `"shorthand"`

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
// ❌ BAD: Incorrect css variable syntax with option `syntax: "shorthand"`
<div class="bg-[var(--primary)]" />;
```

```tsx
// ✅ GOOD: With option `syntax: "shorthand"` in Tailwind CSS v4
<div class="bg-(--primary)" />;
```

```tsx
// ✅ GOOD: With option `syntax: "shorthand"` in Tailwind CSS v3
<div class="bg-[--primary]" />;
```

```tsx
// ❌ BAD: Incorrect css variable syntax with option `syntax: "variable"` in Tailwind CSS v4
<div class="bg-(--primary)" />;
```

```tsx
// ❌ BAD: Incorrect css variable syntax with option `syntax: "variable"` in Tailwind CSS v3
<div class="bg-[--primary]" />;
```

```tsx
// ✅ GOOD: With option `syntax: "variable"`
<div class="bg-[var(--primary)]" />;
```
