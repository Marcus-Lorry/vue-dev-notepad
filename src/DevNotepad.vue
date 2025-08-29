<template>
  <!-- Only render in development by default -->
  <div
    v-if="shouldRender"
    ref="notepadRef"
    class="floating-notepad"
    :class="{ 'collapsed': !isVisible, 'minimized': isMinimized }"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      width: isVisible ? size.width + 'px' : '50px',
      height: isVisible ? size.height + 'px' : '50px',
      zIndex: zIndex
    }"
    @mousedown="bringToFront"
  >
    <!-- Collapsed state - just the button -->
    <div
      v-if="!isVisible"
      class="collapsed-button"
      @click="handleCollapsedClick"
      @mousedown="startDrag"
      title="Open Dev Notes"
    >
      📝
    </div>

    <!-- Full notepad state -->
    <template v-else>
      <!-- Header -->
      <div
        ref="headerRef"
        class="notepad-header"
        @mousedown="startDrag"
      >
        <div class="notepad-title">
          <span class="notepad-icon">📝</span>
          <span>Notes</span>
        </div>
        <div class="notepad-controls">
          <button
            class="control-btn minimize-btn"
            @click="toggleMinimize"
            title="Minimize"
          >
            {{ isMinimized ? '□' : '_' }}
          </button>
          <button
            class="control-btn close-btn"
            @click="closeNotepad"
            title="Collapse to button"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-show="!isMinimized" class="notepad-content">
        <textarea
          ref="textareaRef"
          v-model="noteContent"
          class="notepad-textarea"
          placeholder="Quick notes for this page..."
          @input="saveNote"
          @focus="bringToFront"
        />
        
        <!-- Resize Handle -->
        <div
          ref="resizeHandleRef"
          class="resize-handle"
          @mousedown="startResize"
          title="Resize"
        >
          ◢
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  defaultPosition: {
    type: Object,
    default: () => ({ x: 100, y: 100 })
  },
  defaultSize: {
    type: Object,
    default: () => ({ width: 300, height: 250 })
  },
  minWidth: {
    type: Number,
    default: 200
  },
  minHeight: {
    type: Number,
    default: 150
  },
  maxWidth: {
    type: Number,
    default: 600
  },
  maxHeight: {
    type: Number,
    default: 500
  },
  storagePrefix: {
    type: String,
    default: 'dev-notepad'
  },
  devOnly: {
    type: Boolean,
    default: true
  }
})

// Router (optional)
let router
try {
  router = useRouter()
} catch (e) {
  // Vue Router not available, will use window.location instead
  router = null
}

// Refs
const notepadRef = ref(null)
const headerRef = ref(null)
const textareaRef = ref(null)
const resizeHandleRef = ref(null)

// State
const isVisible = ref(true)
const isMinimized = ref(false)
const noteContent = ref('')
const position = ref({ ...props.defaultPosition })
const size = ref({ ...props.defaultSize })
const zIndex = ref(1000)

// Check if should render (dev only by default)
const shouldRender = computed(() => {
  if (!props.devOnly) return true
  return process.env.NODE_ENV === 'development'
})

// Drag state
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// Computed
const currentRoute = computed(() => {
  if (router?.currentRoute?.value?.fullPath) {
    return router.currentRoute.value.fullPath
  }
  return window.location.pathname + window.location.search
})

const storageKey = computed(() => {
  return `${props.storagePrefix}-${currentRoute.value}`
})

// Methods
const loadNoteData = () => {
  try {
    const saved = localStorage.getItem(storageKey.value)
    if (saved) {
      const data = JSON.parse(saved)
      noteContent.value = data.content || ''
      position.value = data.position || props.defaultPosition
      size.value = data.size || props.defaultSize
      isMinimized.value = data.isMinimized || false
      isVisible.value = data.isVisible !== false
    }
  } catch (error) {
    console.warn('Failed to load notepad data:', error)
  }
}

const saveNoteData = () => {
  try {
    const data = {
      content: noteContent.value,
      position: position.value,
      size: size.value,
      isMinimized: isMinimized.value,
      isVisible: isVisible.value,
      lastUpdated: Date.now()
    }
    localStorage.setItem(storageKey.value, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save notepad data:', error)
  }
}

const saveNote = () => {
  saveNoteData()
}

const bringToFront = () => {
  zIndex.value = Math.max(zIndex.value, 9999)
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  saveNoteData()
}

const closeNotepad = () => {
  isVisible.value = false
  saveNoteData()
}

const openNotepad = () => {
  isVisible.value = true
  isMinimized.value = false
  saveNoteData()
}

const handleCollapsedClick = (e) => {
  // Only open if we weren't dragging
  if (!isDragging.value) {
    e.preventDefault()
    e.stopPropagation()
    openNotepad()
  }
}

// Dragging
const startDrag = (e) => {
  if (e.target.closest('.notepad-controls')) return
  
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e) => {
  if (!isDragging.value) return
  
  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y
  
  // Keep within viewport bounds
  const maxX = window.innerWidth - size.value.width
  const maxY = window.innerHeight - size.value.height
  
  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  saveNoteData()
}

// Resizing
const startResize = (e) => {
  isResizing.value = true
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: size.value.width,
    height: size.value.height
  }
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
  e.stopPropagation()
}

const onResize = (e) => {
  if (!isResizing.value) return
  
  const deltaX = e.clientX - resizeStart.value.x
  const deltaY = e.clientY - resizeStart.value.y
  
  const newWidth = Math.max(
    props.minWidth,
    Math.min(props.maxWidth, resizeStart.value.width + deltaX)
  )
  const newHeight = Math.max(
    props.minHeight,
    Math.min(props.maxHeight, resizeStart.value.height + deltaY)
  )
  
  size.value = { width: newWidth, height: newHeight }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  saveNoteData()
}

// Watchers
watch(currentRoute, () => {
  loadNoteData()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadNoteData()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})

// Expose methods for external use
defineExpose({
  openNotepad,
  closeNotepad,
  toggleNotepad: () => {
    isVisible.value = !isVisible.value
    saveNoteData()
  },
  toggleMinimize,
  clearNote: () => {
    noteContent.value = ''
    saveNote()
  },
  isVisible: () => isVisible.value,
  isMinimized: () => isMinimized.value
})
</script>

<style scoped>
.floating-notepad {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
  overflow: hidden;
  transition: all 0.15s ease-out;
  will-change: transform, width, height;
}

.floating-notepad.collapsed {
  cursor: pointer;
  border-radius: 12px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
}

.floating-notepad:not(.collapsed):hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.collapsed-button {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.1s ease-out;
}

.collapsed-button:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

.notepad-header {
  background: #f8f9fa;
  padding: 8px 12px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  height: 32px;
}

.notepad-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 13px;
  color: #2d3748;
}

.notepad-icon {
  font-size: 14px;
}

.notepad-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.1s ease-out;
}

.control-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
  transform: scale(1.02);
}

.minimize-btn:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.close-btn:hover {
  background: #fef2f2;
  border-color: #f87171;
  color: #dc2626;
}

.notepad-content {
  position: relative;
  height: calc(100% - 33px);
  display: flex;
  flex-direction: column;
}

.notepad-textarea {
  flex: 1;
  border: none;
  outline: none;
  background: #ffffff;
  padding: 12px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  color: #1a202c;
  transition: background-color 0.1s ease-out;
}

.notepad-textarea::placeholder {
  color: #9ca3af;
  font-style: normal;
}

.notepad-textarea:focus {
  background: #fafafa;
}

.resize-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  cursor: nw-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #9ca3af;
  transition: all 0.1s ease-out;
}

.resize-handle:hover {
  color: #6b7280;
  transform: scale(1.1);
}

/* Minimized state */
.floating-notepad.minimized {
  height: 33px !important;
}
</style>