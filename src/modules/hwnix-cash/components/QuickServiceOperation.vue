<template>
  <v-dialog v-model="isOpen" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <span><v-icon start>tabler-device-mobile-pay</v-icon> خدمات سريعة (سحب وإيداع)</span>
        <v-btn icon="tabler-x" variant="text" color="white" @click="closeDialog" />
      </v-card-title>
      
      <v-card-text class="pt-5">
        <v-form ref="formRef" v-model="isValid">
          <v-row>
            <!-- Select Provider/Machine -->
            <v-col cols="12">
              <v-select
                v-model="formData.provider_account_id"
                :items="providers"
                item-title="name"
                item-value="id"
                label="اختر الماكينة / المحفظة"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="6">
               <v-select
                v-model="formData.service_definition_id"
                :items="definitions"
                item-title="name"
                item-value="id"
                label="نوع العملية"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.service_amount"
                label="المبلغ الأساسي (قيمة العملية)"
                type="number"
                variant="outlined"
                :rules="[v => !!v || 'مطلوب', v => v > 0 || 'يجب أن يكون أكبر من الصفر']"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.network_fee"
                label="عمولة الشبكة (إن وجدت)"
                type="number"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.shop_commission"
                label="عمولة المحل (ربحك)"
                type="number"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
            
            <!-- Auto calculated summary -->
             <v-col cols="12">
                <v-alert type="success" variant="tonal" class="mt-2 text-center text-h6">
                    المبلغ المطلوب من العميل: {{ totalFromCustomer }} ج.م
                </v-alert>
             </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pb-4 px-4">
        <v-spacer />
        <v-btn color="error" variant="tonal" @click="closeDialog">إلغاء</v-btn>
        <v-btn color="primary" variant="elevated" :disabled="!isValid || loading" :loading="loading" @click="submit">
          تأكيد وتنفيذ العملية
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import digitalServicesService from '@/api/services/digital-services.service';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // Optionally pass the currently active CashBox from the cashier's shift
  cashBoxId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'success']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const formRef = ref(null);
const isValid = ref(false);
const loading = ref(false);

const formData = ref({
  provider_account_id: null,
  service_definition_id: null,
  service_amount: 0,
  network_fee: 0,
  shop_commission: 0,
});

// القائمة الفعلية من الباك إند
const providers = ref([]);

// Mock data for definitions until they are also fetched from backend
const definitions = ref([
  { id: 1, name: 'سحب كاش', operation_type: 'customer_withdrawal' },
  { id: 2, name: 'إيداع بالمحفظة', operation_type: 'customer_deposit' },
  { id: 3, name: 'دفع فاتورة', operation_type: 'payment_service' }
]);

const fetchProviders = async () => {
  try {
    const res = await digitalServicesService.getProviders();
    providers.value = res.data?.data || [];
  } catch (error) {
    console.error('Failed to load providers', error);
  }
};

watch(() => props.modelValue, (isOpenVal) => {
  if (isOpenVal) fetchProviders();
});

// الديناميكية: حساب الإجمالي وتحديد المبلغ الكاش
const totalFromCustomer = computed(() => {
  const op = definitions.value.find(d => d.id === formData.value.service_definition_id);
  const amount = Number(formData.value.service_amount) || 0;
  const netFee = Number(formData.value.network_fee) || 0;
  const shopComm = Number(formData.value.shop_commission) || 0;

  if (op?.operation_type === 'customer_withdrawal') {
    // العميل يسحب فلوس (هو هيأخد كاش، لكنه هيدفعلنا عمولة)
    // الإجمالي اللي هياخده الكاشير من المحفظة = المبلغ
    // الإجمالي اللي هيديه للعميل = المبلغ ناقص عمولة المحل
    // سنعرضها كإجمالي التفاعل
    return (amount - shopComm); 
  } else {
    // إيداع أو دفع فاتورة: الكاشير يأخذ من العميل المبلغ + العمولات
    return amount + netFee + shopComm;
  }
});

const closeDialog = () => {
  isOpen.value = false;
  formRef.value?.reset();
};

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const op = definitions.value.find(d => d.id === formData.value.service_definition_id);
    const amount = Number(formData.value.service_amount);
    const netFee = Number(formData.value.network_fee);
    const shopComm = Number(formData.value.shop_commission);
    
    let cashAmount = 0;
    let providerAmount = 0;

    if (op?.operation_type === 'customer_withdrawal') {
      cashAmount = -(amount - shopComm); // Outgoing cash
      providerAmount = amount; // Incoming to wallet
    } else {
      cashAmount = amount + netFee + shopComm; // Incoming cash
      providerAmount = -(amount + netFee); // Outgoing from wallet
    }

    const payload = {
      ...formData.value,
      cash_box_id: props.cashBoxId,
      provider_amount: providerAmount,
      cash_amount: cashAmount
    };

    const response = await digitalServicesService.createTransaction(payload);
    notificationManager.success(response.data.message || 'تم التنفيذ بنجاح');
    emit('success', response.data.data);
    closeDialog();
  } catch (error) {
    notificationManager.error(error.response?.data?.message || 'حدث خطأ أثناء التنفيذ');
  } finally {
    loading.value = false;
  }
};
</script>
