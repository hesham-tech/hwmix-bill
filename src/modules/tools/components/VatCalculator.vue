<template>
  <div class="vat-calculator">
    <v-card class="rounded-xl border pa-6 mb-6" elevation="0">
      <div class="d-flex align-center gap-3 mb-6">
        <v-avatar color="primary-lighten-5" rounded="lg" size="48">
          <v-icon icon="ri-percent-line" color="primary" size="26" />
        </v-avatar>
        <div>
          <h2 class="text-h6 font-weight-bold">حاسبة ضريبة القيمة المضافة (VAT)</h2>
          <p class="text-caption text-grey">احسب المبالغ قبل الضريبة وبعدها واستخرج قيمة الضريبة بدقة وسرعة</p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <!-- خيارات نوع الحساب -->
      <v-btn-toggle
        v-model="calculationType"
        mandatory
        color="primary"
        variant="outlined"
        rounded="lg"
        class="mb-6 w-100"
      >
        <v-btn value="exclusive" class="flex-1 font-weight-bold">
          <v-icon icon="ri-add-circle-line" class="me-2"></v-icon>
          إضافة الضريبة إلى المبلغ (غير شامل)
        </v-btn>
        <v-btn value="inclusive" class="flex-1 font-weight-bold">
          <v-icon icon="ri-subtract-line" class="me-2"></v-icon>
          استخراج الضريبة من المبلغ (شامل الضريبة)
        </v-btn>
      </v-btn-toggle>

      <v-row>
        <!-- إدخال المبلغ -->
        <v-col cols="12" md="7">
          <v-text-field
            v-model.number="amount"
            :label="calculationType === 'exclusive' ? 'المبلغ قبل الضريبة' : 'المبلغ الإجمالي الشامل للضريبة'"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            prefix="ر.س"
            clearable
          ></v-text-field>

          <div class="text-subtitle-2 font-weight-bold mb-2">نسبة ضريبة القيمة المضافة:</div>
          <div class="d-flex align-center gap-2 flex-wrap mb-4">
            <v-chip
              v-for="rate in defaultRates"
              :key="rate"
              :color="vatRate === rate ? 'primary' : 'default'"
              :variant="vatRate === rate ? 'flat' : 'outlined'"
              filter
              class="font-weight-bold px-4"
              @click="vatRate = rate"
            >
              {{ rate }}%
            </v-chip>
            <div style="width: 140px;">
              <v-text-field
                v-model.number="vatRate"
                label="نسبة مخصصة"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                suffix="%"
              ></v-text-field>
            </div>
          </div>
        </v-col>

        <!-- كارت تفاصيل النتائج -->
        <v-col cols="12" md="5">
          <v-card color="grey-lighten-5" class="rounded-lg pa-5 border h-100 d-flex flex-column justify-center" elevation="0">
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2 text-grey-darken-1">المبلغ الأساسي (قبل الضريبة):</span>
              <span class="text-body-1 font-weight-bold">{{ formatCurrency(baseAmount) }}</span>
            </div>

            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2 text-grey-darken-1">قيمة الضريبة ({{ vatRate }}%):</span>
              <span class="text-body-1 font-weight-bold text-primary">{{ formatCurrency(vatAmount) }}</span>
            </div>

            <v-divider class="my-3"></v-divider>

            <div class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1 font-weight-black text-slate-800">الإجمالي النهائي:</span>
              <span class="text-h5 font-weight-black text-success">{{ formatCurrency(totalAmount) }}</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const calculationType = ref('exclusive')
const amount = ref(1000)
const vatRate = ref(15)
const defaultRates = [15, 14, 5]

const baseAmount = computed(() => {
  const a = Number(amount.value) || 0
  const r = (Number(vatRate.value) || 0) / 100
  if (calculationType.value === 'exclusive') {
    return a
  } else {
    return r > 0 ? a / (1 + r) : a
  }
})

const vatAmount = computed(() => {
  const a = Number(amount.value) || 0
  const r = (Number(vatRate.value) || 0) / 100
  if (calculationType.value === 'exclusive') {
    return a * r
  } else {
    return a - baseAmount.value
  }
})

const totalAmount = computed(() => {
  if (calculationType.value === 'exclusive') {
    return baseAmount.value + vatAmount.value
  } else {
    return Number(amount.value) || 0
  }
})

const formatCurrency = (val) => {
  return (val || 0).toLocaleString('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ر.س'
}
</script>
