<template>
  <div class="calculator-content pa-2">
    <div class="calculator-display pa-4 text-right position-relative">
      <!-- زر السجل عائم فوق الشاشة -->
      <v-menu v-if="history.length > 0" offset="5">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="ri-history-line" size="x-small" variant="tonal" class="position-absolute history-btn" color="primary" />
        </template>
        <v-list density="compact" width="200">
          <v-list-item v-for="(h, i) in history" :key="i" @click="useHistory(h)">
            <div class="text-caption text-grey">{{ h.expr }}</div>
            <div class="text-body-2 font-weight-bold">= {{ h.res }}</div>
          </v-list-item>
          <v-divider />
          <v-list-item @click="history = []" class="text-error text-center" title="مسح السجل" />
        </v-list>
      </v-menu>

      <div class="text-caption text-grey">{{ expression || '0' }}</div>
      <div class="text-h4 font-weight-bold">{{ current || '0' }}</div>
    </div>

    <div class="pa-2">
      <v-row no-gutters>
        <v-col v-for="btn in buttons" :key="btn.val" :cols="btn.cols || 3" class="pa-1">
          <v-btn
            block
            :color="btn.color || 'surface'"
            :variant="btn.variant || 'flat'"
            height="50"
            class="text-h6 font-weight-bold rounded-md calc-button"
            @click="handleInput(btn.val)"
          >
            {{ btn.label }}
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

defineEmits(['close']);

const current = ref('');
const expression = ref('');
const history = ref([]);
const justCalculated = ref(false); // لتتبع ما إذا كان المستخدم قد ضغط على = للتو

const buttons = [
  { label: 'C', val: 'C', color: 'error', variant: 'tonal' },
  { label: '÷', val: '/', color: 'primary', variant: 'tonal' },
  { label: '×', val: '*', color: 'primary', variant: 'tonal' },
  { label: '⌫', val: 'del', color: 'grey', variant: 'tonal' },
  { label: '7', val: '7' },
  { label: '8', val: '8' },
  { label: '9', val: '9' },
  { label: '-', val: '-', color: 'primary', variant: 'tonal' },
  { label: '4', val: '4' },
  { label: '5', val: '5' },
  { label: '6', val: '6' },
  { label: '+', val: '+', color: 'primary', variant: 'tonal' },
  { label: '1', val: '1' },
  { label: '2', val: '2' },
  { label: '3', val: '3' },
  { label: '=', val: '=', color: 'primary', cols: 3 },
  { label: '0', val: '0', cols: 6 },
  { label: '.', val: '.' },
];

const loadSavedData = () => {
  const saved = localStorage.getItem('calc_data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      current.value = data.current || '';
      expression.value = data.expression || '';
      history.value = data.history || [];
    } catch (e) {
      console.error('Failed to load calc data', e);
    }
  }
};

const saveCurrentData = () => {
  const data = {
    current: current.value,
    expression: expression.value,
    history: history.value,
  };
  localStorage.setItem('calc_data', JSON.stringify(data));
};

const handleInput = val => {
  // إذا كان المستخدم قد ضغط على = للتو
  if (justCalculated.value) {
    // إذا ضغط على رقم أو نقطة، ابدأ عملية جديدة
    if ((val >= '0' && val <= '9') || val === '.') {
      current.value = val;
      expression.value = '';
      justCalculated.value = false;
      saveCurrentData();
      return;
    }
    // إذا ضغط على عملية، استمر على النتيجة الحالية
    else if (['+', '-', '*', '/'].includes(val)) {
      current.value += val;
      justCalculated.value = false;
      saveCurrentData();
      return;
    }
  }

  if (val === 'C') {
    current.value = '';
    expression.value = '';
    justCalculated.value = false;
  } else if (val === 'del') {
    current.value = current.value.slice(0, -1);
    justCalculated.value = false;
  } else if (val === '=') {
    try {
      const expr = current.value;
      // Use Function constructor instead of eval to avoid build issues
      const result = new Function('return ' + current.value)();
      const resStr = String(Number(result.toFixed(4)));

      // إضافة للسجل
      history.value.unshift({ expr, res: resStr });
      if (history.value.length > 5) history.value.pop();

      expression.value = expr;
      current.value = resStr;
      justCalculated.value = true; // تم الحساب للتو
    } catch {
      current.value = 'Error';
      justCalculated.value = false;
    }
  } else {
    if (current.value === 'Error') current.value = '';
    current.value += val;
    justCalculated.value = false;
  }
  saveCurrentData();
};

const useHistory = h => {
  current.value = h.res;
  expression.value = h.expr;
};

// دعم لوحة المفاتيح
const handleKeyboard = e => {
  // الأرقام
  if (e.key >= '0' && e.key <= '9') {
    e.preventDefault();
    handleInput(e.key);
  }
  // العمليات
  else if (['+', '-', '*', '/'].includes(e.key)) {
    e.preventDefault();
    handleInput(e.key);
  }
  // النقطة العشرية
  else if (e.key === '.') {
    e.preventDefault();
    handleInput('.');
  }
  // Enter للحساب
  else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    handleInput('=');
  }
  // Escape للمسح
  else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
    e.preventDefault();
    handleInput('C');
  }
  // Backspace للحذف
  else if (e.key === 'Backspace') {
    e.preventDefault();
    handleInput('del');
  }
};

onMounted(() => {
  loadSavedData();
  // إضافة مستمع للوحة المفاتيح
  window.addEventListener('keydown', handleKeyboard);
});

// إزالة المستمع عند إلغاء تحميل المكون
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
});

// استدعاء التنظيف عند الإغلاق
defineExpose({ onUnmounted });

// مراقبة مسح السجل يدوياً
watch(history, saveCurrentData, { deep: true });
</script>

<style scoped>
.calculator-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow: hidden;
}
.calculator-display {
  background: #f1f5f9;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid #edf2f7;
  padding-right: 40px !important;
}

.history-btn {
  top: 10px;
  right: 10px;
  z-index: 2;
}

.calc-button {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}
</style>
