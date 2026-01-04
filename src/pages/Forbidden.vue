<template>
  <div class="forbidden-page">
    <div class="forbidden-content">
      <v-icon icon="ri-lock-line" size="120" color="error" />

      <h1 class="text-h3 font-weight-bold mt-6 mb-2">غير مصرح لك</h1>

      <p class="text-h6 text-grey mb-6">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>

      <div class="d-flex gap-3">
        <v-btn color="primary" size="large" prepend-icon="ri-arrow-right-line" @click="goBack"> العودة للخلف </v-btn>

        <v-btn variant="outlined" size="large" prepend-icon="ri-home-line" @click="goHome"> الصفحة الرئيسية </v-btn>
      </div>

      <v-alert type="info" variant="tonal" class="mt-8" max-width="600">
        إذا كنت تعتقد أن هذا خطأ، تواصل مع المسؤول للحصول على الصلاحيات المطلوبة
      </v-alert>
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
  router.push('/dashboard');
};
</script>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.forbidden-content {
  text-align: center;
  max-width: 800px;
}
</style>
