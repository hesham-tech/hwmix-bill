<template>
  <div class="dashboard-container">
    <transition name="fade" mode="out-in">
      <AdminDashboard v-if="userStore.isStaff" />
      <CustomerDashboard v-else />
    </transition>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user';
import AdminDashboard from './AdminDashboard.vue';
import CustomerDashboard from './CustomerDashboard.vue';

const userStore = useUserStore();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dashboard-container {
  min-height: calc(100vh - 150px);
}
</style>
