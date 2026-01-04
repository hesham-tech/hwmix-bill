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
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate"> مستخدم جديد </v-btn>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" color="primary" class="me-2">
            <span class="text-white text-caption">{{ getInitials(item.name) }}</span>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #item.role="{ item }">
        <v-chip size="small" color="info">
          {{ item.role || 'موظف' }}
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
          {{ item.is_active ? 'نشط' : 'معطل' }}
        </v-chip>
      </template>

      <template #extra-actions="{ item }">
        <v-btn icon="ri-shield-user-line" size="small" variant="text" color="warning" @click="handleManagePermissions(item)" />
      </template>
    </AppDataTable>

    <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '../store/user.store';
import { useUser } from '../composables/useUser';
import { AppDataTable, ConfirmDialog } from '@/components';
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

<style scoped>
.users-page {
  padding: 1rem;
}
</style>
