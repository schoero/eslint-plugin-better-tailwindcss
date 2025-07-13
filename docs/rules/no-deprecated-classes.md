# better-tailwindcss/no-deprecated-classes

Disallow the use of [deprecated Tailwind CSS classes](https://tailwindcss.com/docs/upgrade-guide#removed-deprecated-utilities) in Tailwindcss v4.

The following classes will be reported as deprecated:

## Deprecated Utilities

| **Deprecated**             | **Replacement**                               |
|---------------------------|-----------------------------------------------|
| `bg-opacity-*`            | Use opacity modifiers like `bg-black/50`      |
| `text-opacity-*`          | Use opacity modifiers like `text-black/50`    |
| `border-opacity-*`        | Use opacity modifiers like `border-black/50`  |
| `divide-opacity-*`        | Use opacity modifiers like `divide-black/50`  |
| `ring-opacity-*`          | Use opacity modifiers like `ring-black/50`    |
| `placeholder-opacity-*`   | Use opacity modifiers like `placeholder-black/50` |
| `flex-shrink-*`           | `shrink-*`                                    |
| `flex-grow-*`             | `grow-*`                                      |
| `overflow-ellipsis`       | `text-ellipsis`                               |
| `decoration-slice`        | `box-decoration-slice`                        |
| `decoration-clone`        | `box-decoration-clone`                        |

## Renamed Utilities (v3 → v4)

| **v3**                    | **v4**                   |
|--------------------------|--------------------------|
| `shadow`                 | `shadow-sm`              |
| `drop-shadow`            | `drop-shadow-sm`         |
| `blur`                   | `blur-sm`                |
| `backdrop-blur`          | `backdrop-blur-sm`       |
| `rounded`                | `rounded-sm`             |

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

  <br/>

### `tailwindConfig`

  Tailwind config file path.  
  
  **Type**: string  
  **Default**: Tailwind's default config resolution

  <br/>

### `entryPoint`

  Main CSS file that imports Tailwind CSS.  
  
  **Type**: string  
  **Default**: Default CSS lookup

</details>

<br/>

## Examples

```tsx
// ❌ BAD: using deprecated shadow class
<div class="shadow" />;
```

```tsx
// ✅ GOOD: using updated shadow class
<div class="shadow-sm" />;
```

```tsx
// ❌ BAD: using deprecated flex-shrink class
<div class="flex-shrink-1" />;
```

```tsx
// ✅ GOOD: using updated shrink class
<div class="shrink-1" />;
```
