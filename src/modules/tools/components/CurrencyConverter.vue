<template>
  <div class="currency-converter">
    <v-card class="rounded-xl border pa-6 mb-6" elevation="0">
      <div class="d-flex align-center gap-3 mb-6">
        <v-avatar color="info-lighten-5" rounded="lg" size="48">
          <v-icon icon="ri-exchange-dollar-line" color="info" size="26" />
        </v-avatar>
        <div>
          <h2 class="text-h6 font-weight-bold">محول العملات السريع</h2>
          <p class="text-caption text-grey">تحويل فوري بين العملات العربية والعالمية</p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <v-row align="center">
        <!-- المبلغ -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model.number="amount"
            label="المبلغ المراد تحويله"
            type="number"
            variant="outlined"
            density="comfortable"
            hide-details
          ></v-text-field>
        </v-col>

        <!-- من عملة -->
        <v-col cols="12" sm="5" md="3">
          <v-select
            v-model="fromCurrency"
            :items="currencies"
            item-title="label"
            item-value="code"
            label="من عملة"
            variant="outlined"
            density="comfortable"
            hide-details
          ></v-select>
        </v-col>

        <!-- زر التبديل -->
        <v-col cols="12" sm="2" md="2" class="text-center">
          <v-btn
            icon="ri-arrow-left-right-line"
            variant="tonal"
            color="primary"
            @click="swapCurrencies"
            title="تبديل العملات"
          ></v-btn>
        </v-col>

        <!-- إلى عملة -->
        <v-col cols="12" sm="5" md="3">
          <v-select
            v-model="toCurrency"
            :items="currencies"
            item-title="label"
            item-value="code"
            label="إلى عملة"
            variant="outlined"
            density="comfortable"
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <!-- نتيجة التحويل -->
      <v-card color="info-lighten-5" class="rounded-xl pa-6 border mt-6 text-center" elevation="0">
        <div class="text-body-2 text-grey-darken-2 mb-2">
          {{ amount }} {{ getCurrencyLabel(fromCurrency) }} يساوي تقريباً:
        </div>
        <div class="text-h3 font-weight-black text-primary mb-2">
          {{ convertedAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          <span class="text-h5 font-weight-bold text-slate-700">{{ getCurrencySymbol(toCurrency) }}</span>
        </div>
        <div class="text-caption text-grey">
          سعر التحويل: 1 {{ fromCurrency }} = {{ rate.toFixed(4) }} {{ toCurrency }}
        </div>
      </v-card>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const amount = ref(100)
const fromCurrency = ref('SAR')
const toCurrency = ref('EGP')

// أسعار صرف استرشادية مقابل الدولار الأمريكي USD
const ratesVsUSD = {
  USD: 1.0,
  SAR: 3.75,
  AED: 3.67,
  EGP: 49.2,
  KWD: 0.31,
  QAR: 3.64,
  EUR: 0.92,
  GBP: 0.77,
}

const currencies = [
  { code: 'SAR', label: 'ريال سعودي (SAR)', symbol: 'ر.س' },
  { code: 'USD', label: 'دولار أمريكي (USD)', symbol: '$' },
  { code: 'EGP', label: 'جنيه مصري (EGP)', symbol: 'ج.م' },
  { code: 'AED', label: 'درهم إماراتي (AED)', symbol: 'د.إ' },
  { code: 'KWD', label: 'دينار كويتي (KWD)', symbol: 'د.ك' },
  { code: 'QAR', label: 'ريال قطري (QAR)', symbol: 'ر.ق' },
  { code: 'EUR', label: 'يورو أوروبي (EUR)', symbol: '€' },
  { code: 'GBP', label: 'جنيه إسترليني (GBP)', symbol: '£' },
]

const rate = computed(() => {
  const fromRate = ratesVsUSD[fromCurrency.value] || 1
  const toRate = ratesVsUSD[toCurrency.value] || 1
  return toRate / fromRate
})

const convertedAmount = computed(() => {
  return (Number(amount.value) || 0) * rate.value
})

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
}

const getCurrencyLabel = (code) => {
  const found = currencies.find(c => c.code === code)
  return found ? found.label : code
}

const getCurrencySymbol = (code) => {
  const found = currencies.find(c => c.code === code)
  return found ? found.symbol : code
}
</script>
