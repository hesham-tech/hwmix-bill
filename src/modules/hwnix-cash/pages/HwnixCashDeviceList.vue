<template>
  <div class="hwnix-cash-devices-wrapper">
    <AppDataTable
      table-key="hwnix-cash-devices.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.devices"
      :loading="store.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash"
      title="إدارة الأجهزة"
      subtitle="إدارة وتتبع الهواتف والأجهزة المربوطة بنظام كاش هونكس"
      icon="ri-cellphone-line"
      @update:page="store.page = $event; store.fetchDevices()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchDevices()"
      @update:filters="applyFilters"
    >
      <template #actions>
        <AppButton
          variant="tonal"
          color="primary"
          prepend-icon="ri-refresh-line"
          :loading="store.loading"
          @click="store.fetchDevices()"
        >
          تحديث البيانات
        </AppButton>
      </template>

      <!-- اسم الجهاز والمعرف -->
      <template #item.device_name="{ item }">
        <div class="d-flex align-center gap-2">
          <v-avatar color="primary" variant="tonal" size="32">
            <v-icon icon="ri-cellphone-line" size="18" />
          </v-avatar>
          <div class="d-flex flex-column">
            <span class="font-weight-bold text-body-2">{{ item.device_name || item.model || 'جهاز أندرويد' }}</span>
            <span class="text-caption text-grey font-mono">{{ item.android_id }}</span>
          </div>
        </div>
      </template>

      <!-- مواصفات الجهاز والإصدار -->
      <template #item.specs="{ item }">
        <div class="d-flex flex-column">
          <span class="text-caption font-weight-medium">{{ item.brand }} {{ item.model }}</span>
          <span class="text-caption text-grey">أندرويد: {{ item.android_version || '—' }} | تطبيق: v{{ item.app_version || '1.0' }}</span>
        </div>
      </template>

      <!-- آخر اتصال -->
      <template #item.last_seen_at="{ item }">
        <div class="d-flex align-center gap-1 text-caption text-grey-darken-1">
          <v-icon icon="ri-time-line" size="14" />
          <span>{{ item.last_seen_at || '—' }}</span>
        </div>
      </template>

      <!-- الحالة -->
      <template #item.is_active="{ item }">
        <v-chip
          :color="(item.is_active || item.status === 'active') ? 'success' : 'error'"
          size="small"
          variant="tonal"
          class="font-weight-bold"
        >
          {{ (item.is_active || item.status === 'active') ? 'نشط / متصل' : 'معطل / مفصول' }}
        </v-chip>
      </template>

      <!-- الإجراءات -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center justify-center gap-1">
          <v-btn
            icon="ri-edit-line"
            size="small"
            variant="text"
            color="primary"
            title="تعديل اسم الجهاز"
            @click="openEditDialog(item)"
          />
          <v-btn
            icon="ri-delete-bin-line"
            size="small"
            variant="text"
            color="error"
            title="إلغاء ربط الجهاز"
            @click="confirmDelete(item)"
          />
        </div>
      </template>
    </AppDataTable>

    <!-- Dialog تعديل بيانات الجهاز -->
    <v-dialog v-model="editDialog" max-width="480" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-edit-line" color="primary" />
          تعديل بيانات الجهاز
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="editForm.device_name"
                label="اسم الجهاز التوضيحي"
                placeholder="مثال: هاتف الفرع الرئيسي"
                variant="outlined"
                density="compact"
                prepend-inner-icon="ri-smartphone-line"
              />
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="editForm.is_active"
                label="حالة تفعيل الجهاز"
                color="success"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="editDialog = false">إلغاء</AppButton>
          <AppButton
            color="primary"
            :loading="store.loading"
            prepend-icon="ri-save-line"
            @click="saveDevice"
          >
            حفظ التغييرات
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تأكيد الحذف / إلغاء الربط -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-2 text-error d-flex align-center gap-2">
          <v-icon icon="ri-error-warning-line" color="error" />
          تأكيد إلغاء ربط الجهاز
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          هل أنت تأكد من رغبتك في إلغاء ربط الجهاز <strong>{{ deletingDevice?.device_name || deletingDevice?.android_id }}</strong>؟ سيؤدي ذلك لقطع اتصال الهاتف بالنظام.
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="deleteDialog = false">تراجع</AppButton>
          <AppButton
            color="error"
            :loading="store.loading"
            prepend-icon="ri-delete-bin-line"
            @click="executeDelete"
          >
            إلغاء الربط
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useHwnixCashDeviceStore } from '../store/hwnix-cash-device.store';
import AppButton from '@/components/common/AppButton.vue';

const store = useHwnixCashDeviceStore();

const editDialog = ref(false);
const editingDevice = ref(null);
const editForm = ref({
  device_name: '',
  is_active: true,
});

const deleteDialog = ref(false);
const deletingDevice = ref(null);

const headers = [
  { title: 'الجهاز ومعرفه', key: 'device_name', sortable: true },
  { title: 'المواصفات والإصدار', key: 'specs', sortable: false },
  { title: 'آخر اتصال', key: 'last_seen_at', sortable: true },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

const advancedFilters = [
  {
    key: 'status',
    label: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: 'active' },
      { title: 'معطل', value: 'inactive' },
    ],
  },
];

function openEditDialog(device) {
  editingDevice.value = device;
  editForm.value = {
    device_name: device.device_name || '',
    is_active: device.is_active ?? (device.status === 'active'),
  };
  editDialog.value = true;
}

async function saveDevice() {
  await store.updateDevice(editingDevice.value.id, editForm.value);
  editDialog.value = false;
}

function confirmDelete(device) {
  deletingDevice.value = device;
  deleteDialog.value = true;
}

async function executeDelete() {
  await store.deleteDevice(deletingDevice.value.id);
  deleteDialog.value = false;
}

function applyFilters(filters) {
  store.statusFilter = filters.status ?? null;
  store.page = 1;
  store.fetchDevices();
}

onMounted(() => store.fetchDevices());
</script>
