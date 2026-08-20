<template>
  <AppDialog v-model="show" :title="isEdit ? 'ØªØ¹Ø¯ÙŠÙ„ Ù…ØµØ±ÙˆÙ' : 'ØªØ³Ø¬ÙŠÙ„ Ù…ØµØ±ÙˆÙ Ø¬Ø¯ÙŠØ¯'" :loading="loading" max-width="700" @save="handleSave">
    <v-form ref="form" v-slot="{ valid }" v-model="isFormValid" @submit.prevent="handleSave">
      <v-container fluid class="pa-0">
        <v-row>
          <!-- Ø§Ù„ØªØµÙ†ÙŠÙ (50% Ø¬ÙˆØ§Ù„) -->
          <v-col cols="6" sm="6">
            <AppAutocomplete
              v-model="formData.expense_category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="ØªØµÙ†ÙŠÙ Ø§Ù„Ù…ØµØ±ÙˆÙ"
              placeholder="Ø§Ø®ØªØ± Ø§Ù„ØªØµÙ†ÙŠÙ"
              required
              :rules="[v => !!v || 'Ø§Ù„ØªØµÙ†ÙŠÙ Ù…Ø·Ù„ÙˆØ¨']"
            />
          </v-col>

          <!-- Ø§Ù„ØªØ§Ø±ÙŠØ® (50% Ø¬ÙˆØ§Ù„) -->
          <v-col cols="6" sm="6">
            <AppDatePicker v-model="formData.expense_date" label="ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…ØµØ±ÙˆÙ" required :rules="[v => !!v || 'Ø§Ù„ØªØ§Ø±ÙŠØ® Ù…Ø·Ù„ÙˆØ¨']" />
          </v-col>

          <!-- Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¯ÙØ¹ (100% Ø¬ÙˆØ§Ù„) -->
          <v-col cols="12" class="py-0">
            <v-radio-group v-model="paymentSource" inline label="Ù…ØµØ¯Ø± Ø§Ù„Ø¯ÙØ¹">
              <v-radio label="Ø®Ø²ÙŠÙ†Ø©" value="cashbox"></v-radio>
              <v-radio label="Ø¹Ù‡Ø¯Ø©" value="custody"></v-radio>
            </v-radio-group>
          </v-col>

          <!-- Ø§Ù„Ø®Ø²ÙŠÙ†Ø© / Ø§Ù„Ø¹Ù‡Ø¯Ø© (100% Ø¬ÙˆØ§Ù„) -->
          <v-col cols="12" v-if="paymentSource === 'cashbox'">
            <AppAutocomplete
              v-model="formData.cash_box_id"
              :items="cashBoxes"
              item-title="name"
              item-value="id"
              label="Ø§Ù„Ø®Ø²ÙŠÙ†Ø©"
              placeholder="Ø§Ø®ØªØ± Ø§Ù„Ø®Ø²ÙŠÙ†Ø©"
              required
              :rules="[v => !!v || 'Ø§Ù„Ø®Ø²ÙŠÙ†Ø© Ù…Ø·Ù„ÙˆØ¨Ø©']"
            />
          </v-col>
          
          <v-col cols="12" v-if="paymentSource === 'custody'">
            <AppAutocomplete
              v-model="formData.custody_id"
              :items="custodies"
              item-title="description"
              item-value="id"
              label="Ø§Ù„Ø¹Ù‡Ø¯Ø©"
              placeholder="Ø§Ø®ØªØ± Ø§Ù„Ø¹Ù‡Ø¯Ø©"
              required
              :rules="[v => !!v || 'Ø§Ù„Ø¹Ù‡Ø¯Ø© Ù…Ø·Ù„ÙˆØ¨Ø©']"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.description || 'Ø¹Ù‡Ø¯Ø© #' + item.raw.id" :subtitle="'Ø§Ù„Ù…Ø¨Ù„Øº: ' + item.raw.amount" />
              </template>
              <template #selection="{ item }">
                {{ item.raw.description || 'Ø¹Ù‡Ø¯Ø© #' + item.raw.id }}
              </template>
            </AppAutocomplete>
          </v-col>

          <!-- Ø§Ù„Ù…Ø¨Ù„Øº (50% Ø¬ÙˆØ§Ù„) -->
          <v-col cols="6" sm="6">
            <AppInput
              v-model.number="formData.amount"
              label="Ø§Ù„Ù…Ø¨Ù„Øº"
              type="number"
              suffix="Ø¬.Ù…"
              required
              :rules="[v => !!v || 'Ø§Ù„Ù…Ø¨Ù„Øº Ù…Ø·Ù„ÙˆØ¨', v => v > 0 || 'Ø§Ù„Ù…Ø¨Ù„Øº ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø£ÙƒØ¨Ø± Ù…Ù† ØµÙØ±']"
            />
          </v-col>

          <!-- Ø§Ù„Ù…Ø±Ø¬Ø¹ / Ø±Ù‚Ù… Ø§Ù„Ø¥ÙŠØµØ§Ù„ (50% Ø¬ÙˆØ§Ù„) -->
          <v-col cols="6" sm="6">
            <AppInput v-model="formData.reference" label="Ø§Ù„Ù…Ø±Ø¬Ø¹ / Ø±Ù‚Ù… Ø§Ù„Ø¥ÙŠØµØ§Ù„" placeholder="Ù…Ø«Ù„Ø§Ù‹: Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø£Ùˆ Ø§Ù„Ø¥ÙŠØµØ§Ù„" />
          </v-col>

          <!-- Ø§Ù„ÙˆØµÙ (100% Ø¬ÙˆØ§Ù„) -->
          <v-col cols="12">
            <AppTextarea v-model="formData.description" label="Ø§Ù„ÙˆØµÙ / Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª" placeholder="Ø§ÙƒØªØ¨ ØªÙØ§ØµÙŠÙ„ Ø¥Ø¶Ø§ÙÙŠØ© Ù‡Ù†Ø§..." rows="3" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <!-- Ø§Ù„Ø£ÙƒÙˆØ§Ù† Ø§Ù„Ù…Ø®ØµØµØ© Ù„Ù„Ø£Ø²Ø±Ø§Ø± Ø­Ø³Ø¨ Guidelines -->
    <template #actions>
      <div class="d-flex w-full ga-2 flex-wrap align-center">
        <AppActionHelp action-key="expense" size="small" class="me-2" />
        <v-spacer />
        <AppButton color="primary" class="flex-grow-1" :loading="loading" @click="handleSave">
          {{ isEdit ? 'ØªØ­Ø¯ÙŠØ«' : 'Ø­ÙØ¸' }}
        </AppButton>
        <AppButton variant="outlined" color="secondary" class="flex-grow-1" @click="show = false"> Ø¥Ù„ØºØ§Ø¡ </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<script setup>
//   Ù†Ø§ÙØ°Ø© Ù…Ù†Ø¨Ø«Ù‚Ø© Ù„ØªØ³Ø¬ÙŠÙ„ ÙˆØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ØµØ§Ø±ÙŠÙ Ø§Ù„ØªØ´ØºÙŠÙ„ÙŠØ© Ù„Ù„Ù…Ù†Ø´Ø£Ø©
import { ref, watch, reactive, computed } from 'vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDatePicker from '@/components/common/AppDatePicker.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppActionHelp from '@/components/common/AppActionHelp.vue';
import { useExpenseCategories } from '../composables/useExpenseCategories';

const props = defineProps({
  modelValue: Boolean,
  expense: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const show = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const { categories, fetchCategories } = useExpenseCategories();
const loading = ref(false);
const isEdit = computed(() => !!props.expense?.id);
const isFormValid = ref(false);
const form = ref(null);

const paymentSource = ref('cashbox');

import { useCashBoxesData } from '@/modules/cashbox/composables/useCashBoxesData';
import { useApi } from '@/composables/useApi';

const { cashBoxes, fetchCashBoxes } = useCashBoxesData();
const custodiesApi = useApi('/api/custodies');
const custodies = ref([]);

const fetchCustodies = async () => {
  try {
    const res = await custodiesApi.get();
    custodies.value = res.data?.data || res.data || [];
  } catch (error) {
    console.error('Failed to fetch custodies', error);
  }
};

const formData = reactive({
  expense_category_id: null,
  cash_box_id: null,
  custody_id: null,
  amount: null,
  expense_date: new Date(),
  reference: '',
  description: '',
});

// Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ù†Ø¯ Ø§Ù„ÙØªØ­
watch(show, val => {
  if (val) {
    fetchCategories();
    fetchCashBoxes();
    fetchCustodies();
    if (props.expense) {
      paymentSource.value = props.expense.custody_id ? 'custody' : 'cashbox';
      Object.assign(formData, {
        expense_category_id: props.expense.expense_category_id,
        cash_box_id: props.expense.cash_box_id || null,
        custody_id: props.expense.custody_id || null,
        amount: props.expense.amount,
        expense_date: props.expense.expense_date ? new Date(props.expense.expense_date) : new Date(),
        reference: props.expense.reference || '',
        description: props.expense.description || '',
      });
    } else {
      resetForm();
    }
  }
});

const resetForm = () => {
  paymentSource.value = 'cashbox';
  Object.assign(formData, {
    expense_category_id: null,
    cash_box_id: null,
    custody_id: null,
    amount: null,
    expense_date: new Date(),
    reference: '',
    description: '',
  });
};

const handleSave = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  const payload = { ...formData, id: props.expense?.id };
  if (paymentSource.value === 'cashbox') {
    payload.custody_id = null;
  } else {
    payload.cash_box_id = null;
  }

  emit('saved', payload);
};

defineExpose({
  loading,
});
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
