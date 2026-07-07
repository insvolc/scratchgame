<template>
  <div class="achievements-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <h1 class="page-title">成就勋章</h1>
      <div class="coins-display">
        <span class="coins-icon">💰</span>
        <span class="coins-count">{{ coins }}</span>
      </div>
    </header>

    <main class="main-content">
      <div class="summary-card">
        <div class="summary-item">
          <span class="summary-value">{{ unlockedCount }}</span>
          <span class="summary-label">已解锁</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-value">{{ totalCount }}</span>
          <span class="summary-label">总勋章</span>
        </div>
      </div>

      <div class="achievements-grid">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked }"
        >
          <div class="medal">
            <span class="medal-icon">{{ achievement.unlocked ? achievement.icon : '🔒' }}</span>
            <div v-if="achievement.unlocked" class="medal-glow"></div>
          </div>
          <div class="achievement-info">
            <h3 class="achievement-name">{{ achievement.name }}</h3>
            <p class="achievement-desc">{{ achievement.description }}</p>
            <span v-if="achievement.unlocked && achievement.unlockedAt" class="unlock-time">
              {{ formatTime(achievement.unlockedAt) }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const { coins, achievements } = storeToRefs(gameStore)

const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length)
const totalCount = computed(() => achievements.value.length)

function goBack() {
  gameStore.setView('home')
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.achievements-page {
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
  margin-bottom: 16px;
}

.back-btn {
  padding: 10px 18px;
  border: 1px solid rgba(31, 41, 55, 0.1);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  font-size: 14px;
  color: rgba(31, 41, 55, 0.75);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #1f2937;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: 2px;
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(250, 204, 21, 0.35);
  padding: 10px 18px;
  border-radius: 999px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.coins-icon {
  font-size: 20px;
}

.coins-count {
  font-size: 18px;
  font-weight: 800;
  color: #b45309;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 20px 32px;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 28px;
}

.summary-value {
  font-size: 32px;
  font-weight: 900;
  color: #d97706;
}

.summary-label {
  font-size: 13px;
  color: rgba(31, 41, 55, 0.6);
  margin-top: 4px;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, rgba(31, 41, 55, 0.15), transparent);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0.72;
}

.achievement-card.unlocked {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(250, 204, 21, 0.45);
  box-shadow: 0 12px 36px rgba(245, 158, 11, 0.15);
  opacity: 1;
}

.medal {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  flex-shrink: 0;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.08);
}

.achievement-card.unlocked .medal {
  background: linear-gradient(135deg, #fde047 0%, #f59e0b 100%);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.5);
}

.medal-icon {
  font-size: 30px;
  position: relative;
  z-index: 1;
}

.medal-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-name {
  font-size: 16px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 6px;
}

.achievement-desc {
  font-size: 13px;
  color: rgba(31, 41, 55, 0.6);
  line-height: 1.4;
  margin: 0;
}

.unlock-time {
  display: inline-block;
  margin-top: 8px;
  font-size: 11px;
  color: #d97706;
  font-weight: 700;
  padding: 3px 10px;
  background: rgba(251, 191, 36, 0.15);
  border-radius: 999px;
}
</style>
