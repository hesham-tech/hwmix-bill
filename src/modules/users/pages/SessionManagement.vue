<template>
  <div class="session-management-page">
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-black mb-1">إدارة الأجهزة والجلسات</h1>
        <p class="text-grey-darken-1">تحكم في الأجهزة التي سجلت الدخول منها إلى حسابك وقم بتأمين حسابك.</p>
      </div>
      <v-btn color="error" variant="tonal" prepend-icon="ri-logout-circle-line" :loading="revokingAll" @click="confirmRevokeOthers">
        تسجيل الخروج من جميع الأجهزة الأخرى
      </v-btn>
    </div>

    <v-alert type="info" variant="tonal" class="mb-6 rounded-md" icon="ri-shield-user-line" title="نصيحة أمان">
      إذا رأيت جهازاً لا تعرفه، قم بتسجيل الخروج منه فوراً وقم بتغيير كلمة المرور الخاصة بك.
    </v-alert>

    <v-row v-if="loading && !sessions.length">
      <v-col v-for="i in 3" :key="i" cols="12" md="6" lg="4">
        <v-skeleton-loader type="list-item-avatar-three-line" class="rounded-md border" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="session in sessions" :key="session.id" cols="12" md="6" lg="4">
        <v-card variant="flat" border class="session-card rounded-md h-100 overflow-hidden" :class="{ 'current-session': session.is_current }">
          <div class="pa-5">
            <div class="d-flex align-start gap-4">
              <v-avatar :color="session.is_current ? 'primary' : 'grey-lighten-4'" rounded="md" size="48">
                <v-icon :icon="getDeviceIcon(session.device)" :color="session.is_current ? 'white' : 'grey-darken-1'" />
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex align-center gap-2 mb-1">
                  <span class="text-body-1 font-weight-bold line-clamp-1">{{ formatDeviceName(session.device) }}</span>
                  <v-chip v-if="session.is_current" color="primary" size="x-small" class="font-weight-bold"> هذا الجهاز </v-chip>
                </div>

                <p class="text-caption text-grey mb-4">{{ session.device }}</p>

                <div class="d-flex flex-column gap-1">
                  <div class="d-flex align-center gap-2 text-caption">
                    <v-icon icon="ri-time-line" size="14" class="text-grey" />
                    <span>تم الإنشاء: {{ formatDate(session.created_at) }}</span>
                  </div>
                  <div class="d-flex align-center gap-2 text-caption">
                    <v-icon icon="ri-history-line" size="14" class="text-grey" />
                    <span>آخر نشاط: {{ session.last_used_at ? formatDate(session.last_used_at) : 'الآن' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <v-divider />

          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-spacer />
            <v-btn
              v-if="!session.is_current"
              color="error"
              variant="text"
              prepend-icon="ri-delete-bin-line"
              size="small"
              class="font-weight-bold"
              @click="confirmRevoke(session)"
            >
              إنهاء الجلسة
            </v-btn>
            <span v-else class="text-caption font-weight-bold text-primary px-2"> نشط حالياً </span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Confirm Revoke Dialog -->
    <v-dialog v-model="revokeDialog.show" max-width="400">
      <v-card class="rounded-md pa-2">
        <v-card-title class="text-h6 font-weight-bold">إنهاء الجلسة؟</v-card-title>
        <v-card-text> هل أنت متأكد من رغبتك في تسجيل الخروج من هذا الجهاز؟ سيتم طلب تسجيل الدخول مرة أخرى للوصول إلى الحساب. </v-card-text>
        <v-card-actions class="mt-4">
          <v-spacer />
          <v-btn variant="text" rounded="md" @click="revokeDialog.show = false"> إلغاء </v-btn>
          <v-btn color="error" variant="flat" rounded="md" :loading="revokingId === revokeDialog.id" @click="handleRevoke"> إنهاء الجلسة </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Revoke All Dialog -->
    <v-dialog v-model="revokeAllDialog" max-width="400">
      <v-card class="rounded-md pa-2">
        <v-card-title class="text-h6 font-weight-bold text-error">إنهاء جميع الجلسات الأخرى؟</v-card-title>
        <v-card-text> سيتم تسجيل الخروج من جميع الأجهزة والمنصات الأخرى باستثناء هذا الجهاز الحالي. هل تود الاستمرار؟ </v-card-text>
        <v-card-actions class="mt-4">
          <v-spacer />
          <v-btn variant="text" rounded="md" @click="revokeAllDialog = false"> إلغاء </v-btn>
          <v-btn color="error" variant="flat" rounded="md" :loading="revokingAll" @click="handleRevokeOthers"> تأكيد الإنهاء </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authService } from '@/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

dayjs.locale('ar');

const sessions = ref([]);
const loading = ref(false);
const revokingId = ref(null);
const revokingAll = ref(false);

const revokeDialog = ref({
  show: false,
  id: null,
});
const revokeAllDialog = ref(false);

const fetchSessions = async () => {
  loading.value = true;
  try {
    sessions.value = await authService.getSessions();
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
  } finally {
    loading.value = false;
  }
};

const getDeviceIcon = userAgent => {
  if (!userAgent) return 'ri-device-line';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobi')) return 'ri-smartphone-line';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'ri-tablet-line';
  return 'ri-computer-line';
};

const formatDeviceName = userAgent => {
  if (!userAgent) return 'جهاز غير معروف';

  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Macintosh')) return 'MacBook / Mac';
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('Android')) return 'Android Phone';
  if (userAgent.includes('Linux')) return 'Linux Device';

  return 'متصفح ويب';
};

const formatDate = date => {
  if (!date) return 'متاح الآن';
  return dayjs(date).format('D MMMM YYYY - h:mm A');
};

const confirmRevoke = session => {
  revokeDialog.value = {
    show: true,
    id: session.id,
  };
};

const handleRevoke = async () => {
  revokingId.value = revokeDialog.value.id;
  try {
    await authService.revokeSession(revokingId.value);
    sessions.value = sessions.value.filter(s => s.id !== revokingId.value);
    revokeDialog.value.show = false;
  } catch (error) {
    console.error('Failed to revoke session:', error);
  } finally {
    revokingId.value = null;
  }
};

const confirmRevokeOthers = () => {
  revokeAllDialog.value = true;
};

const handleRevokeOthers = async () => {
  revokingAll.value = true;
  try {
    await authService.revokeOtherSessions();
    sessions.value = sessions.value.filter(s => s.is_current);
    revokeAllDialog.value = false;
  } catch (error) {
    console.error('Failed to revoke others:', error);
  } finally {
    revokingAll.value = false;
  }
};

onMounted(fetchSessions);
</script>

<style scoped>
.session-card {
  transition: all 0.3s ease;
}

.session-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04) !important;
}

.current-session {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.02) !important;
}

.gap-4 {
  gap: 16px;
}
.gap-2 {
  gap: 8px;
}
.gap-1 {
  gap: 4px;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
