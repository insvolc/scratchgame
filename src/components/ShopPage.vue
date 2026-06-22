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
            <div class="lottery-meta">
              <span class="meta-item">最高奖金: {{ lottery.maxPrize }}</span>
              <span class="meta-item">中奖概率: {{ lottery.probability }}</span>
            </div>
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
    rainbow: '🌈'
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
}

.lottery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.lottery-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.lottery-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.lottery-image {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
}

.lottery-card.gold .lottery-image {
  background: linear-gradient(135deg, #ffd700, #ffb700);
}

.lottery-card.diamond .lottery-image {
  background: linear-gradient(135deg, #e0e0e0, #9e9e9e);
}

.lottery-card.red .lottery-image {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
}

.lottery-card.green .lottery-image {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
}

.lottery-card.rainbow .lottery-image {
  background: linear-gradient(135deg, #ff6b6b, #ffd700, #4ECDC4);
}

.lottery-info {
  padding: 20px;
}

.lottery-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
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
  font-size: 24px;
  font-weight: bold;
  color: #ff6b6b;
}

.lottery-desc {
  font-size: 13px;
  color: #888;
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lottery-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.meta-item {
  font-size: 14px;
  color: #666;
}

.buy-btn {
  width: calc(100% - 40px);
  margin: 0 20px 20px;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.buy-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.buy-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.notification {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 30px;
  color: #fff;
  font-weight: bold;
  animation: fadeInUp 0.3s ease;
}

.notification.success {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
}

.notification.error {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
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
</style>