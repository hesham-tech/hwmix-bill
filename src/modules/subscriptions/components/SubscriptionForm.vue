<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <v-card flat>
      <v-card-text class="pa-0">
        <v-row>
          <!-- Customer Selection -->
          <v-col cols="12" md="6">
            <AppAutocomplete
              v-model="formData.user_id"
              label="العميل *"
              api-endpoint="users"
              item-title="nickname"
              item-value="id"
              required
              can-create
              :rules="[v => !!v || 'يرجى اختيار العميل']"
            />
          </v-col>

          <!-- Service Selection -->
          <v-col cols="12" md="6">
            <AppAutocomplete
              v-model="formData.service_id"
              label="الخدمة *"
              api-endpoint="services"
              item-title="name"
              item-value="id"
              required
              :rules="[v => !!v || 'يرجى اختيار الخدمة']"
              @update:model-value="handleServiceChange"
            />
          </v-col>

          <!-- Billing Plan -->
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.billing_cycle"
              :items="billingCycles"
              label="دورة الفوترة *"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'يرجى اختيار دورة الفوترة']"
            />
          </v-col>

          <!-- Price -->
          <v-col cols="12" md="6">
            <AppInput
              v-model.number="formData.price"
              label="السعر *"
              type="number"
              required
              :rules="[v => v >= 0 || 'السعر يجب أن يكون 0 أو أكثر']"
              prepend-inner-icon="ri-money-dollar-circle-line"
            />
          </v-col>

          <!-- Start Date -->
          <v-col cols="12" md="6">
            <AppInput v-model="formData.starts_at" label="تاريخ البدء *" type="date" required :rules="[v => !!v || 'يرجى اختيار تاريخ البدء']" />
          </v-col>

          <!-- Auto Renew Toggle -->
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-switch v-model="formData.auto_renew" label="تجديد تلقائي" color="primary" inset hide-details />
          </v-col>

          <!-- Renewal Type -->
          <v-col cols="12" md="4">
            <v-select v-model="formData.renewal_type" :items="renewalTypes" label="نوع التجديد *" variant="outlined" density="comfortable" required />
          </v-col>

          <!-- Unique Identifier (Phone/IP) -->
          <v-col cols="12" md="4">
            <AppInput
              v-model="formData.unique_identifier"
              label="رقم الهاتف / IP / معرف"
              placeholder="مثال: 0100xxxxxxx"
              prepend-inner-icon="ri-hashtag"
            />
          </v-col>

          <!-- Notes -->
          <v-col cols="12">
            <AppTextarea v-model="formData.notes" label="ملاحظات" placeholder="أي ملاحظات إضافية حول هذا الاشتراك..." rows="3" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider class="my-4" />

      <v-card-actions class="px-0 pb-0">
        <v-spacer />
        <AppButton variant="text" color="grey" @click="$emit('cancel')"> إلغاء </AppButton>
        <AppButton color="primary" type="submit" :loading="loading" :disabled="!isValid" prepend-icon="ri-save-line">
          {{ isEditMode ? 'تحديث الاشتراك' : 'حفظ الاشتراك' }}
        </AppButton>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { subscriptionApiService, serviceApiService } from '@/api';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
import AppButton from '@/components/common/AppButton.vue';
import { toast } from 'vue3-toastify';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['success', 'cancel']);

const isValid = ref(false);
const loading = ref(false);
const form = ref(null);

const billingCycles = [
  { title: 'يومي', value: 'daily' },
  { title: 'أسبوعي', value: 'weekly' },
  { title: 'شهري', value: 'monthly' },
  { title: 'سنوي', value: 'yearly' },
];

const renewalTypes = [
  { title: 'يدوي (يتطلب دفع)', value: 'manual' },
  { title: 'تلقائي (يخصم من مدفوعات الاشتراك السابقة)', value: 'automatic' },
];

const isEditMode = computed(() => !!props.initialData?.id);

const formData = reactive({
  user_id: null,
  service_id: null,
  billing_cycle: 'monthly',
  price: 0,
  starts_at: new Date().toISOString().substr(0, 10),
  unique_identifier: '',
  auto_renew: true,
  renewal_type: 'manual',
  notes: '',
  status: 'active',
});

// Initialize form data
watch(
  () => props.initialData,
  newData => {
    if (newData) {
      Object.assign(formData, {
        user_id: newData.user_id || null,
        service_id: newData.service_id || null,
        billing_cycle: newData.billing_cycle || 'monthly',
        price: newData.price || 0,
        starts_at: newData.starts_at ? newData.starts_at.substring(0, 10) : new Date().toISOString().substr(0, 10),
        unique_identifier: newData.unique_identifier || '',
        auto_renew: newData.auto_renew ?? true,
        renewal_type: newData.renewal_type || 'manual',
        notes: newData.notes || '',
        status: newData.status || 'active',
      });
    }
  },
  { immediate: true }
);

const handleServiceChange = async serviceId => {
  if (!serviceId) return;
  try {
    const response = await serviceApiService.getOne(serviceId);
    if (response.data) {
      formData.price = response.data.default_price || 0;
    }
  } catch (error) {
    console.error('Error fetching service details:', error);
  }
};

const handleSubmit = async () => {
  if (!isValid.value) return;

  loading.value = true;
  try {
    if (isEditMode.value) {
      await subscriptionApiService.update(props.initialData.id, formData);
      toast.success('تم تحديث الاشتراك بنجاح');
    } else {
      await subscriptionApiService.create(formData);
      toast.success('تم إنشاء الاشتراك بنجاح');
    }
    emit('success');
  } catch (error) {
    // Error handled by intercepter
  } finally {
    loading.value = false;
  }
};
</script>
