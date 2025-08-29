# Vue Dev Notepad

A floating, draggable, and resizable notepad component designed specifically for Vue.js developers with per-page note persistence.

## ✨ Features

- 🖱️ **Draggable** - Click and drag to move around the screen
- 📏 **Resizable** - Resize to your preferred dimensions
- 💾 **Auto-save** - Every keystroke is automatically saved
- 📄 **Per-page notes** - Each route/page has its own separate notepad
- 🔄 **Persistent** - Notes persist across browser sessions
- 🎨 **Sticky note design** - Beautiful yellow sticky note appearance
- ⬇️ **Minimize/Maximize** - Collapse when not needed
- ❌ **Show/Hide** - Close and reopen as needed
- 🎯 **Position memory** - Remembers position and size per page

## 📦 Installation

```bash
npm install vue-dev-notepad
```

## 🚀 Usage

### As a Plugin (Recommended)

```javascript
// main.js
import { createApp } from 'vue'
import { DevNotepad } from 'vue-dev-notepad'
import App from './App.vue'

const app = createApp(App)
app.use(DevNotepad)
app.mount('#app')
```

Then use in any component:

```vue
<template>
  <div>
    <DevNotepad />
  </div>
</template>
```

### As a Component

```vue
<template>
  <div>
    <DevNotepad
      :default-position="{ x: 50, y: 50 }"
      :default-size="{ width: 350, height: 300 }"
    />
  </div>
</template>

<script setup>
import { DevNotepad } from 'vue-dev-notepad'
</script>
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultPosition` | Object | `{ x: 100, y: 100 }` | Initial position when first loaded |
| `defaultSize` | Object | `{ width: 300, height: 250 }` | Initial size when first loaded |
| `minWidth` | Number | `200` | Minimum width constraint |
| `minHeight` | Number | `150` | Minimum height constraint |
| `maxWidth` | Number | `600` | Maximum width constraint |
| `maxHeight` | Number | `500` | Maximum height constraint |
| `storagePrefix` | String | `'dev-notepad'` | localStorage key prefix |

## 🎮 Methods

Access these methods using template refs:

```vue
<template>
  <div>
    <DevNotepad ref="notepadRef" />
    <button @click="clearNotes">Clear Notes</button>
    <button @click="toggleNotepad">Toggle</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DevNotepad } from 'vue-dev-notepad'

const notepadRef = ref(null)

const clearNotes = () => {
  notepadRef.value.clearNote()
}

const toggleNotepad = () => {
  notepadRef.value.toggleMinimize()
}
</script>
```

Available methods:
- `showNotepad()` - Show the notepad
- `closeNotepad()` - Hide the notepad
- `toggleMinimize()` - Toggle minimize state
- `clearNote()` - Clear the current note content

## 💡 How it Works

The notepad automatically detects the current route and stores notes separately for each page. Notes are saved to localStorage with a key pattern:

```
dev-notepad-/your/route/path
```

This means:
- `/home` page has its own notes
- `/about` page has its own notes  
- `/products/123` page has its own notes

## 🎨 Styling

The component comes with a beautiful sticky note design out of the box. If you need to customize the appearance, you can override the CSS classes:

```css
/* Custom styling example */
.floating-notepad {
  /* Your custom styles */
}

.notepad-header {
  /* Header customization */
}

.notepad-textarea {
  /* Textarea customization */
}
```

## 🛠️ Development

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Publishing

1. Update version in `package.json`
2. Build the package: `npm run build`
3. Publish: `npm publish`

## 📋 Requirements

- Vue 3.0+
- Vue Router (for automatic route detection)

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you find any bugs or have feature requests, please create an issue on the GitHub repository.