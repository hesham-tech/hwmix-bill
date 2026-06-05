<!-- تعليق عربي: مكون تفاعلي لحساب تكلفة اشتراكات SaaS المخصصة والشرائح الزمنية وتطبيق الكوبونات والخصومات (Pricing Calculator Widget) -->

<template>
  <v-card class="pricing-calculator-widget rounded-xl border border-opacity-10 shadow-md bg-white overflow-hidden">
    <div class="pa-5 bg-light-primary border-primary border-b border-opacity-5">
      <div class="d-flex align-center justify-between">
        <div class="d-flex align-center gap-3">
          <v-avatar color="primary" variant="tonal" size="48" class="rounded-lg">
            <v-icon icon="ri-calculator-line" color="primary" size="24" />
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold text-grey-darken-3 mb-0">حاسبة تسعير الاشتراك المرن</h3>
            <p class="text-caption text-grey mb-0">قم بتخصيص مدة الاشتراك واحصل على خصومات إضافية فورية</p>
          </div>
        </div>
        <v-chip color="primary" variant="flat" size="small" class="font-weight-bold">
          باقة: {{ plan?.name }}
        </v-chip>
      </div>
    </div>

    <v-card-text class="pa-6">
      <v-row>
        <!-- Left Column: Controls (Months and Coupon) -->
        <v-col cols="12" md="7" class="border-e-md border-opacity-10">
          <div class="mb-6">
            <div class="d-flex align-center justify-between mb-3">
              <span class="text-subtitle-2 font-weight-bold text-grey-darken-3">اختر مدة الاشتراك بالباقة:</span>
              <v-chip color="success" size="small" variant="tonal" class="font-weight-bold">
                {{ selectedMonths }} {{ getMonthLabel(selectedMonths) }}
              </v-chip>
            </div>

            <!-- Custom Months Slider -->
            <v-slider
              v-model="selectedMonths"
              min="1"
              max="48"
              step="1"
              thumb-label="always"
              color="primary"
              track-color="grey-lighten-3"
              class="mt-6 mb-6"
              hide-details
            >
              <template #thumb-label="{ modelValue }">
                <span class="font-weight-bold">{{ modelValue }}ش</span>
              </template>
            </v-slider>

            <!-- Quick Duration Buttons -->
            <v-row class="g-2">
              <v-col v-for="tier in durationTiers" :key="tier.months" cols="4" sm="2">
                <v-btn
                  block
                  variant="outlined"
                  class="rounded-lg py-1 px-0 font-weight-bold text-caption"
                  :color="selectedMonths === tier.months ? 'primary' : 'grey-darken-1'"
                  :class="{ 'border-primary border-2': selectedMonths === tier.months }"
                  @click="selectedMonths = tier.months"
                >
                  <div class="d-flex flex-column align-center">
                    <span>{{ tier.label }}</span>
                    <span v-if="tier.discount" class="text-success text-xxs font-weight-black mt-0.5">
                      {{ tier.discount }}
                    </span>
                  </div>
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Coupon Code Input -->
          <div>
            <span class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-2 d-block">كود الخصم (الكوبون):</span>
            <div class="d-flex gap-2">
              <v-text-field
                v-model="couponCode"
                placeholder="أدخل كود الخصم هنا (مثال: SAVE20)"
                variant="outlined"
                density="comfortable"
                hide-details
                prepend-inner-icon="ri-coupon-3-line"
                class="rounded-lg"
                clearable
                @click:clear="clearCoupon"
              />
              <v-btn
                color="secondary"
                variant="flat"
                class="rounded-lg font-weight-bold"
                :loading="calculating"
                @click="applyCoupon"
              >
                تطبيق
              </v-btn>
            </div>
            <div v-if="couponSuccessMsg" class="text-success text-caption font-weight-bold mt-2 d-flex align-center gap-1">
              <v-icon icon="ri-checkbox-circle-fill" size="14" />
              <span>{{ couponSuccessMsg }}</span>
            </div>
            <div v-if="couponErrorMsg" class="text-error text-caption font-weight-bold mt-2 d-flex align-center gap-1">
              <v-icon icon="ri-error-warning-fill" size="14" />
              <span>{{ couponErrorMsg }}</span>
            </div>
          </div>
        </v-col>

        <!-- Right Column: Pricing Summary Breakdown -->
        <v-col cols="12" md="5" class="d-flex flex-column justify-between bg-grey-lighten-5 pa-6 rounded-r-xl">
          <div v-if="calculating && !breakdown" class="d-flex flex-column align-center justify-center py-8">
            <v-progress-circular indeterminate color="primary" size="40" />
            <span class="text-caption text-grey mt-2">جاري حساب الأسعار...</span>
          </div>

          <div v-else-if="breakdown" class="d-flex flex-column justify-between h-100">
            <div>
              <h4 class="text-subtitle-2 font-weight-bold text-grey-darken-4 mb-4">تفاصيل الحساب والتوفير</h4>
              
              <div class="pricing-rows d-flex flex-column gap-3 mb-4">
                <div class="d-flex align-center justify-between text-body-2 text-grey-darken-1">
                  <span>سعر الشهر الأساسي:</span>
                  <span class="font-weight-bold text-ltr">{{ breakdown.base_price_per_month }} EGP</span>
                </div>
                <div v-if="breakdown.tiered_discount_amount > 0" class="d-flex align-center justify-between text-body-2 text-success">
                  <span>سعر الشهر المخفض للمدة:</span>
                  <span class="font-weight-bold text-ltr">{{ breakdown.tiered_price_per_month }} EGP</span>
                </div>
                <div class="d-flex align-center justify-between text-body-2 text-grey-darken-1">
                  <span>المبلغ الإجمالي (قبل الخصم):</span>
                  <span class="font-weight-bold text-decoration-line-through text-ltr">{{ breakdown.subtotal }} EGP</span>
                </div>
                
                <v-divider class="my-1 border-dashed" />

                <!-- Discounts Breakdown -->
                <div v-if="breakdown.tiered_discount_amount > 0" class="d-flex align-center justify-between text-caption text-success font-weight-medium">
                  <span>خصم مدة الاشتراك:</span>
                  <span class="text-ltr">-{{ breakdown.tiered_discount_amount }} EGP</span>
                </div>
                <div v-if="breakdown.coupon_discount_amount > 0" class="d-flex align-center justify-between text-caption text-secondary font-weight-medium">
                  <span>خصم الكوبون ({{ breakdown.coupon?.code }}):</span>
                  <span class="text-ltr">-{{ breakdown.coupon_discount_amount }} EGP</span>
                </div>

                <div v-if="breakdown.total_discount_amount > 0" class="d-flex align-center justify-between alert-savings pa-3 rounded-lg bg-green-lighten-5 text-green-darken-2 font-weight-bold text-caption mt-2">
                  <span class="d-flex align-center gap-1">
                    <v-icon icon="ri-sparkles-line" size="14" />
                    <span>إجمالي التوفير والخصومات:</span>
                  </span>
                  <span class="text-ltr">-{{ breakdown.total_discount_amount }} EGP</span>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-opacity-10">
              <div class="d-flex align-center justify-between mb-2">
                <span class="text-subtitle-1 font-weight-bold text-grey-darken-3">المبلغ الكلي المطلوب:</span>
                <span class="text-h4 font-weight-black text-primary text-ltr">{{ breakdown.total_price }} EGP</span>
              </div>
              <div class="text-caption text-grey text-end mb-4">
                تأثير التكلفة: {{ breakdown.effective_price_per_month }} EGP شهرياً
              </div>

              <v-btn
                color="primary"
                block
                size="large"
                class="rounded-xl font-weight-bold"
                prepend-icon="ri-vip-crown-fill"
                :loading="submitting"
                @click="onConfirm"
              >
                تأكيد الاشتراك والدفع
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm']);

const selectedMonths = ref(1);
const couponCode = ref('');
const appliedCoupon = ref('');
const calculating = ref(false);
const breakdown = ref(null);

const couponSuccessMsg = ref('');
const couponErrorMsg = ref('');

const durationTiers = [
  { months: 1, label: 'شهر 1', discount: '' },
  { months: 3, label: '3 أشهر', discount: 'خصم 10%' },
  { months: 6, label: '6 أشهر', discount: 'خصم 20%' },
  { months: 12, label: 'سنة 1', discount: 'خصم 30%' },
  { months: 24, label: 'سنتين', discount: 'وفر 33%' },
  { months: 48, label: '4 سنوات', discount: 'وفر 33%' },
];

const getMonthLabel = (m) => {
  if (m === 1) return 'شهر';
  if (m === 2) return 'شهران';
  if (m >= 3 && m <= 10) return 'أشهر';
  return 'شهر';
};

const calculatePricing = async () => {
  if (!props.plan?.id) return;
  calculating.value = true;
  try {
    const api = useApi('/api/saas/pricing/calculate');
    const response = await api.post({
      plan_id: props.plan.id,
      months: selectedMonths.value,
      coupon_code: appliedCoupon.value || null
    });

    if (response.success && response.data) {
      breakdown.value = response.data;
      
      // تحديث تنبيهات الكوبون
      if (appliedCoupon.value) {
        if (response.data.coupon_error) {
          couponErrorMsg.value = response.data.coupon_error;
          couponSuccessMsg.value = '';
          appliedCoupon.value = '';
        } else if (response.data.coupon) {
          couponSuccessMsg.value = `تم تطبيق الكوبون (${response.data.coupon.code}) بنجاح!`;
          couponErrorMsg.value = '';
        }
      }
    }
  } catch (error) {
    console.error('Failed to calculate pricing:', error);
  } finally {
    calculating.value = false;
  }
};

const applyCoupon = () => {
  if (!couponCode.value || couponCode.value.trim() === '') {
    couponErrorMsg.value = 'يرجى إدخال كود كوبون صالح أولاً.';
    return;
  }
  appliedCoupon.value = couponCode.value.trim().toUpperCase();
  calculatePricing();
};

const clearCoupon = () => {
  couponCode.value = '';
  appliedCoupon.value = '';
  couponSuccessMsg.value = '';
  couponErrorMsg.value = '';
  calculatePricing();
};

const onConfirm = () => {
  emit('confirm', {
    plan_id: props.plan.id,
    months: selectedMonths.value,
    coupon_code: appliedCoupon.value || null
  });
};

watch(() => props.plan?.id, () => {
  clearCoupon();
});

watch(selectedMonths, () => {
  calculatePricing();
});

onMounted(() => {
  calculatePricing();
});
</script>

<style scoped>
.pricing-calculator-widget {
  max-width: 100%;
}

.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.border-b {
  border-bottom: 1px solid currentColor;
}

.text-xxs {
  font-size: 0.65rem;
}

.alert-savings {
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.border-dashed {
  border-style: dashed !important;
}

.text-ltr {
  direction: ltr;
  display: inline-block;
}
</style>
