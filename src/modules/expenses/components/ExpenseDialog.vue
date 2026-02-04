<template>
  <AppDialog v-model="show" :title="isEdit ? 'تعديل مصروف' : 'تسجيل مصروف جديد'" :loading="loading" max-width="700" @save="handleSave">
    <v-form ref="form" v-slot="{ valid }" v-model="isFormValid" @submit.prevent="handleSave">
      <v-container fluid class="pa-0">
        <v-row>
          <!-- التصنيف (50% جوال) -->
          <v-col cols="6" sm="6">
            <AppAutocomplete
              v-model="formData.expense_category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="تصنيف المصروف"
              placeholder="اختر التصنيف"
              required
              :rules="[v => !!v || 'التصنيف مطلوب']"
            />
          </v-col>

          <!-- التاريخ (50% جوال) -->
          <v-col cols="6" sm="6">
            <AppDatePicker v-model="formData.expense_date" label="تاريخ المصروف" required :rules="[v => !!v || 'التاريخ مطلوب']" />
          </v-col>

          <!-- المبلغ (50% جوال) -->
          <v-col cols="6" sm="6">
            <AppInput
              v-model.number="formData.amount"
              label="المبلغ"
              type="number"
              suffix="ج.م"
              required
              :rules="[v => !!v || 'المبلغ مطلوب', v => v > 0 || 'المبلغ يجب أن يكون أكبر من صفر']"
            />
          </v-col>

          <!-- المرجع / رقم الإيصال (50% جوال) -->
          <v-col cols="6" sm="6">
            <AppInput v-model="formData.reference" label="المرجع / رقم الإيصال" placeholder="مثلاً: رقم الفاتورة أو الإيصال" />
          </v-col>

          <!-- الوصف (100% جوال) -->
          <v-col cols="12">
            <AppTextarea v-model="formData.description" label="الوصف / الملاحظات" placeholder="اكتب تفاصيل إضافية هنا..." rows="3" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <!-- الأكوان المخصصة للأزرار حسب Guidelines -->
    <template #actions>
      <div class="d-flex w-full ga-2 flex-wrap">
        <AppButton color="primary" class="flex-grow-1" :loading="loading" @click="handleSave">
          {{ isEdit ? 'تحديث' : 'حفظ' }}
        </AppButton>
        <AppButton variant="outlined" color="secondary" class="flex-grow-1" @click="show = false"> إلغاء </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDatePicker from '@/components/common/AppDatePicker.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
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

const formData = reactive({
  expense_category_id: null,
  amount: null,
  expense_date: new Date(),
  reference: '',
  description: '',
});

// إعادة تعيين البيانات عند الفتح
watch(show, val => {
  if (val) {
    fetchCategories();
    if (props.expense) {
      Object.assign(formData, {
        expense_category_id: props.expense.expense_category_id,
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
  Object.assign(formData, {
    expense_category_id: null,
    amount: null,
    expense_date: new Date(),
    reference: '',
    description: '',
  });
};

const handleSave = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  emit('saved', { ...formData, id: props.expense?.id });
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
