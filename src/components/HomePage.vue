<template>
  <div class="home-page">
    <header class="header">
      <div class="coins-display">
        <span class="coins-icon">💰</span>
        <span class="coins-count">{{ coins }}</span>
      </div>
    </header>
    
    <main class="main-content">
      <div class="top-section">
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

      <div class="bottom-section">
        <button class="refresh-btn" @click="refreshGame">
          🔄 重新开始
        </button>

        <button class="debug-btn" @click="addCoinsDebug">
          💸 +100金币 (调试)
        </button>

        <p class="disclaimer">模拟游戏，不涉及真实金钱赌博</p>
      </div>
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
  height: 100%;
  padding: 80px 24px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #f1f5f9;
  padding: 10px 20px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
  padding-bottom: 40px;
  overflow-y: auto;
}

.top-section {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: auto;
  padding-top: 20px;
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
  color: #1f2937;
}

.game-subtitle {
  font-size: 16px;
  color: rgba(31, 41, 55, 0.65);
  letter-spacing: 4px;
  text-transform: uppercase;
}

.stats-section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #f1f5f9;
  padding: 24px 44px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
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
  background: #e2e8f0;
}

.buttons-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 360px;
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
  content: none;
}

.action-btn:hover {
  transform: translateY(-4px) scale(1.02);
}

.action-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.shop-btn {
  background: #f59e0b;
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.shop-btn:hover {
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.backpack-btn {
  background: #6366f1;
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.backpack-btn:hover {
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.achievements-btn {
  background: #fbbf24;
  color: #fff;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
}

.achievements-btn:hover {
  box-shadow: 0 8px 20px rgba(217, 119, 6, 0.3);
}

.achievement-badge {
  background: #fbbf24;
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
  background: #ef4444;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
  border: 2px solid #fff;
  z-index: 2;
}

.bottom-section {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
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

/* 移动端适配 */
@media (max-width: 480px) {
  .home-page {
    padding: 64px 16px 16px;
  }

  .header {
    padding: 6px 16px;
  }

  .coins-display {
    padding: 6px 14px;
  }

  .coins-icon {
    font-size: 18px;
  }

  .coins-count {
    font-size: 16px;
  }

  .main-content {
    padding-top: 8px;
    padding-bottom: 24px;
  }

  .top-section {
    width: calc(100% - 32px);
    max-width: 320px;
    padding-top: 0;
  }

  .logo-section {
    margin-bottom: 20px;
  }

  .game-title {
    font-size: 34px;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .game-subtitle {
    font-size: 12px;
    letter-spacing: 2px;
  }

  .stats-section {
    padding: 14px 24px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .stat-item {
    padding: 0 14px;
  }

  .stat-value {
    font-size: 26px;
  }

  .stat-label {
    font-size: 11px;
    margin-top: 4px;
  }

  .stat-divider {
    height: 36px;
  }

  .buttons-section {
    gap: 18px;
    width: calc(100% - 32px);
    max-width: 320px;
    padding-top: 0;
  }

  .bottom-section {
    width: calc(100% - 32px);
    max-width: 320px;
  }

  .action-btn {
    padding: 16px 18px;
    border-radius: 14px;
  }

  .btn-icon {
    font-size: 22px;
    margin-right: 10px;
  }

  .btn-text {
    font-size: 16px;
    letter-spacing: 1px;
  }

  .badge {
    top: -6px;
    right: -6px;
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .refresh-btn {
    margin-top: 20px;
    padding: 10px 22px;
    font-size: 13px;
  }

  .debug-btn {
    margin-top: 10px;
    padding: 8px 16px;
    font-size: 12px;
  }

  .disclaimer {
    margin-top: 20px;
    font-size: 11px;
  }
}
</style>