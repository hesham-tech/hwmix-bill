<template>
  <div class="percentage-tool-content pa-4">
    <v-row dense>
      <v-col cols="12">
        <v-text-field
          v-model.number="form.amount"
          label="المبلغ الأساسي"
          placeholder="5000"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-3"
          autofocus
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model.number="form.percent"
          label="النسبة المئوية"
          placeholder="30"
          suffix="%"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-4"
        />
      </v-col>
    </v-row>

    <!-- النسبة الثابتة (لا تتأثر بالأزرار) -->
    <v-expand-transition>
      <div v-if="percentValue !== null" class="mb-4 pa-3 rounded-lg bg-grey-lighten-4 border-dashed">
        <div class="text-caption text-grey-darken-1 mb-1">المبلغ {{ form.amount }} وقيمة الـ {{ form.percent }}% منه هي:</div>
        <div class="text-h6 font-weight-bold text-grey-darken-3">
          {{ formatCurrency(percentValue) }}
        </div>
      </div>
    </v-expand-transition>

    <!-- أزرار العمليات -->
    <div class="d-flex gap-2 mb-4">
      <v-btn
        :color="mode === 'add' ? 'success' : 'grey-lighten-3'"
        :variant="mode === 'add' ? 'flat' : 'tonal'"
        class="flex-grow-1"
        @click="setMode('add')"
      >
        <v-icon icon="ri-add-line" class="me-1" />
        إضافة +
      </v-btn>
      <v-btn
        :color="mode === 'subtract' ? 'error' : 'grey-lighten-3'"
        :variant="mode === 'subtract' ? 'flat' : 'tonal'"
        class="flex-grow-1"
        @click="setMode('subtract')"
      >
        <v-icon icon="ri-subtract-line" class="me-1" />
        خصم -
      </v-btn>
    </div>

    <!-- النتيجة النهائية -->
    <v-expand-transition>
      <div v-if="finalResult !== null" class="pa-3 rounded-lg bg-primary-lighten-5 border-primary">
        <div class="text-caption text-primary mb-1">{{ resultLabel }}</div>
        <div class="text-h5 font-weight-bold text-primary-darken-3">
          {{ formatCurrency(finalResult) }}
        </div>
      </div>
    </v-expand-transition>

    <div v-if="finalResult === null" class="text-center text-caption text-grey opacity-70">أدخل المبلغ والنسبة</div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { formatCurrency } from '@/utils/formatters';

const form = reactive({
  amount: null,
  percent: null,
});

const mode = ref('add'); // 'add' or 'subtract'
const percentValue = ref(null);
const finalResult = ref(null);
const resultLabel = ref('');

const calculate = () => {
  if (form.amount === null || form.percent === null) {
    percentValue.value = null;
    finalResult.value = null;
    return;
  }

  const amount = Number(form.amount);
  const percent = Number(form.percent);

  // دائمًا نحسب قيمة النسبة بشكل منفصل
  percentValue.value = amount * (percent / 100);

  if (mode.value === 'add') {
    finalResult.value = amount + percentValue.value;
    resultLabel.value = `المبلغ ${amount} وبعد إضافة ${percent}% هو:`;
  } else if (mode.value === 'subtract') {
    finalResult.value = amount - percentValue.value;
    resultLabel.value = `المبلغ ${amount} وبعد خصم ${percent}% هو:`;
  }
};

const setMode = newMode => {
  mode.value = newMode;
  calculate();
};

// حساب تلقائي عند أي تغيير
watch(() => [form.amount, form.percent, mode.value], calculate, { immediate: true });
</script>

<style scoped>
.percentage-tool-content {
  min-height: 200px;
}
.gap-2 {
  gap: 8px;
}
.bg-primary-lighten-5 {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
.border-primary {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}
</style>
