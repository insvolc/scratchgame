<template>
  <div class="scratch-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <h1 class="page-title">刮奖</h1>
      <div class="coins-display">
        <span class="coins-icon">💰</span>
        <span class="coins-count">{{ coins }}</span>
      </div>
    </header>
    
    <main class="main-content" v-if="currentLottery">
      <div class="lottery-container">
        <div class="lottery-frame">
          <div class="lottery-header">
            <span class="lottery-name">{{ currentLottery.lotteryName }}</span>
            <span class="lottery-price">面值：{{ getLotteryPrice(currentLottery.lotteryId) }}金币</span>
          </div>
          
          <!-- 好运十倍 - 数字匹配（符合现实玩法） -->
          <div v-if="currentLottery.myNumbers" class="game-area">
            <div class="lucky-ten-layout">
              <div class="lucky-row winning-row">
                <div class="lucky-label">中奖号码</div>
                <div class="scratch-wrapper winning-scratch">
                  <ScratchCanvas 
                    v-if="!currentLottery.isScratched"
                    :brush-size="25"
                    @revealed="() => onAreaRevealed('winning')"
                  >
                    <div class="winning-numbers-row">
                      <div 
                        v-for="(num, index) in currentLottery.winningNumbers" 
                        :key="'win-num-' + index"
                        class="winning-num-cell"
                      >
                        <span class="win-num-text">{{ num.value }}</span>
                      </div>
                    </div>
                  </ScratchCanvas>
                  <div v-else class="winning-numbers-row">
                    <div 
                      v-for="(num, index) in currentLottery.winningNumbers" 
                      :key="'win-num-' + index"
                      class="winning-num-cell"
                    >
                      <span class="win-num-text">{{ num.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="lucky-row">
                <div class="lucky-label">我的号码</div>
                <div class="scratch-wrapper">
                  <ScratchCanvas 
                    v-if="!currentLottery.isScratched"
                    :brush-size="25"
                    @revealed="() => onAreaRevealed('mynumbers')"
                  >
                    <div class="my-numbers-grid">
                      <div 
                        v-for="(num, index) in currentLottery.myNumbers" 
                        :key="'num-' + index"
                        class="number-cell-with-prize"
                        :class="{ winning: selectedMyNumbers.has(index) }"
                      >
                        <span class="num-value">{{ num.value }}</span>
                        <span class="num-prize">{{ num.prize }}💰</span>
                      </div>
                    </div>
                  </ScratchCanvas>
                  <div v-else class="my-numbers-grid">
                    <div 
                      v-for="(num, index) in currentLottery.myNumbers" 
                      :key="'num-' + index"
                      class="number-cell-with-prize"
                      :class="{ winning: selectedMyNumbers.has(index) }"
                      @click="handleNumberClick(index)"
                    >
                      <span class="num-value">{{ num.value }}</span>
                      <span class="num-prize">{{ num.prize }}💰</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="match-result" v-if="currentLottery.isScratched">
              <span class="match-count">匹配 {{ getMatchCount(currentLottery) }} 个号码</span>
              <span class="total-prize">共获得 {{ getTotalPrize(currentLottery) }} 金币</span>
            </div>
          </div>
          
          <!-- 点石成金 - 找符号 -->
          <div v-if="currentLottery.symbolAreas" class="game-area">
            <div class="area-title">💎 找出三个金块</div>
            <div class="symbol-areas">
              <div 
                v-for="(area, areaIdx) in currentLottery.symbolAreas" 
                :key="'area-' + areaIdx"
                class="symbol-area-item"
              >
                <div class="area-prize">奖金：{{ area.prize }}</div>
                <div class="scratch-wrapper">
                  <ScratchCanvas 
                    v-if="!currentLottery.isScratched"
                    @revealed="() => onAreaRevealed('symbol-' + areaIdx)"
                  >
                    <div class="symbols-grid">
                      <div 
                        v-for="(sym, cellIdx) in area.symbols" 
                        :key="'sym-' + areaIdx + '-' + cellIdx"
                        class="symbol-cell"
                        :class="{ winning: sym.isWinning }"
                      >
                        <span class="sym-value">{{ sym.symbol }}</span>
                      </div>
                    </div>
                  </ScratchCanvas>
                  <div v-else class="symbols-grid">
                    <div 
                      v-for="(sym, cellIdx) in area.symbols" 
                      :key="'sym-' + areaIdx + '-' + cellIdx"
                      class="symbol-cell"
                      :class="{ winning: sym.isWinning }"
                    >
                      <span class="sym-value">{{ sym.symbol }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 走进桃花源 - 九宫格连线 -->
          <div v-if="currentLottery.grid" class="game-area">
            <div class="area-title">🌸 九宫格连线</div>
            <div class="grid-container">
              <div class="grid-lines-hint">
                <span>连线：8线连珠</span>
              </div>
              <div class="scratch-wrapper">
                <ScratchCanvas 
                  v-if="!currentLottery.isScratched"
                  @revealed="() => onAreaRevealed('grid')"
                >
                  <div class="nine-grid">
                    <div 
                      v-for="(row, rowIdx) in currentLottery.grid" 
                      :key="'row-' + rowIdx"
                      class="grid-row"
                    >
                      <div 
                        v-for="(cell, colIdx) in row" 
                        :key="'cell-' + rowIdx + '-' + colIdx"
                        class="grid-cell"
                        :class="{ winning: cell.isWinning }"
                      >
                        <span class="cell-value">{{ cell.symbol }}</span>
                      </div>
                    </div>
                  </div>
                </ScratchCanvas>
                <div v-else class="nine-grid">
                  <div 
                    v-for="(row, rowIdx) in currentLottery.grid" 
                    :key="'row-' + rowIdx"
                    class="grid-row"
                  >
                    <div 
                      v-for="(cell, colIdx) in row" 
                      :key="'cell-' + rowIdx + '-' + colIdx"
                      class="grid-cell"
                      :class="{ winning: cell.isWinning }"
                    >
                      <span class="cell-value">{{ cell.symbol }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="lines-hint">
                <div class="line-item">横：①②③</div>
                <div class="line-item">竖：④⑤⑥</div>
                <div class="line-item">斜：⑦⑧</div>
              </div>
            </div>
          </div>
          
          <!-- 甜蜜蜜 - 三同号 -->
          <div v-if="currentLottery.numberAreas" class="game-area">
            <div class="area-title">🍯 三同号</div>
            <div class="triple-areas">
              <div 
                v-for="(area, areaIdx) in currentLottery.numberAreas" 
                :key="'tarea-' + areaIdx"
                class="triple-area-item"
              >
                <div class="area-prize">奖金：{{ area.prize }}</div>
                <div class="scratch-wrapper">
                  <ScratchCanvas 
                    v-if="!currentLottery.isScratched"
                    @revealed="() => onAreaRevealed('triple-' + areaIdx)"
                  >
                    <div class="triple-numbers">
                      <div 
                        v-for="(num, cellIdx) in area.numbers" 
                        :key="'tnum-' + areaIdx + '-' + cellIdx"
                        class="triple-cell"
                        :class="{ winning: num.isWinning }"
                      >
                        <span class="num-value">{{ num.value }}</span>
                      </div>
                    </div>
                  </ScratchCanvas>
                  <div v-else class="triple-numbers">
                    <div 
                      v-for="(num, cellIdx) in area.numbers" 
                      :key="'tnum-' + areaIdx + '-' + cellIdx"
                      class="triple-cell"
                      :class="{ winning: num.isWinning }"
                    >
                      <span class="num-value">{{ num.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 超级财富 - 复合玩法 -->
          <div v-if="currentLottery.numberArea" class="game-area">
            <div class="area-title">🎰 超级财富</div>
            
            <div class="mixed-section">
              <div class="mixed-title">数字匹配区</div>
              <div class="winning-number-display small">
                <span class="win-num-label">中奖号</span>
                <span class="win-num-value">{{ currentLottery.numberArea.winningNumber }}</span>
              </div>
              <div class="scratch-wrapper">
                <ScratchCanvas 
                  v-if="!currentLottery.isScratched"
                  @revealed="() => onAreaRevealed('mixed-number')"
                >
                  <div class="my-numbers-grid small">
                    <div 
                      v-for="(num, index) in currentLottery.numberArea.myNumbers" 
                      :key="'mnum-' + index"
                      class="number-cell small"
                      :class="{ winning: num.isWinning }"
                    >
                      <span class="num-value">{{ num.value }}</span>
                    </div>
                  </div>
                </ScratchCanvas>
                <div v-else class="my-numbers-grid small">
                  <div 
                    v-for="(num, index) in currentLottery.numberArea.myNumbers" 
                    :key="'mnum-' + index"
                    class="number-cell small"
                    :class="{ winning: num.isWinning }"
                  >
                    <span class="num-value">{{ num.value }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mixed-section" v-if="currentLottery.symbolArea">
              <div class="mixed-title">找幸运符</div>
              <div class="scratch-wrapper">
                <ScratchCanvas 
                  v-if="!currentLottery.isScratched"
                  @revealed="() => onAreaRevealed('mixed-symbol')"
                >
                  <div class="bonus-symbols">
                    <div 
                      v-for="(sym, index) in currentLottery.symbolArea.symbols" 
                      :key="'bsym-' + index"
                      class="symbol-cell"
                      :class="{ winning: sym.isWinning }"
                    >
                      <span class="sym-value">{{ sym.symbol }}</span>
                    </div>
                  </div>
                </ScratchCanvas>
                <div v-else class="bonus-symbols">
                  <div 
                    v-for="(sym, index) in currentLottery.symbolArea.symbols" 
                    :key="'bsym-' + index"
                    class="symbol-cell"
                    :class="{ winning: sym.isWinning }"
                  >
                    <span class="sym-value">{{ sym.symbol }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mixed-section" v-if="currentLottery.bonusPrizes">
              <div class="mixed-title">奖金即开</div>
              <div class="scratch-wrapper">
                <ScratchCanvas 
                  v-if="!currentLottery.isScratched"
                  @revealed="() => onAreaRevealed('mixed-bonus')"
                >
                  <div class="bonus-prizes">
                    <div 
                      v-for="(bp, index) in currentLottery.bonusPrizes" 
                      :key="'bp-' + index"
                      class="bonus-cell"
                      :class="{ winning: bp.isWinning }"
                    >
                      <span class="bonus-value">{{ bp.value }}</span>
                    </div>
                  </div>
                </ScratchCanvas>
                <div v-else class="bonus-prizes">
                  <div 
                    v-for="(bp, index) in currentLottery.bonusPrizes" 
                    :key="'bp-' + index"
                    class="bonus-cell"
                    :class="{ winning: bp.isWinning }"
                  >
                    <span class="bonus-value">{{ bp.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 结果展示 -->
          <div v-if="currentLottery.isScratched" class="result-section">
            <div class="result-icon">
              {{ resultIcon }}
            </div>
            <div class="result-text">{{ resultText }}</div>
            <div class="prize-amount">
              {{ currentLottery.prize && currentLottery.prize > 0 ? `+${currentLottery.prize}` : 0 }} 💰
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="lottery-footer">
            <button 
              v-if="!currentLottery.isScratched" 
              class="action-btn reveal-all-btn"
              @click="revealAll"
            >
              一键刮开
            </button>
            <button 
              v-if="currentLottery.isScratched && hasNextLottery" 
              class="action-btn next-btn"
              @click="goToNext"
            >
              再刮一张
            </button>
            <button 
              v-if="currentLottery.isScratched" 
              class="action-btn back-btn"
              @click="goBack"
            >
              返回背包
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="showResultAnimation" class="result-animation">
        <div class="confetti" v-for="i in 20" :key="i" :style="getConfettiStyle(i)"></div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import type { BackpackItem } from '@/types'
import ScratchCanvas from './ScratchCanvas.vue'

const gameStore = useGameStore()
const { currentLottery, backpack } = storeToRefs(gameStore)
const coins = computed(() => gameStore.coins)

const showResultAnimation = ref(false)
const selectedMyNumbers = ref<Set<number>>(new Set())
const scratchCanvasRefs = ref<Map<string, InstanceType<typeof ScratchCanvas>>>(new Map())
const revealedAreas = ref<Set<string>>(new Set())

const totalScratchAreas = computed(() => {
  const lottery = currentLottery.value
  if (!lottery) return 0
  
  let count = 0
  if (lottery.myNumbers) count += 2
  if (lottery.symbolAreas) count += lottery.symbolAreas.length
  if (lottery.grid) count += 1
  if (lottery.numberAreas) count += lottery.numberAreas.length
  if (lottery.numberArea) count += 1
  if (lottery.symbolArea) count += 1
  if (lottery.bonusPrizes) count += 1
  
  console.log('totalScratchAreas calculated:', count)
  return count
})

const resultIcon = computed(() => {
  if (!currentLottery.value?.result) return '❓'
  const icons: Record<string, string> = {
    grand: '🏆',
    first: '🥇',
    second: '🥈',
    third: '🥉',
    fourth: '🎁',
    none: '😢'
  }
  return icons[currentLottery.value.result] || '❓'
})

const resultText = computed(() => {
  if (!currentLottery.value?.result) return ''
  const texts: Record<string, string> = {
    grand: '特等奖！恭喜你！',
    first: '一等奖！太棒了！',
    second: '二等奖！不错哦！',
    third: '三等奖！继续加油！',
    fourth: '四等奖！小有收获！',
    none: '谢谢参与，再接再厉！'
  }
  return texts[currentLottery.value.result] || ''
})

const hasNextLottery = computed(() => {
  return (backpack.value || []).some(item => !item.isScratched && item.id !== currentLottery.value?.id)
})

function getLotteryPrice(lotteryId: string): number {
  const prices: Record<string, number> = {
    '1': 10,
    '2': 20,
    '3': 50,
    '4': 5,
    '5': 100
  }
  return prices[lotteryId] || 0
}

function getMatchCount(item: BackpackItem): number {
  if (!item.myNumbers) return 0
  return item.myNumbers.filter(n => n.isWinning).length
}

function getTotalPrize(item: BackpackItem): number {
  if (!item.myNumbers) return 0
  return item.myNumbers.filter(n => n.isWinning).reduce((sum, n) => sum + (n.prize || 0), 0)
}

function handleNumberClick(index: number) {
  if (!currentLottery.value?.myNumbers) return
  const num = currentLottery.value.myNumbers[index]
  if (!num || !num.isWinning) return
  
  const next = new Set(selectedMyNumbers.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  selectedMyNumbers.value = next
}

function getConfettiStyle(index: number) {
  const colors = ['#ffd700', '#ff6b6b', '#4ECDC4', '#44A08D', '#ff8E53']
  const left = Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 1 + Math.random() * 1
  const size = 10 + Math.random() * 10
  
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    backgroundColor: colors[index % colors.length],
    width: `${size}px`,
    height: `${size}px`
  }
}

function onAreaRevealed(areaId: string) {
  if (currentLottery.value?.isScratched) return
  
  console.log('Area revealed:', areaId)
  console.log('Triggering revealAll because area is revealed')
  
  const lotteryId = currentLottery.value?.id
  if (lotteryId) {
    setTimeout(() => {
      console.log('Executing revealAll for lottery:', lotteryId)
      gameStore.scratchLottery(lotteryId)
      
      if (currentLottery.value?.prize && currentLottery.value.prize > 0) {
        showResultAnimation.value = true
        setTimeout(() => {
          showResultAnimation.value = false
        }, 2000)
      }
    }, 300)
  }
}

function onRevealed() {
  if (currentLottery.value) {
    gameStore.scratchLottery(currentLottery.value.id)
    
    if (currentLottery.value.prize && currentLottery.value.prize > 0) {
      showResultAnimation.value = true
      setTimeout(() => {
        showResultAnimation.value = false
      }, 2000)
    }
  }
}

function revealAll() {
  if (currentLottery.value) {
    gameStore.scratchLottery(currentLottery.value.id)
    
    if (currentLottery.value.prize && currentLottery.value.prize > 0) {
      showResultAnimation.value = true
      setTimeout(() => {
        showResultAnimation.value = false
      }, 2000)
    }
  }
}

function goBack() {
  gameStore.setView('backpack')
}

function goToNext() {
  const nextLottery = (backpack.value || []).find(item => !item.isScratched)
  if (nextLottery) {
    gameStore.selectLottery(nextLottery)
    nextTick(() => {
      showResultAnimation.value = false
    })
  }
}

onMounted(() => {
  showResultAnimation.value = false
})

watch(() => currentLottery.value?.id, () => {
  showResultAnimation.value = false
  selectedMyNumbers.value.clear()
  revealedAreas.value.clear()
})
</script>

<style scoped>
.scratch-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  margin-bottom: 20px;
}

.back-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #fff;
}

.page-title {
  font-size: 24px;
  color: #fff;
  font-weight: bold;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.2);
}

.coins-display {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffd700, #ffb700);
  padding: 8px 16px;
  border-radius: 25px;
}

.coins-icon {
  font-size: 20px;
  margin-right: 6px;
}

.coins-count {
  font-size: 18px;
  font-weight: bold;
  color: #8B4513;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.lottery-container {
  width: 100%;
  max-width: 420px;
  padding: 0 10px;
}

.lottery-frame {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}

.lottery-header {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  padding: 20px;
  text-align: center;
}

.lottery-name {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.lottery-price {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  margin-top: 5px;
}

.game-area {
  padding: 15px;
  border-bottom: 1px dashed #eee;
}

.area-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.scratch-wrapper {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

/* 好运十倍（符合现实玩法） */
.lucky-ten-layout {
  background: linear-gradient(135deg, #fff9e6, #ffefd5);
  border-radius: 12px;
  padding: 12px;
  border: 2px dashed #ffd700;
  min-width: 320px;
}

.lucky-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.lucky-row:last-child {
  margin-bottom: 0;
}

.lucky-label {
  flex-shrink: 0;
  width: 28px;
  font-size: 13px;
  font-weight: bold;
  color: #8B4513;
  text-align: center;
  writing-mode: vertical-rl;
  letter-spacing: 3px;
}

.winning-numbers-row {
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 6px;
  background: #f9f9f9;
  border-radius: 8px;
}

.winning-num-cell {
  flex: 1;
  min-width: 42px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.win-num-text {
  font-weight: bold;
}

.winning-row {
  align-items: flex-start;
}

.winning-scratch {
  max-height: 60px;
}

.winning-scratch .winning-numbers-row {
  min-height: 48px;
}

.my-numbers-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(42px, 1fr));
  gap: 6px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.my-numbers-grid.small {
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.number-cell-with-prize {
  min-width: 42px;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding: 4px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.number-cell-with-prize:active {
  transform: scale(0.95);
}

.number-cell-with-prize.winning {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  border-color: #ffd700;
  color: #8B4513;
  animation: pulse 1s infinite;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}

.num-value {
  font-size: 18px;
  font-weight: bold;
}

.num-prize {
  font-size: 11px;
  margin-top: 1px;
}

.match-result {
  text-align: center;
  margin-top: 15px;
  padding: 12px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.match-count {
  font-size: 16px;
  font-weight: bold;
  color: #8B4513;
}

.total-prize {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
}

.number-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.number-cell.small {
  font-size: 14px;
}

.number-cell.winning {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  border-color: #ffd700;
  color: #8B4513;
  animation: pulse 1s infinite;
}

.winning-number-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: linear-gradient(135deg, #ffd700, #ffb700);
  border-radius: 10px;
}

.winning-number-display.small {
  padding: 6px;
}

.win-num-label {
  font-size: 14px;
  color: #8B4513;
}

.win-num-value {
  font-size: 24px;
  font-weight: bold;
  color: #8B4513;
}

/* 点石成金 */
.symbol-areas {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.symbol-area-item {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 10px;
}

.area-prize {
  text-align: center;
  font-size: 14px;
  color: #ff6b6b;
  font-weight: bold;
  margin-bottom: 10px;
}

.symbols-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.symbol-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 28px;
}

.symbol-cell.winning {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  animation: pulse 1s infinite;
}

/* 走进桃花源 */
.grid-container {
  text-align: center;
}

.grid-lines-hint {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
}

.nine-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 240px;
  margin: 0 auto;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.grid-row {
  display: flex;
  gap: 8px;
}

.grid-cell {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 32px;
}

.grid-cell.winning {
  background: linear-gradient(135deg, #ff6b6b, #ff8E53);
  border-color: #ff6b6b;
  animation: pulse 1s infinite;
}

.lines-hint {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
  font-size: 12px;
  color: #888;
}

.line-item {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 甜蜜蜜 */
.triple-areas {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.triple-area-item {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 10px;
}

.triple-numbers {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.triple-cell {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 10px;
  font-size: 24px;
  font-weight: bold;
}

.triple-cell.winning {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  animation: pulse 1s infinite;
}

/* 超级财富 */
.mixed-section {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
}

.mixed-title {
  font-size: 14px;
  font-weight: bold;
  color: #4ECDC4;
  margin-bottom: 10px;
  text-align: center;
}

.bonus-symbols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.bonus-prizes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.bonus-cell {
  aspect-ratio: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #8B4513;
}

.bonus-cell.winning {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  animation: pulse 1s infinite;
}

/* 通用 */
.num-value {
  color: #333;
}

.sym-value {
  color: #333;
}

/* 结果区 */
.result-section {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1));
}

.result-icon {
  font-size: 64px;
  margin-bottom: 10px;
}

.result-text {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.prize-amount {
  font-size: 32px;
  font-weight: bold;
  color: #ff6b6b;
}

.lottery-footer {
  padding: 20px;
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.reveal-all-btn {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #8B4513;
  flex: 2;
}

.next-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: #fff;
}

.next-btn:hover,
.reveal-all-btn:hover {
  transform: scale(1.02);
}

.lottery-footer .back-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff8E53);
  color: #fff;
}

.result-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.confetti {
  position: absolute;
  top: -20px;
  border-radius: 50%;
  animation: confettiFall 2s ease-out forwards;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>