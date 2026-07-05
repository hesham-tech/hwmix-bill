<template>
  <div class="line-list-page">
    <AppPageHeader title="خطوط الاتصال والشرائح المتاحة" subtitle="عرض ومراقبة قوة الإشارة وحالة التشغيل لشرائح الاتصال بالأجهزة" icon="ri-sim-card-line" sticky>
      <template #controls>
        <v-col cols="12" md="8">
          <AppInput
            v-model="search"
            placeholder="بحث سريع عن شريحة أو مزود..."
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
          :items="lines"
          :loading="loading"
          :search="search"
          title="الشرائح النشطة"
          icon="ri-sim-card-2-line"
        >
          <!-- منفذ الشريحة -->
          <template #item.slot_index="{ item }">
            <v-chip variant="tonal" color="primary" size="small" class="font-weight-bold">
              المنفذ {{ item.slot_index + 1 }}
            </v-chip>
          </template>

          <!-- قوة الإشارة -->
          <template #item.signal_strength="{ item }">
            <div class="d-flex align-center gap-1">
              <template v-if="item.signal_strength !== null && item.signal_strength !== undefined">
                <div class="signal-bars">
                  <span
                    v-for="bar in 4"
                    :key="bar"
                    class="signal-bar"
                    :class="{ active: bar <= getSignalBars(item.signal_strength) }"
                    :style="{ height: (bar * 4 + 4) + 'px', backgroundColor: bar <= getSignalBars(item.signal_strength) ? getSignalColor(item.signal_strength) : '#ddd' }"
                  />
                </div>
                <span class="text-caption font-weight-medium ms-1" :style="{ color: getSignalColor(item.signal_strength) }">
                  {{ item.signal_strength }} dBm
                </span>
              </template>
              <template v-else>
                <v-icon icon="ri-signal-wifi-off-line" color="grey" size="16" />
                <span class="text-caption text-grey ms-1">غير متوفر</span>
              </template>
            </div>
          </template>

          <!-- البوابة المرتبطة -->
          <template #item.device="{ item }">
            <span class="font-weight-bold text-primary">
              {{ item.device?.device_name || 'جهاز غير معروف' }}
            </span>
          </template>

          <!-- رقم الهاتف المكتشف -->
          <template #item.phone_number="{ item }">
            <span>
              {{ item.phone_number || 'غير محدد' }}
            </span>
          </template>

          <!-- حالة الخط -->
          <template #item.status="{ item }">
            <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold px-3">
              {{ item.status === 'active' ? 'نشط' : 'معطل' }}
            </v-chip>
          </template>

          <!-- الرصيد المالي -->
          <template #item.balance="{ item }">
            <span class="font-weight-bold text-success">
              {{ item.balance !== null && item.balance !== undefined ? parseFloat(item.balance).toFixed(2) + ' EGP' : '0.00 EGP' }}
            </span>
          </template>

          <!-- الرصيد الفعلي -->
          <template #item.actual_balance="{ item }">
            <span class="font-weight-bold text-info">
              {{ item.actual_balance !== null && item.actual_balance !== undefined ? parseFloat(item.actual_balance).toFixed(2) + ' EGP' : '0.00 EGP' }}
            </span>
          </template>

          <!-- الليمت اليومي -->
          <template #item.daily_limit="{ item }">
            <span class="font-weight-medium">
              {{ item.daily_limit ? item.daily_limit + ' رسالة' : 'بلا حد' }}
            </span>
          </template>

          <!-- ملاحظة -->
          <template #item.note="{ item }">
            <span class="text-caption text-grey text-truncate d-inline-block" style="max-width: 150px;" :title="item.note">
              {{ item.note || '-' }}
            </span>
          </template>

          <!-- إجراءات -->
          <template #item.actions="{ item }">
            <v-tooltip text="تعديل الشريحة" location="bottom">
              <template #activator="{ props }">
                <v-btn icon="ri-pencil-line" variant="text" size="small" color="primary" v-bind="props" @click="openEditDialog(item)" />
              </template>
            </v-tooltip>
          </template>
        </AppDataTable>
      </v-card>
    </v-container>

    <!-- حوار تعديل بيانات الشريحة -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card rounded="md" class="border">
        <v-card-title class="d-flex align-center bg-light px-6 py-4 border-b">
          <v-icon icon="ri-edit-2-line" class="me-2 text-primary" />
          <span class="font-weight-bold">تعديل بيانات الشريحة</span>
          <v-spacer />
          <v-btn icon="ri-close-line" variant="text" size="small" @click="editDialog = false" />
        </v-card-title>
        
        <v-card-text class="px-6 py-4">
          <v-row>
            <v-col cols="12" class="pb-2">
              <span class="text-subtitle-2 font-weight-bold d-block mb-1 text-grey">الرقم المكتشف:</span>
              <span class="text-body-1 font-weight-bold text-primary">{{ editForm.phone_number || 'غير محدد' }}</span>
            </v-col>
            
            <v-col cols="12" md="6" class="py-2">
              <AppInput
                v-model.number="editForm.balance"
                type="number"
                label="الرصيد المالي"
                placeholder="0.00"
                prefix="EGP"
                hide-details
              />
            </v-col>
            
            <v-col cols="12" md="6" class="py-2">
              <AppInput
                v-model.number="editForm.actual_balance"
                type="number"
                label="الرصيد الفعلي"
                placeholder="0.00"
                prefix="EGP"
                hide-details
              />
            </v-col>

            <v-col cols="12" class="py-2">
              <AppInput
                v-model.number="editForm.daily_limit"
                type="number"
                label="الحد اليومي لإرسال الرسائل (الليمت)"
                placeholder="مثال: 100 (0 تعني بلا حد)"
                hide-details
              />
            </v-col>

            <v-col cols="12" class="py-2">
              <v-textarea
                v-model="editForm.note"
                label="ملاحظات أو نوت"
                placeholder="أضف ملاحظاتك حول هذا الخط..."
                variant="outlined"
                rows="3"
                hide-details
                color="primary"
                class="rounded-md"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 py-4 border-t bg-light d-flex justify-end gap-2">
          <AppButton variant="text" color="grey" class="px-6" @click="editDialog = false">
            تراجع
          </AppButton>
          <AppButton color="primary" class="px-6" :loading="saveLoading" @click="saveLineData">
            حفظ التغييرات
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
/* تعليق عربي مختصر: صفحة عرض ومراقبة شرائح خطوط الاتصال (SIM Lines) المرتبطة بالنظام */

import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const api = useApi('v1/sms-gateway/lines');

// State
const lines = ref([]);
const loading = ref(false);
const search = ref('');

// Dialog states
const editDialog = ref(false);
const saveLoading = ref(false);
const editForm = ref({
  id: null,
  phone_number: '',
  balance: 0.00,
  actual_balance: 0.00,
  daily_limit: 0,
  note: ''
});

const openEditDialog = (item) => {
  editForm.value = {
    id: item.id,
    phone_number: item.phone_number || '',
    balance: item.balance || 0.00,
    actual_balance: item.actual_balance || 0.00,
    daily_limit: item.daily_limit || 0,
    note: item.note || ''
  };
  editDialog.value = true;
};

const saveLineData = async () => {
  saveLoading.value = true;
  try {
    const linesApi = useApi(`v1/sms-gateway/lines/${editForm.value.id}`);
    await linesApi.put({
      balance: editForm.value.balance,
      actual_balance: editForm.value.actual_balance,
      daily_limit: editForm.value.daily_limit,
      note: editForm.value.note
    });
    editDialog.value = false;
    await loadData();
  } catch (err) {
    console.error(err);
  } finally {
    saveLoading.value = false;
  }
};

const headers = [
  { title: 'المنفذ', key: 'slot_index', align: 'start' },
  { title: 'مزود الشبكة (Carrier)', key: 'carrier' },
  { title: 'رقم الهاتف المكتشف', key: 'phone_number' },
  { title: 'الرصيد المالي', key: 'balance', align: 'center' },
  { title: 'الرصيد الفعلي', key: 'actual_balance', align: 'center' },
  { title: 'الحد اليومي (الليمت)', key: 'daily_limit', align: 'center' },
  { title: 'ملاحظة', key: 'note' },
  { title: 'قوة الإشارة (Signal)', key: 'signal_strength', align: 'center' },
  { title: 'نوع الشبكة', key: 'network_type', align: 'center' },
  { title: 'الجهاز المرتبط', key: 'device' },
  { title: 'حالة الخط', key: 'status', align: 'center' },
  { title: 'إجراءات', key: 'actions', sortable: false, align: 'center' },
];

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get({}, { showLoading: false });
    lines.value = response.data || [];
  } finally {
    loading.value = false;
  }
};

const getSignalBars = (strength) => {
  if (strength === null || strength === undefined) return 0;
  const dbm = Math.abs(strength);
  if (dbm <= 70) return 4;
  if (dbm <= 85) return 3;
  if (dbm <= 95) return 2;
  if (dbm <= 105) return 1;
  return 0;
};

const getSignalColor = (strength) => {
  if (strength === null || strength === undefined) return '#9E9E9E';
  const dbm = Math.abs(strength);
  if (dbm <= 70) return '#4CAF50';
  if (dbm <= 85) return '#8BC34A';
  if (dbm <= 95) return '#FF9800';
  if (dbm <= 105) return '#FF5722';
  return '#F44336';
};

const getSignalIcon = (strength) => {
  if (strength === null || strength === undefined) return 'ri-signal-wifi-off-line';
  const bars = getSignalBars(strength);
  if (bars >= 4) return 'ri-signal-wifi-fill';
  if (bars >= 3) return 'ri-signal-wifi-3-fill';
  if (bars >= 2) return 'ri-signal-wifi-2-fill';
  if (bars >= 1) return 'ri-signal-wifi-1-fill';
  return 'ri-signal-wifi-error-fill';
};

onMounted(loadData);
</script>

<style scoped>
.line-list-page :deep(.v-container) {
  max-width: 100% !important;
}
.signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 20px;
}
.signal-bar {
  width: 5px;
  border-radius: 2px;
  background-color: #ddd;
  display: inline-block;
}
</style>
