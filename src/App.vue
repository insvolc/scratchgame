<template>
  <div class="app">
    <HomePage v-if="currentView === 'home'" />
    <ShopPage v-else-if="currentView === 'shop'" />
    <BackpackPage v-else-if="currentView === 'backpack'" />
    <ScratchPage v-else-if="currentView === 'scratch'" />
    <AchievementsPage v-else-if="currentView === 'achievements'" />

    <div class="achievement-toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="achievement in achievementNotifications"
          :key="achievement.id"
          class="achievement-toast"
        >
          <span class="toast-icon">{{ achievement.icon }}</span>
          <div class="toast-content">
            <div class="toast-title">解锁成就</div>
            <div class="toast-name">{{ achievement.name }}</div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { watch, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import HomePage from '@/components/HomePage.vue'
import ShopPage from '@/components/ShopPage.vue'
import BackpackPage from '@/components/BackpackPage.vue'
import ScratchPage from '@/components/ScratchPage.vue'
import AchievementsPage from '@/components/AchievementsPage.vue'

const gameStore = useGameStore()
const { currentView, achievementNotifications } = storeToRefs(gameStore)
const dismissTimer = ref<ReturnType<typeof setTimeout> | null>(null)

watch(
  () => achievementNotifications.value.length,
  (length) => {
    if (length === 0) return

    if (dismissTimer.value) {
      clearTimeout(dismissTimer.value)
    }

    dismissTimer.value = setTimeout(() => {
      gameStore.clearAchievementNotifications()
      dismissTimer.value = null
    }, 3000)
  },
  { immediate: true }
)
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.achievement-toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
  pointer-events: none;
  width: calc(100% - 48px);
  max-width: 360px;
}

.achievement-toast {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(250, 204, 21, 0.45);
  box-shadow: 0 16px 48px rgba(245, 158, 11, 0.22);
  backdrop-filter: blur(14px);
  pointer-events: auto;
}

.toast-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.toast-content {
  display: flex;
  flex-direction: column;
}

.toast-title {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.toast-name {
  font-size: 16px;
  font-weight: 800;
  color: #1f2937;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.92);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}
</style>