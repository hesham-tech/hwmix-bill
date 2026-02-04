<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <v-icon icon="ri-file-search-line" size="120" color="primary" />

      <h1 class="text-h3 font-weight-bold mt-6 mb-2">404</h1>

      <h2 class="text-h5 mb-2">الصفحة غير موجودة</h2>

      <p class="text-body-1 text-grey mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها</p>

      <div class="d-flex gap-3">
        <v-btn color="primary" size="large" prepend-icon="ri-arrow-right-line" @click="goBack"> العودة للخلف </v-btn>

        <v-btn variant="outlined" size="large" prepend-icon="ri-home-line" @click="goHome"> الصفحة الرئيسية </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/app');
};
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
}
</style>
