<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <span><v-icon start>ri-device-line</v-icon> إضافة ماكينة دفع / محفظة خدمات</span>
        <v-btn icon="ri-close-line" variant="text" color="white" @click="closeDialog" />
      </v-card-title>
      
      <v-card-text class="pt-5">
        <v-form ref="formRef" v-model="isValid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="اسم الماكينة / المحفظة (مثال: فوري 1، درج فودافون)"
                variant="outlined"
                :rules="[v => !!v || 'مطلوب']"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="formData.type"
                :items="[{text: 'ماكينة دفع (فوري/مصاري)', value: 'payment_machine'}, {text: 'محفظة إلكترونية (فودافون كاش)', value: 'digital_wallet'}]"
                item-title="text"
                item-value="value"
                label="نوع الكيان"
                variant="outlined"
                :rules="[v => !!v || 'مطلوب']"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <!-- في النسخة الكاملة يتم جلبها من service_providers API -->
              <v-select
                v-model="formData.service_provider_id"
                :items="[{id: 1, name: 'فودافون كاش'}, {id: 2, name: 'فوري'}, {id: 3, name: 'أمان'}, {id: 4, name: 'مصاري'}]"
                item-title="name"
                item-value="id"
                label="مقدم الخدمة (الشبكة)"
                variant="outlined"
                :rules="[v => !!v || 'مطلوب']"
              ></v-select>
            </v-col>
            
            <v-col cols="12" v-if="formData.type === 'digital_wallet'">
              <!-- الربط الاختياري مع حساب الموبايل -->
              <v-select
                v-model="formData.hwnix_cash_financial_account_id"
                :items="accountStore.accounts || []"
                item-title="name"
                item-value="id"
                label="اربطها بحساب رسائل الموبايل (اختياري للمطابقة)"
                variant="outlined"
                clearable
                hint="يربط هذا الكيان بخط الأندرويد لسحب الأرصدة الفعلية للمطابقة"
                persistent-hint
              ></v-select>
            </v-col>

          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pb-4 px-4">
        <v-spacer />
        <v-btn color="error" variant="tonal" @click="closeDialog">إلغاء</v-btn>
        <v-btn color="primary" variant="elevated" :disabled="!isValid || loading" :loading="loading" @click="submit">
          حفظ وإنشاء الخزينة
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import digitalServicesService from '@/api/services/digital-services.service';
import notificationManager from '@/services/notificationManager';
// import { useHwnixCashFinancialAccountStore } from '@/modules/hwnix-cash/store/hwnix-cash-financial-account.store';
// Assuming accountStore exists and is initialized if needed

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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
  name: '',
  type: 'payment_machine',
  service_provider_id: null,
  hwnix_cash_financial_account_id: null,
});

// Mock account store for safety in case of missing imports
const accountStore = ref({ accounts: [] }); 

const closeDialog = () => {
  isOpen.value = false;
  formRef.value?.reset();
};

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const response = await digitalServicesService.createProvider(formData.value);
    notificationManager.success(response.data.message || 'تم إعداد الماكينة/المحفظة بنجاح');
    emit('success', response.data.data);
    closeDialog();
  } catch (error) {
    notificationManager.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
  } finally {
    loading.value = false;
  }
};
</script>
