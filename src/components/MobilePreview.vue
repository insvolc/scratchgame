<template>
  <div class="mobile-preview">
    <!-- 桌面端：手机模拟器 + iframe 嵌入应用 -->
    <div v-if="!isMobile" class="device-frame">
      <div class="device-side-button device-button-left top"></div>
      <div class="device-side-button device-button-left middle"></div>
      <div class="device-side-button device-button-left bottom"></div>
      <div class="device-side-button device-button-right"></div>

      <div class="device-screen">
        <div class="device-notch">
          <div class="dynamic-island"></div>
        </div>
        <div class="iframe-wrapper">
          <iframe
            ref="iframeRef"
            class="device-iframe"
            :src="iframeSrc"
            frameborder="0"
            scrolling="no"
            title="幸运刮刮乐"
          ></iframe>
        </div>
        <div class="device-home-indicator"></div>
      </div>
    </div>

    <!-- 移动端：直接渲染原始应用内容 -->
    <div v-else class="mobile-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const iframeRef = ref<HTMLIFrameElement | null>(null)

const isMobile = ref(window.innerWidth <= 480)

const iframeSrc = computed(() => {
  const url = new URL(window.location.href)
  url.searchParams.set('embed', '1')
  return url.toString()
})

function handleResize() {
  isMobile.value = window.innerWidth <= 480
}

onMounted(() => {
  document.body.classList.add('preview-mode')
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.body.classList.remove('preview-mode')
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.mobile-preview {
  width: 100%;
  height: 100%;
}

/* 桌面端：手机模拟器 */
.device-frame {
  display: none;
}

@media (min-width: 481px) {
  .mobile-preview {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-content {
    display: none;
  }

  .device-frame {
    display: block;
    width: 414px;
    height: 852px;
    border-radius: 55px;
    background: #1c1c1e;
    border: 12px solid #1c1c1e;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.1),
      0 25px 60px rgba(0, 0, 0, 0.25),
      0 10px 20px rgba(0, 0, 0, 0.15);
    position: relative;
    flex-shrink: 0;
  }

  .device-screen {
    width: 100%;
    height: 100%;
    border-radius: 43px;
    overflow: hidden;
    position: relative;
    background: #fff;
  }

  .device-notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 126px;
    height: 35px;
    background: #000;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    z-index: 10;
  }

  .dynamic-island {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90px;
    height: 24px;
    background: #0a0a0a;
    border-radius: 12px;
  }

  .iframe-wrapper {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 20px;
    overflow: hidden;
  }

  .device-iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }

  .device-home-indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 100px;
    z-index: 10;
  }

  .device-side-button {
    position: absolute;
    background: #2d2d2f;
    border-radius: 4px;
    z-index: -1;
  }

  .device-button-left {
    left: -16px;
    width: 6px;
  }

  .device-button-left.top {
    top: 110px;
    height: 28px;
  }

  .device-button-left.middle {
    top: 170px;
    height: 64px;
  }

  .device-button-left.bottom {
    top: 250px;
    height: 64px;
  }

  .device-button-right {
    right: -16px;
    top: 180px;
    width: 6px;
    height: 90px;
  }
}

/* 移动端：全屏应用 */
.mobile-content {
  width: 100%;
  height: 100%;
}
</style>
