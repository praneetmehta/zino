<template>
  <div
    ref="textBoxRef"
    class="floating-text-box"
    :class="{ locked: element.locked, editing: isEditing }"
    :style="boxStyle"
    @mousedown="startDrag"
    @click.stop="emit('edit')"
    @dblclick="startEditing"
    @mouseenter="handleMouseEnter"
  >
    <!-- Resize handles (hidden during export) -->
    <div v-if="!element.locked && !isEditing" class="resize-handles export-hide">
      <div class="resize-handle nw" @mousedown.stop="startResize('nw')"></div>
      <div class="resize-handle ne" @mousedown.stop="startResize('ne')"></div>
      <div class="resize-handle sw" @mousedown.stop="startResize('sw')"></div>
      <div class="resize-handle se" @mousedown.stop="startResize('se')"></div>
    </div>

    <!-- Text content (this is what gets exported) -->
    <div v-if="!isEditing" class="text-display export-content" :style="textStyle">
      {{ element.content || 'Double-click to edit' }}
    </div>
    <textarea
      v-else
      ref="textarea"
      v-model="localContent"
      class="text-editor export-hide"
      :style="textStyle"
      @blur="stopEditing"
      @click.stop
    ></textarea>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useZineStore } from '@/stores/zineStore'
import { FONT_STACK, DEFAULT_TEXT_STYLE } from '@/utils/textRendering'

const props = defineProps({
  element: Object,
  pageId: String,
  pageWidth: Number,
  pageHeight: Number,
})

const emit = defineEmits(['update', 'edit', 'delete', 'editing-change'])

const isEditing = ref(false)
const localContent = ref(props.element.content)
const textarea = ref(null)
const showControls = ref(false)
const textBoxRef = ref(null)

const boxStyle = computed(() => ({
  left: `${props.element.x}%`,
  top: `${props.element.y}%`,
  width: `${props.element.width}%`,
  height: `${props.element.height}%`,
  zIndex: props.element.zIndex,
}))

const textStyle = computed(() => {
  const style = props.element?.style || {}
  const baseStyle = {
    fontFamily: style.fontFamily ? `"${style.fontFamily}", ${FONT_STACK}` : FONT_STACK,
    fontSize: `${style.fontSize || DEFAULT_TEXT_STYLE.fontSize}px`,
    fontWeight: Number(style.fontWeight) || DEFAULT_TEXT_STYLE.fontWeight,
    lineHeight: Number(style.lineHeight) || DEFAULT_TEXT_STYLE.lineHeight,
    textAlign: style.textAlign || DEFAULT_TEXT_STYLE.textAlign,
    color: style.color || DEFAULT_TEXT_STYLE.color,
    backgroundColor: style.backgroundColor || DEFAULT_TEXT_STYLE.backgroundColor,
    padding: style.padding || `${DEFAULT_TEXT_STYLE.padding}px`,
  }
  
  // Add optional properties if present
  if (style.writingMode) baseStyle.writingMode = style.writingMode
  if (style.letterSpacing) baseStyle.letterSpacing = style.letterSpacing
  
  return baseStyle
})

let dragStartX = 0
let dragStartY = 0
let dragStartLeft = 0
let dragStartTop = 0
let resizeStartX = 0
let resizeStartY = 0
let resizeStartWidth = 0
let resizeStartHeight = 0
let resizeStartLeft = 0
let resizeStartTop = 0
let resizeMode = null

const startDrag = (e) => {
  if (props.element.locked || isEditing.value || e.target.closest('.resize-handle') || e.target.closest('.text-controls')) {
    return
  }

  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartLeft = props.element.x
  dragStartTop = props.element.y

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e) => {
  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY
  
  const deltaXPercent = (deltaX / props.pageWidth) * 100
  const deltaYPercent = (deltaY / props.pageHeight) * 100

  const newX = Math.max(0, Math.min(100 - props.element.width, dragStartLeft + deltaXPercent))
  const newY = Math.max(0, Math.min(100 - props.element.height, dragStartTop + deltaYPercent))

  emit('update', { x: newX, y: newY })
}

const stopDrag = () => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const startResize = (mode) => {
  resizeMode = mode
  resizeStartX = event.clientX
  resizeStartY = event.clientY
  resizeStartWidth = props.element.width
  resizeStartHeight = props.element.height
  resizeStartLeft = props.element.x
  resizeStartTop = props.element.y

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const onResize = (e) => {
  const deltaX = e.clientX - resizeStartX
  const deltaY = e.clientY - resizeStartY
  
  const deltaXPercent = (deltaX / props.pageWidth) * 100
  const deltaYPercent = (deltaY / props.pageHeight) * 100

  let updates = {}

  if (resizeMode.includes('e')) {
    updates.width = Math.max(10, Math.min(100 - resizeStartLeft, resizeStartWidth + deltaXPercent))
  }
  if (resizeMode.includes('w')) {
    const newWidth = Math.max(10, resizeStartWidth - deltaXPercent)
    const newX = Math.max(0, resizeStartLeft + (resizeStartWidth - newWidth))
    updates.width = newWidth
    updates.x = newX
  }
  if (resizeMode.includes('s')) {
    updates.height = Math.max(10, Math.min(100 - resizeStartTop, resizeStartHeight + deltaYPercent))
  }
  if (resizeMode.includes('n')) {
    const newHeight = Math.max(10, resizeStartHeight - deltaYPercent)
    const newY = Math.max(0, resizeStartTop + (resizeStartHeight - newHeight))
    updates.height = newHeight
    updates.y = newY
  }

  emit('update', updates)
}

const stopResize = () => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  resizeMode = null
}

const startEditing = () => {
  if (props.element.locked) return
  isEditing.value = true
  emit('editing-change', true)
  localContent.value = props.element.content
  nextTick(() => {
    textarea.value?.focus()
    textarea.value?.select()
  })
}

const stopEditing = () => {
  isEditing.value = false
  emit('editing-change', false)
  if (localContent.value !== props.element.content) {
    emit('update', { content: localContent.value })
  }
}

const toggleLock = () => {
  emit('update', { locked: !props.element.locked })
}

const handleMouseEnter = () => {
  showControls.value = true
}

const handleClickOutside = (event) => {
  if (textBoxRef.value && !textBoxRef.value.contains(event.target)) {
    showControls.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.floating-text-box {
  position: absolute;
  border: 2px dashed var(--border);
  cursor: move;
  transition: border-color 0.2s;
  min-width: 50px;
  min-height: 30px;
  user-select: none;
  -webkit-user-select: none;
}

.floating-text-box:hover {
  border-color: var(--accent);
}

.floating-text-box.locked {
  border: 1px solid rgba(var(--border-rgb, 220, 224, 230), 0.3);
  cursor: default;
}

.floating-text-box.editing {
  border-color: var(--accent);
  border-style: solid;
  cursor: default;
}

/* Hide UI controls during export */
.export-mode .export-hide {
  display: none !important;
}

/* Remove border during export */
.export-mode .floating-text-box {
  border: none !important;
}

.text-display {
  width: 100%;
  height: 100%;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
  pointer-events: none;
}

.text-editor {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-align: inherit;
  color: inherit;
  padding: inherit;
  user-select: text;
  -webkit-user-select: text;
}

.resize-handles {
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--accent);
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: all;
  z-index: 10;
}

.resize-handle.nw {
  top: -6px;
  left: -6px;
  cursor: nw-resize;
}

.resize-handle.ne {
  top: -6px;
  right: -6px;
  cursor: ne-resize;
}

.resize-handle.sw {
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
}

.resize-handle.se {
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
}

.text-controls {
  position: absolute;
  top: -40px;
  right: 0;
  display: flex;
  gap: 4px;
}

.control-btn {
  padding: 6px 10px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.control-btn:hover {
  background: var(--accent);
  transform: scale(1.1);
}

.control-btn.delete:hover {
  background: var(--danger);
}
</style>
