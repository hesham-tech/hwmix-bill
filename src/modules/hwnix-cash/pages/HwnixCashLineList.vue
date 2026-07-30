<template>
  <div class="hwnix-cash-lines-wrapper">
    <AppDataTable
      table-key="hwnix-cash-lines.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.lines"
      :loading="store.loading || accountStore.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash"
      title="الخطوط والحسابات المالية"
      subtitle="إدارة خطوط الهاتف الفيزيائية والحسابات المالية المرتبطة بمصادر الرسائل"
      icon="ri-sim-card-line"
      @update:page="store.page = $event; store.fetchLines()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchLines()"
      @update:filters="applyFilters"
    >
      <template #actions>
        <div class="d-flex align-center gap-2">
          <!-- زر إضافة حساب مالي جديد -->
          <AppButton
            variant="elevation"
            color="primary"
            prepend-icon="ri-add-circle-line"
            class="font-weight-bold"
            @click="openAddAccountDialog()"
          >
            إضافة حساب مالي جديد
          </AppButton>

          <AppButton
            variant="tonal"
            color="secondary"
            prepend-icon="ri-refresh-line"
            :loading="store.loading"
            @click="store.fetchLines()"
          >
            تحديث
          </AppButton>
        </div>
      </template>

      <!-- رقم الهاتف الشريحة -->
      <template #item.phone_number="{ item }">
        <div class="d-flex flex-column gap-1">
          <div class="d-flex align-center gap-2">
            <v-icon icon="ri-sim-card-line" size="18" class="text-primary" />
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
        </div>
      </template>

      <!-- الحسابات المالية التابعة للخط -->
      <template #item.financial_accounts="{ item }">
        <div class="d-flex flex-column gap-2 py-2">
          <div v-if="!item.financial_accounts || item.financial_accounts.length === 0" class="text-caption text-grey italic">
            لا تقتصر الشريحة على حساب حالياً. انقر "إضافة حساب مالي".
          </div>

          <div
            v-for="acc in item.financial_accounts"
            :key="acc.id"
            class="pa-2 rounded-lg border bg-grey-lighten-5 d-flex flex-column gap-1"
          >
            <!-- عنوان الحساب ومصدر الرسائل -->
            <div class="d-flex align-center justify-space-between gap-2">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-bank-card-line" size="16" color="primary" />
                <span class="font-weight-bold text-body-2">{{ acc.name }}</span>
                <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-bold">
                  {{ acc.sender_identifier }}
                </v-chip>
              </div>

              <!-- أزرار التحكم بالحساب المالي -->
              <div class="d-flex align-center gap-1">
                <v-tooltip text="تسوية الرصيد" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="ri-scales-3-line"
                      size="x-small"
                      variant="tonal"
                      color="info"
                      @click="openReconcileAccountDialog(acc)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="تعديل الحدود" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="ri-edit-line"
                      size="x-small"
                      variant="text"
                      color="primary"
                      @click="openEditAccountDialog(acc)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="حذف الحساب" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="ri-delete-bin-line"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="deleteAccount(acc)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </div>

            <!-- الأرصدة التابعة للحساب المالي -->
            <div class="d-flex align-center justify-space-between text-caption mt-1">
              <span>الفعلي (SMS): <strong class="text-success">{{ formatCurrency(acc.actual_balance) }} ج.م</strong></span>
              <span>الحسابي: <strong>{{ formatCurrency(acc.balance) }} ج.م</strong></span>
              <v-chip v-if="acc.has_balance_mismatch" color="warning" size="x-small" variant="flat" class="font-weight-bold">
                فارق: {{ formatCurrency(acc.balance_difference) }} ج.م
              </v-chip>
            </div>
          </div>
        </div>
      </template>

      <!-- الأرصدة الإجمالية للخط -->
      <template #item.total_balances="{ item }">
        <div class="d-flex flex-column gap-1 py-1">
          <div class="d-flex align-center justify-space-between gap-2">
            <span class="text-caption text-grey">إجمالي الفعلي:</span>
            <span class="font-weight-bold text-success text-body-2">
              {{ formatCurrency(item.total_actual_balance) }} ج.م
            </span>
          </div>
          <div class="d-flex align-center justify-space-between gap-2">
            <span class="text-caption text-grey">إجمالي الحسابي:</span>
            <span class="font-weight-bold text-body-2">
              {{ formatCurrency(item.total_balance) }} ج.م
            </span>
          </div>
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
          <v-tooltip text="إضافة حساب مالي على هذه الشريحة" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-add-line"
                size="small"
                variant="tonal"
                color="primary"
                @click="openAddAccountDialog(item.id)"
              />
            </template>
          </v-tooltip>
        </div>
      </template>
    </AppDataTable>

    <!-- Dialog إضافة حساب مالي جديد (Form واحدة بزر حفظ واحد) -->
    <v-dialog v-model="accountFormDialog" max-width="580" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-bank-card-line" color="primary" />
          {{ isEditingAccount ? 'تعديل الحساب المالي' : 'إضافة حساب مالي جديد (Single Form)' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="accountFormRef" @submit.prevent="saveAccount">
            <v-row dense>
              <!-- اختيار الخط -->
              <v-col cols="12" v-if="!isEditingAccount">
                <v-select
                  v-model="accountForm.line_id"
                  :items="store.lines"
                  item-title="phone_number"
                  item-value="id"
                  label="اختر خط الهاتف *"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-sim-card-line"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.phone_number" :subtitle="item.raw.device_name || item.raw.carrier" />
                  </template>
                </v-select>
              </v-col>

              <!-- اسم الحساب -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="accountForm.name"
                  label="اسم الحساب المالي *"
                  placeholder="مثال: فودافون كاش كشك 1"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-bookmark-line"
                />
              </v-col>

              <!-- رقم الحساب اختياري -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="accountForm.account_number"
                  label="رقم الحساب / المحفظة (اختياري)"
                  placeholder="مثال: 01012345678"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-number-1"
                />
              </v-col>

              <!-- اختيار مصدر الرسائل المكتشف (Select Only) -->
              <v-col cols="12" v-if="!isEditingAccount">
                <v-select
                  v-model="accountForm.sender_identifier"
                  :items="accountStore.distinctSenders"
                  label="مصدر الرسائل (اختر من الرسائل المكتشفة بالنظام) *"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-mail-send-line"
                  no-data-text="لم يتم اكتشاف رسائل سابقة بالنظام"
                />
              </v-col>

              <!-- الحدود المالية -->
              <v-col cols="6">
                <v-text-field
                  v-model="accountForm.daily_deposit_limit"
                  label="حد الإيداع اليومي (ج.م)"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="accountForm.daily_withdraw_limit"
                  label="حد السحب اليومي (ج.م)"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="accountForm.monthly_deposit_limit"
                  label="حد الإيداع الشهري (ج.م)"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="accountForm.monthly_withdraw_limit"
                  label="حد السحب الشهري (ج.م)"
                  type="number"
                  min="0"
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
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="accountFormDialog = false">إلغاء</AppButton>
          <AppButton
            color="primary"
            :loading="accountStore.loading"
            prepend-icon="ri-save-line"
            @click="saveAccount"
          >
            حفظ الحساب المالي
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Context Menu النقر بزر الفأرة الأيمن للحساب المالي -->
    <v-menu
      v-model="contextMenuShow"
      :target="[contextMenuX, contextMenuY]"
      location="bottom start"
    >
      <v-list density="compact" rounded="lg" class="py-1 min-w-180">
        <v-list-item
          prepend-icon="ri-scales-3-line"
          title="تسوية الرصيد الحسابي"
          :disabled="!selectedAccountForContext?.has_balance_mismatch"
          @click="openReconcileAccountDialog(selectedAccountForContext)"
        />
        <v-list-item
          prepend-icon="ri-edit-line"
          title="تعديل الحساب المالي"
          @click="openEditAccountDialog(selectedAccountForContext)"
        />
        <v-divider />
        <v-list-item
          prepend-icon="ri-delete-bin-line"
          title="حذف الحساب المالي"
          color="error"
          @click="deleteAccount(selectedAccountForContext)"
        />
      </v-list>
    </v-menu>

    <!-- Dialog تسوية الرصيد الحسابي للحساب المالي -->
    <v-dialog v-model="reconcileDialog" max-width="540" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-scales-3-line" color="info" />
          تسوية رصيد الحساب المالي
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-alert
            type="warning"
            variant="tonal"
            rounded="lg"
            class="mb-4 text-body-2"
            icon="ri-alert-line"
          >
            سيتم إنشاء <strong>معاملة تسوية مستقلة</strong> لتعديل الرصيد الحسابي حتى يطابق الرصيد الفعلي. لن يتم حذف أو تعديل أي معاملة مالية سابقة.
          </v-alert>

          <div class="d-flex flex-column gap-3 mb-4 p-4 rounded-lg bg-grey-lighten-4">
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">اسم الحساب:</span>
              <span class="font-weight-bold font-mono">{{ reconcilingAccount?.name }}</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">مصدر الرسائل المقترن:</span>
              <v-chip size="x-small" color="primary" variant="outlined" class="font-weight-bold">
                {{ reconcilingAccount?.sender_identifier || reconcilingAccount?.message_source?.sender_identifier }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">الرصيد الفعلي المستلم (Ground Truth):</span>
              <span class="font-weight-bold text-success text-body-1">
                {{ formatCurrency(reconcilingAccount?.actual_balance) }} ج.م
              </span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">الرصيد الحسابي الحالي بالنظام:</span>
              <span class="font-weight-bold text-body-1">
                {{ formatCurrency(reconcilingAccount?.balance) }} ج.م
              </span>
            </div>
            <v-divider />
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 font-weight-medium">فرق التسوية المطلوب:</span>
              <v-chip
                :color="reconcilingAccount?.has_balance_mismatch ? 'warning' : 'success'"
                size="small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ formatCurrency(reconcilingAccount?.balance_difference) }} ج.م
              </v-chip>
            </div>
          </div>

          <!-- حقل سبب التسوية الإجباري مع اقتراحات سريعة -->
          <div class="mt-4">
            <div class="text-caption font-weight-medium mb-1 text-grey-darken-2">
              اقتراحات سريعة لسبب التسوية:
            </div>
            <div class="d-flex flex-wrap gap-1 mb-3">
              <v-chip
                v-for="preset in RECONCILE_REASON_PRESETS"
                :key="preset"
                size="x-small"
                variant="tonal"
                color="info"
                class="cursor-pointer"
                @click="reconcileReason = preset"
              >
                {{ preset }}
              </v-chip>
            </div>

            <v-textarea
              v-model="reconcileReason"
              label="سبب التسوية (إجباري) *"
              placeholder="اكتب سبب إجراء تسوية الرصيد بالتفصيل للمراجعة والتدقيق المحاسبي..."
              variant="outlined"
              rows="2"
              auto-grow
              required
              density="compact"
              prepend-inner-icon="ri-file-text-line"
            />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="reconcileDialog = false">إلغاء</AppButton>
          <AppButton
            color="info"
            :loading="accountStore.loading"
            :disabled="!reconcileReason || !reconcilingAccount?.has_balance_mismatch"
            prepend-icon="ri-check-double-line"
            @click="saveAccountReconciliation"
          >
            تنفيذ التسوية
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useHwnixCashLineStore } from '../store/hwnix-cash-line.store';
import { useHwnixCashFinancialAccountStore } from '../store/hwnix-cash-financial-account.store';
import AppButton from '@/components/common/AppButton.vue';

const store = useHwnixCashLineStore();
const accountStore = useHwnixCashFinancialAccountStore();

const DEFAULT_CBE_LIMITS = {
  DAILY_DEPOSIT: 60000,
  DAILY_WITHDRAW: 60000,
  MONTHLY_DEPOSIT: 200000,
  MONTHLY_WITHDRAW: 200000,
};

const headers = [
  { title: 'رقم الهاتف (الشريحة)', key: 'phone_number', sortable: true },
  { title: 'الهاتف والمرابطة', key: 'device', sortable: false },
  { title: 'الحسابات المالية التابعة', key: 'financial_accounts', sortable: false },
  { title: 'إجمالي أرصدة الخط', key: 'total_balances', sortable: false },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

const advancedFilters = [
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

const accountFormDialog = ref(false);
const isEditingAccount = ref(false);
const editingAccountId = ref(null);

const accountForm = ref({
  line_id: null,
  name: '',
  account_number: '',
  sender_identifier: '',
  daily_deposit_limit: DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
  daily_withdraw_limit: DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
  monthly_deposit_limit: DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
  monthly_withdraw_limit: DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
});

const reconcileDialog = ref(false);
const reconcilingAccount = ref(null);
const reconcileReason = ref('');

const RECONCILE_REASON_PRESETS = [
  'تسوية بعد مراجعة كشف المحفظة',
  'رصيد افتتاحي',
  'تصحيح فرق بعد الجرد',
  'تعديل بعد مراجعة البنك',
];

const contextMenuShow = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const selectedAccountForContext = ref(null);

function openContextMenu(e, account) {
  if (!account) return;
  selectedAccountForContext.value = account;
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuShow.value = true;
}

function formatCurrency(v) {
  return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);
}

function openAddAccountDialog(lineId = null) {
  isEditingAccount.value = false;
  editingAccountId.value = null;
  accountForm.value = {
    line_id: lineId || store.lines[0]?.id || null,
    name: '',
    account_number: '',
    sender_identifier: '',
    daily_deposit_limit: DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
    daily_withdraw_limit: DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
    monthly_deposit_limit: DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
    monthly_withdraw_limit: DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
  };
  accountStore.fetchDistinctSenders();
  accountFormDialog.value = true;
}

function openEditAccountDialog(account) {
  if (!account) return;
  isEditingAccount.value = true;
  editingAccountId.value = account.id;
  accountForm.value = {
    name: account.name,
    account_number: account.account_number || '',
    daily_deposit_limit: account.daily_deposit_limit || DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
    daily_withdraw_limit: account.daily_withdraw_limit || DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
    monthly_deposit_limit: account.monthly_deposit_limit || DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
    monthly_withdraw_limit: account.monthly_withdraw_limit || DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
  };
  accountFormDialog.value = true;
}

function applyDefaultCbeLimits() {
  accountForm.value.daily_deposit_limit = DEFAULT_CBE_LIMITS.DAILY_DEPOSIT;
  accountForm.value.daily_withdraw_limit = DEFAULT_CBE_LIMITS.DAILY_WITHDRAW;
  accountForm.value.monthly_deposit_limit = DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT;
  accountForm.value.monthly_withdraw_limit = DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW;
}

async function saveAccount() {
  if (isEditingAccount.value) {
    await accountStore.updateFinancialAccount(editingAccountId.value, accountForm.value);
  } else {
    await accountStore.createFinancialAccount(accountForm.value);
  }
  accountFormDialog.value = false;
  store.fetchLines();
}

async function deleteAccount(account) {
  if (!account) return;
  if (confirm(`هل أنت تأكد من رغبتك في حذف الحساب المالي "${account.name}"؟`)) {
    await accountStore.deleteFinancialAccount(account.id);
    store.fetchLines();
  }
}

function openReconcileAccountDialog(account) {
  if (!account) return;
  reconcilingAccount.value = account;
  reconcileReason.value = RECONCILE_REASON_PRESETS[0];
  reconcileDialog.value = true;
}

async function saveAccountReconciliation() {
  if (!reconcilingAccount.value || !reconcileReason.value) return;
  await accountStore.reconcileFinancialAccount(reconcilingAccount.value.id, {
    reason: reconcileReason.value,
  });
  reconcileDialog.value = false;
  store.fetchLines();
}

function applyFilters(filters) {
  store.statusFilter = filters.is_active ?? null;
  store.page = 1;
  store.fetchLines();
}

onMounted(() => {
  store.fetchLines();
  accountStore.fetchDistinctSenders();
});
</script>
