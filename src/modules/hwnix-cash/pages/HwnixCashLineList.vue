<template>
  <div class="hwnix-cash-lines-wrapper">
    <AppDataTable
      table-key="hwnix-cash-lines.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.lines"
      :loading="store.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash"
      title="الخطوط والأجهزة"
      subtitle="إدارة خطوط كاش هونكس وأجهزتها وحدود المحافظ"
      icon="ri-sim-card-line"
      @update:page="store.page = $event; store.fetchLines()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchLines()"
      @update:filters="applyFilters"
    >
      <!-- رقم الهاتف -->
      <template #item.phone_number="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon icon="ri-sim-card-line" size="16" class="text-primary" />
          <span class="font-weight-bold font-mono">{{ item.phone_number || '—' }}</span>
        </div>
      </template>

      <!-- الجهاز -->
      <template #item.device="{ item }">
        <div v-if="item.device" class="d-flex flex-column">
          <span class="text-body-2 font-weight-medium">{{ item.device.name || item.device.identifier }}</span>
          <span class="text-caption text-grey">{{ item.device.identifier }}</span>
        </div>
        <span v-else class="text-grey text-caption">لا يوجد جهاز</span>
      </template>

      <!-- المزود -->
      <template #item.provider="{ item }">
        <HwnixCashProviderChip :provider="item.provider" />
      </template>

      <!-- حدود اليومي -->
      <template #item.daily_limits="{ item }">
        <div class="d-flex flex-column gap-1 py-1">
          <HwnixCashLimitBar
            label="إيداع يومي"
            :used="item.today_deposit_usage ?? 0"
            :limit="Number(item.daily_deposit_limit)"
            color="success"
          />
          <HwnixCashLimitBar
            label="سحب يومي"
            :used="item.today_withdraw_usage ?? 0"
            :limit="Number(item.daily_withdraw_limit)"
            color="warning"
          />
        </div>
      </template>

      <!-- حدود الشهري -->
      <template #item.monthly_limits="{ item }">
        <div class="d-flex flex-column gap-1 py-1">
          <HwnixCashLimitBar
            label="إيداع شهري"
            :used="item.month_deposit_usage ?? 0"
            :limit="Number(item.monthly_deposit_limit)"
            color="success"
          />
          <HwnixCashLimitBar
            label="سحب شهري"
            :used="item.month_withdraw_usage ?? 0"
            :limit="Number(item.monthly_withdraw_limit)"
            color="warning"
          />
        </div>
      </template>

      <!-- الحالة -->
      <template #item.is_active="{ item }">
        <v-chip
          :color="item.is_active ? 'success' : 'error'"
          size="small"
          variant="tonal"
          class="font-weight-bold"
        >
          {{ item.is_active ? 'نشط' : 'معطل' }}
        </v-chip>
      </template>

      <!-- الإجراءات -->
      <template #item.actions="{ item }">
        <v-btn
          v-if="can(PERMISSIONS.HWNIX_CASH_EDIT_ALL)"
          icon="ri-edit-line"
          size="small"
          variant="text"
          color="primary"
          @click="openEditDialog(item)"
        />
      </template>
    </AppDataTable>

    <!-- Dialog تعديل الخط -->
    <v-dialog v-model="editDialog" max-width="520" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-sim-card-line" color="primary" />
          تعديل حدود الخط
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="12" class="text-body-2 text-grey mb-2">
              <v-icon icon="ri-information-line" size="14" class="me-1" />
              رقم الهاتف: <strong>{{ editingLine?.phone_number }}</strong>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="editForm.daily_deposit_limit"
                label="حد الإيداع اليومي"
                type="number"
                min="0"
                prepend-inner-icon="ri-arrow-up-circle-line"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editForm.daily_withdraw_limit"
                label="حد السحب اليومي"
                type="number"
                min="0"
                prepend-inner-icon="ri-arrow-down-circle-line"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editForm.monthly_deposit_limit"
                label="حد الإيداع الشهري"
                type="number"
                min="0"
                prepend-inner-icon="ri-arrow-up-circle-2-line"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editForm.monthly_withdraw_limit"
                label="حد السحب الشهري"
                type="number"
                min="0"
                prepend-inner-icon="ri-arrow-down-circle-2-line"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" class="mt-2">
              <v-btn
                variant="tonal"
                color="info"
                size="small"
                block
                prepend-icon="ri-bank-line"
                @click="applyDefaultCbeLimits"
              >
                استعادة حدود البنك المركزي المصري (60 ألف يومياً / 200 ألف شهرياً)
              </v-btn>
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
            @click="saveLine"
          >
            حفظ التغييرات
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHwnixCashLineStore } from '../store/hwnix-cash-line.store';
import { PERMISSIONS } from '@/config/permissions';
import { useUserStore } from '@/stores/user';
import HwnixCashProviderChip from '../components/HwnixCashProviderChip.vue';
import HwnixCashLimitBar from '../components/HwnixCashLimitBar.vue';
import AppButton from '@/components/common/AppButton.vue';

const store = useHwnixCashLineStore();
const userStore = useUserStore();
const can = permission => userStore.hasPermission(permission);

// الحدود الافتراضية المعتمدة رسمياً من البنك المركزي المصري (CBE) للأفراد
const DEFAULT_CBE_LIMITS = {
  DAILY_DEPOSIT: 60000,
  DAILY_WITHDRAW: 60000,
  MONTHLY_DEPOSIT: 200000,
  MONTHLY_WITHDRAW: 200000,
};

const headers = [
  { title: 'رقم الهاتف', key: 'phone_number', sortable: true },
  { title: 'الجهاز', key: 'device', sortable: false },
  { title: 'المزود', key: 'provider', sortable: true },
  { title: 'حدود اليومية', key: 'daily_limits', sortable: false },
  { title: 'حدود الشهرية', key: 'monthly_limits', sortable: false },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

const advancedFilters = [
  {
    key: 'provider',
    label: 'المزود',
    type: 'select',
    items: [
      { title: 'فودافون كاش', value: 'vodafone_cash' },
      { title: 'اورنج كاش', value: 'orange_cash' },
      { title: 'اتصالات كاش', value: 'etisalat_cash' },
      { title: 'وي كاش', value: 'we_cash' },
    ],
  },
  {
    key: 'is_active',
    label: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: '1' },
      { title: 'معطل', value: '0' },
    ],
  },
];

const editDialog = ref(false);
const editingLine = ref(null);
const editForm = ref({
  daily_deposit_limit: DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
  daily_withdraw_limit: DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
  monthly_deposit_limit: DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
  monthly_withdraw_limit: DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
});

function applyDefaultCbeLimits() {
  editForm.value = {
    daily_deposit_limit: DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
    daily_withdraw_limit: DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
    monthly_deposit_limit: DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
    monthly_withdraw_limit: DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
  };
}

function openEditDialog(line) {
  editingLine.value = line;
  editForm.value = {
    daily_deposit_limit: (line.daily_deposit_limit && line.daily_deposit_limit > 0) ? line.daily_deposit_limit : DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
    daily_withdraw_limit: (line.daily_withdraw_limit && line.daily_withdraw_limit > 0) ? line.daily_withdraw_limit : DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
    monthly_deposit_limit: (line.monthly_deposit_limit && line.monthly_deposit_limit > 0) ? line.monthly_deposit_limit : DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
    monthly_withdraw_limit: (line.monthly_withdraw_limit && line.monthly_withdraw_limit > 0) ? line.monthly_withdraw_limit : DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
  };
  editDialog.value = true;
}

async function saveLine() {
  await store.updateLine(editingLine.value.id, editForm.value);
  editDialog.value = false;
}

function applyFilters(filters) {
  store.providerFilter = filters.provider ?? null;
  store.statusFilter = filters.is_active ?? null;
  store.page = 1;
  store.fetchLines();
}

onMounted(() => store.fetchLines());
</script>
