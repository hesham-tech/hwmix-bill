<template>
  <AppDialog
    v-model="isOpen"
    title="إدارة مستخدمي الخزينة المشتركة"
    icon="ri-group-line"
    max-width="500"
    :loading="loading"
    confirm-text="حفظ الصلاحيات"
    @confirm="handleSubmit"
    @close="close"
  >
    <div class="pa-2">
      <div v-if="cashBox" class="mb-4 pa-3 bg-grey-lighten-4 rounded-lg">
        <div class="text-subtitle-1 font-weight-bold text-slate-800">{{ cashBox.name }}</div>
        <div class="text-caption text-grey">الفرع: {{ cashBox.branch_name || 'عام للشركة' }}</div>
      </div>

      <div class="text-body-2 mb-3 text-grey-darken-1">
        اختر الموظفين المصرح لهم بالسحب والإيداع والتحويل من هذه الخزينة:
      </div>

      <LoadingSpinner v-if="loadingData" />
      
      <v-list v-else class="border rounded-lg max-h-300 overflow-y-auto">
        <v-list-item v-for="user in companyUsers" :key="user.id" class="px-3">
          <template #prepend>
            <v-checkbox
              v-model="selectedUserIds"
              :value="user.id"
              hide-details
              density="comfortable"
              color="primary"
            />
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ user.nickname || user.full_name }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-xxs">
            {{ user.email }}
          </v-list-item-subtitle>
        </v-list-item>

        <div v-if="companyUsers.length === 0" class="pa-4 text-center text-grey">
          لا يوجد موظفون متاحون
        </div>
      </v-list>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { AppDialog } from '@/components';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useApi } from '@/composables/useApi';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  modelValue: Boolean,
  cashBox: Object,
});

const emit = defineEmits(['update:modelValue', 'success']);

const api = useApi('/api/cash-boxes');
const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const loadingData = ref(false);
const loading = ref(false);
const companyUsers = ref([]);
const selectedUserIds = ref([]);

const loadUsers = async () => {
  if (!props.cashBox) return;
  loadingData.value = true;
  try {
    const response = await api.request('get', `/${props.cashBox.id}/users`, null, { showError: false, showLoading: false });
    companyUsers.value = response.data.company_users || [];
    selectedUserIds.value = response.data.assigned_user_ids || [];
  } catch (error) {
    console.error('Failed to load cash box users:', error);
  } finally {
    loadingData.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadUsers();
  }
});

const close = () => {
  isOpen.value = false;
};

const handleSubmit = async () => {
  if (!props.cashBox) return;
  loading.value = true;
  try {
    await api.request('post', `/${props.cashBox.id}/users`, {
      user_ids: selectedUserIds.value
    });
    notificationManager.success('تم تحديث صلاحيات الخزينة بنجاح');
    emit('success');
    close();
  } catch (error) {
    console.error('Failed to save cash box users:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.max-h-300 {
  max-height: 300px;
}
</style>
