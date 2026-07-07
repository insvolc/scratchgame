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
          
          <!-- 点石成金 - 数字匹配（符合现实玩法） -->
          <div v-if="currentLottery.myNumbers" class="game-area dianshi-area">
            <div class="dianshi-ticket">
              <div class="dianshi-shine"></div>

              <div class="dianshi-header">
                <div class="dianshi-price">
                  <span class="price-value">{{ getLotteryPrice(currentLottery.lotteryId) }}</span>
                  <span class="price-unit">金币</span>
                </div>
              </div>

              <div class="dianshi-title">
                <span class="title-main">点石成金</span>
                <span class="title-glow"></span>
              </div>

              <div class="dianshi-rules">
                刮开覆盖膜，如果你的任何号码与中奖号码之一相同，即可赢得该号码下方所示的奖金。
              </div>

              <div class="dianshi-prize-banner">
                <div class="prize-banner-label">最高奖金</div>
                <div class="prize-banner-value">{{ formatPrize(getLotteryMaxPrize(currentLottery.lotteryId)) }} 金币</div>
              </div>

              <div class="dianshi-scratch-zone">
                <div class="scratch-zone-label">
                  <span>刮开区</span>
                  <span class="zone-arrow">▼</span>
                </div>

                <div class="dianshi-numbers-panel">
                  <div class="dianshi-section winning-section">
                    <div class="section-title">中奖号码</div>
                    <div class="scratch-wrapper dianshi-scratch">
                      <ScratchCanvas
                        v-if="!currentLottery.isScratched"
                        :brush-size="22"
                        coating-color="#d4a017"
                        coating-text-color="#fff8dc"
                        @revealed="() => onAreaRevealed('winning')"
                      >
                        <div class="dianshi-win-row">
                          <div
                            v-for="(num, index) in currentLottery.winningNumbers"
                            :key="'win-num-' + index"
                            class="dianshi-ball winning-ball"
                          >
                            <span class="ball-value">{{ num.value }}</span>
                            <span class="ball-pinyin">{{ numberToPinyin(num.value) }}</span>
                          </div>
                        </div>
                      </ScratchCanvas>
                      <div v-else class="dianshi-win-row">
                        <div
                          v-for="(num, index) in currentLottery.winningNumbers"
                          :key="'win-num-' + index"
                          class="dianshi-ball winning-ball"
                        >
                          <span class="ball-value">{{ num.value }}</span>
                          <span class="ball-pinyin">{{ numberToPinyin(num.value) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="dianshi-section my-section">
                    <div class="section-title">你的号码</div>
                    <div class="scratch-wrapper dianshi-scratch">
                      <ScratchCanvas
                        v-if="!currentLottery.isScratched"
                        :brush-size="20"
                        coating-color="#d4a017"
                        coating-text-color="#fff8dc"
                        @revealed="() => onAreaRevealed('mynumbers')"
                      >
                        <div class="dianshi-my-grid">
                          <div
                            v-for="(num, index) in currentLottery.myNumbers"
                            :key="'num-' + index"
                            class="dianshi-ball my-ball"
                            :class="{ winning: selectedMyNumbers.has(index), clickable: num.isWinning }"
                            @click="handleNumberClick(index)"
                          >
                            <span class="ball-value">{{ num.value }}</span>
                            <span class="ball-pinyin">{{ numberToPinyin(num.value) }}</span>
                            <span class="ball-prize">{{ formatPrize(num.prize) }}</span>
                          </div>
                        </div>
                      </ScratchCanvas>
                      <div v-else class="dianshi-my-grid">
                        <div
                          v-for="(num, index) in currentLottery.myNumbers"
                          :key="'num-' + index"
                          class="dianshi-ball my-ball"
                          :class="{ winning: selectedMyNumbers.has(index), clickable: num.isWinning }"
                          @click="handleNumberClick(index)"
                        >
                          <span class="ball-value">{{ num.value }}</span>
                          <span class="ball-pinyin">{{ numberToPinyin(num.value) }}</span>
                          <span class="ball-prize">{{ formatPrize(num.prize) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="dianshi-footer-banner">
                共有 20 次中奖机会！
              </div>
            </div>

            <div class="match-result" v-if="currentLottery.isScratched && (!hasWinningNumbers || hasClickedWinningNumber)">
              <span class="match-count">匹配 {{ selectedMyNumbers.size }} 个号码</span>
              <span class="total-prize">已获得 {{ displayPrize }} 金币</span>
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
          
          <!-- 喜相逢 - 5×5 图符型 -->
          <div v-if="currentLottery.xiXiangFengCells" class="game-area xi-xiangfeng-area">
            <div class="xi-xiangfeng-ticket">
              <div class="ticket-clouds ticket-clouds-top"></div>

              <div class="ticket-header">
                <div class="ticket-main-title">喜相逢</div>
                <div class="ticket-subtitle">财运亨通</div>
              </div>

              <div class="ticket-prize-banner">
                <span class="prize-label">最高奖金</span>
                <span class="prize-value">{{ getLotteryMaxPrize(currentLottery.lotteryId) }}</span>
                <span class="prize-unit">金币</span>
              </div>

              <div class="ticket-body">
                <div class="side-banner left">鹏程万里</div>
                <div class="ticket-grid-wrapper">
                  <div class="scratch-wrapper xi-xiangfeng-scratch">
                    <ScratchCanvas
                      v-if="!currentLottery.isScratched"
                      ref="xiScratchCanvasRef"
                      :brush-size="22"
                      coating-color="#e60012"
                      coating-text-color="#ffffff"
                      coating-pattern="xi"
                      pattern-color="rgba(255, 215, 0, 0.35)"
                      pattern-symbol="囍"
                      :pattern-rows="5"
                      :pattern-cols="5"
                      @revealed="() => onAreaRevealed('xixiangfeng')"
                    >
                      <div class="xi-xiangfeng-grid">
                        <div
                          v-for="(row, rowIdx) in currentLottery.xiXiangFengCells"
                          :key="'xirow-' + rowIdx"
                          class="xi-xiangfeng-row"
                        >
                          <div
                            v-for="(cell, colIdx) in row"
                            :key="'xicell-' + rowIdx + '-' + colIdx"
                            class="xi-xiangfeng-cell"
                            :class="{ winning: selectedXiCells.has(`${rowIdx}-${colIdx}`), double: cell.multiplier === 2 }"
                            @click="handleXiCellClick(rowIdx, colIdx)"
                          >
                            <span class="xi-symbol">{{ cell.symbol }}</span>
                            <span class="xi-prize">{{ cell.basePrize * cell.multiplier }}</span>
                          </div>
                        </div>
                      </div>
                    </ScratchCanvas>
                    <div v-else class="xi-xiangfeng-grid">
                      <div
                        v-for="(row, rowIdx) in currentLottery.xiXiangFengCells"
                        :key="'xirow-' + rowIdx"
                        class="xi-xiangfeng-row"
                      >
                        <div
                          v-for="(cell, colIdx) in row"
                          :key="'xicell-' + rowIdx + '-' + colIdx"
                          class="xi-xiangfeng-cell"
                          :class="{ winning: selectedXiCells.has(`${rowIdx}-${colIdx}`), double: cell.multiplier === 2 }"
                          @click="handleXiCellClick(rowIdx, colIdx)"
                        >
                          <span class="xi-symbol">{{ cell.symbol }}</span>
                          <span class="xi-prize">{{ cell.basePrize * cell.multiplier }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="side-banner right">鸿运千秋</div>
              </div>

              <div class="ticket-footer">
                <div class="ticket-footer-banner">金玉满堂</div>
                <div class="ticket-chance">25次中奖机会</div>
              </div>

            </div>

            <div class="xi-xiangfeng-hint">
              <span>刮开后点击“喜”或“囍”图符领取奖金，“囍”可得两倍</span>
            </div>

            <div class="match-result" v-if="currentLottery.isScratched && currentLottery.xiXiangFengCells">
              <span class="match-count">已领取 {{ selectedXiCells.size }} 个中奖图符</span>
              <span class="total-prize">已获得 {{ displayPrize }} 金币</span>
            </div>
          </div>

          <!-- 幸运加倍 - 20 局图符匹配 -->
          <div v-if="currentLottery.luckyDoubleRounds" class="game-area lucky-double-area">
            <div class="lucky-double-ticket">
              <div class="lucky-double-shine"></div>

              <div class="lucky-double-header">
                <div class="lucky-double-price">
                  <span class="price-value">{{ getLotteryPrice(currentLottery.lotteryId) }}</span>
                  <span class="price-unit">金币</span>
                </div>
                <div class="lucky-double-title">
                  <span class="title-main">幸运加倍</span>
                  <span class="title-sub">20次中奖机会</span>
                </div>
                <div class="lucky-double-prize-banner">
                  <span class="prize-label">最高奖金</span>
                  <span class="prize-value">{{ formatPrize(getLotteryMaxPrize(currentLottery.lotteryId)) }}</span>
                  <span class="prize-unit">金币</span>
                </div>
              </div>

              <div class="lucky-double-rules">
                刮开覆盖膜，在同一局游戏中刮出 3 个相同的图符，即可获得该局右侧所示奖金；如果在任意一局游戏中刮出 “¥” 图符，即可获得该局奖金的两倍。20 局游戏，中奖奖金兼中兼得。
              </div>

              <div class="scratch-wrapper lucky-double-scratch">
                <ScratchCanvas
                  v-if="!currentLottery.isScratched"
                  ref="luckyDoubleScratchCanvasRef"
                  :brush-size="22"
                  coating-color="#e60012"
                  coating-text-color="#ffd700"
                  coating-pattern="xi"
                  pattern-color="rgba(255, 215, 0, 0.35)"
                  pattern-symbol="¥"
                  :pattern-rows="4"
                  :pattern-cols="5"
                  @revealed="() => onAreaRevealed('luckydouble')"
                >
                  <div class="lucky-double-rounds">
                    <div
                      v-for="(round, roundIdx) in currentLottery.luckyDoubleRounds"
                      :key="'ldround-' + roundIdx"
                      class="lucky-double-round"
                      :class="{ winning: selectedLuckyDoubleRounds.has(roundIdx), double: round.multiplier === 2 }"
                      @click="handleLuckyDoubleRoundClick(roundIdx)"
                    >
                      <span class="round-label">第{{ round.roundIndex }}局</span>
                      <div class="round-symbols">
                        <span
                          v-for="(sym, symIdx) in round.symbols"
                          :key="'ldsym-' + roundIdx + '-' + symIdx"
                          class="round-symbol"
                          :class="{ 'double-symbol': sym.symbol === '¥' }"
                        >
                          {{ sym.symbol }}
                        </span>
                      </div>
                      <div class="round-prize">
                        <span class="prize-currency">¥</span>
                        <span class="prize-amount">{{ formatPrize(round.prize * round.multiplier) }}</span>
                      </div>
                    </div>
                  </div>
                </ScratchCanvas>
                <div v-else class="lucky-double-rounds">
                  <div
                    v-for="(round, roundIdx) in currentLottery.luckyDoubleRounds"
                    :key="'ldround-' + roundIdx"
                    class="lucky-double-round"
                    :class="{ winning: selectedLuckyDoubleRounds.has(roundIdx), double: round.multiplier === 2 }"
                    @click="handleLuckyDoubleRoundClick(roundIdx)"
                  >
                    <span class="round-label">第{{ round.roundIndex }}局</span>
                    <div class="round-symbols">
                      <span
                        v-for="(sym, symIdx) in round.symbols"
                        :key="'ldsym-' + roundIdx + '-' + symIdx"
                        class="round-symbol"
                        :class="{ 'double-symbol': sym.symbol === '¥' }"
                      >
                        {{ sym.symbol }}
                      </span>
                    </div>
                    <div class="round-prize">
                      <span class="prize-currency">¥</span>
                      <span class="prize-amount">{{ formatPrize(round.prize * round.multiplier) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lucky-double-footer-banner">
                最高奖金 100 万元
              </div>

            </div>

            <div class="lucky-double-hint">
              <span>刮开后点击中奖局领取奖金，“¥” 图符可使该局奖金翻倍</span>
            </div>

            <div class="match-result" v-if="currentLottery.isScratched && currentLottery.luckyDoubleRounds">
              <span class="match-count">已领取 {{ selectedLuckyDoubleRounds.size }} 局中奖金</span>
              <span class="total-prize">已获得 {{ displayPrize }} 金币</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="lottery-footer">
            <div v-if="!currentLottery.isScratched" class="reveal-section">
              <button 
                class="action-btn reveal-all-btn"
                @click="revealAll"
              >
                一键刮开
              </button>
            </div>
            <div class="action-section">
              <button 
                v-if="hasNextLottery" 
                class="action-btn next-btn"
                @click="goToNext"
              >
                再刮一张
              </button>
              <button 
                class="action-btn back-btn"
                @click="goBack"
              >
                返回背包
              </button>
            </div>
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
const selectedXiCells = ref<Set<string>>(new Set())
const selectedLuckyDoubleRounds = ref<Set<number>>(new Set())
const scratchCanvasRefs = ref<Map<string, InstanceType<typeof ScratchCanvas>>>(new Map())
const xiScratchCanvasRef = ref<InstanceType<typeof ScratchCanvas> | null>(null)
const luckyDoubleScratchCanvasRef = ref<InstanceType<typeof ScratchCanvas> | null>(null)
const revealedAreas = ref<Set<string>>(new Set())
const hasClickedWinningNumber = ref(false)
const claimedPrize = ref(0)

const totalScratchAreas = computed(() => {
  const lottery = currentLottery.value
  if (!lottery) return 0
  
  let count = 0
  if (lottery.myNumbers) count += 2
  if (lottery.grid) count += 1
  if (lottery.numberAreas) count += lottery.numberAreas.length
  if (lottery.numberArea) count += 1
  if (lottery.symbolArea) count += 1
  if (lottery.bonusPrizes) count += 1
  if (lottery.xiXiangFengCells) count += 1
  if (lottery.luckyDoubleRounds) count += 1

  return count
})



const hasNextLottery = computed(() => {
  return (backpack.value || []).some(item => !item.isScratched && item.id !== currentLottery.value?.id)
})

const hasWinningNumbers = computed(() => {
  if (!currentLottery.value?.myNumbers) return false
  return currentLottery.value.myNumbers.some(n => n.isWinning)
})

const displayPrize = computed(() => {
  const lottery = currentLottery.value
  if (!lottery) return 0
  
  if (lottery.myNumbers && hasWinningNumbers.value) {
    return claimedPrize.value
  }

  if (lottery.xiXiangFengCells) {
    return claimedPrize.value
  }

  if (lottery.luckyDoubleRounds) {
    return claimedPrize.value
  }

  return lottery.prize || 0
})

function getLotteryPrice(lotteryId: string): number {
  const prices: Record<string, number> = {
    '1': 50,
    '3': 50,
    '4': 5,
    '5': 100,
    '6': 20,
    '7': 20
  }
  return prices[lotteryId] || 0
}

function getLotteryMaxPrize(lotteryId: string): number {
  const lottery = gameStore.lotteries.find(l => l.id === lotteryId)
  return lottery?.maxPrize || 0
}

function formatPrize(value: number): string {
  return value.toLocaleString('zh-CN')
}

const pinyinMap: Record<string, string> = {
  '01': 'YI', '02': 'ER', '03': 'SAN', '04': 'SI', '05': 'WU',
  '06': 'LIU', '07': 'QI', '08': 'BA', '09': 'JIU', '10': 'SHI',
  '11': 'SYI', '12': 'SE2', '13': 'SSA', '14': 'SSI', '15': 'SWU',
  '16': 'SLI', '17': 'SQI', '18': 'SBA', '19': 'SJI', '20': 'ERSHI',
  '21': 'EYI', '22': 'EER', '23': 'ESA', '24': 'ESI', '25': 'EWU',
  '26': 'ELI', '27': 'EQI', '28': 'EBA', '29': 'EJI', '30': 'SANSHI',
  '31': 'SSY', '32': 'SSE', '33': 'SSS', '34': 'SSI', '35': 'SSW',
  '36': 'SSL'
}

function numberToPinyin(num: string): string {
  return pinyinMap[num] || num
}

function handleNumberClick(index: number) {
  if (!currentLottery.value?.myNumbers) return
  const num = currentLottery.value.myNumbers[index]
  if (!num || !num.isWinning) return
  
  const next = new Set(selectedMyNumbers.value)
  if (!next.has(index)) {
    next.add(index)
    selectedMyNumbers.value = next
    
    if (num.prize && num.prize > 0) {
      claimedPrize.value += num.prize
      gameStore.addCoins(num.prize)
      showResultAnimation.value = true
      setTimeout(() => {
        showResultAnimation.value = false
      }, 2000)
    }
  }
  
  hasClickedWinningNumber.value = true
}

function handleXiCellClick(rowIdx: number, colIdx: number) {
  if (!currentLottery.value?.xiXiangFengCells) return
  const cell = currentLottery.value.xiXiangFengCells[rowIdx]?.[colIdx]
  if (!cell || !cell.isWinning) return

  const key = `${rowIdx}-${colIdx}`
  const next = new Set(selectedXiCells.value)
  if (!next.has(key)) {
    next.add(key)
    selectedXiCells.value = next

    const prize = cell.basePrize * cell.multiplier
    if (prize > 0) {
      claimedPrize.value += prize
      if (currentLottery.value) {
        currentLottery.value.claimedXiCells = Array.from(next)
        currentLottery.value.claimedPrize = claimedPrize.value
      }
      gameStore.addCoins(prize)
      showResultAnimation.value = true
      setTimeout(() => {
        showResultAnimation.value = false
      }, 2000)
    }
  }
}

function handleLuckyDoubleRoundClick(roundIdx: number) {
  if (!currentLottery.value?.luckyDoubleRounds) return
  const round = currentLottery.value.luckyDoubleRounds[roundIdx]
  if (!round || !round.isWinning) return

  const next = new Set(selectedLuckyDoubleRounds.value)
  if (!next.has(roundIdx)) {
    next.add(roundIdx)
    selectedLuckyDoubleRounds.value = next

    const prize = round.prize * round.multiplier
    if (prize > 0) {
      claimedPrize.value += prize
      if (currentLottery.value) {
        currentLottery.value.claimedLuckyDoubleRounds = Array.from(next)
        currentLottery.value.claimedPrize = claimedPrize.value
      }
      gameStore.addCoins(prize)
      showResultAnimation.value = true
      setTimeout(() => {
        showResultAnimation.value = false
      }, 2000)
    }
  }
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
  
  revealedAreas.value.add(areaId)
  
  const lottery = currentLottery.value
  if (!lottery) return
  
  // 点石成金需要两个区域都刮开后才完全刮开
  if (lottery.myNumbers) {
    if (revealedAreas.value.has('winning') && revealedAreas.value.has('mynumbers')) {
      setTimeout(() => {
        gameStore.scratchLottery(lottery.id)
      }, 300)
    }
    return
  }
  
  // 其他玩法单个区域刮开即可（喜相逢由用户点击领奖，不自动结算）
  setTimeout(() => {
    gameStore.scratchLottery(lottery.id)
  }, 300)
}

function onRevealed() {
  if (currentLottery.value) {
    gameStore.scratchLottery(currentLottery.value.id)
  }
}

function revealAll() {
  if (currentLottery.value) {
    xiScratchCanvasRef.value?.revealAll()
    luckyDoubleScratchCanvasRef.value?.revealAll()
    gameStore.scratchLottery(currentLottery.value.id)

    if (currentLottery.value.myNumbers && currentLottery.value.prize && currentLottery.value.prize > 0) {
      const remainingPrize = currentLottery.value.prize - claimedPrize.value
      if (remainingPrize > 0) {
        claimedPrize.value = currentLottery.value.prize
        gameStore.addCoins(remainingPrize)
        showResultAnimation.value = true
        setTimeout(() => {
          showResultAnimation.value = false
        }, 2000)
      }
      
      const winningIndices = currentLottery.value.myNumbers
        .map((num, idx) => num.isWinning ? idx : -1)
        .filter(idx => idx !== -1)
      const next = new Set(selectedMyNumbers.value)
      winningIndices.forEach(idx => next.add(idx))
      selectedMyNumbers.value = next
    }
  }
}

function goBack() {
  gameStore.setView('backpack')
}

function goToNext() {
  const nextLottery = (backpack.value || []).find(item => !item.isScratched && item.id !== currentLottery.value?.id)
  if (nextLottery) {
    gameStore.selectLottery(nextLottery)
    nextTick(() => {
      showResultAnimation.value = false
    })
  }
}

function resetScratchState() {
  showResultAnimation.value = false
  hasClickedWinningNumber.value = false
  claimedPrize.value = currentLottery.value?.claimedPrize ?? 0
  selectedMyNumbers.value.clear()
  selectedXiCells.value = new Set(currentLottery.value?.claimedXiCells ?? [])
  selectedLuckyDoubleRounds.value = new Set(currentLottery.value?.claimedLuckyDoubleRounds ?? [])
  revealedAreas.value.clear()
}

onMounted(() => {
  resetScratchState()
})

watch(() => currentLottery.value?.id, () => {
  resetScratchState()
})

watch(() => currentLottery.value?.isScratched, (newVal, oldVal) => {
  if (newVal === true && oldVal === false && currentLottery.value?.prize && currentLottery.value.prize > 0) {
    if (!currentLottery.value.myNumbers && !currentLottery.value.xiXiangFengCells && !currentLottery.value.luckyDoubleRounds && claimedPrize.value < currentLottery.value.prize) {
      gameStore.addCoins(currentLottery.value.prize - claimedPrize.value)
      claimedPrize.value = currentLottery.value.prize
      showResultAnimation.value = true
      setTimeout(() => {
        showResultAnimation.value = false
      }, 2000)
    }
  }
})
</script>

<style scoped>
.scratch-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  margin-bottom: 24px;
}

.back-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(31, 41, 55, 0.08);
  border-radius: 999px;
  font-size: 15px;
  color: rgba(31, 41, 55, 0.85);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
}

.page-title {
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(180deg, #1f2937 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 6px rgba(217, 119, 6, 0.15));
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(250, 204, 21, 0.35);
  padding: 8px 16px;
  border-radius: 999px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.coins-icon {
  font-size: 20px;
  filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4));
}

.coins-count {
  font-size: 18px;
  font-weight: 800;
  color: #b45309;
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
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
}

.lottery-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%);
  padding: 22px;
  text-align: center;
  border-bottom: 1px solid rgba(31, 41, 55, 0.06);
}

.lottery-name {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  display: block;
  letter-spacing: 1px;
}

.lottery-price {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6px;
  font-weight: 600;
}

.game-area {
  padding: 15px;
  border-bottom: 1px dashed rgba(31, 41, 55, 0.1);
}

.area-title {
  font-size: 16px;
  font-weight: 800;
  color: rgba(31, 41, 55, 0.85);
  margin-bottom: 15px;
  text-align: center;
}

.scratch-wrapper {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

/* 点石成金（参考现实票面优化） */
.dianshi-area {
  padding: 10px;
}

.dianshi-ticket {
  position: relative;
  background: linear-gradient(180deg, #fff8dc 0%, #ffe866 30%, #ffd700 60%, #ffb700 100%);
  border-radius: 18px;
  padding: 16px 12px 14px;
  color: #5a3d00;
  overflow: hidden;
  box-shadow:
    inset 0 0 0 3px #b8860b,
    inset 0 0 0 6px #ffd700,
    0 8px 28px rgba(139, 69, 19, 0.28);
}

.dianshi-ticket::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 12px;
  border: 1px dashed rgba(184, 134, 11, 0.5);
  border-radius: 12px;
  pointer-events: none;
}

.dianshi-shine {
  position: absolute;
  top: -40%;
  left: -40%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, transparent 60%);
  opacity: 0.6;
  pointer-events: none;
}

.dianshi-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
}

.dianshi-price {
  background: linear-gradient(135deg, #8b0000, #c90010);
  color: #ffd700;
  padding: 4px 10px;
  border-radius: 14px;
  border: 2px solid #ffd700;
  display: flex;
  align-items: baseline;
  gap: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.price-value {
  font-size: 18px;
  font-weight: 900;
}

.price-unit {
  font-size: 11px;
  font-weight: bold;
}

.dianshi-title {
  text-align: center;
  position: relative;
  z-index: 1;
  margin-bottom: 6px;
}

.title-main {
  display: block;
  font-size: 42px;
  font-weight: 900;
  color: #ffd700;
  letter-spacing: 6px;
  text-shadow:
    0 0 0 #8b0000,
    2px 2px 0 #8b0000,
    -1px -1px 0 #8b0000,
    0 0 16px rgba(255, 215, 0, 0.7);
  line-height: 1.1;
}

.dianshi-rules {
  position: relative;
  z-index: 1;
  font-size: 11px;
  line-height: 1.4;
  color: #7a5200;
  text-align: center;
  padding: 0 10px;
  margin-bottom: 8px;
}

.dianshi-prize-banner {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 10px;
  background: linear-gradient(90deg, transparent, rgba(139, 0, 0, 0.08), transparent);
  padding: 6px 0;
}

.prize-banner-label {
  font-size: 12px;
  color: #8b0000;
  font-weight: bold;
  margin-bottom: 2px;
}

.prize-banner-value {
  font-size: 22px;
  font-weight: 900;
  color: #8b0000;
  text-shadow: 1px 1px 0 rgba(255, 215, 0, 0.6);
}

.dianshi-scratch-zone {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  gap: 6px;
  background: linear-gradient(135deg, #fff8dc, #ffe866);
  border: 2px solid #d4a017;
  border-radius: 14px;
  padding: 8px 6px;
  margin-bottom: 10px;
}

.scratch-zone-label {
  flex-shrink: 0;
  width: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;
  background: linear-gradient(180deg, #b8860b, #8b6914);
  color: #fff;
  border-radius: 8px;
  font-size: 11px;
  font-weight: bold;
  padding: 8px 2px;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
  line-height: 1.1;
}

.zone-arrow {
  font-size: 10px;
  margin-top: 2px;
}

.dianshi-numbers-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.dianshi-section {
  border-radius: 12px;
}

.section-title {
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  color: #8b0000;
  margin-bottom: 6px;
  letter-spacing: 3px;
}

.dianshi-scratch {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0;
}

.dianshi-scratch .scratch-canvas-container {
  display: block;
  width: 100%;
}

.dianshi-win-row {
  display: flex;
  justify-content: space-evenly;
  gap: 6px;
  padding: 8px 6px;
  background: linear-gradient(135deg, #fff9e6, #ffefd5);
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
}

.dianshi-my-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  padding: 8px 6px;
  background: linear-gradient(135deg, #fff9e6, #ffefd5);
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
}

.dianshi-ball {
  aspect-ratio: 1.15;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fffef5 0%, #fff8dc 50%, #ffecb3 100%);
  border-radius: 6px;
  box-shadow:
    inset 0 -2px 4px rgba(184, 134, 11, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 2px;
  transition: transform 0.12s, box-shadow 0.2s;
  min-width: 0;
  overflow: hidden;
}

.dianshi-ball.clickable {
  cursor: pointer;
}

.dianshi-ball.clickable:active {
  transform: scale(0.95);
}

.dianshi-ball.winning {
  background: linear-gradient(180deg, #fff5a0 0%, #ffd700 50%, #ffb347 100%);
  box-shadow:
    inset 0 -2px 4px rgba(139, 0, 0, 0.15),
    0 0 12px rgba(255, 140, 0, 0.5);
  animation: pulse 1s infinite;
}

.ball-value {
  font-size: 14px;
  font-weight: 900;
  color: #8b0000;
  line-height: 1.1;
}

.ball-pinyin {
  font-size: 7px;
  color: #b8860b;
  font-weight: 600;
  line-height: 1.1;
  margin-top: 1px;
  letter-spacing: 0;
  transform: scale(0.9);
}

.ball-prize {
  font-size: 8px;
  color: #c90010;
  font-weight: 700;
  line-height: 1.1;
  margin-top: 1px;
}

.dianshi-ball.winning .ball-prize {
  color: #8b0000;
}

.dianshi-footer-banner {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 900;
  color: #8b0000;
  text-shadow: 1px 1px 0 rgba(255, 215, 0, 0.6);
  margin-bottom: 8px;
}

.match-result {
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 251, 235, 0.72);
  border: 1px solid rgba(250, 204, 21, 0.25);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.match-count {
  font-size: 15px;
  font-weight: 700;
  color: rgba(31, 41, 55, 0.75);
}

.total-prize {
  font-size: 20px;
  font-weight: 900;
  color: #d97706;
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

.area-prize {
  text-align: center;
  font-size: 14px;
  color: #ff6b6b;
  font-weight: bold;
  margin-bottom: 10px;
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

.my-numbers-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(44px, 1fr));
  gap: 6px;
  padding: 10px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.my-numbers-grid.small {
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.num-value {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
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

/* 喜相逢 */
.xi-xiangfeng-area {
  padding: 10px;
}

.xi-xiangfeng-ticket {
  position: relative;
  background: linear-gradient(180deg, #e60012 0%, #c90010 100%);
  border-radius: 18px;
  padding: 18px 10px 14px;
  color: #fff;
  overflow: hidden;
  box-shadow:
    inset 0 0 0 3px #0047ab,
    inset 0 0 0 5px #ffd700,
    0 6px 20px rgba(0, 0, 0, 0.25);
}

.xi-xiangfeng-ticket::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 1px dashed rgba(255, 215, 0, 0.55);
  border-radius: 12px;
  pointer-events: none;
}

.ticket-clouds {
  position: absolute;
  left: 0;
  right: 0;
  height: 28px;
  background-repeat: repeat-x;
  background-size: 28px 28px;
  opacity: 0.25;
  pointer-events: none;
}

.ticket-clouds-top {
  top: 0;
  background-image: radial-gradient(circle at 50% 100%, transparent 10px, #0047ab 11px, #0047ab 14px, transparent 15px);
}

.ticket-header {
  text-align: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.ticket-main-title {
  font-size: 44px;
  font-weight: 900;
  color: #ffd700;
  letter-spacing: 10px;
  text-shadow:
    0 0 0 #8b0000,
    2px 2px 0 #8b0000,
    0 0 12px rgba(255, 215, 0, 0.5);
  line-height: 1.1;
}

.ticket-subtitle {
  display: inline-block;
  background: #0047ab;
  color: #ffd700;
  padding: 4px 28px;
  border-radius: 20px;
  border: 2px solid #ffd700;
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 4px;
  margin-top: 6px;
}

.ticket-prize-banner {
  text-align: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.ticket-prize-banner .prize-label {
  color: #ffd700;
  font-size: 13px;
  margin-right: 4px;
}

.ticket-prize-banner .prize-value {
  color: #ffd700;
  font-size: 22px;
  font-weight: 900;
}

.ticket-prize-banner .prize-unit {
  color: #ffd700;
  font-size: 12px;
  margin-left: 2px;
}

.ticket-body {
  display: flex;
  align-items: stretch;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.side-banner {
  writing-mode: vertical-rl;
  text-orientation: upright;
  background: #0047ab;
  color: #ffd700;
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 10px 2px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.ticket-grid-wrapper {
  flex: 1;
  background: #e60012;
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

.xi-xiangfeng-scratch {
  margin-bottom: 0;
}

.xi-xiangfeng-scratch .scratch-canvas-container {
  display: block;
  width: 100%;
  border-radius: 0;
}

.xi-xiangfeng-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 0;
  box-sizing: border-box;
}

.xi-xiangfeng-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  width: 100%;
}

.xi-xiangfeng-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 8px;
  font-weight: bold;
  color: #222;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
}

.xi-xiangfeng-cell:active {
  transform: scale(0.95);
}

.xi-xiangfeng-cell.winning {
  background: radial-gradient(circle at 30% 30%, #fff5a0, #ffd700 60%, #ffb700);
  border-color: #b8860b;
  color: #8b0000;
  animation: pulse 1s infinite;
}

.xi-xiangfeng-cell.double {
  border-color: #b8860b;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.xi-xiangfeng-cell.winning.double {
  background: radial-gradient(circle at 30% 30%, #fff, #ffd700 50%, #ff8a00);
}

.xi-symbol {
  font-size: 22px;
  line-height: 1.1;
  color: #1a1a1a;
}

.xi-xiangfeng-cell.winning .xi-symbol {
  font-size: 26px;
  font-weight: bold;
  color: #8b0000;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.xi-prize {
  font-size: 11px;
  margin-top: 2px;
  font-weight: 800;
  color: #333;
}

.ticket-footer {
  margin-top: 12px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.ticket-footer-banner {
  display: inline-block;
  background: #0047ab;
  color: #ffd700;
  padding: 5px 32px;
  border-radius: 20px;
  border: 2px solid #ffd700;
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 4px;
}

.ticket-chance {
  color: #ffd700;
  font-size: 11px;
  margin-top: 6px;
  font-weight: bold;
}

.ticket-security {
  margin-top: 10px;
  background: #0047ab;
  color: #fff;
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 6px;
  text-align: center;
  position: relative;
  z-index: 1;
  border: 1px dashed rgba(255, 255, 255, 0.4);
}

.xi-xiangfeng-hint {
  text-align: center;
  font-size: 12px;
  color: #888;
  margin-top: 12px;
}

/* 通用 */
.num-value {
  color: #333;
}

.sym-value {
  color: #333;
}

.lottery-footer {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(255, 255, 255, 0.45);
}

.reveal-section {
  width: 100%;
}

.action-section {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%);
  opacity: 0.7;
}

.reveal-all-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  width: 100%;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.28);
}

.next-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.28);
}

.next-btn:hover,
.reveal-all-btn:hover {
  transform: scale(1.02);
}

.lottery-footer .back-btn {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(31, 41, 55, 0.08);
  color: rgba(31, 41, 55, 0.85);
  box-shadow: none;
}

.lottery-footer .back-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
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

/* 幸运加倍 */
.lucky-double-area {
  padding: 10px;
}

.lucky-double-ticket {
  position: relative;
  background: linear-gradient(180deg, #e60012 0%, #c90010 100%);
  border-radius: 18px;
  padding: 16px 10px 14px;
  color: #fff;
  overflow: hidden;
  box-shadow:
    inset 0 0 0 3px #ffd700,
    inset 0 0 0 5px #8b0000,
    0 6px 20px rgba(0, 0, 0, 0.25);
}

.lucky-double-ticket::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 1px dashed rgba(255, 215, 0, 0.55);
  border-radius: 12px;
  pointer-events: none;
}

.lucky-double-shine {
  position: absolute;
  top: -40%;
  left: -40%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 60%);
  opacity: 0.6;
  pointer-events: none;
}

.lucky-double-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
}

.lucky-double-price {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #8b0000;
  padding: 4px 10px;
  border-radius: 14px;
  border: 2px solid #fff;
  display: flex;
  align-items: baseline;
  gap: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.lucky-double-price .price-value {
  font-size: 18px;
  font-weight: 900;
}

.lucky-double-price .price-unit {
  font-size: 11px;
  font-weight: bold;
}

.lucky-double-title {
  text-align: center;
}

.lucky-double-title .title-main {
  display: block;
  font-size: 32px;
  font-weight: 900;
  color: #ffd700;
  letter-spacing: 4px;
  text-shadow: 2px 2px 0 #8b0000;
  line-height: 1.1;
}

.lucky-double-title .title-sub {
  display: block;
  font-size: 11px;
  color: #ffd700;
  margin-top: 2px;
  font-weight: bold;
}

.lucky-double-prize-banner {
  text-align: center;
}

.lucky-double-prize-banner .prize-label {
  display: block;
  font-size: 10px;
  color: #ffd700;
}

.lucky-double-prize-banner .prize-value {
  display: block;
  font-size: 18px;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 1px 1px 0 #8b0000;
}

.lucky-double-prize-banner .prize-unit {
  font-size: 10px;
  color: #ffd700;
}

.lucky-double-rules {
  position: relative;
  z-index: 1;
  font-size: 10px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  padding: 0 6px;
  margin-bottom: 10px;
}

.lucky-double-scratch {
  margin-bottom: 0;
  border-radius: 12px;
  overflow: hidden;
}

.lucky-double-scratch .scratch-canvas-container {
  display: block;
  width: 100%;
}

.lucky-double-rounds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  padding: 8px;
  background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
}

.lucky-double-round {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 5px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  border: 1px solid rgba(255, 215, 0, 0.35);
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
  min-width: 0;
}

.lucky-double-round:active {
  transform: scale(0.98);
}

.lucky-double-round.winning {
  background: radial-gradient(circle at 30% 30%, #fff5a0, #ffd700 60%, #ffb700);
  border-color: #b8860b;
  color: #8b0000;
  animation: pulse 1s infinite;
}

.lucky-double-round.double {
  border-color: #b8860b;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.round-label {
  font-size: 9px;
  color: #8b0000;
  font-weight: bold;
  white-space: nowrap;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 1px;
}

.round-symbols {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  gap: 2px;
  padding-left: 6px;
  min-width: 0;
}

.round-symbol {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  font-size: 18px;
  color: #222;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.round-symbol.double-symbol {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #8b0000;
  font-weight: bold;
  border-color: #b8860b;
}

.round-prize {
  display: flex;
  align-items: baseline;
  gap: 1px;
  font-weight: 800;
  color: #8b0000;
  white-space: nowrap;
  margin-left: auto;
}

.round-prize .prize-currency {
  font-size: 9px;
}

.round-prize .prize-amount {
  font-size: 11px;
}

.lucky-double-footer-banner {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 1px 1px 0 #8b0000;
  margin-top: 10px;
}

.lucky-double-security {
  position: relative;
  z-index: 1;
  margin-top: 8px;
  background: #8b0000;
  color: #fff;
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 6px;
  text-align: center;
  border: 1px dashed rgba(255, 255, 255, 0.4);
}

.lucky-double-hint {
  text-align: center;
  font-size: 12px;
  color: #888;
  margin-top: 12px;
}
</style>