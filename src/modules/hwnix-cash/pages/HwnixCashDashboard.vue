<template>
  <div class="hwnix-cash-dashboard pa-4 pa-md-6">
    <!-- Header Banner / Hero Section -->
    <v-card class="mb-6 elevation-2 overflow-hidden rounded-xl" color="primary" variant="flat">
      <div class="hero-background pa-6 pa-md-8 text-white">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center gap-3 mb-3">
              <v-avatar color="white" size="48" class="elevation-3">
                <v-icon icon="ri-wallet-3-line" color="primary" size="28" />
              </v-avatar>
              <div>
                <h1 class="text-h4 font-weight-bold mb-1 text-white">لوحة تحكم كاش هونكس</h1>
                <p class="text-subtitle-1 text-white text-opacity-90 mb-0">
                  المركز الرئيسي لإدارة المحافظ، الخطوط، الرسائل الواردة، ومعاملاتك علي كاش هونكس
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-md-left">
            <v-btn
              color="white"
              variant="elevated"
              size="large"
              rounded="lg"
              class="text-primary font-weight-bold px-6 elevation-3"
              prepend-icon="ri-android-line"
              href="/downloads/app-release.apk"
              target="_blank"
            >
              تنزيل تطبيق الأندرويد
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- App Role Notice Banner -->
    <v-alert color="info" variant="tonal" rounded="xl" border="start" class="mb-6 elevation-1" icon="ri-information-line">
      <div class="d-flex flex-column gap-1">
        <span class="font-weight-bold text-subtitle-1">تنبيه هامة حول آلية إدارة النظام:</span>
        <span class="text-body-2">
          التطبيق مسؤول عن استقبال الرسائل وإرسالها إلى السيرفر، بينما تتم إدارة النظام بالكامل من خلال لوحة التحكم على الويب باستخدام نفس بيانات
          تسجيل الدخول الخاصة بالتطبيق.
        </span>
      </div>
    </v-alert>

    <!-- Quick Stats Overview Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl pa-4 elevation-1 border h-100">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-medium">المحافظ والحسابات</div>
              <div class="text-h5 font-weight-bold primary--text my-1">
                {{ loading ? '...' : stats.totalAccounts }}
              </div>
              <span class="text-caption text-success font-weight-bold">
                <v-icon icon="ri-check-double-line" size="14" class="mr-1" />
                نشطة وجاهزة
              </span>
            </div>
            <v-avatar color="primary-container" size="48" rounded="xl">
              <v-icon icon="ri-bank-card-line" color="primary" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl pa-4 elevation-1 border h-100">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-medium">الخطوط المربوطة</div>
              <div class="text-h5 font-weight-bold secondary--text my-1">
                {{ loading ? '...' : stats.activeLines }}
              </div>
              <span class="text-caption text-info font-weight-bold">
                <v-icon icon="ri-cellphone-line" size="14" class="mr-1" />
                خطوط متصلة
              </span>
            </div>
            <v-avatar color="secondary-container" size="48" rounded="xl">
              <v-icon icon="ri-sim-card-line" color="secondary" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl pa-4 elevation-1 border h-100">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-medium">رسائل اليوم</div>
              <div class="text-h5 font-weight-bold info--text my-1">
                {{ loading ? '...' : stats.todayMessages }}
              </div>
              <span class="text-caption text-grey">رسالة مستلمة اليوم</span>
            </div>
            <v-avatar color="info-container" size="48" rounded="xl">
              <v-icon icon="ri-mail-check-line" color="info" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-xl pa-4 elevation-1 border h-100">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-grey font-weight-medium">معاملات اليوم</div>
              <div class="text-h5 font-weight-bold success--text my-1">
                {{ loading ? '...' : stats.todayTransactions }}
              </div>
              <span class="text-caption text-success font-weight-bold">معاملة مالية جديدة</span>
            </div>
            <v-avatar color="success-container" size="48" rounded="xl">
              <v-icon icon="ri-exchange-dollar-line" color="success" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Navigation Sections Grid -->
    <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-2">
      <v-icon icon="ri-grid-fill" color="primary" size="22" />
      أقسام إدارة النظام
    </h2>

    <v-row class="mb-6">
      <!-- 1. Lines & Devices -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="rounded-xl border pa-5 h-100 hover-card d-flex flex-column" variant="flat" to="/app/hwnix-cash/lines">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar color="primary" variant="tonal" size="44" rounded="lg">
              <v-icon icon="ri-cellphone-line" size="24" />
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold mb-0">الخطوط والأجهزة</h3>
              <span class="text-caption text-grey">إدارة شرائح SIM والهواتف المتصلة</span>
            </div>
          </div>
          <p class="text-body-2 text-grey-darken-1 flex-grow-1">
            متابعة حالة اتصالات الهواتف، ربط أرقام الشرائح، والتأكد من نشاط التزامن الفوري في الخلفية.
          </p>
          <div class="d-flex align-center justify-space-between pt-2">
            <span class="text-caption font-weight-bold text-primary">عرض التفاصيل</span>
            <v-icon icon="ri-arrow-left-s-line" color="primary" />
          </div>
        </v-card>
      </v-col>

      <!-- 2. Financial Accounts & Wallets -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="rounded-xl border pa-5 h-100 hover-card d-flex flex-column" variant="flat" to="/app/hwnix-cash/financial-accounts">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar color="success" variant="tonal" size="44" rounded="lg">
              <v-icon icon="ri-bank-card-line" size="24" />
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold mb-0">المحافظ والحسابات المالية</h3>
              <span class="text-caption text-grey">فودافون كاش، أورنج، اتصالات، وي</span>
            </div>
          </div>
          <p class="text-body-2 text-grey-darken-1 flex-grow-1">
            إضافة وتحديد أرقام المحافظ، ضبط الحدود اليومية والشهرية، الرصيد، وربطها بالخزائن المالية.
          </p>
          <div class="d-flex align-center justify-space-between pt-2">
            <span class="text-caption font-weight-bold text-success">عرض المحافظ</span>
            <v-icon icon="ri-arrow-left-s-line" color="success" />
          </div>
        </v-card>
      </v-col>

      <!-- 3. SMS Messages Log -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="rounded-xl border pa-5 h-100 hover-card d-flex flex-column" variant="flat" to="/app/hwnix-cash/messages">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar color="info" variant="tonal" size="44" rounded="lg">
              <v-icon icon="ri-mail-check-line" size="24" />
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold mb-0">سجل الرسائل الواردة</h3>
              <span class="text-caption text-grey">تتبع استلام المعاملات وتحليلها</span>
            </div>
          </div>
          <p class="text-body-2 text-grey-darken-1 flex-grow-1">
            سجل كامل بجميع الرسائل المستلمة من التطبيق، حالة المعالجة البرمجية، وتفاصيل التحويلات.
          </p>
          <div class="d-flex align-center justify-space-between pt-2">
            <span class="text-caption font-weight-bold text-info">سجل الرسائل</span>
            <v-icon icon="ri-arrow-left-s-line" color="info" />
          </div>
        </v-card>
      </v-col>

      <!-- 4. Wallet Transactions & Limits -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="rounded-xl border pa-5 h-100 hover-card d-flex flex-column" variant="flat" to="/app/hwnix-cash/wallet-transactions">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar color="warning" variant="tonal" size="44" rounded="lg">
              <v-icon icon="ri-exchange-dollar-line" size="24" />
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold mb-0">معاملات المحافظ والحدود</h3>
              <span class="text-caption text-grey">الإيداع والتحويل ومتابعة الاستهلاك</span>
            </div>
          </div>
          <p class="text-body-2 text-grey-darken-1 flex-grow-1">
            جدول المعاملات المالية المحسوبة، التحقق من الحدود اليومية والشهرية، وتقارير العمليات.
          </p>
          <div class="d-flex align-center justify-space-between pt-2">
            <span class="text-caption font-weight-bold text-warning">معاملات المحافظ</span>
            <v-icon icon="ri-arrow-left-s-line" color="warning" />
          </div>
        </v-card>
      </v-col>

      <!-- 5. Message Sources & Formats -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="rounded-xl border pa-5 h-100 hover-card d-flex flex-column" variant="flat" to="/app/hwnix-cash/message-sources">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar color="secondary" variant="tonal" size="44" rounded="lg">
              <v-icon icon="ri-settings-4-line" size="24" />
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-bold mb-0">مصادر الرسائل والصيغ</h3>
              <span class="text-caption text-grey">ضبط أسماء المرسليين المعتمدين</span>
            </div>
          </div>
          <p class="text-body-2 text-grey-darken-1 flex-grow-1">
            إدارة مرسلي رسائل المحافظ المعتمدين (VF-Cash, OrangeCash, EtisalatCash) وقواعد الذكاء الاصطناعي.
          </p>
          <div class="d-flex align-center justify-space-between pt-2">
            <span class="text-caption font-weight-bold text-secondary">إدارة المصادر</span>
            <v-icon icon="ri-arrow-left-s-line" color="secondary" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import httpClient from '@/api/httpClient';

const loading = ref(true);
const stats = ref({
  totalAccounts: 0,
  activeLines: 0,
  todayMessages: 0,
  todayTransactions: 0,
});

const fetchDashboardStats = async () => {
  loading.value = true;
  try {
    const response = await httpClient.get('/hwnix-cash/dashboard/stats');
    if (response.data && response.data.status) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error('فشل جلب إحصائيات كاش هونكس:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardStats();
});
</script>

<style scoped>
.hero-background {
  background: linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%);
}

.hover-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}
</style>
