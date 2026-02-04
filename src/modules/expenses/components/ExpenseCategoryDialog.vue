<template>
  <AppDialog v-model="show" title="إدارة فئات المصاريف" :loading="loading" max-width="500" hide-actions>
    <v-card flat>
      <v-form ref="form" v-model="isFormValid" class="mb-6" @submit.prevent="handleAdd">
        <v-row align="center" no-gutters>
          <v-col>
            <AppInput
              v-model="newCategoryName"
              label="اسم الفئة الجديدة"
              placeholder="مثلاً: صيانة، إيجار..."
              hide-details="auto"
              required
              :rules="[v => !!v || 'الاسم مطلوب']"
            />
          </v-col>
          <v-col cols="auto" class="ms-2">
            <AppButton color="primary" :loading="loading" @click="handleAdd" icon="ri-add-line" />
          </v-col>
        </v-row>
      </v-form>

      <v-divider class="mb-4" />

      <v-list density="compact" class="border rounded-md">
        <v-list-item v-for="cat in categories" :key="cat.id" class="px-3">
          <template #prepend>
            <v-icon icon="ri-price-tag-3-line" size="small" color="primary" class="me-3" />
          </template>
          <v-list-item-title class="font-weight-medium">{{ cat.name }}</v-list-item-title>
          <template #append>
            <v-btn icon="ri-delete-bin-line" size="x-small" variant="text" color="error" @click="handleDelete(cat.id)" />
          </template>
        </v-list-item>
        <v-list-item v-if="categories.length === 0" class="text-center text-grey py-8"> لا يوجد تصنيفات حالياً </v-list-item>
      </v-list>
    </v-card>

    <template #actions>
      <AppButton variant="tonal" class="w-full" @click="show = false"> إغلاق </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import { useExpenseCategories } from '../composables/useExpenseCategories';
import { expenseCategoryService } from '@/api';
import { toast } from 'vue3-toastify';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'changed']);

const show = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const { categories, loading, fetchCategories, createCategory } = useExpenseCategories();
const newCategoryName = ref('');
const isFormValid = ref(false);
const form = ref(null);

watch(show, val => {
  if (val) fetchCategories();
});

const handleAdd = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  const res = await createCategory({ name: newCategoryName.value });
  if (res?.success) {
    newCategoryName.value = '';
    emit('changed');
  }
};

const handleDelete = async id => {
  if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

  loading.value = true;
  try {
    const res = await expenseCategoryService.delete(id);
    if (res.success) {
      toast.success('تم حذف التصنيف');
      await fetchCategories();
      emit('changed');
    }
  } catch (error) {
    // Error handled by base service
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
