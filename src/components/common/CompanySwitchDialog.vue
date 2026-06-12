<template>
  <!-- تعليق عربي: كلاس نافذة تبديل المتجر أو الشركة مع إمكانية القفل (Persistent) في حال حذف الشركة النشطة حالياً. -->
  <AppDialog
    :model-value="modelValue"
    :title="companyDeletedMode ? 'الشركة الحالية محذوفة' : 'تبديل المتجر / الشركة'"
    :icon="companyDeletedMode ? 'ri-error-warning-line' : 'ri-exchange-funds-line'"
    max-width="700"
    :hide-actions="true"
    :persistent="persistent"
    @update:model-value="!persistent && $emit('update:modelValue', $event)"
  >
    <div class="pa-0 dialog-content">
      <!-- Warning alert when current active company is deleted -->
      <v-alert
        v-if="companyDeletedMode"
        type="error"
        variant="tonal"
        class="ma-4 mb-2 rounded-lg font-weight-medium"
        icon="ri-error-warning-line"
      >
        تنبيه: لقد تم حذف الشركة أو المتجر النشط حالياً الخاص بك من قبل المسؤول.
        يرجى اختيار شركة أو متجر آخر من القائمة التالية للمتابعة.
      </v-alert>

      <div class="pa-4 pt-2 overflow-y-auto" style="max-height: 500px">
        <div class="text-subtitle-2 mb-3 text-grey-darken-1 px-1">الشركات التي يمكنك ادارتها:</div>

        <v-row dense>
          <!-- All Companies Option for Super Admin -->
          <v-col v-if="userStore.isAdmin && !companyDeletedMode" cols="12">
            <v-card
              :active="userStore.currentUser?.active_company_id === null"
              class="company-card mb-2 all-companies-card"
              variant="outlined"
              @click="handleSwitch({ id: null, name: 'كل الشركات' })"
              :disabled="loadingId === 'all'"
              :class="{ 'active-card': userStore.currentUser?.active_company_id === null }"
            >
              <div class="d-flex pa-3 align-start">
                <v-avatar :size="mobile ? 48 : 64" rounded="md" color="primary-lighten-4" :class="[mobile ? 'me-2' : 'me-4', 'border-thin']">
                  <v-icon icon="ri-global-line" color="primary" :size="mobile ? 24 : 32" />
                </v-avatar>

                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <h3 class="text-h6 font-weight-bold company-name">
                      كل الشركات (جميع المدخلات)
                    </h3>
                    <v-chip
                      v-if="userStore.currentUser?.active_company_id === null"
                      size="x-small"
                      color="success"
                      class="text-caption font-weight-bold"
                      variant="flat"
                    >
                      النشطة حالياً
                    </v-chip>
                  </div>
                  <div class="text-caption text-grey">
                    عرض كافة الحركات والمستندات والعمليات المالية لجميع الشركات والفروع دفعة واحدة.
                  </div>
                </div>

                <div class="ms-2 align-self-center">
                  <v-progress-circular v-if="loadingId === 'all'" indeterminate size="24" width="3" color="primary" />
                  <v-btn v-else icon="ri-arrow-left-line" variant="text" color="primary" size="small" />
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col v-for="company in filteredCompanies" :key="company.id" cols="12">
            <v-card
              :active="company.id === userStore.currentUser?.active_company_id"
              class="company-card mb-2"
              variant="outlined"
              @click="handleSwitch(company)"
              :disabled="loadingId === company.id || (companyDeletedMode && company.id === userStore.currentUser?.active_company_id)"
              :class="{
                'active-card': company.id === userStore.currentUser?.active_company_id && !companyDeletedMode,
                'deleted-active-card': company.id === userStore.currentUser?.active_company_id && companyDeletedMode
              }"
            >
              <div class="d-flex pa-3 align-start">
                <!-- Company Logo -->
                <v-avatar :size="mobile ? 48 : 64" rounded="md" color="grey-lighten-4" :class="[mobile ? 'me-2' : 'me-4', 'border-thin']">
                  <v-img v-if="company.logo" :src="company.logo" contain />
                  <v-icon v-else icon="ri-building-line" color="primary" :size="mobile ? 24 : 32" />
                </v-avatar>

                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <h3 class="text-h6 font-weight-bold company-name">
                      {{ company.name }}
                    </h3>
                    <v-chip
                      v-if="company.id === userStore.currentUser?.active_company_id"
                      size="x-small"
                      :color="companyDeletedMode ? 'error' : 'success'"
                      class="text-caption font-weight-bold"
                      variant="flat"
                    >
                      {{ companyDeletedMode ? 'محذوفة حالياً' : 'النشطة حالياً' }}
                    </v-chip>
                  </div>

                  <div class="d-flex flex-wrap gap-2 mb-2 align-center">
                    <span v-if="company.field" class="text-caption text-grey-darken-1 d-flex align-center">
                      <v-icon icon="ri-apps-2-line" start size="14" class="me-1" />
                      {{ company.field }}
                    </span>
                    <span v-if="company.owner_name" class="text-caption text-grey-darken-1 d-flex align-center">
                      <v-icon icon="ri-user-star-line" start size="14" class="me-1" />
                      {{ company.owner_name }}
                    </span>
                  </div>

                  <div v-if="company.description" class="text-caption text-grey mb-2 line-clamp-1">
                    {{ company.description }}
                  </div>
                </div>

                <div class="ms-2 align-self-center">
                  <v-progress-circular v-if="loadingId === company.id" indeterminate size="24" width="3" color="primary" />
                  <v-btn v-else icon="ri-arrow-left-line" variant="text" color="primary" size="small" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <div v-if="filteredCompanies.length === 0" class="text-center py-10">
          <v-icon icon="ri-building-2-line" size="64" color="grey-lighten-2" class="mb-3" />
          <div class="text-h6 text-grey">لا توجد شركات تطابق بحثك</div>
        </div>

        <!-- Logout button when stuck with no other companies -->
        <div v-if="companyDeletedMode" class="d-flex justify-center mt-6 pt-4 border-t">
          <v-btn
            color="error"
            variant="tonal"
            prepend-icon="ri-logout-box-line"
            @click="handleLogout"
            :loading="loggingOut"
            class="px-6 rounded-pill"
          >
            تسجيل الخروج من الحساب
          </v-btn>
        </div>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import AppDialog from '@/components/common/AppDialog.vue';
import { toast } from 'vue3-toastify';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  companyDeletedMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const { mobile } = useDisplay();
const loadingId = ref(null);
const loggingOut = ref(false);
const search = ref('');

const filteredCompanies = computed(() => {
  if (!userStore.companies) return [];
  const q = search.value.toLowerCase();
  return userStore.companies.filter(
    c =>
      c.name?.toLowerCase().includes(q) ||
      c.field?.toLowerCase().includes(q) ||
      c.owner_name?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
  );
});

const handleSwitch = async company => {
  if (company.id === userStore.currentUser?.active_company_id) {
    emit('update:modelValue', false);
    return;
  }

  try {
    loadingId.value = company.id === null ? 'all' : company.id;
    await userStore.switchCompany(company.id);
    toast.success(`تم الانتقال إلى ${company.name} بنجاح`);
    emit('update:modelValue', false);
  } catch (error) {
    toast.error('فشل في تبديل الشركة، يرجى المحاولة مرة أخرى');
  } finally {
    loadingId.value = null;
  }
};

const handleLogout = async () => {
  loggingOut.value = true;
  try {
    await authStore.logout();
    router.push('/login');
    emit('update:modelValue', false);
  } catch (error) {
    toast.error('فشل في تسجيل الخروج، يرجى المحاولة مرة أخرى');
  } finally {
    loggingOut.value = false;
  }
};
</script>

<style scoped>
.dialog-content {
  overflow: hidden;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.company-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px !important;
}

.company-card:hover:not(.active-card):not(.deleted-active-card) {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.02);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
}

.active-card {
  border-color: rgb(var(--v-theme-success)) !important;
  background-color: rgba(var(--v-theme-success), 0.04) !important;
}

.deleted-active-card {
  border-color: rgb(var(--v-theme-error)) !important;
  background-color: rgba(var(--v-theme-error), 0.02) !important;
  cursor: not-allowed;
  opacity: 0.8;
}

.company-name {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.1rem !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.search-field :deep(.v-field) {
  background: white !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12) !important;
}
</style>
