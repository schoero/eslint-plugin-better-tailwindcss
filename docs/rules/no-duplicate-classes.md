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

### `selectors`

  Flat list of selectors that determines where Tailwind class strings are linted.

  **Type**: Array of [Selectors](../configuration/advanced.md#selectors)
  **Default**: See [defaults API](../api/defaults.md)

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
