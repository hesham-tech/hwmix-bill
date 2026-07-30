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
      title="الخطوط والمحافظ المالية"
      subtitle="إدارة خطوط الاتصال والأرصدة وتسوية الرصيد الحسابي بالرصيد الفعلي"
      icon="ri-sim-card-line"
      @update:page="store.page = $event; store.fetchLines()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchLines()"
      @update:filters="applyFilters"
    >
      <template #actions>
        <AppButton
          variant="tonal"
          color="primary"
          prepend-icon="ri-refresh-line"
          :loading="store.loading"
          @click="store.fetchLines()"
        >
          تحديث البيانات
        </AppButton>
      </template>

      <!-- رقم الهاتف -->
      <template #item.phone_number="{ item }">
        <div class="d-flex flex-column gap-1">
          <div class="d-flex align-center gap-2">
            <v-icon icon="ri-sim-card-line" size="16" class="text-primary" />
            <span class="font-weight-bold font-mono text-body-1">{{ item.phone_number || '—' }}</span>
          </div>
          <div v-if="item.note" class="text-caption text-grey">
            {{ item.note }}
          </div>
        </div>
      </template>

      <!-- الهاتف والمرابطة -->
      <template #item.device="{ item }">
        <div class="d-flex flex-column py-1">
          <div class="d-flex align-center gap-1 font-weight-bold text-body-2">
            <v-icon icon="ri-smartphone-line" size="14" color="primary" />
            <span>{{ item.device_name || item.device?.name || 'غير محدد' }}</span>
          </div>
          <div class="d-flex align-center gap-2 mt-1">
            <v-chip size="x-small" variant="flat" color="primary" class="font-weight-medium">
              {{ item.slot_label || ('شريحة ' + ((item.slot_index ?? 0) + 1)) }}
            </v-chip>
            <span v-if="item.device_brand || item.device_model" class="text-caption text-grey">
              {{ [item.device_brand, item.device_model].filter(Boolean).join(' ') }}
            </span>
          </div>
          <span v-if="item.device_android_id" class="text-caption font-mono text-grey mt-1">
            ID: {{ item.device_android_id }}
          </span>
        </div>
      </template>

      <!-- المزود -->
      <template #item.provider="{ item }">
        <HwnixCashProviderChip :provider="item.carrier || item.provider" />
      </template>

      <!-- الأرصدة (الفعلي والحسابي) -->
      <template #item.balances="{ item }">
        <div class="d-flex flex-column gap-1 py-1">
          <!-- الرصيد الفعلي القاطع -->
          <div class="d-flex align-center justify-space-between gap-2">
            <span class="text-caption text-grey">الفعلي (SMS):</span>
            <span class="font-weight-bold text-success text-body-2">
              {{ formatCurrency(item.actual_balance) }} ج.م
            </span>
          </div>
          <!-- الرصيد الحسابي بالنظام -->
          <div class="d-flex align-center justify-space-between gap-2">
            <span class="text-caption text-grey">الحسابي:</span>
            <span class="font-weight-bold text-body-2">
              {{ formatCurrency(item.balance) }} ج.م
            </span>
          </div>
          <!-- التنبيه في حال وجود فارق -->
          <div v-if="item.has_balance_mismatch" class="mt-1">
            <v-chip color="warning" size="x-small" variant="tonal" class="font-weight-bold">
              <v-icon icon="ri-alert-line" size="12" class="me-1" />
              فارق: {{ formatCurrency(item.balance_difference) }} ج.م
            </v-chip>
          </div>
        </div>
      </template>

      <!-- حدود اليومي -->
      <template #item.daily_limits="{ item }">
        <div class="d-flex flex-column gap-1 py-1">
          <HwnixCashLimitBar
            label="إيداع يومي"
            :used="item.daily_deposit_used ?? item.today_deposit_usage ?? 0"
            :limit="Number(item.daily_deposit_limit)"
            color="success"
          />
          <HwnixCashLimitBar
            label="سحب يومي"
            :used="item.daily_withdraw_used ?? item.today_withdraw_usage ?? 0"
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
            :used="item.monthly_deposit_used ?? item.month_deposit_usage ?? 0"
            :limit="Number(item.monthly_deposit_limit)"
            color="success"
          />
          <HwnixCashLimitBar
            label="سحب شهري"
            :used="item.monthly_withdraw_used ?? item.month_withdraw_usage ?? 0"
            :limit="Number(item.monthly_withdraw_limit)"
            color="warning"
          />
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
          {{ (item.is_active || item.status === 'active') ? 'نشط' : 'معطل' }}
        </v-chip>
      </template>

      <!-- الإجراءات -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center gap-1 justify-center">
          <!-- زر التسوية المالية -->
          <v-tooltip text="تسوية الرصيد الحسابي بالرصيد الفعلي" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-scales-3-line"
                size="small"
                variant="tonal"
                color="info"
                @click="openReconcileDialog(item)"
              />
            </template>
          </v-tooltip>

          <!-- زر تعديل الحدود -->
          <v-tooltip text="تعديل حدود المحفظة" location="top">
            <template #activator="{ props }">
              <v-btn
                v-if="can(PERMISSIONS.HWNIX_CASH_EDIT_ALL)"
                v-bind="props"
                icon="ri-edit-line"
                size="small"
                variant="text"
                color="primary"
                @click="openEditDialog(item)"
              />
            </template>
          </v-tooltip>
        </div>
      </template>
    </AppDataTable>

    <!-- Dialog تسوية الرصيد الحسابي بالرصيد الفعلي -->
    <v-dialog v-model="reconcileDialog" max-width="520" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-scales-3-line" color="info" />
          تسوية الرصيد الحسابي بالرصيد الفعلي
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-alert
            type="info"
            variant="tonal"
            rounded="lg"
            class="mb-4 text-body-2"
            icon="ri-information-line"
          >
            تصل الرسائل المالية باستمرار وتحين <strong>الرصيد الفعلي</strong> القاطع تلقائياً. تتيح لك هذه الشاشة تسوية ومساواة <strong>الرصيد الحسابي بالنظام</strong> بالرصيد الفعلي وتسجيل قيد حركة تسوية رسمية.
          </v-alert>

          <div class="d-flex flex-column gap-3 mb-4 p-4 rounded-lg bg-grey-lighten-4">
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">رقم الخط:</span>
              <span class="font-weight-bold font-mono">{{ reconcilingLine?.phone_number }}</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">الرصيد الفعلي المستلم (Ground Truth):</span>
              <span class="font-weight-bold text-success text-body-1">
                {{ formatCurrency(reconcilingLine?.actual_balance) }} ج.م
              </span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">الرصيد الحسابي الحالي بالنظام:</span>
              <span class="font-weight-bold text-body-1">
                {{ formatCurrency(reconcilingLine?.balance) }} ج.م
              </span>
            </div>
            <v-divider />
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 font-weight-medium">الفارق المالي حالياً:</span>
              <v-chip
                :color="reconcilingLine?.has_balance_mismatch ? 'warning' : 'success'"
                size="small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ formatCurrency(reconcilingLine?.balance_difference) }} ج.م
              </v-chip>
            </div>
          </div>

          <!-- زر سريع لمساواة الفعلي بالمحاسبي بنقرة واحدة -->
          <v-btn
            color="success"
            variant="tonal"
            block
            class="mb-4 font-weight-bold"
            prepend-icon="ri-equalizer-line"
            @click="syncBalanceToActual"
          >
            مساواة الرصيد الحسابي بالرصيد الفعلي ({{ formatCurrency(reconcilingLine?.actual_balance) }} ج.م)
          </v-btn>

          <v-form @submit.prevent="saveReconciliation">
            <v-text-field
              v-model="reconcileForm.target_balance"
              label="الرصيد الحسابي الجديد المستهدف (ج.م)"
              type="number"
              step="0.01"
              min="0"
              required
              prepend-inner-icon="ri-money-dollar-circle-line"
              variant="outlined"
              density="compact"
              class="mb-3"
            />

            <v-textarea
              v-model="reconcileForm.note"
              label="ملاحظات سبب التسوية (اختياري)"
              rows="2"
              variant="outlined"
              density="compact"
              placeholder="مثال: تسوية الرصيد الحسابي بعد تشغيل شريحة الهواتف"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="reconcileDialog = false">إلغاء</AppButton>
          <AppButton
            color="info"
            :loading="store.loading"
            prepend-icon="ri-check-double-line"
            @click="saveReconciliation"
          >
            تأكيد إجراء التسوية
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تعديل الحدود -->
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
import { ref, onMounted } from 'vue';
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
  { title: 'الهاتف والمرابطة', key: 'device', sortable: false },
  { title: 'المزود', key: 'provider', sortable: true },
  { title: 'الأرصدة (فعلي / حسابي)', key: 'balances', sortable: false },
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

const reconcileDialog = ref(false);
const reconcilingLine = ref(null);
const reconcileForm = ref({
  target_balance: 0,
  note: '',
});

function formatCurrency(v) {
  return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);
}

function openReconcileDialog(line) {
  reconcilingLine.value = line;
  reconcileForm.value = {
    target_balance: line.actual_balance ?? line.balance ?? 0,
    note: '',
  };
  reconcileDialog.value = true;
}

function syncBalanceToActual() {
  if (reconcilingLine.value) {
    reconcileForm.value.target_balance = reconcilingLine.value.actual_balance ?? 0;
  }
}

async function saveReconciliation() {
  if (!reconcilingLine.value) return;
  await store.reconcileLine(reconcilingLine.value.id, reconcileForm.value);
  reconcileDialog.value = false;
}

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

