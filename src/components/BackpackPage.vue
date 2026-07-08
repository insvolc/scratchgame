<template>
  <div class="backpack-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <h1 class="page-title">我的背包</h1>
      <button 
        class="clear-btn" 
        :disabled="scratchedCount === 0"
        @click="clearScratched"
      >
        清空已刮
      </button>
    </header>
    
    <main class="main-content">
      <div v-if="backpack.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-text">背包是空的</p>
        <button class="go-shop-btn" @click="goToShop">去购买彩票</button>
      </div>
      
      <div v-else class="backpack-grid">
        <button 
          v-for="item in backpack" 
          :key="item.id" 
          class="lottery-item"
          :class="{ scratched: item.isScratched }"
          :disabled="item.isScratched"
          @click="selectLottery(item)"
        >
          <div class="lottery-cover" :class="item.lotteryTheme">
            <span v-if="!item.isScratched" class="unscratched-icon">🎟️</span>
            <span v-else class="scratched-icon">
              {{ item.prize && item.prize > 0 ? '🎉' : '😢' }}
            </span>
          </div>
          <div class="lottery-info">
            <span class="lottery-name">{{ item.lotteryName }}</span>
            <span v-if="item.isScratched" class="prize-result">
              {{ item.prize && item.prize > 0 ? `+${item.prize} 💰` : '未中奖' }}
            </span>
            <span v-else class="status-badge">未刮开</span>
          </div>
        </button>
      </div>
      
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部 ({{ backpack.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'unscratched' }"
          @click="activeTab = 'unscratched'"
        >
          未刮 ({{ unscratchedCount }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'scratched' }"
          @click="activeTab = 'scratched'"
        >
          已刮 ({{ scratchedCount }})
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import type { BackpackItem } from '@/types'

const gameStore = useGameStore()
const { backpack } = storeToRefs(gameStore)

const activeTab = ref<'all' | 'unscratched' | 'scratched'>('all')

const unscratchedCount = computed(() => 
  (backpack.value || []).filter(item => !item.isScratched).length
)

const scratchedCount = computed(() => 
  (backpack.value || []).filter(item => item.isScratched).length
)

function goBack() {
  gameStore.setView('home')
}

function goToShop() {
  gameStore.setView('shop')
}

function selectLottery(item: BackpackItem) {
  if (!item.isScratched) {
    gameStore.selectLottery(item)
  }
}

function clearScratched() {
  gameStore.clearScratched()
}
</script>

<style scoped>
.backpack-page {
  width: 100%;
  min-height: 100vh;
  padding: 80px 24px 24px;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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

.clear-btn {
  padding: 10px 20px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 999px;
  font-size: 15px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.clear-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.main-content {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.25));
}

.empty-text {
  font-size: 18px;
  color: rgba(31, 41, 55, 0.7);
  margin-bottom: 24px;
}

.go-shop-btn {
  padding: 15px 40px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  border-radius: 999px;
  font-size: 17px;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.28);
}

.go-shop-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4);
}

.backpack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 480px) {
  .backpack-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.lottery-item {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  padding: 0;
  text-align: left;
  font-family: inherit;
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.lottery-item:hover:not(.scratched) {
  transform: translateY(-5px);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.lottery-item:disabled,
.lottery-item.scratched {
  opacity: 0.65;
  cursor: default;
}

.lottery-cover {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  position: relative;
}

.lottery-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%);
}

.lottery-cover.gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.lottery-cover.diamond {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
}

.lottery-cover.red {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.lottery-cover.green {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.lottery-cover.rainbow {
  background: linear-gradient(135deg, #f87171, #fbbf24, #34d399);
}

.lottery-cover.red-gold {
  background: linear-gradient(135deg, #f87171, #fbbf24);
}

.lottery-cover.red-lucky {
  background: linear-gradient(135deg, #fb7185, #fb923c);
}

.lottery-info {
  padding: 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.45);
}

.lottery-name {
  font-size: 14px;
  font-weight: 800;
  color: #1f2937;
  display: block;
}

.prize-result {
  font-size: 13px;
  color: #d97706;
  font-weight: 800;
  display: block;
  margin-top: 6px;
}

.status-badge {
  font-size: 12px;
  color: rgba(31, 41, 55, 0.55);
  display: inline-block;
  margin-top: 6px;
  background: rgba(31, 41, 55, 0.05);
  padding: 3px 8px;
  border-radius: 999px;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.tab-btn {
  padding: 10px 22px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  font-size: 14px;
  color: rgba(31, 41, 55, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #1f2937;
}

.tab-btn.active {
  background: rgba(255, 251, 235, 0.9);
  border-color: rgba(250, 204, 21, 0.5);
  color: #b45309;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(250, 204, 21, 0.15);
}
</style>