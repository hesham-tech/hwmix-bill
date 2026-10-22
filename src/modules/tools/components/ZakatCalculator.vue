<template>
  <div class="zakat-calculator">
    <v-card class="rounded-xl border pa-6 mb-6" elevation="0">
      <div class="d-flex align-center gap-3 mb-6">
        <v-avatar color="success-lighten-5" rounded="lg" size="48">
          <v-icon icon="ri-hand-coin-line" color="success" size="26" />
        </v-avatar>
        <div>
          <h2 class="text-h6 font-weight-bold">حاسبة زكاة المال وعروض التجارة</h2>
          <p class="text-caption text-grey">احسب زكاة أموالك والذهب والفضة بسهولة ودقة وفق الأحكام الشرعية</p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <!-- نصاب الزكاة والمعايير -->
      <v-card color="grey-lighten-5" class="rounded-lg pa-4 mb-6 border" elevation="0">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <div class="text-subtitle-2 font-weight-bold text-slate-800">معيار النصاب الشرعي</div>
            <div class="text-caption text-grey">يُحسب النصاب بما يعادل قيمة 85 جراماً من الذهب عيار 21 أو 24</div>
          </div>
          <div class="d-flex align-center gap-3">
            <v-text-field
              v-model.number="goldPricePerGram"
              label="سعر جرام الذهب عيار 21 الحالي"
              type="number"
              density="compact"
              variant="outlined"
              bg-color="white"
              hide-details
              style="width: 200px"
              suffix="ر.س"
            ></v-text-field>
          </div>
        </div>
      </v-card>

      <!-- مدخلات الأموال والأصول -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="rounded-lg pa-4 h-100 border">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center gap-2">
              <v-icon icon="ri-wallet-3-line" size="20"></v-icon>
              الأموال النقدية والودائع
            </h3>

            <v-text-field
              v-model.number="form.cashInHand"
              label="السيولة النقدية في اليد والخزينة"
              type="number"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              prefix="ر.س"
            ></v-text-field>

            <v-text-field
              v-model.number="form.bankDeposits"
              label="الأرصدة والحسابات البنكية"
              type="number"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              prefix="ر.س"
            ></v-text-field>

            <v-text-field
              v-model.number="form.goodDebts"
              label="ديون لك على الآخرين (مرجوة السداد)"
              type="number"
              variant="outlined"
              density="comfortable"
              prefix="ر.س"
            ></v-text-field>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card variant="outlined" class="rounded-lg pa-4 h-100 border">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-warning d-flex align-center gap-2">
              <v-icon icon="ri-copper-coin-line" size="20"></v-icon>
              الذهب والفضة وعروض التجارة
            </h3>

            <v-text-field
              v-model.number="form.goldValue"
              label="قيمة سبائك الذهب المدخرة للزكاة"
              type="number"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              prefix="ر.س"
            ></v-text-field>

            <v-text-field
              v-model.number="form.tradeGoods"
              label="قيمة البضائع وعروض التجارة بسعر السوق الحالي"
              type="number"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              prefix="ر.س"
            ></v-text-field>

            <v-text-field
              v-model.number="form.debtsOwed"
              label="ديون مستحقة عليك حالاً (تُخصم من الوعاء)"
              type="number"
              variant="outlined"
              density="comfortable"
              prefix="ر.س"
              color="error"
            ></v-text-field>
          </v-card>
        </v-col>
      </v-row>

      <!-- شريط الإجراءات -->
      <div class="d-flex align-center justify-end gap-3 mt-6">
        <v-btn variant="outlined" color="grey" @click="resetForm" prepend-icon="ri-refresh-line">
          إعادة تعيين
        </v-btn>
      </div>
    </v-card>

    <!-- ملخص النتائج -->
    <v-card class="rounded-xl border pa-6 bg-gradient" elevation="0">
      <v-row align="center">
        <v-col cols="12" md="4" class="text-center border-e-md">
          <div class="text-caption text-grey mb-1">إجمالي وعاء الزكاة الصافي</div>
          <div class="text-h4 font-weight-black text-slate-800">
            {{ formatCurrency(netZakatableWealth) }}
          </div>
          <div class="text-caption text-grey mt-1">
            حد النصاب الحالي: {{ formatCurrency(nisabThreshold) }}
          </div>
        </v-col>

        <v-col cols="12" md="4" class="text-center border-e-md">
          <div class="text-caption text-grey mb-1">حالة بلوغ النصاب الشرعي</div>
          <v-chip
            :color="isNisabReached ? 'success' : 'grey'"
            variant="tonal"
            size="large"
            class="font-weight-bold"
          >
            <v-icon :icon="isNisabReached ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'" class="me-1"></v-icon>
            {{ isNisabReached ? 'بلغ النصاب (تجب الزكاة)' : 'لم يبلغ النصاب بعد' }}
          </v-chip>
        </v-col>

        <v-col cols="12" md="4" class="text-center">
          <div class="text-caption text-grey mb-1">مقدار الزكاة الواجبة (2.5%)</div>
          <div class="text-h3 font-weight-black text-success">
            {{ formatCurrency(zakatDue) }}
          </div>
          <div class="text-caption text-success font-weight-medium mt-1">
            ربع العشر (2.5%)
          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const goldPricePerGram = ref(380) // سعر تقديري افتراضي لجرام الذهب

const form = reactive({
  cashInHand: 0,
  bankDeposits: 0,
  goodDebts: 0,
  goldValue: 0,
  tradeGoods: 0,
  debtsOwed: 0,
})

const nisabThreshold = computed(() => {
  return (goldPricePerGram.value || 0) * 85
})

const totalAssets = computed(() => {
  return (
    (Number(form.cashInHand) || 0) +
    (Number(form.bankDeposits) || 0) +
    (Number(form.goodDebts) || 0) +
    (Number(form.goldValue) || 0) +
    (Number(form.tradeGoods) || 0)
  )
})

const netZakatableWealth = computed(() => {
  const net = totalAssets.value - (Number(form.debtsOwed) || 0)
  return net > 0 ? net : 0
})

const isNisabReached = computed(() => {
  return netZakatableWealth.value >= nisabThreshold.value && nisabThreshold.value > 0
})

const zakatDue = computed(() => {
  if (!isNisabReached.value) return 0
  return netZakatableWealth.value * 0.025
})

const resetForm = () => {
  form.cashInHand = 0
  form.bankDeposits = 0
  form.goodDebts = 0
  form.goldValue = 0
  form.tradeGoods = 0
  form.debtsOwed = 0
}

const formatCurrency = (val) => {
  return (val || 0).toLocaleString('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ر.س'
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}
</style>
