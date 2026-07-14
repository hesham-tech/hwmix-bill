<template>
  <div class="user-view-page">
    <EntityProfileContainer
      :entity-id="route.params.id"
      entity-type="user"
      :fetch-action="loadUser"
    >
      <!-- Title & Subtitle Slots -->
      <template #title>تفاصيل المستخدم</template>
      <template #subtitle>عرض البيانات الكاملة للمستخدم والنشاطات</template>

      <!-- Header Actions Slot -->
      <template #header-actions="{ entity }">
        <AppButton
          v-if="can(PERMISSIONS.USERS_DELETE_ALL)"
          color="error"
          variant="tonal"
          prepend-icon="ri-delete-bin-line"
          @click="onDelete(entity)"
        >
          حذف المستخدم
        </AppButton>
        <AppButton
          v-if="can(PERMISSIONS.USERS_UPDATE_ALL)"
          color="primary"
          prepend-icon="ri-edit-line"
          @click="onEdit(entity)"
        >
          تعديل البيانات
        </AppButton>
      </template>

      <!-- Sidebar Card Slot -->
      <template #sidebar="{ entity }">
        <v-card v-if="entity" class="user-sidebar-card rounded-md overflow-hidden border-0 elevation-sm h-100">
          <!-- Gradient Header -->
          <div class="user-card-header pa-8 pb-4 text-center position-relative overflow-hidden">
            <AppUserBalanceProfile :user="entity" mode="vertical" :avatar-size="160" class="position-relative" style="z-index: 2" />

            <div class="d-flex justify-center gap-1 flex-wrap mt-4 mb-2 position-relative" style="z-index: 2">
              <!-- علاقات الطرف التجارية -->
              <v-chip
                v-for="rel in entity.relation_types"
                :key="rel"
                :color="rel === 'customer' ? 'primary' : (rel === 'supplier' ? 'success' : (rel === 'employee' ? 'info' : 'warning'))"
                size="small"
                variant="flat"
                class="font-weight-bold text-white elevation-1"
              >
                {{ rel === 'customer' ? 'عميل' : (rel === 'supplier' ? 'مورد' : (rel === 'employee' ? 'موظف' : 'شريك')) }}
              </v-chip>
              
              <!-- الأدوار الأمنية -->
              <v-chip
                v-for="role in entity.roles"
                :key="role"
                :color="getRoleColor(role)"
                size="small"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ role }}
              </v-chip>
              <v-chip v-if="!entity.relation_types?.length && !entity.roles?.length" size="small" variant="flat" color="rgba(255,255,255,0.2)" class="text-white"> عميل </v-chip>
            </div>
          </div>

          <!-- Basic Info List -->
          <v-list class="pa-4 bg-transparent">
            <v-list-item prepend-icon="ri-mail-line" class="rounded-md mb-2" :title="entity.email || 'لا يوجد بريد'" subtitle="البريد الإلكتروني" />
            <v-list-item prepend-icon="ri-at-line" class="rounded-md mb-2" :title="entity.username" subtitle="اسم المستخدم" />
            <v-list-item prepend-icon="ri-calendar-line" class="rounded-md mb-2" :title="formatDate(entity.created_at)" subtitle="تاريخ الانضمام" />
          </v-list>

          <v-divider class="mx-6 opacity-20" />

          <div class="pa-6">
            <div class="stats-grid">
              <div class="stat-item text-center pa-3 rounded-md border border-dashed">
                <div class="text-caption text-grey">نوع العميل</div>
                <div class="text-body-2 font-weight-bold mt-1" :class="entity.customer_type === 'wholesale' ? 'text-purple' : 'text-info'">
                  {{ entity.customer_type === 'wholesale' ? 'جملة' : 'قطاعي' }}
                </div>
              </div>
              <div class="stat-item text-center pa-3 rounded-md border border-dashed">
                <div class="text-caption text-grey">المبيعات</div>
                <div class="text-body-2 font-weight-bold mt-1">{{ entity.sales_count || 0 }}</div>
              </div>
            </div>
          </div>
        </v-card>
      </template>

      <!-- Empty Actions Slot -->
      <template #empty-actions>
        <AppButton variant="text" color="primary" class="mt-4" @click="$router.push('/app/users')">العودة لقائمة المستخدمين</AppButton>
      </template>
    </EntityProfileContainer>

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
// ملف عرض تفاصيل المستخدم كغلاف مبسط يستدعي حاوية الكيانات الموحدة
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '../composables/useUser';
import { usePermissions } from '@/composables/usePermissions';
import { formatDate } from '@/utils/formatters';
import { PERMISSIONS } from '@/config/permissions';
import UserForm from '../components/UserForm.vue';
import { AppDialog, AppConfirmDialog, AppButton, AppUserBalanceProfile } from '@/components';
import EntityProfileContainer from '@/components/entity-profile/EntityProfileContainer.vue';

const route = useRoute();
const router = useRouter();
const { can } = usePermissions();
const userFormRef = ref(null);

const { formData, isOpen, close, showConfirm, confirmMessage, handleConfirm, handleCancel, loadUser, saveUser, handleDelete, handleEdit } = useUser();

const onEdit = (user) => {
  handleEdit(user);
};

const onSave = async data => {
  await saveUser(data);
  close();
  window.location.reload();
};

const onDelete = (user) => {
  handleDelete(user);
};

const onDeletionConfirm = async () => {
  await handleConfirm();
  router.push('/app/users');
};

const getRoleColor = roleName => {
  const colors = {
    'admin.super': '#EE4B2B',
    'admin.company': '#1A73E8',
    manager: '#00BFA5',
    sales: '#4CAF50',
    stock: '#FB8C00',
    accountant: '#8E24AA',
  };
  return colors[roleName] || '#78909C';
};
</script>

<style scoped>
.user-sidebar-card {
  background-color: white;
  transition: all 0.3s ease;
}

.user-card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
