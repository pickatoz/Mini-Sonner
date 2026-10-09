# mini-sonner

> A lightweight, production-ready React toast notification library — zero unnecessary dependencies, fully typed, drag to dismiss.

[![npm version](https://img.shields.io/npm/v/mini-sonner.svg?style=flat-square)](https://www.npmjs.com/package/mini-sonner)
[![bundle size](https://img.shields.io/bundlephobia/minzip/mini-sonner?style=flat-square)](https://bundlephobia.com/package/mini-sonner)
[![license](https://img.shields.io/npm/l/mini-sonner.svg?style=flat-square)](https://github.com/pickatoz/Mini-Sonner/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square)](https://www.typescriptlang.org/)

---

## ✨ Features

- ⚡ **Tiny footprint** — minimal bundle, zero unnecessary dependencies
- 🎨 **3 themes** — `light`, `dark`, and `system` (auto)
- 🔔 **Full API** — `success`, `error`, `warning`, `info`, `loading`, `promise`, `custom`
- 👆 **Drag to dismiss** — swipe the toast away in any direction
- ⏸️ **Pause on hover** — timer pauses while the cursor is over the toast
- 🎬 **Promise toasts** — auto-updates from loading → success/error
- 🧩 **Custom JSX** — render any React element as a toast
- 📦 **Dual output** — ESM + CJS + TypeScript `.d.ts` bundled with Rollup

---

## 📦 Installation

```bash
npm install mini-sonner
# or
pnpm add mini-sonner
# or
yarn add mini-sonner
```

---

## 🚀 Quick Start

### Step 1 — Wrap your app with `<SonnerContainer>`

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerContainer } from "mini-sonner";
import "mini-sonner/styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SonnerContainer autoClose={3000} closeButton theme="light">
      <App />
    </SonnerContainer>
  </StrictMode>
);
```

### Step 2 — Trigger toasts from anywhere

```tsx
import { sonner } from "mini-sonner";

// Basic
sonner("Event has been created");
sonner.success("Changes saved!");
sonner.error("Something went wrong.");
sonner.warning("Session expiring soon.");
sonner.info("New update available.");
sonner.loading("Uploading...");

// Dismiss
sonner.dismiss();        // dismiss all
sonner.dismiss(toastId); // dismiss specific
```

---

## 📖 API Reference

### `<SonnerContainer>` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | — | Your app component tree |
| `autoClose` | `number \| false` | `2500` | Auto-dismiss duration in ms (`false` to disable) |
| `theme` | `'light' \| 'dark' \| 'system'` | `'light'` | Color theme |
| `closeButton` | `boolean` | `false` | Show × close button on all toasts |
| `hideIcons` | `boolean` | `false` | Hide type icons globally |
| `pauseOnHover` | `boolean` | `true` | Pause timer on mouse hover |
| `className` | `string` | — | Extra CSS class for the toaster container |
| `style` | `CSSProperties` | — | Inline styles for the toaster container |
| `toastOptions` | `ToastOptions` | — | Default options applied to every toast |
| `toastClassNames` | `ToastClassNames` | — | Default CSS classes for toast elements |

---

### Toast Options

Pass options as the second argument to any `sonner.*` call:

```tsx
sonner.success("Profile updated!", {
  description: "Your changes have been saved.",
  autoClose: 5000,
  closeButton: true,
  action: {
    label: "Undo",
    onClick: () => console.log("Undo!"),
  },
  cancel: {
    label: "Dismiss",
    onClick: () => {},
  },
});
```

| Option | Type | Description |
| :--- | :--- | :--- |
| `description` | `ReactNode` | Secondary text below the message |
| `autoClose` | `number \| false` | Per-toast duration override |
| `closeButton` | `boolean` | Show × button on this toast |
| `hideIcon` | `boolean` | Hide icon on this toast |
| `icon` | `ReactNode` | Custom icon element |
| `id` | `string \| number` | Reuse to update an existing toast |
| `className` | `string` | Custom CSS class on the toast |
| `style` | `CSSProperties` | Inline styles on the toast |
| `action` | `{ label, onClick }` | Primary action button |
| `cancel` | `{ label, onClick }` | Secondary dismiss button |
| `onDismiss` | `(toast) => void` | Callback on dismiss |
| `onAutoClose` | `(toast) => void` | Callback on auto-close |

---

### Promise Toast

Automatically transitions through loading → success / error states:

```tsx
sonner.promise(
  fetch("/api/save").then((r) => r.json()),
  {
    loading: "Saving...",
    success: (data) => `Saved ${data.name}!`,
    error: (err) => `Error: ${err.message}`,
  }
);
```

The `success` and `error` values can be:
- A **string** — displayed as the message
- A **function** `(result) => string | ReactNode` — dynamic message from response
- A **`ToastOptions` object** — full control over the resolved toast

---

### Custom JSX Toast

```tsx
sonner.custom(
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <span>🎉</span>
    <strong>Congrats! You just earned a badge.</strong>
  </div>
);
```

---

### Update a Toast

Pass the same `id` to replace an existing toast:

```tsx
const id = sonner.loading("Uploading...");

// Later...
sonner.success("Upload complete!", { id });
```

---

## 🎨 Theming

```tsx
// Light theme (default)
<SonnerContainer theme="light" />

// Dark theme
<SonnerContainer theme="dark" />

// Follow system preference
<SonnerContainer theme="system" />
```

---

## 💅 Custom Styling

### Per-toast class names

```tsx
sonner.success("Styled toast!", {
  className: "my-custom-toast",
});
```

### Global class names via `toastClassNames`

```tsx
<SonnerContainer
  toastClassNames={{
    toast: "my-toast",
    message: "my-message",
    description: "my-desc",
    closeButton: "my-close",
    icon: "my-icon",
  }}
/>
```

### Override CSS variables

```css
:root {
  --mini-sonner-bg-light: #ffffff;
  --mini-sonner-text-light: #0f172a;
  --mini-sonner-border-light: rgba(226, 232, 240, 0.95);
  --mini-sonner-shadow-light: 0 4px 12px rgba(0, 0, 0, 0.08);

  --mini-sonner-bg-dark: #0f172a;
  --mini-sonner-text-dark: #f8fafc;
  --mini-sonner-border-dark: rgba(51, 65, 85, 0.95);

  --mini-sonner-border-success: #16a34a;
  --mini-sonner-border-error: #dc2626;
  --mini-sonner-border-warning: #ea580c;
  --mini-sonner-border-info: #2563eb;
  --mini-sonner-border-loading: #4f46e5;
}
```

---

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/pickatoz/Mini-Sonner.git
cd Mini-Sonner

# Install dependencies
pnpm install

# Build the library
pnpm build

# Watch mode (for library development)
pnpm dev

# Run the example app
cd examples/react
pnpm install
pnpm dev
```

---

## 📄 License

MIT © [Pickatoz](https://github.com/pickatoz)
