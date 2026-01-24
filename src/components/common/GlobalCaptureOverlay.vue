<template>
  <teleport to="body">
    <div
      v-if="appState.isCapturing"
      id="global-capture-overlay"
      style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.95) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        direction: rtl !important;
      "
    >
      <div
        style="
          background: #ffffff !important;
          color: #000000 !important;
          padding: 50px !important;
          border-radius: 30px !important;
          text-align: center !important;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5) !important;
          max-width: 90% !important;
          border: 5px solid #2196f3 !important;
        "
      >
        <div
          style="
            width: 80px;
            height: 80px;
            border: 8px solid #f3f3f3;
            border-top: 8px solid #2196f3;
            border-radius: 50%;
            margin: 0 auto 30px;
            animation: global-capture-spin 1s linear infinite;
          "
        ></div>
        <h1
          id="global-capture-title"
          style="
            font-size: 32px !important;
            font-weight: bold !important;
            margin: 0 0 15px 0 !important;
            color: #000000 !important;
            display: block !important;
          "
        >
          {{ appState.captureMessage }}
        </h1>
        <p
          id="global-capture-subtitle"
          style="font-size: 18px !important; color: #666666 !important; margin: 0 !important; display: block !important"
        >
          يرجى الانتظار، نقوم بتجهيز الصورة بأفضل جودة
        </p>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useappState } from '@/stores/appState';
const appState = useappState();

onMounted(() => {
  console.log('GlobalCaptureOverlay mounted and ready');
});

watch(
  () => appState.isCapturing,
  newVal => {
    console.log('Global Capture State Change:', newVal);
    if (newVal) {
      setTimeout(() => {
        const el = document.getElementById('global-capture-overlay');
        console.log('Overlay element in DOM:', !!el);
        if (el) {
          console.log('Overlay styles - zIndex:', window.getComputedStyle(el).zIndex, 'display:', window.getComputedStyle(el).display);
        }
      }, 100);
    }
  }
);
</script>

<style>
@keyframes global-capture-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
