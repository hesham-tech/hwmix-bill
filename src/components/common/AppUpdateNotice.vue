<template>
  <aside v-if="update" class="app-update-notice" role="status">
    <span>تحديث جديد جاهز. احفظ عملك ثم حدّث الواجهة.</span>
    <button type="button" @click="update()">تحديث الآن</button>
    <button type="button" aria-label="إغلاق تنبيه التحديث" @click="update = null">لاحقًا</button>
  </aside>
</template>

<script setup>
import { onMounted, onUnmounted, shallowRef } from 'vue';
const update = shallowRef(null);
const notify = event => { update.value = event.detail; };
onMounted(() => window.addEventListener('hwnix-update-available', notify));
onUnmounted(() => window.removeEventListener('hwnix-update-available', notify));
</script>

<style scoped>
.app-update-notice { position: fixed; z-index: 10002; inset-inline: 16px; bottom: 16px; margin-inline: auto; width: fit-content; max-width: calc(100% - 32px); display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #bae6fd; border-radius: 10px; background: #f0f9ff; color: #075985; box-shadow: 0 4px 24px rgb(0 134 205 / 15%); }
button { border: 1px solid #0086cd; border-radius: 6px; padding: 4px 12px; cursor: pointer; }
</style>
