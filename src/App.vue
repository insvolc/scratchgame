<template>
  <div class="app">
    <!-- iframe 嵌入模式：直接渲染原始应用内容 -->
    <template v-if="isEmbedMode">
      <Transition name="page" mode="out-in">
        <component :is="currentViewComponent" :key="currentView" />
      </Transition>

      <div class="achievement-toast-container" :class="{ 'toast-embed': isEmbedMode }">
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

      <Transition name="fade">
        <div v-if="exitConfirmVisible" class="exit-toast" :class="{ 'exit-toast-embed': isEmbedMode }">再按一次退出</div>
      </Transition>
    </template>

    <!-- 桌面端预览模式：手机模拟器 + iframe -->
    <MobilePreview v-else>
      <Transition name="page" mode="out-in">
        <component :is="currentViewComponent" :key="currentView" />
      </Transition>

      <div class="achievement-toast-container" :class="{ 'toast-embed': isEmbedMode }">
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

      <Transition name="fade">
        <div v-if="exitConfirmVisible" class="exit-toast" :class="{ 'exit-toast-embed': isEmbedMode }">再按一次退出</div>
      </Transition>
    </MobilePreview>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { watch, ref, computed, onMounted, onUnmounted, type Component } from 'vue'
import { App } from '@capacitor/app'
import { useGameStore } from '@/stores/game'
import HomePage from '@/components/HomePage.vue'
import ShopPage from '@/components/ShopPage.vue'
import BackpackPage from '@/components/BackpackPage.vue'
import ScratchPage from '@/components/ScratchPage.vue'
import AchievementsPage from '@/components/AchievementsPage.vue'
import MobilePreview from '@/components/MobilePreview.vue'

const isEmbedMode = new URLSearchParams(window.location.search).has('embed')

const gameStore = useGameStore()
const { currentView, achievementNotifications } = storeToRefs(gameStore)

const viewComponents: Record<string, Component> = {
  home: HomePage,
  shop: ShopPage,
  backpack: BackpackPage,
  scratch: ScratchPage,
  achievements: AchievementsPage
}

const currentViewComponent = computed(() => viewComponents[currentView.value] || HomePage)
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

// 安卓返回键二次确认退出
const exitConfirmVisible = ref(false)
const exitConfirmTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const EXIT_CONFIRM_DELAY = 2000

let backButtonListener: { remove: () => Promise<void> } | null = null

onMounted(async () => {
  backButtonListener = await App.addListener('backButton', () => {
    // 刮奖页面禁止侧滑/返回键返回
    if (currentView.value === 'scratch') {
      return
    }

    if (currentView.value !== 'home') {
      gameStore.setView('home')
      return
    }

    if (exitConfirmVisible.value) {
      App.exitApp()
      return
    }

    exitConfirmVisible.value = true
    if (exitConfirmTimer.value) {
      clearTimeout(exitConfirmTimer.value)
    }
    exitConfirmTimer.value = setTimeout(() => {
      exitConfirmVisible.value = false
      exitConfirmTimer.value = null
    }, EXIT_CONFIRM_DELAY)
  })
})

onUnmounted(() => {
  if (exitConfirmTimer.value) {
    clearTimeout(exitConfirmTimer.value)
  }
  backButtonListener?.remove()
})
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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

.achievement-toast-container.toast-embed {
  top: 52px;
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

.exit-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  pointer-events: none;
  white-space: nowrap;
}

.exit-toast.exit-toast-embed {
  bottom: 92px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>