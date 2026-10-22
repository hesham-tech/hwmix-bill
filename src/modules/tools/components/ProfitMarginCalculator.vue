<template>
  <div class="profit-margin-calculator">
    <v-card class="rounded-xl border pa-6 mb-6" elevation="0">
      <div class="d-flex align-center gap-3 mb-6">
        <v-avatar color="deep-purple-lighten-5" rounded="lg" size="48">
          <v-icon icon="ri-line-chart-line" color="deep-purple" size="26" />
        </v-avatar>
        <div>
          <h2 class="text-h6 font-weight-bold">حاسبة هامش الربح والتسعير</h2>
          <p class="text-caption text-grey">احسب نسب الربح وهامش المبيعات بدقة لتسعير منتجاتك وخدماتك</p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="costPrice"
            label="سعر التكلفة (Cost)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            prefix="ر.س"
          ></v-text-field>

          <v-text-field
            v-model.number="sellingPrice"
            label="سعر البيع (Revenue)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            prefix="ر.س"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-card color="grey-lighten-5" class="rounded-lg pa-5 border h-100 d-flex flex-column justify-center" elevation="0">
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2 text-grey-darken-1">صافي الربح المالي:</span>
              <span class="text-h6 font-weight-black" :class="grossProfit >= 0 ? 'text-success' : 'text-error'">
                {{ formatCurrency(grossProfit) }}
              </span>
            </div>

            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2 text-grey-darken-1">هامش الربح (Profit Margin):</span>
              <span class="text-h6 font-weight-black text-primary">
                {{ marginPercent.toFixed(2) }}%
              </span>
            </div>

            <v-divider class="my-3"></v-divider>

            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">نسبة الإضافة (Markup):</span>
              <span class="text-h6 font-weight-black text-deep-purple">
                {{ markupPercent.toFixed(2) }}%
              </span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const costPrice = ref(80)
const sellingPrice = ref(100)

const grossProfit = computed(() => {
  return (Number(sellingPrice.value) || 0) - (Number(costPrice.value) || 0)
})

const marginPercent = computed(() => {
  const sell = Number(sellingPrice.value) || 0
  if (sell <= 0) return 0
  return (grossProfit.value / sell) * 100
})

const markupPercent = computed(() => {
  const cost = Number(costPrice.value) || 0
  if (cost <= 0) return 0
  return (grossProfit.value / cost) * 100
})

const formatCurrency = (val) => {
  return (val || 0).toLocaleString('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ر.س'
}
</script>
