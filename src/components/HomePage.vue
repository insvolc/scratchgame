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
        <div class="btn-wrapper">
          <button class="action-btn backpack-btn" @click="goToBackpack">
            <span class="btn-icon">🎒</span>
            <span class="btn-text">我的背包</span>
          </button>
          <span v-if="unscratchedCount > 0" class="badge">{{ unscratchedCount }}</span>
        </div>

        <button class="action-btn shop-btn" @click="goToShop">
          <span class="btn-icon">🛒</span>
          <span class="btn-text">购买彩票</span>
        </button>

        <div class="btn-wrapper">
          <button class="action-btn achievements-btn" @click="goToAchievements">
            <span class="btn-icon">🏆</span>
            <span class="btn-text">成就勋章</span>
          </button>
          <span v-if="unlockedAchievementCount > 0" class="badge achievement-badge">{{ unlockedAchievementCount }}</span>
        </div>
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
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const { coins, achievements } = storeToRefs(gameStore)
const unscratchedCount = gameStore.unscratchedCount
const totalWon = gameStore.totalWon
const unlockedAchievementCount = computed(() => achievements.value.filter(a => a.unlocked).length)

function goToShop() {
  gameStore.setView('shop')
}

function goToBackpack() {
  gameStore.setView('backpack')
}

function goToAchievements() {
  gameStore.setView('achievements')
}

function refreshGame() {
  if (confirm('确定要重新开始吗？所有数据将被重置！')) {
    gameStore.refreshCoins()
  }
}

function addCoinsDebug() {
  gameStore.addCoins(100)
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(250, 204, 21, 0.35);
  padding: 10px 20px;
  border-radius: 999px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.coins-icon {
  font-size: 22px;
  filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4));
}

.coins-count {
  font-size: 20px;
  font-weight: 800;
  color: #b45309;
  letter-spacing: 0.5px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
}

.logo-section {
  text-align: center;
  margin-bottom: 36px;
}

.game-title {
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 12px;
  background: linear-gradient(180deg, #1f2937 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 10px rgba(217, 119, 6, 0.15));
}

.game-subtitle {
  font-size: 16px;
  color: rgba(31, 41, 55, 0.65);
  letter-spacing: 4px;
  text-transform: uppercase;
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 24px 44px;
  border-radius: 20px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  margin-bottom: 36px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px;
}

.stat-value {
  font-size: 36px;
  font-weight: 900;
  color: #d97706;
}

.stat-label {
  font-size: 13px;
  color: rgba(31, 41, 55, 0.6);
  margin-top: 6px;
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 46px;
  background: linear-gradient(180deg, transparent, rgba(31, 41, 55, 0.15), transparent);
}

.buttons-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 320px;
  padding-top: 12px;
}

.btn-wrapper {
  position: relative;
  display: flex;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s;
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

.action-btn:hover {
  transform: translateY(-4px) scale(1.02);
}

.action-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.shop-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.28);
}

.shop-btn:hover {
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4);
}

.backpack-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.28);
}

.backpack-btn:hover {
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
}

.achievements-btn {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.28);
}

.achievements-btn:hover {
  box-shadow: 0 12px 32px rgba(217, 119, 6, 0.4);
}

.achievement-badge {
  background: linear-gradient(135deg, #fbbf24, #d97706);
}

.btn-icon {
  font-size: 26px;
  margin-right: 12px;
  position: relative;
  z-index: 1;
}

.btn-text {
  font-size: 18px;
  position: relative;
  z-index: 1;
  letter-spacing: 2px;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.6);
  z-index: 2;
}

.refresh-btn {
  margin-top: 32px;
  padding: 12px 28px;
  border: 1px solid rgba(31, 41, 55, 0.1);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  font-size: 14px;
  color: rgba(31, 41, 55, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #1f2937;
}

.debug-btn {
  margin-top: 12px;
  padding: 10px 20px;
  border: 1px solid rgba(250, 204, 21, 0.4);
  background: rgba(255, 251, 235, 0.72);
  border-radius: 999px;
  font-size: 13px;
  color: #b45309;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.debug-btn:hover {
  background: rgba(255, 251, 235, 0.95);
  transform: scale(1.05);
}

.disclaimer {
  margin-top: 36px;
  font-size: 12px;
  color: rgba(31, 41, 55, 0.45);
  text-align: center;
  letter-spacing: 0.5px;
}
</style>