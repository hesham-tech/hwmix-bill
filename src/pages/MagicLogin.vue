<template>
  <div class="d-flex align-center justify-center" style="height: 100vh;">
    <v-card class="pa-5 text-center" elevation="2" max-width="400">
      
      <div v-if="loading">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
        <h3 class="text-h6">جاري التحقق من الصلاحيات...</h3>
      </div>

      <div v-else-if="conflictUser">
        <v-icon color="warning" size="64" class="mb-4">tabler-alert-triangle</v-icon>
        <h3 class="text-h6 mb-2">تنبيه تعارض الحسابات</h3>
        <p class="text-body-1 mb-4">
          أنت مسجل دخول حالياً بحساب <strong>{{ currentUser.name || currentUser.full_name }}</strong>.
          <br>
          التطبيق يحاول فتح لوحة التحكم لحساب <strong>{{ conflictUser.name }}</strong>.
        </p>
        <p class="text-body-2 text-medium-emphasis mb-6">ماذا تود أن تفعل؟</p>
        
        <v-btn color="primary" block class="mb-3" @click="executeSwitch" :loading="switching">
          تسجيل الخروج والانتقال لحساب ({{ conflictUser.name }})
        </v-btn>
        <v-btn color="secondary" variant="outlined" block @click="cancelSwitch" :disabled="switching">
          إلغاء والبقاء في الحساب الحالي
        </v-btn>
      </div>

      <div v-else-if="error">
        <v-icon color="error" size="64" class="mb-4">tabler-x</v-icon>
        <h3 class="text-h6 mb-2">خطأ في الرابط</h3>
        <p class="text-body-1 mb-4">{{ error }}</p>
        <v-btn color="primary" to="/login">الذهاب لتسجيل الدخول</v-btn>
      </div>

    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from '@/api/axios.config';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const switching = ref(false);
const error = ref(null);
const conflictUser = ref(null);

const currentUser = computed(() => authStore.user);
const token = route.query.token;

onMounted(async () => {
  if (!token) {
    error.value = "الرابط غير صالح أو مفقود.";
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get('/agent/auth/magic-link/check', { params: { token } });
    
    if (response.data.status !== 'valid') {
      router.push({ name: 'login', query: { message: 'invalid_magic_link' } });
      return;
    }

    const targetUser = response.data.target_user;

    // السيناريو الأول: المتصفح غير مسجل دخوله لأي حساب
    if (!authStore.isAuthenticated) {
      // توجيه لصفحة تسجيل الدخول العادية لإنشاء جلسة دائمة يدوياً
      router.push({ name: 'login', query: { message: 'login_required_for_dashboard' } });
      return;
    }

    // السيناريو الثاني: المتصفح مسجل دخول بنفس الحساب
    if (currentUser.value.id === targetUser.id) {
      // سنتوجه للوحة التحكم مباشرة
      router.push('/app/hwnix-cash/dashboard');
      return;
    }

    // السيناريو الثالث: المتصفح مسجل بحساب مختلف
    conflictUser.value = targetUser;
    loading.value = false;

  } catch (err) {
    error.value = "حدث خطأ أثناء الاتصال بالسيرفر.";
    loading.value = false;
  }
});

const executeSwitch = async () => {
  switching.value = true;
  try {
    const response = await axios.post('/agent/auth/magic-link/execute', { token });
    if (response.data.success || response.data.status === 'success') {
      const data = response.data.data || response.data;
      authStore.saveLoginData({ user: data.user, token: data.token }, true);
      window.location.href = '/app/hwnix-cash/dashboard'; // Full reload to clear state
    } else {
      error.value = "فشل تبديل الحساب.";
      conflictUser.value = null;
    }
  } catch (err) {
    error.value = "حدث خطأ أثناء محاولة التبديل.";
    conflictUser.value = null;
  } finally {
    switching.value = false;
  }
};

const cancelSwitch = () => {
  router.push('/app/hwnix-cash/dashboard');
};
</script>
