<template>
  <div class="app">
    <HomePage v-if="currentView === 'home'" />
    <ShopPage v-else-if="currentView === 'shop'" />
    <BackpackPage v-else-if="currentView === 'backpack'" />
    <ScratchPage v-else-if="currentView === 'scratch'" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import HomePage from '@/components/HomePage.vue'
import ShopPage from '@/components/ShopPage.vue'
import BackpackPage from '@/components/BackpackPage.vue'
import ScratchPage from '@/components/ScratchPage.vue'

const gameStore = useGameStore()
const { currentView } = storeToRefs(gameStore)
</script>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
}
</style>