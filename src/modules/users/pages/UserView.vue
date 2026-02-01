<template>
  <div class="user-view-page pa-4 pa-md-8">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8 flex-wrap gap-4">
      <div class="d-flex align-center gap-4">
        <AppButton icon="ri-arrow-right-line" variant="text" @click="$router.back()" />
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">تفاصيل المستخدم</h1>
          <p class="text-subtitle-2 text-grey">عرض البيانات الكاملة للمستخدم والنشاطات</p>
        </div>
      </div>
      <div class="d-flex gap-3">
        <AppButton v-if="can(PERMISSIONS.USERS_DELETE_ALL)" color="error" variant="tonal" prepend-icon="ri-delete-bin-line" @click="onDelete">
          حذف المستخدم
        </AppButton>
        <AppButton v-if="can(PERMISSIONS.USERS_UPDATE_ALL)" color="primary" prepend-icon="ri-edit-line" @click="onEdit"> تعديل البيانات </AppButton>
      </div>
    </div>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" md="4">
        <v-skeleton-loader type="card" height="500" class="rounded-md" />
      </v-col>
      <v-col cols="12" md="8">
        <v-skeleton-loader type="article, table" height="500" class="rounded-md" />
      </v-col>
    </v-row>

    <!-- Content -->
    <v-row v-else-if="user">
      <!-- Sidebar Info Card -->
      <v-col cols="12" md="4">
        <v-card class="user-sidebar-card rounded-md overflow-hidden border-0 elevation-sm h-100">
          <!-- Gradient Header -->
          <div class="user-card-header pa-8 text-center position-relative">
            <AppAvatar
              :img-url="user.avatar_url"
              :name="user.nickname || user.full_name"
              size="150"
              rounded="circle"
              class="mx-auto border-4 border-white shadow-xl mb-4 position-relative"
              style="z-index: 2"
              type="user"
            />
            <h2 class="text-h5 font-weight-bold mb-1 text-white position-relative" style="z-index: 2">
              {{ user.nickname || user.full_name }}
            </h2>
            <div class="d-flex justify-center gap-1 flex-wrap mb-4 position-relative" style="z-index: 2">
              <v-chip
                v-for="role in user.roles"
                :key="role.id"
                :color="getRoleColor(role.name)"
                size="small"
                variant="flat"
                class="font-weight-bold text-white elevation-1"
              >
                {{ role.label || role.name }}
              </v-chip>
              <v-chip v-if="!user.roles?.length" size="small" variant="flat" color="rgba(255,255,255,0.2)" class="text-white"> عميل </v-chip>
            </div>
            <!-- Status Badge overlay -->
            <div
              class="status-overlay py-1 px-4 rounded-pill elevation-2"
              :class="[1, '1', true, 'active'].includes(user.status) ? 'bg-success' : 'bg-error'"
            >
              <span class="text-caption font-weight-bold text-white">
                {{ [1, '1', true, 'active'].includes(user.status) ? 'نشط' : 'معطل' }}
              </span>
            </div>
          </div>

          <!-- Basic Info List -->
          <v-list class="pa-4 pt-8 bg-transparent">
            <v-list-item prepend-icon="ri-phone-line" class="rounded-md mb-2" subtitle="رقم الهاتف">
              <template #append>
                <AppPhone v-if="user.phone" :phone="user.phone" hide-text icon-only />
              </template>
            </v-list-item>
            <v-list-item prepend-icon="ri-mail-line" class="rounded-md mb-2" :title="user.email || 'لا يوجد بريد'" subtitle="البريد الإلكتروني" />
            <v-list-item prepend-icon="ri-at-line" class="rounded-md mb-2" :title="user.username" subtitle="اسم المستخدم" />
            <v-list-item prepend-icon="ri-calendar-line" class="rounded-md mb-2" :title="formatDate(user.created_at)" subtitle="تاريخ الانضمام" />
          </v-list>

          <v-divider class="mx-6 opacity-20" />

          <!-- Financial Card -->
          <div class="pa-6">
            <div class="balance-card pa-6 rounded-md overflow-hidden position-relative">
              <div class="d-flex align-center gap-3">
                <div class="pa-2 rounded-md bg-white-transparent">
                  <v-icon icon="ri-wallet-3-line" color="white" />
                </div>
                <div>
                  <div class="text-caption text-white-70">الرصيد الحالي</div>
                  <div class="text-h4 font-weight-bold text-white">{{ formatCurrency(user.balance) }}</div>
                </div>
              </div>
            </div>

            <div class="stats-grid mt-6">
              <div class="stat-item text-center pa-3 rounded-md border border-dashed">
                <div class="text-caption text-grey">نوع العميل</div>
                <div class="text-body-2 font-weight-bold mt-1" :class="user.customer_type === 'wholesale' ? 'text-purple' : 'text-info'">
                  {{ user.customer_type === 'wholesale' ? 'جملة' : 'قطاعي' }}
                </div>
              </div>
              <div class="stat-item text-center pa-3 rounded-md border border-dashed">
                <div class="text-caption text-grey">المبيعات</div>
                <div class="text-body-2 font-weight-bold mt-1">{{ user.sales_count || 0 }}</div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Main Content Tabs -->
      <v-col cols="12" md="8">
        <v-card class="rounded-md border border-grey-lighten-4 h-100 overflow-hidden elevation-sm">
          <v-tabs v-model="activeTab" bg-color="white" color="primary" density="comfortable" align-tabs="start" class="border-b">
            <v-tab value="details" prepend-icon="ri-information-line" class="px-6">المعلومات الإضافية</v-tab>
            <v-tab value="activity" prepend-icon="ri-history-line" class="px-6">النشاطات</v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="pa-6">
            <v-window-item value="details">
              <div class="mb-10">
                <h3 class="text-h6 font-weight-bold mb-6 d-flex align-center gap-3">
                  <v-avatar color="primary-lighten-5" rounded="md" size="32">
                    <v-icon icon="ri-building-line" color="primary" size="20" />
                  </v-avatar>
                  الشركات المرتبطة
                </h3>
                <v-row>
                  <v-col v-for="company in user.companies" :key="company.id" cols="12" sm="6" lg="4">
                    <v-card variant="outlined" class="rounded-md border-grey-lighten-3 pa-1 hover-card">
                      <v-list-item :prepend-avatar="company.logo || '/default-company.png'">
                        <v-list-item-title class="font-weight-bold text-body-1">{{ company.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption mt-1">
                          <v-chip size="x-small" label color="success" class="font-weight-bold">نشط</v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-card>
                  </v-col>
                  <v-col v-if="!user.companies?.length" cols="12">
                    <div class="text-center py-8 bg-grey-lighten-5 rounded-md border-dashed">
                      <v-icon icon="ri-building-2-line" color="grey-lighten-2" size="48" class="mb-2" />
                      <p class="text-grey text-body-2">لا توجد شركات مرتبطة حالياً</p>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <div>
                <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-3">
                  <v-avatar color="primary-lighten-5" rounded="md" size="32">
                    <v-icon icon="ri-sticky-note-line" color="primary" size="20" />
                  </v-avatar>
                  ملاحظات إضافية
                </h3>
                <div class="bg-grey-lighten-5 pa-6 rounded-md border border-dashed text-body-1 text-grey-darken-1 min-height-100">
                  {{ user.notes || 'لا توجد ملاحظات إضافية مسجلة لهذا المستخدم.' }}
                </div>
              </div>
            </v-window-item>

            <v-window-item value="activity">
              <div class="text-center py-16">
                <v-avatar color="grey-lighten-5" size="100" class="mb-4">
                  <v-icon icon="ri-timeline-view" size="50" color="grey-lighten-3" />
                </v-avatar>
                <h3 class="text-h5 text-grey-darken-1 mb-2">سجل النشاط</h3>
                <p class="text-grey">سيتم إضافة سجل التتبع والعمليات قريباً في إصدار قادم.</p>
              </div>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Not Found -->
    <div v-else class="text-center py-16">
      <v-icon icon="ri-user-search-line" size="64" color="grey-lighten-2" />
      <h3 class="text-h5 text-grey mt-4">المستخدم غير موجود</h3>
      <AppButton variant="text" color="primary" class="mt-4" @click="$router.push('/users')">العودة لقائمة المستخدمين</AppButton>
    </div>

    <!-- User Form Dialog -->
    <AppDialog
      v-model="isOpen"
      :title="`تعديل بيانات: ${formData.nickname || formData.full_name || ''}`"
      subtitle="تحديث المعلومات الأساسية وصلاحيات الوصول"
      icon="ri-user-edit-line"
      max-width="800"
      hide-actions
    >
      <UserForm ref="userFormRef" v-model="formData" :is-edit-mode="true" hide-actions @save="onSave" @cancel="close" />

      <template #actions>
        <AppButton variant="tonal" color="grey" @click="close">إلغاء</AppButton>
        <AppButton
          :loading="userFormRef?.loading"
          color="primary"
          class="px-8 font-weight-bold rounded-pill shadow-md"
          @click="userFormRef?.handleSubmit()"
        >
          <v-icon :icon="userFormRef?.form?.id ? 'ri-user-received-line' : 'ri-save-line'" class="me-2" />
          {{ userFormRef?.form?.id ? 'تحديث البيانات' : 'حفظ' }}
        </AppButton>
      </template>
    </AppDialog>

    <!-- Global Confirm Dialog for Deletion -->
    <AppConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="onDeletionConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '../composables/useUser';
import { usePermissions } from '@/composables/usePermissions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PERMISSIONS } from '@/config/permissions';
import UserForm from '../components/UserForm.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppPhone from '@/components/common/AppPhone.vue';

const route = useRoute();
const router = useRouter();
const { can } = usePermissions();
const userFormRef = ref(null);

// Use shared logic from composable
const { formData, isOpen, close, showConfirm, confirmMessage, handleConfirm, handleCancel, loadUser, saveUser, handleDelete, handleEdit } = useUser();

const user = ref(null);
const loading = ref(true);
const activeTab = ref('details');

const fetchUserData = async () => {
  loading.value = true;
  try {
    user.value = await loadUser(route.params.id);
  } catch (error) {
    console.error('Failed to fetch user:', error);
  } finally {
    loading.value = false;
  }
};

const onEdit = () => {
  handleEdit(user.value);
};

const onSave = async data => {
  await saveUser(data);
  close();
  await fetchUserData(); // Refresh data after update
};

const onDelete = () => {
  handleDelete(user.value);
};

const onDeletionConfirm = async () => {
  await handleConfirm(); // Deletion logic from composable
  router.push('/users'); // Redirect to list after deletion
};

const getRoleColor = roleName => {
  const colors = {
    'admin.super': '#EE4B2B', // Vivid Red
    'admin.company': '#1A73E8', // Google Blue
    manager: '#00BFA5', // Teal
    sales: '#4CAF50', // Green
    stock: '#FB8C00', // Orange
    accountant: '#8E24AA', // Purple
  };
  return colors[roleName] || '#78909C';
};

onMounted(fetchUserData);
</script>

<style scoped>
.user-view-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* User Sidebar Card Styling */
.user-sidebar-card {
  background-color: white;
  transition: all 0.3s ease;
}

.user-card-header {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  padding-bottom: 60px !important;
}

.user-card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, white 0%, transparent 100%);
  z-index: 1;
}

.shadow-xl {
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15) !important;
}

.status-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

/* Financial Balance Card */
.balance-card {
  background: linear-gradient(135deg, #00c853 0%, #2e7d32 100%);
  box-shadow: 0 8px 16px rgba(46, 125, 50, 0.2);
}

.bg-white-transparent {
  background: rgba(255, 255, 255, 0.15);
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Hover Effects */
.hover-card {
  transition: all 0.2s ease;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: rgb(var(--v-theme-primary), 0.3) !important;
}

.min-height-100 {
  min-height: 100px;
}

.gap-3 {
  gap: 12px;
}
</style>
