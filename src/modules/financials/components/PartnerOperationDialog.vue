<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center bg-primary text-white pa-4">
        <v-icon icon="ri-hand-coin-line" class="me-2"></v-icon>
        ?????? ???????? ??????
        <v-spacer></v-spacer>
        <v-btn icon="ri-close-line" variant="text" @click="close"></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="form" @submit.prevent="submit" :disabled="loading">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="formData.type"
                :items="operationTypes"
                item-title="label"
                item-value="key"
                label="??? ????????"
                :rules="[v => !!v || '??? ???????? ????????']"
                variant="outlined"
                density="comfortable"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.raw.label" :subtitle="item.raw.description">
                    <template #prepend>
                      <v-icon
                        :color="item.raw.category === 'deposit' ? 'success' : 'error'"
                        :icon="item.raw.category === 'deposit' ? 'ri-arrow-down-line' : 'ri-arrow-up-line'"
                      ></v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="6">
              <CustomerSelector
                v-model="formData.partner_id"
                label="المالك أو الشريك المستهدف *"
                relation-type=""
                include-self
                :rules="[v => !!v || '???????? ????????']"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <CashBoxSelector
                v-model="formData.cashbox_id"
                label="???????"
                :rules="[v => !!v || '??????? ????????']"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.amount"
                label="???????"
                type="number"
                min="0"
                step="0.01"
                :rules="[v => !!v || '??????? ????????', v => v > 0 || '??? ?? ???? ??????? ???? ?? ???']"
                variant="outlined"
                density="comfortable"
                append-inner-icon="ri-money-dollar-circle-line"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.operation_date"
                label="????? ????????"
                type="date"
                :rules="[v => !!v || '????? ???????? ????????']"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.notes"
                label="????????"
                rows="2"
                variant="outlined"
                density="comfortable"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close" :disabled="loading">?????</v-btn>
        <v-btn color="primary" variant="flat" @click="submit" :loading="loading" :disabled="loading">
          ????
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { usePartnerOperations } from '../composables/usePartnerOperations';
import CustomerSelector from '@/modules/invoices/components/CustomerSelector.vue';
import CashBoxSelector from '@/modules/invoices/components/CashBoxSelector.vue';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'saved']);

const dialog = ref(props.modelValue);
const form = ref(null);
const { createOperation, loadTypes, operationTypes } = usePartnerOperations();

const loading = ref(false);

const initialData = {
  type: null,
  partner_id: null,
  cashbox_id: null,
  amount: null,
  operation_date: new Date().toISOString().substr(0, 10),
  notes: ''
};

const formData = reactive({ ...initialData });

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val) {
    Object.assign(formData, initialData);
    formData.operation_date = new Date().toISOString().substr(0, 10);
    if (operationTypes.value.length === 0) {
      loadTypes();
    }
  }
});

watch(() => dialog.value, (val) => {
  emit('update:modelValue', val);
});

onMounted(() => {
  loadTypes();
});

const close = () => {
  dialog.value = false;
};

const submit = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const res = await createOperation(formData);
    if (res.success) {
      notificationManager.success('?? ????? ???????? ?????');
      emit('saved');
      close();
    } else {
      notificationManager.error(res.message || '??? ??? ????? ????????');
    }
  } catch (error) {
    notificationManager.error(error.response?.data?.message || '??? ??? ????? ????????');
  } finally {
    loading.value = false;
  }
};
</script>


