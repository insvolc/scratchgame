<template>
  <div class="home-page">
    <header class="header">
      <div class="coins-display">
        <span class="coins-icon">💰</span>
        <span class="coins-count">{{ coins }}</span>
      </div>
    </header>
    
    <main class="main-content">
      <div class="logo-section">
        <h1 class="game-title">幸运刮刮乐</h1>
        <p class="game-subtitle">试试你的运气，赢取大奖！</p>
      </div>
      
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-value">{{ unscratchedCount }}</span>
          <span class="stat-label">未刮彩票</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ totalWon }}</span>
          <span class="stat-label">累计中奖</span>
        </div>
      </div>
      
      <div class="buttons-section">
        <button class="action-btn shop-btn" @click="goToShop">
          <span class="btn-icon">🛒</span>
          <span class="btn-text">购买彩票</span>
        </button>
        
        <button class="action-btn backpack-btn" @click="goToBackpack">
          <span class="btn-icon">🎒</span>
          <span class="btn-text">我的背包</span>
          <span v-if="unscratchedCount > 0" class="badge">{{ unscratchedCount }}</span>
        </button>
      </div>
      
      <button class="refresh-btn" @click="refreshGame">
        🔄 重新开始
      </button>
      
      <button class="debug-btn" @click="addCoinsDebug">
        💸 +100金币 (调试)
      </button>
      
      <p class="disclaimer">模拟游戏，不涉及真实金钱赌博</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const { coins } = storeToRefs(gameStore)
const unscratchedCount = gameStore.unscratchedCount
const totalWon = gameStore.totalWon

function goToShop() {
  gameStore.setView('shop')
}

function goToBackpack() {
  gameStore.setView('backpack')
}

function refreshGame() {
  if (confirm('确定要重新开始吗？所有数据将被重置！')) {
    gameStore.refreshCoins()
  }
}

function addCoinsDebug() {
  gameStore.addCoins(100)
  alert('已添加 100 金币！')
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.coins-display {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffd700, #ffb700);
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.coins-icon {
  font-size: 24px;
  margin-right: 8px;
}

.coins-count {
  font-size: 20px;
  font-weight: bold;
  color: #8B4513;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.game-title {
  font-size: 48px;
  font-weight: bold;
  color: #fff;
  text-shadow: 3px 3px 0 #ff6b6b, 6px 6px 0 rgba(0,0,0,0.2);
  margin-bottom: 10px;
}

.game-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.stats-section {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #ff6b6b;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: #ddd;
}

.buttons-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 300px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: none;
  border-radius: 15px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.shop-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: #fff;
}

.backpack-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: #fff;
}

.btn-icon {
  font-size: 28px;
  margin-right: 10px;
}

.btn-text {
  font-size: 20px;
}

.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ffd700;
  color: #8B4513;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.refresh-btn {
  margin-top: 30px;
  padding: 12px 30px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #fff;
}

.debug-btn {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  background: rgba(255, 215, 0, 0.9);
  border-radius: 20px;
  font-size: 14px;
  color: #8B4513;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.debug-btn:hover {
  background: #ffd700;
  transform: scale(1.05);
}

.disclaimer {
  margin-top: 40px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}
</style>