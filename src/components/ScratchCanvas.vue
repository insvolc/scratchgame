<template>
  <div class="scratch-canvas-container" ref="containerRef">
    <canvas 
      ref="scratchCanvas" 
      class="scratch-canvas"
      @mousedown="startScratch"
      @mousemove="scratch"
      @mouseup="stopScratch"
      @mouseleave="stopScratch"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="stopScratch"
    ></canvas>
    <div class="scratch-content" :style="contentStyle">
      <slot></slot>
    </div>
    <div class="scratch-hint" v-if="!isScratched && scratchPercentage < 50">
      <span>👆 滑动刮开涂层</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{
  width?: number
  height?: number
  brushSize?: number
  revealThreshold?: number
}>()

const emit = defineEmits<{
  (e: 'scratch', percentage: number): void
  (e: 'revealed'): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const scratchCanvas = ref<HTMLCanvasElement | null>(null)
const isScratching = ref(false)
const scratchPercentage = ref(0)
const isScratched = ref(false)
const contentWidth = ref(props.width || 300)
const contentHeight = ref(props.height || 200)

const contentStyle = computed(() => ({
  width: `${contentWidth.value}px`,
  height: `${contentHeight.value}px`
}))

function measureContentSize() {
  const container = containerRef.value
  if (!container) return
  const content = container.querySelector('.scratch-content')
  if (content) {
    const rect = content.getBoundingClientRect()
    contentWidth.value = Math.max(rect.width, props.width || 300)
    contentHeight.value = Math.max(rect.height, props.height || 200)
  }
}

function getPosition(e: MouseEvent | Touch) {
  const canvas = scratchCanvas.value
  if (!canvas) return { x: 0, y: 0 }
  
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function startScratch(e: MouseEvent) {
  if (isScratched.value) return
  isScratching.value = true
  scratch(e)
}

function scratch(e: MouseEvent) {
  if (!isScratching.value || isScratched.value) return
  
  const canvas = scratchCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const pos = getPosition(e)
  const brushSize = props.brushSize || 30
  
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2)
  ctx.fill()
  
  calculateScratchPercentage()
}

function stopScratch() {
  isScratching.value = false
}

function handleTouchStart(e: TouchEvent) {
  if (isScratched.value) return
  e.preventDefault()
  isScratching.value = true
  const touch = e.touches[0]
  scratch({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent)
}

function handleTouchMove(e: TouchEvent) {
  if (!isScratching.value || isScratched.value) return
  e.preventDefault()
  const touch = e.touches[0]
  scratch({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent)
}

function calculateScratchPercentage() {
  const canvas = scratchCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data
  let transparentPixels = 0
  
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) {
      transparentPixels++
    }
  }
  
  const totalPixels = width * height
  scratchPercentage.value = (transparentPixels / totalPixels) * 100
  
  emit('scratch', scratchPercentage.value)
  
  // 不再自动揭示，由玩家通过一键刮开控制
}

function revealAll() {
  const canvas = scratchCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  scratchPercentage.value = 100
}

function initCanvas() {
  measureContentSize()
  nextTick(() => {
    const canvas = scratchCanvas.value
    const container = containerRef.value
    if (!canvas || !container) return
    
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.fillStyle = '#c0c0c0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#a0a0a0'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('刮开此处', canvas.width / 2, canvas.height / 2 - 15)
    ctx.font = '14px Arial'
    ctx.fillText('Scratch Here', canvas.width / 2, canvas.height / 2 + 15)
  })
}

function reset() {
  isScratched.value = false
  scratchPercentage.value = 0
  initCanvas()
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
})

watch(() => [props.width, props.height], () => {
  initCanvas()
})

defineExpose({
  reset,
  revealAll,
  scratchPercentage
})
</script>

<style scoped>
.scratch-canvas-container {
  position: relative;
  display: block;
  border-radius: 10px;
  overflow: hidden;
}

.scratch-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
}

.scratch-content {
  position: relative;
  z-index: 1;
}

.scratch-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 3;
  pointer-events: none;
}
</style>