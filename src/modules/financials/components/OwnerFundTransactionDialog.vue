<template>
  <AppDialog
    v-model="isOpen"
    title="Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã˜Â£Ã™â€¦Ã™â€žÃ˜Â§Ã™Æ’ Ã˜Â´Ã˜Â±Ã™Å Ã™Æ’ / Ã™â€¦Ã˜Â§Ã™â€žÃ™Æ’"
    icon="ri-hand-coin-line"
    max-width="550"
    :loading="loading"
    confirm-text="Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â©"
    @confirm="handleSubmit"
    @close="close"
  >
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-container class="pa-0">
        <v-row dense>
          <!-- Ã™â€ Ã™Ë†Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â© -->
          <v-col cols="12">
            <v-select
              v-model="form.type"
              :items="transactionTypes"
              item-title="title"
              item-value="value"
              label="Ã™â€ Ã™Ë†Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â© *"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'Ã™â€ Ã™Ë†Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã™â€¦Ã˜Â·Ã™â€žÃ™Ë†Ã˜Â¨']"
              class="mb-2"
            />
          </v-col>

          <!-- Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’ / Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Å Ã™Æ’ -->
          <v-col cols="12">
            <v-autocomplete
              v-model="form.user_id"
              :items="users"
              :loading="loadingUsers"
              :item-title="item => item.nickname ? `${item.full_name} (${item.nickname})` : item.full_name || item.name"
              item-value="id"
              label="Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’ Ã˜Â£Ã™Ë† Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Å Ã™Æ’ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜ÂªÃ™â€¡Ã˜Â¯Ã™Â *"
              placeholder="Ã˜Â§Ã˜Â¨Ã˜Â­Ã˜Â« Ã˜Â¹Ã™â€  Ã˜Â§Ã˜Â³Ã™â€¦ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’/Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Å Ã™Æ’..."
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’/Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Å Ã™Æ’ Ã™â€¦Ã˜Â·Ã™â€žÃ™Ë†Ã˜Â¨']"
              class="mb-2"
            />
          </v-col>

          <!-- Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â²Ã™Å Ã™â€ Ã˜Â© / Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨ Ã˜Â§Ã™â€žÃ˜Â¨Ã™â€ Ã™Æ’Ã™Å  -->
          <v-col cols="12">
            <v-select
              v-model="form.cashbox_id"
              :items="cashBoxes"
              :loading="loadingBoxes"
              item-title="name"
              item-value="id"
              label="Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â²Ã™Å Ã™â€ Ã˜Â© Ã˜Â£Ã™Ë† Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨ Ã˜Â§Ã™â€žÃ˜Â¨Ã™â€ Ã™Æ’Ã™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â±Ã˜ÂªÃ˜Â¨Ã˜Â· *"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â²Ã™Å Ã™â€ Ã˜Â© Ã™â€¦Ã˜Â·Ã™â€žÃ™Ë†Ã˜Â¨Ã˜Â©']"
              class="mb-2"
            />
          </v-col>

          <!-- Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã™â€žÃ˜Âº -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="form.amount"
              label="Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã™â€žÃ˜Âº Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â·Ã™â€žÃ™Ë†Ã˜Â¨ *"
              type="number"
              step="0.01"
              variant="outlined"
              density="comfortable"
              prefix="Ã‚Â£"
              required
              :rules="[v => !!v || 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã™â€žÃ˜Âº Ã™â€¦Ã˜Â·Ã™â€žÃ™Ë†Ã˜Â¨', v => v > 0 || 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã™â€žÃ˜Âº Ã™Å Ã˜Â¬Ã˜Â¨ Ã˜Â£Ã™â€  Ã™Å Ã™Æ’Ã™Ë†Ã™â€  Ã˜Â£Ã™Æ’Ã˜Â¨Ã˜Â± Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ˜ÂµÃ™ÂÃ˜Â±']"
              class="mb-2"
            />
          </v-col>

          <!-- Ã˜ÂªÃ˜Â§Ã˜Â±Ã™Å Ã˜Â® Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â© -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.entry_date"
              label="Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â§Ã˜Â±Ã™Å Ã˜Â® Ã˜Â§Ã™â€žÃ™ÂÃ˜Â¹Ã™â€žÃ™Å  Ã™â€žÃ™â€žÃ™â€¦Ã˜Â·Ã˜Â§Ã˜Â¨Ã™â€šÃ˜Â© *"
              type="date"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â§Ã˜Â±Ã™Å Ã˜Â® Ã™â€¦Ã˜Â·Ã™â€žÃ™Ë†Ã˜Â¨']"
              class="mb-2"
            />
          </v-col>

          <!-- Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ˜Â§Ã˜Â­Ã˜Â¸Ã˜Â§Ã˜Âª -->
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Ã™â€¦Ã™â€žÃ˜Â§Ã˜Â­Ã˜Â¸Ã˜Â§Ã˜Âª Ã™Ë†Ã˜ÂªÃ™ÂÃ˜Â§Ã˜ÂµÃ™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â©"
              placeholder="Ã˜Â§Ã™Æ’Ã˜ÂªÃ˜Â¨ Ã˜ÂªÃ™ÂÃ˜Â§Ã˜ÂµÃ™Å Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â© (Ã™â€¦Ã˜Â«Ã˜Â§Ã™â€ž: Ã˜Â²Ã™Å Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â­Ã˜ÂµÃ˜Â© Ã˜Â§Ã™â€žÃ™â€ Ã™â€šÃ˜Â¯Ã™Å Ã˜Â© Ã™ÂÃ™Å  Ã˜Â±Ã˜Â£Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€ž...)"
              rows="2"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </AppDialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { AppDialog } from '@/components';
import { useApi } from '@/composables/useApi';
import { userService } from '@/api';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'success']);

const formRef = ref(null);
const loading = ref(false);
const loadingUsers = ref(false);
const loadingBoxes = ref(false);
const users = ref([]);
const cashBoxes = ref([]);

const api = useApi('/api/owner-fund-transactions');
const boxesApi = useApi('/api/cash-boxes');

const transactionTypes = [
  { title: 'Ã˜Â²Ã™Å Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â±Ã˜Â£Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€ž (Capital Increase)', value: 'capital_increase' },
  { title: 'Ã™â€¦Ã˜Â³Ã˜Â§Ã™â€¡Ã™â€¦Ã˜Â© Ã˜Â´Ã˜Â±Ã™Å Ã™Æ’ Ã˜Â¬Ã˜Â§Ã˜Â±Ã™Å  (Partner Contribution)', value: 'partner_contribution' },
  { title: 'Ã™â€šÃ˜Â±Ã˜Â¶ Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’ Ã™â€žÃ™â€žÃ˜Â´Ã˜Â±Ã™Æ’Ã˜Â© (Loan from Owner)', value: 'loan_from_owner' },
  { title: 'Ã™â€šÃ˜Â±Ã˜Â¶ Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Æ’Ã˜Â© Ã™â€žÃ™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’ (Loan to Owner)', value: 'loan_to_owner' },
  { title: 'Ã˜Â³Ã™â€žÃ™ÂÃ˜Â© Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’ (Advance from Owner)', value: 'advance_from_owner' },
  { title: 'Ã˜Â³Ã™â€žÃ™ÂÃ˜Â© Ã™â€žÃ™â€žÃ˜Â´Ã˜Â±Ã™Å Ã™Æ’ (Advance to Partner)', value: 'advance_to_partner' },
  { title: 'Ã˜Â³Ã˜Â­Ã˜Â¨ Ã˜Â£Ã˜Â±Ã˜Â¨Ã˜Â§Ã˜Â­ (Drawings)', value: 'drawings' },
  { title: 'Ã˜ÂªÃ™Ë†Ã˜Â²Ã™Å Ã˜Â¹ Ã˜Â£Ã˜Â±Ã˜Â¨Ã˜Â§Ã˜Â­ (Profit Distribution)', value: 'profit_distribution' },
];

const form = reactive({
  type: null,
  user_id: null,
  cashbox_id: null,
  amount: null,
  entry_date: new Date().toISOString().substring(0, 10),
  description: '',
});

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await userService.getAll({ per_page: 100 });
    users.value = response.data || [];
  } catch (error) {
    console.error('Failed to load users for owner transaction:', error);
  } finally {
    loadingUsers.value = false;
  }
};

const loadBoxes = async () => {
  loadingBoxes.value = true;
  try {
    const response = await boxesApi.get({ per_page: 100, is_active: true, all_company_boxes: true });
    cashBoxes.value = response.data || [];
  } catch (error) {
    console.error('Failed to load active cash boxes:', error);
  } finally {
    loadingBoxes.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.type = null;
    form.user_id = null;
    form.cashbox_id = null;
    form.amount = null;
    form.entry_date = new Date().toISOString().substring(0, 10);
    form.description = '';
    if (formRef.value) formRef.value.resetValidation();
    
    loadUsers();
    loadBoxes();
  }
});

const close = () => {
  isOpen.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const response = await api.create({ ...form });
    notificationManager.success('Ã˜ÂªÃ™â€¦ Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â© Ã˜Â£Ã™â€¦Ã™Ë†Ã˜Â§Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ˜Â§Ã™Æ’/Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Æ’Ã˜Â§Ã˜Â¡ Ã˜Â¨Ã™â€ Ã˜Â¬Ã˜Â§Ã˜Â­.');
    emit('success', response.data);
    close();
  } catch (error) {
    console.error('Failed to submit owner fund transaction:', error);
  } finally {
    loading.value = false;
  }
};
</script>
