<template>
  <AppDialog v-model="isOpen" :title="title" :icon="icon" :variant="variant" max-width="500" @close="close">
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-container>
        <!-- User Info -->
        <div v-if="user" class="mb-6 pa-4 bg-grey-lighten-4 rounded-lg d-flex align-center gap-4">
          <AppUserBalanceProfile :user="user" hide-balance :clickable="false" />
          <div>
            <div class="text-caption text-grey">الرصيد الحالي</div>
            <div class="text-h6 font-weight-bold" :class="user.balance < 0 ? 'text-error' : 'text-success'">
              {{ formatCurrency(user.balance) }}
            </div>
          </div>
        </div>

        <!-- Operation Types -->
        <v-btn-toggle v-model="operationType" mandatory color="primary" variant="tonal" class="w-100 mb-6 rounded-lg" style="height: 48px">
          <v-btn v-if="canDeposit" value="deposit" class="flex-grow-1" :disabled="loading">
            <v-icon icon="ri-qr-code-line" start />
            إيداع
          </v-btn>
          <v-btn v-if="canWithdraw" value="withdraw" class="flex-grow-1" :disabled="loading">
            <v-icon icon="ri-hand-coin-line" start />
            سحب
          </v-btn>
          <v-btn v-if="canTransfer" value="transfer" class="flex-grow-1" :disabled="loading">
            <v-icon icon="ri-swap-box-line" start />
            تحويل
          </v-btn>
        </v-btn-toggle>

        <v-alert v-if="!hasAnyOperation" type="warning" variant="tonal" class="mb-4"> ليس لديك صلاحية لإجراء أي عمليات مالية. </v-alert>

        <!-- Form Fields -->
        <v-row v-if="hasAnyOperation">
          <v-col cols="12">
            <v-text-field
              v-model.number="form.amount"
              label="المبلغ"
              type="number"
              prefix="£"
              placeholder="0.00"
              required
              :rules="[v => !!v || 'المبلغ مطلوب', v => v > 0 || 'المبلغ يجب أن يكون أكبر من صفر']"
              variant="outlined"
              :disabled="loading"
            />
          </v-col>

          <!-- Target User for Transfer -->
          <v-col v-if="operationType === 'transfer'" cols="12">
            <v-autocomplete
              v-model="form.target_user_id"
              label="المستلم"
              :items="users"
              item-title="full_name"
              item-value="id"
              placeholder="ابحث عن مستلم..."
              variant="outlined"
              required
              :rules="[v => !!v || 'المستلم مطلوب']"
              :loading="loadingUsers"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="ملاحظات"
              placeholder="مثال: رصيد أمان، دفعة مقدمة..."
              rows="2"
              variant="outlined"
              :disabled="loading"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <template #actions>
      <AppButton variant="text" color="grey" @click="close" :disabled="loading">إلغاء</AppButton>
      <v-spacer />
      <AppButton v-if="hasAnyOperation" :color="variant" class="px-8" :loading="loading" @click="handleSubmit"> تأكيد العملية </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppDialog, AppButton, AppUserBalanceProfile } from '@/components';
import { transactionService, userService } from '@/api';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'vue3-toastify';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  modelValue: Boolean,
  user: Object,
  initialType: {
    type: String,
    default: 'deposit',
  },
});

const emit = defineEmits(['update:modelValue', 'success']);

const { can, canAny } = usePermissions();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);
const loadingUsers = ref(false);
const usersList = ref([]);
const operationType = ref(props.initialType);

const form = reactive({
  amount: null,
  target_user_id: null,
  description: '',
});

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const isSelf = computed(() => props.user?.id === authStore.user?.id);

const canDeposit = computed(() => {
  if (isSelf.value) return can(PERMISSIONS.BALANCE_DEPOSIT);
  return canAny(PERMISSIONS.BALANCE_DEPOSIT_ANY, PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY);
});

const canWithdraw = computed(() => {
  if (isSelf.value) return can(PERMISSIONS.BALANCE_WITHDRAW);
  return canAny(PERMISSIONS.BALANCE_WITHDRAW_ANY, PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY);
});

const canTransfer = computed(() => {
  if (isSelf.value) return can(PERMISSIONS.BALANCE_TRANSFER);
  return canAny(PERMISSIONS.BALANCE_TRANSFER_ANY, PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY);
});

const hasAnyOperation = computed(() => canDeposit.value || canWithdraw.value || canTransfer.value);

const title = computed(() => {
  if (operationType.value === 'deposit') return 'إيداع رصيد';
  if (operationType.value === 'withdraw') return 'سحب رصيد';
  return 'تحويل رصيد';
});

const icon = computed(() => {
  if (operationType.value === 'deposit') return 'ri-qr-code-line';
  if (operationType.value === 'withdraw') return 'ri-hand-coin-line';
  return 'ri-swap-box-line';
});

const variant = computed(() => {
  if (operationType.value === 'deposit') return 'info';
  if (operationType.value === 'withdraw') return 'error';
  return 'warning';
});

watch(
  [() => props.modelValue, () => props.initialType],
  ([isOpenValue, type]) => {
    if (isOpenValue) {
      if (type === 'deposit' && canDeposit.value) operationType.value = 'deposit';
      else if (type === 'withdraw' && canWithdraw.value) operationType.value = 'withdraw';
      else if (type === 'transfer' && canTransfer.value) operationType.value = 'transfer';
      else {
        if (canDeposit.value) operationType.value = 'deposit';
        else if (canWithdraw.value) operationType.value = 'withdraw';
        else if (canTransfer.value) operationType.value = 'transfer';
      }
    }
  },
  { immediate: true }
);

watch(operationType, async val => {
  if (val === 'transfer' && usersList.value.length === 0) {
    loadingUsers.value = true;
    try {
      const response = await userService.getAll({ per_page: 100 });
      usersList.value = response.data.filter(u => u.id !== props.user?.id);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      loadingUsers.value = false;
    }
  }
});

const close = () => {
  isOpen.value = false;
  resetForm();
};

const resetForm = () => {
  form.amount = null;
  form.target_user_id = null;
  form.description = '';
  if (formRef.value) formRef.value.resetValidation();
};

const handleSubmit = async () => {
  if (!hasAnyOperation.value || !formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    let response;
    const commonPayload = {
      user_id: props.user.id,
      amount: form.amount,
      description: form.description,
    };

    if (operationType.value === 'deposit') {
      response = await transactionService.deposit(commonPayload);
    } else if (operationType.value === 'withdraw') {
      response = await transactionService.withdraw(commonPayload);
    } else if (operationType.value === 'transfer') {
      response = await transactionService.transfer({
        from_user_id: props.user.id,
        target_user_id: form.target_user_id,
        amount: form.amount,
        description: form.description,
      });
    }

    toast.success('تمت العملية بنجاح');
    emit('success', response.data);
    close();
  } catch (error) {
    console.error('Operation failed:', error);
    toast.error(error.message || 'فشلت العملية');
  } finally {
    loading.value = false;
  }
};
</script>
