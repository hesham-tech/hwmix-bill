<template>
  <div class="device-list-page">
    <AppPageHeader title="أجهزة الهواتف الذكية (SMS Devices)" subtitle="إدارة ومراقبة الهواتف الموثقة كأجهزة رسائل في النظام" icon="ri-smartphone-line" sticky>
      <template #controls>
        <v-col cols="12" md="8">
          <AppInput
            v-model="search"
            placeholder="بحث سريع عن جهاز..."
            prepend-inner-icon="ri-search-line"
            clearable
            hide-details
            variant="solo-filled"
            density="comfortable"
            flat
            class="rounded-md"
          />
        </v-col>
        <v-col cols="12" md="4" class="text-end">
          <AppButton
            variant="tonal"
            color="primary"
            prepend-icon="ri-refresh-line"
            class="rounded-md font-weight-bold"
            :loading="loading"
            @click="loadData"
          >
            تحديث القائمة
          </AppButton>
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <v-card rounded="md" class="border shadow-sm overflow-hidden mb-6">
        <AppDataTable
          :headers="headers"
          :items="devices"
          :loading="loading"
          :search="search"
          title="الأجهزة المتصلة"
          icon="ri-cellphone-line"
        >
          <!-- تنسيق عمود بيانات الجهاز والعتاد المدمج -->
          <template #item.device_info="{ item }">
            <div class="text-start py-2">
              <div class="font-weight-bold text-primary text-subtitle-2 d-flex align-center">
                <v-icon icon="ri-smartphone-line" size="18" class="me-2 text-primary" />
                {{ item.device_name }}
              </div>
              <div class="text-caption text-grey-darken-1 ps-6 mt-1">
                <span class="font-weight-semibold text-grey-darken-3">{{ item.brand }}</span>
                <span class="mx-1 text-grey-lighten-1">•</span>
                <span>{{ item.model }}</span>
                <span v-if="item.hardware_name && item.hardware_name !== item.model" class="ms-2 text-grey">
                  ({{ item.hardware_name }})
                </span>
              </div>
            </div>
          </template>

          <!-- تنسيق عمود الإصدارات المدمج -->
          <template #item.version_info="{ item }">
            <div class="py-1">
              <div class="text-body-2 font-weight-medium">تطبيق: {{ item.app_version }}</div>
              <div class="text-caption text-grey">أندرويد: {{ item.android_version }}</div>
            </div>
          </template>

          <!-- تنسيق عمود الحالة -->
          <template #item.status="{ item }">
            <div class="d-flex align-center justify-center font-weight-bold">
              <span 
                :class="item.status === 'active' ? 'bg-success' : 'bg-error'" 
                class="rounded-circle d-inline-block me-2" 
                style="width: 8px; height: 8px;"
              ></span>
              <span :class="item.status === 'active' ? 'text-success' : 'text-error'">
                {{ item.status === 'active' ? 'متصل' : 'غير متصل' }}
              </span>
            </div>
          </template>
          
          <!-- تنسيق آخر ظهور -->
          <template #item.last_seen_at="{ item }">
            <span class="font-weight-medium text-caption text-grey">
              {{ item.last_seen_at ? formatDate(item.last_seen_at) : 'لم يظهر بعد' }}
            </span>
          </template>

          <!-- إجراءات -->
          <template #item.actions="{ item }">
            <v-tooltip text="إلغاء ربط وحذف الجهاز" location="bottom">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  color="error"
                  @click="confirmDecouple(item)"
                >
                  <v-icon icon="ri-link-unlink" />
                </v-btn>
              </template>
            </v-tooltip>
          </template>
        </AppDataTable>
      </v-card>
    </v-container>

    <!-- حوار تأكيد الحذف وإلغاء الربط -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card class="rounded-lg border">
        <v-card-title class="text-h5 font-weight-bold text-error pt-6 px-6">
          <v-icon icon="ri-alert-line" color="error" class="me-2" />
          تأكيد إلغاء ربط الجهاز؟
        </v-card-title>
        
        <v-card-text class="px-6 pt-4 text-body-1">
          هل أنت متأكد من رغبتك في إلغاء إقران الجهاز
          <strong class="text-primary">"{{ selectedDevice?.device_name }}"</strong>؟
          سيؤدي هذا إلى إيقاف كافة خطوط الاتصال التابعة له ومسح سجلاته نهائياً من السيرفر.
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer></v-spacer>
          <AppButton variant="text" color="grey" @click="deleteDialog = false">
            تراجع
          </AppButton>
          <AppButton color="error" class="px-6" :loading="decoupleLoading" @click="decoupleDevice">
            تأكيد الإلغاء والحذف
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
/* تعليق عربي مختصر: صفحة عرض وإدارة أجهزة الرسائل المرتبطة بالنظام */

import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const api = useApi('v1/sms-gateway/devices');

// State
const devices = ref([]);
const loading = ref(false);
const search = ref('');
const decoupleLoading = ref(false);
const deleteDialog = ref(false);
const selectedDevice = ref(null);

const headers = [
  { title: 'بيانات الجهاز والعتاد', key: 'device_info', align: 'start' },
  { title: 'إصدار النظام والتطبيق', key: 'version_info', align: 'center' },
  { title: 'حالة التواجد', key: 'status', align: 'center', sortable: false },
  { title: 'آخر ظهور نشط', key: 'last_seen_at', align: 'center' },
  { title: 'إجراءات', key: 'actions', sortable: false, align: 'center' },
];

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get({}, { showLoading: false });
    devices.value = response.data || [];
  } finally {
    loading.value = false;
  }
};

const confirmDecouple = (device) => {
  selectedDevice.value = device;
  deleteDialog.value = true;
};

const decoupleDevice = async () => {
  if (!selectedDevice.value) return;
  decoupleLoading.value = true;
  try {
    await api.remove(selectedDevice.value.id);
    deleteDialog.value = false;
    await loadData();
  } finally {
    decoupleLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(loadData);
</script>

<style scoped>
.device-list-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
