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

.clear-btn {
  padding: 10px 20px;
  background: rgba(255, 107, 107, 0.9);
  border: none;
  border-radius: 20px;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #ff6b6b;
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
}

.empty-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

.go-shop-btn {
  padding: 15px 40px;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  border: none;
  border-radius: 30px;
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.go-shop-btn:hover {
  transform: scale(1.05);
}

.backpack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.lottery-item {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  padding: 0;
  text-align: left;
  font-family: inherit;
}

.lottery-item:hover:not(.scratched) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.lottery-item:disabled,
.lottery-item.scratched {
  opacity: 0.7;
  cursor: default;
}

.lottery-cover {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.lottery-cover.gold {
  background: linear-gradient(135deg, #ffd700, #ffb700);
}

.lottery-cover.diamond {
  background: linear-gradient(135deg, #e0e0e0, #9e9e9e);
}

.lottery-cover.red {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
}

.lottery-cover.green {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
}

.lottery-cover.rainbow {
  background: linear-gradient(135deg, #ff6b6b, #ffd700, #4ECDC4);
}

.lottery-cover.red-gold {
  background: linear-gradient(135deg, #ff6b6b, #ffd700);
}

.lottery-cover.red-lucky {
  background: linear-gradient(135deg, #e60012, #ff8a00);
}

.lottery-info {
  padding: 10px;
  text-align: center;
}

.lottery-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
}

.prize-result {
  font-size: 12px;
  color: #4ECDC4;
  display: block;
  margin-top: 5px;
}

.status-badge {
  font-size: 12px;
  color: #ff6b6b;
  display: block;
  margin-top: 5px;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tab-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #fff;
}

.tab-btn.active {
  background: #fff;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
</style>