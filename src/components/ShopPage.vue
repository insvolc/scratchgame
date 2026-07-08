<template>
  <div class="shop-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <h1 class="page-title">彩票商城</h1>
      <div class="coins-display">
        <span class="coins-icon">💰</span>
        <span class="coins-count">{{ coins }}</span>
      </div>
    </header>
    
    <main class="main-content">
      <div class="lottery-grid">
        <div 
          v-for="lottery in lotteries" 
          :key="lottery.id" 
          class="lottery-card"
          :class="lottery.theme"
        >
          <div class="lottery-image">
            <span class="theme-icon">{{ getThemeIcon(lottery.theme) }}</span>
          </div>
          <div class="lottery-info">
            <h3 class="lottery-name">{{ lottery.name }}</h3>
            <div class="lottery-price">
              <span class="price-icon">💰</span>
              <span class="price-value">{{ lottery.price }}</span>
            </div>
            <p class="lottery-desc">{{ lottery.description }}</p>
          </div>
          <button 
            class="buy-btn" 
            :disabled="coins < lottery.price"
            @click="buyLottery(String(lottery.id))"
          >
            {{ coins >= lottery.price ? '购买' : '金币不足' }}
          </button>
        </div>
      </div>
      
      <div v-if="showNotification" class="notification" :class="notificationType">
        {{ notificationMessage }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const { coins } = storeToRefs(gameStore)
const lotteries = gameStore.lotteries

const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')

function getThemeIcon(theme: string): string {
  const icons: Record<string, string> = {
    gold: '🌟',
    diamond: '💎',
    red: '🏮',
    green: '🍀',
    rainbow: '🌈',
    'red-gold': '囍',
    'red-lucky': '¥'
  }
  return icons[theme] || '🎟️'
}

function goBack() {
  gameStore.setView('home')
}

function buyLottery(lotteryId: string) {
  const success = gameStore.buyLottery(lotteryId)
  if (success) {
    notificationMessage.value = '购买成功！快去背包看看吧~'
    notificationType.value = 'success'
  } else {
    notificationMessage.value = '金币不足，无法购买'
    notificationType.value = 'error'
  }
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 2000)
}
</script>

<style scoped>
.shop-page {
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
}

.lottery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.lottery-card {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: transform 0.25s, box-shadow 0.25s;
  display: flex;
  flex-direction: column;
}

.lottery-card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.lottery-image {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  position: relative;
}

.lottery-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.12) 100%);
}

.lottery-card.gold .lottery-image {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.lottery-card.diamond .lottery-image {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
}

.lottery-card.red .lottery-image {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.lottery-card.green .lottery-image {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.lottery-card.rainbow .lottery-image {
  background: linear-gradient(135deg, #f87171, #fbbf24, #34d399);
}

.lottery-card.red-gold .lottery-image {
  background: linear-gradient(135deg, #f87171, #fbbf24);
}

.lottery-card.red-lucky .lottery-image {
  background: linear-gradient(135deg, #fb7185, #fb923c);
}

.lottery-info {
  padding: 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.lottery-name {
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 10px;
}

.lottery-price {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.price-icon {
  font-size: 18px;
  margin-right: 5px;
}

.price-value {
  font-size: 26px;
  font-weight: 900;
  color: #d97706;
}

.lottery-desc {
  font-size: 13px;
  color: rgba(31, 41, 55, 0.6);
  line-height: 1.5;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.buy-btn {
  width: calc(100% - 44px);
  margin: 0 22px 22px;
  padding: 15px;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.28);
}

.buy-btn:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 10px 28px rgba(245, 158, 11, 0.4);
}

.buy-btn:disabled {
  background: rgba(31, 41, 55, 0.08);
  color: rgba(31, 41, 55, 0.35);
  box-shadow: none;
  cursor: not-allowed;
}

.notification {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 30px;
  border-radius: 999px;
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.notification.success {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
}

.notification.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .lottery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .lottery-image {
    height: 90px;
    font-size: 40px;
  }

  .lottery-info {
    padding: 12px;
  }

  .lottery-name {
    font-size: 16px;
    margin-bottom: 6px;
  }

  .lottery-price {
    margin-bottom: 8px;
  }

  .price-value {
    font-size: 20px;
  }

  .lottery-desc {
    font-size: 11px;
    line-height: 1.35;
    margin-bottom: 8px;
    -webkit-line-clamp: 1;
  }

  .buy-btn {
    width: calc(100% - 24px);
    margin: 0 12px 12px;
    padding: 9px;
    border-radius: 10px;
    font-size: 14px;
  }
}
</style>