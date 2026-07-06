<template>
  <div
    class="scratch-canvas-container"
    ref="containerRef"
    @mousedown="startScratch"
    @mousemove="scratch"
    @mouseup="stopScratch"
    @mouseleave="stopScratch"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="stopScratch"
  >
    <canvas
      ref="scratchCanvas"
      class="scratch-canvas"
    ></canvas>
    <div class="scratch-content">
      <slot></slot>
    </div>
    <div class="scratch-hint" v-if="!isScratched && scratchPercentage < revealThreshold">
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
  coatingColor?: string
  coatingTextColor?: string
  coatingPattern?: 'none' | 'xi'
  patternColor?: string
  patternSymbol?: string
  patternRows?: number
  patternCols?: number
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
const revealThreshold = computed(() => props.revealThreshold ?? 80)

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
  
  if (scratchPercentage.value >= revealThreshold.value && !isScratched.value) {
    isScratched.value = true
    console.log('Canvas revealed, percentage:', scratchPercentage.value)
    nextTick(() => {
      emit('revealed')
    })
  }
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
  nextTick(() => {
    requestAnimationFrame(() => {
      const canvas = scratchCanvas.value
      const container = containerRef.value
      if (!canvas || !container) return
      
      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.fillStyle = props.coatingColor || '#c0c0c0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 涂层提示图案
      if (props.coatingPattern === 'xi') {
        drawCoatingPattern(ctx, canvas.width, canvas.height)
      }

      ctx.fillStyle = props.coatingTextColor || '#a0a0a0'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
      ctx.shadowBlur = 4
      ctx.fillText('刮开此处', canvas.width / 2, canvas.height / 2 - 15)
      ctx.font = '14px Arial'
      ctx.fillText('Scratch Here', canvas.width / 2, canvas.height / 2 + 15)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    })
  })
}

function drawCoatingPattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const rows = props.patternRows ?? 5
  const cols = props.patternCols ?? 5
  if (rows <= 0 || cols <= 0) return

  const color = props.patternColor || 'rgba(255, 255, 255, 0.22)'
  const symbol = props.patternSymbol || '囍'
  const paddingX = width * 0.03
  const paddingY = height * 0.03
  const cellW = (width - paddingX * 2) / cols
  const cellH = (height - paddingY * 2) / rows
  const radius = Math.min(cellW, cellH) * 0.40

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = Math.max(1, width * 0.003)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${Math.floor(radius * 1.1)}px Arial`

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = paddingX + cellW * c + cellW / 2
      const cy = paddingY + cellH * r + cellH / 2
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillText(symbol, cx, cy)
    }
  }
  ctx.restore()
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
  display: inline-block;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  touch-action: none;
}

.scratch-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.scratch-content {
  position: relative;
  z-index: 1;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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