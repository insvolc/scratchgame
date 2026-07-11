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
        <div class="device-status-bar">
          <span class="status-time">9:41</span>
          <div class="status-icons">
            <div class="status-signal">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="status-wifi">
              <svg viewBox="0 0 16 12" width="16" height="12">
                <path d="M8 1c2.5 0 4.8 1 6.5 2.6l-.7.7C12.4 2.9 10.3 2 8 2S3.6 2.9 2.2 4.3l-.7-.7C3.2 2 5.5 1 8 1z" fill="currentColor"/>
                <path d="M8 4.5c1.7 0 3.2.7 4.3 1.8l-.7.7C10.7 5.9 9.4 5.3 8 5.3S5.3 5.9 4.4 6.9l-.7-.7C4.8 5.2 6.3 4.5 8 4.5z" fill="currentColor"/>
                <path d="M8 8c.9 0 1.7.4 2.2 1l-.7.7c-.4-.4-.9-.7-1.5-.7s-1.1.3-1.5.7l-.7-.7C6.3 8.4 7.1 8 8 8z" fill="currentColor"/>
              </svg>
            </div>
            <div class="status-battery">
              <div class="battery-body">
                <div class="battery-level"></div>
              </div>
              <div class="battery-cap"></div>
            </div>
          </div>
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
      </div>
      <div class="device-overlay">
        <div class="device-home-bar"></div>
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
    z-index: 11;
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

  .device-status-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    padding: 0 24px 0 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #000;
    z-index: 10;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
    background: #fff;
  }

  .status-time {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.2px;
    min-width: 38px;
  }

  .status-icons {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-signal {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
  }

  .status-signal span {
    width: 3px;
    background: #000;
    border-radius: 1px;
  }

  .status-signal span:nth-child(1) { height: 4px; }
  .status-signal span:nth-child(2) { height: 6px; }
  .status-signal span:nth-child(3) { height: 8px; }
  .status-signal span:nth-child(4) { height: 10px; }

  .status-wifi {
    width: 16px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
  }

  .status-battery {
    display: flex;
    align-items: center;
    gap: 1px;
    height: 12px;
  }

  .battery-body {
    width: 22px;
    height: 11px;
    border: 1px solid rgba(0, 0, 0, 0.35);
    border-radius: 3px;
    padding: 1.5px;
    display: flex;
    align-items: center;
  }

  .battery-level {
    width: 70%;
    height: 100%;
    background: #000;
    border-radius: 1px;
  }

  .battery-cap {
    width: 1.5px;
    height: 5px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 0 1px 1px 0;
  }

  .iframe-wrapper {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }

  .device-iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }

  .device-overlay {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 12px;
    pointer-events: none;
    z-index: 100;
    overflow: hidden;
    border-radius: 43px;
  }

  .device-home-bar {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 100px;
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
