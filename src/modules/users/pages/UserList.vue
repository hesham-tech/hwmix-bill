<template>
  <div class="users-page">
    <AppDataTable
      v-model:page="store.page"
      v-model:items-per-page="store.itemsPerPage"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="users"
      :total-items="totalItems"
      :loading="loading"
      title="المستخدمين"
      icon="ri-team-line"
      @update:options="loadUsers"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #actions>
        <AppButton color="primary" prepend-icon="ri-user-add-line" @click="handleCreate"> مستخدم جديد </AppButton>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar size="40" color="primary-lighten-5" class="me-3">
            <span class="text-primary font-weight-bold">{{ getInitials(item.name) }}</span>
          </v-avatar>
          <div class="d-flex flex-column">
            <span class="font-weight-bold text-body-1">{{ item.name }}</span>
            <span class="text-caption text-grey">{{ item.email || 'لا يوجد بريد إلكتروني' }}</span>
          </div>
        </div>
      </template>

      <template #item.role="{ item }">
        <v-chip size="small" variant="flat" color="secondary-lighten-5" class="text-secondary font-weight-bold px-3">
          <v-icon icon="ri-admin-line" size="14" class="me-1" />
          {{ item.role || 'موظف' }}
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold px-3">
          {{ item.is_active ? 'نشط' : 'معطل' }}
        </v-chip>
      </template>

      <template #extra-actions="{ item }">
        <AppButton
          icon="ri-shield-user-line"
          size="x-small"
          variant="text"
          color="warning"
          tooltip="إدارة الصلاحيات"
          @click="handleManagePermissions(item)"
        />
      </template>
    </AppDataTable>

    <div class="px-6 pb-6">
      <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '../store/user.store';
import { useUser } from '../composables/useUser';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import { getInitials } from '@/utils/helpers';

const store = useUserStore();
const { users, loading, totalItems, showConfirm, confirmMessage, handleConfirm, handleCancel, loadUsers, handleDelete, handleEdit, handleCreate } =
  useUser();

const headers = [
  { title: 'المستخدم', key: 'name', sortable: true },
  { title: 'الدور', key: 'role', sortable: true },
  { title: 'الهاتف', key: 'phone', sortable: false },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const handleManagePermissions = user => {
  console.log('Manage permissions for:', user.name);
  // TODO: Open permissions dialog
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped></style>
