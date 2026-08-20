<template>
  <AppDialog
    v-model="internalValue"
    title="رد عهدة"
    width="500"
    :loading="loading"
    @cancel="close"
    @confirm="submit"
  >
    <v-form ref="form" @submit.prevent="submit" class="mt-2">
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="formData.cashbox_id"
            :items="cashboxes"
            item-title="name"
            item-value="id"
            label="صندوق الاستلام"
            :rules="[v => !!v || 'مطلوب']"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="formData.amount"
            label="المبلغ"
            type="number"
            :rules="[v => !!v || 'مطلوب', v => v > 0 || 'يجب أن يكون أكبر من صفر']"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="formData.date"
            label="التاريخ"
            type="date"
            :rules="[v => !!v || 'مطلوب']"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useCustodies } from '../composables/useCustodies';
import AppDialog from '@/components/common/AppDialog.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  custody: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const internalValue = ref(props.modelValue);
watch(() => props.modelValue, val => {
  internalValue.value = val;
  if (val) resetForm();
});
watch(() => internalValue.value, val => emit('update:modelValue', val));

const { refundCustody, loading } = useCustodies();
const form = ref(null);
const cashboxes = ref([]);

const formData = ref({
  cashbox_id: null,
  amount: null,
  date: new Date().toISOString().substr(0, 10),
});

onMounted(async () => {
  try {
    const api = await import('@/api');
    const cRes = await (api.default?.cashboxService || api.cashboxService).getAll({ per_page: 100 });
    if (cRes && cRes.data) cashboxes.value = cRes.data;
  } catch (err) {
    console.error(err);
  }
});

const resetForm = () => {
  if (form.value) form.value.resetValidation();
  formData.value = {
    cashbox_id: null,
    amount: props.custody?.remaining_amount || props.custody?.amount || null,
    date: new Date().toISOString().substr(0, 10),
  };
};

const close = () => {
  internalValue.value = false;
};

const submit = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  const res = await refundCustody(props.custody.id, formData.value);
  if (res && res.success) {
    emit('saved');
    close();
  }
};
</script>
