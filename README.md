# Tailwind Class Convert

A lightweight Visual Studio Code extension that converts shorthand class names from older projects into Tailwind CSS-compatible class names.

It automatically detects Tailwind CSS workspaces, supports conversion on save, and only converts complete class tokens inside `class` and `className` attributes.

---

## ✨ Features

- Automatically enables itself when Tailwind CSS is detected.
- Converts files automatically when saving.
- Converts the current file or selected class names from the Command Palette.
- Provides a workspace switch in the status bar.
- Supports English and Simplified Chinese.
- Leaves partial matches such as `hellow100` unchanged.

```html
<!-- Before -->
<div class="w100 h200 mt20 hellow100"></div>

<!-- After -->
<div class="w-100 h-200 mt-20 hellow100"></div>
```

---

## 🚀 Usage

### Convert on Save

Open a Tailwind CSS workspace and save a supported file. Conversion is enabled automatically when Tailwind CSS is detected.

### Convert Manually

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Run **Tailwind Class Convert: Convert Current File or Selection**.
3. When text is selected, only the selected class names are converted. Otherwise, the entire file is converted.

### Enable or Disable

Click **Tailwind Convert** in the status bar to enable or disable conversion for the current workspace.

---

## 🔄 Supported Conversions

| Input | Output | Input | Output |
| :--- | :--- | :--- | :--- |
| `w100` | `w-100` | `h200` | `h-200` |
| `mt20` | `mt-20` | `p16` | `p-16` |
| `g8` | `gap-8` | `gap8` | `gap-8` |
| `t10` | `top-10` | `top10` | `top-10` |
| `r10` | `right-10` | `right10` | `right-10` |
| `b10` | `bottom-10` | `bottom10` | `bottom-10` |
| `l10` | `left-10` | `left10` | `left-10` |
| `d12` | `rounded-12` | `rounded12` | `rounded-12` |

Supported spacing prefixes include `m`, `mt`, `mr`, `mb`, `ml`, `p`, `pt`, `pr`, `pb`, and `pl`.

---

## ⚙️ Settings

Open Visual Studio Code Settings and search for **Tailwind Class Convert**.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `tailwindClassConvert.enableMode` | `auto` | Automatically detect Tailwind CSS, always enable, or always disable conversion. |
| `tailwindClassConvert.convertOnSave` | `true` | Convert supported class names when saving. |
| `tailwindClassConvert.showStatusBar` | `true` | Show the workspace switch in the status bar. |
| `tailwindClassConvert.languages` | Common frontend files | Choose which file types can be processed. Use `*` to allow every file type. |

Example:

```json
{
  "tailwindClassConvert.enableMode": "auto",
  "tailwindClassConvert.convertOnSave": true,
  "tailwindClassConvert.showStatusBar": true,
  "tailwindClassConvert.languages": [
    "html",
    "vue",
    "javascriptreact",
    "typescriptreact"
  ]
}
```

---

## 🧭 Detection

Tailwind Class Convert considers a workspace to use Tailwind CSS when it finds one of the following:

- A `tailwind.config.js`, `.cjs`, `.mjs`, or `.ts` file.
- A `tailwindcss` dependency in `package.json`.
- A Tailwind CSS import or directive in a stylesheet.

---

## 📄 Notes

- Only complete class tokens inside `class` and `className` attributes are converted.
- Already converted classes such as `w-100` are left unchanged.
- Variant classes such as `hover:w100` are left unchanged.
- Similar text such as `hellow100` is never partially converted.
