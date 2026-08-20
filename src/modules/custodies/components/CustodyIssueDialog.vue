<template>
  <AppDialog
    v-model="internalValue"
    title="صرف عهدة"
    width="500"
    :loading="loading"
    @cancel="close"
    @confirm="submit"
  >
    <v-form ref="form" @submit.prevent="submit" class="mt-2">
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="formData.user_id"
            :items="users"
            item-title="name"
            item-value="id"
            label="الموظف / المستلم"
            :rules="[v => !!v || 'مطلوب']"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-col>
        <v-col cols="12">
          <v-select
            v-model="formData.cashbox_id"
            :items="cashboxes"
            item-title="name"
            item-value="id"
            label="صندوق الدفع"
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
            v-model="formData.issue_date"
            label="التاريخ"
            type="date"
            :rules="[v => !!v || 'مطلوب']"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            label="الوصف"
            rows="2"
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useCustodies } from '../composables/useCustodies';
import AppDialog from '@/components/common/AppDialog.vue';
import { userService, cashboxService } from '@/api';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const internalValue = ref(props.modelValue);
watch(() => props.modelValue, val => {
  internalValue.value = val;
  if (val) resetForm();
});
watch(() => internalValue.value, val => emit('update:modelValue', val));

const { issueCustody, loading } = useCustodies();
const form = ref(null);

const users = ref([]);
const cashboxes = ref([]);

const formData = ref({
  user_id: null,
  cashbox_id: null,
  amount: null,
  issue_date: new Date().toISOString().substr(0, 10),
  description: '',
});

onMounted(async () => {
  // Load users and cashboxes
  try {
    const [uRes, cRes] = await Promise.all([
      userService.getAll({ per_page: 100 }),
      // Replace with your actual cashbox service call
      import('@/api').then(m => m.default?.cashboxService?.getAll({ per_page: 100 }) || m.cashboxService?.getAll({ per_page: 100 }) || {data:[]})
    ]);
    if (uRes && uRes.data) users.value = uRes.data;
    if (cRes && cRes.data) cashboxes.value = cRes.data;
  } catch (err) {
    console.error(err);
  }
});

const resetForm = () => {
  if (form.value) form.value.resetValidation();
  formData.value = {
    user_id: null,
    cashbox_id: null,
    amount: null,
    issue_date: new Date().toISOString().substr(0, 10),
    description: '',
  };
};

const close = () => {
  internalValue.value = false;
};

const submit = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  const res = await issueCustody(formData.value);
  if (res && res.success) {
    emit('saved');
    close();
  }
};
</script>
