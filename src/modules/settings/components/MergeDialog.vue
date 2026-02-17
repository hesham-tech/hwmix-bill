<template>
  <AppDialog
    v-model="isOpen"
    :title="`دمج ${title}`"
    icon="ri-merge-cells-horizontal"
    :loading="loading"
    confirm-text="تأكيد الدمج"
    confirm-color="warning"
    @confirm="handleConfirm"
  >
    <div class="pa-2">
      <v-alert type="warning" variant="tonal" class="mb-4 text-subtitle-2" density="compact">
        تحذير: سيتم نقل جميع المنتجات المرتبطة بـ "<strong>{{ sourceItem?.name }}</strong
        >" إلى السجل الجديد، ثم حذف السجل القديم نهائياً.
      </v-alert>

      <AppAutocomplete
        v-model="targetId"
        :label="`اختر ${title} المستهدف (الذي سيبقى)`"
        :placeholder="`ابحث عن ${title} لدمج السجل فيه...`"
        :api-endpoint="apiEndpoint"
        item-title="name"
        item-value="id"
        :rules="[v => !!v || 'يجب اختيار السجل المستهدف']"
        clearable
      />

      <div v-if="targetId" class="mt-4 pa-3 bg-grey-lighten-4 rounded border-dashed">
        <div class="text-caption text-grey-darken-1 mb-1">ملخص العملية:</div>
        <div class="d-flex align-center gap-2">
          <v-chip size="small" color="error" variant="flat">{{ sourceItem?.name }}</v-chip>
          <v-icon icon="ri-arrow-right-line" />
          <v-chip size="small" color="success" variant="flat">السجل المختار</v-chip>
        </div>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';

const props = defineProps({
  modelValue: Boolean,
  sourceItem: Object,
  apiEndpoint: String,
  title: {
    type: String,
    default: 'السجل',
  },
  loading: Boolean,
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const targetId = ref(null);

watch(
  () => props.modelValue,
  val => {
    if (val) {
      targetId.value = null;
    }
  }
);

const handleConfirm = () => {
  if (!targetId.value) return;
  emit('confirm', {
    source_id: props.sourceItem.id,
    target_id: targetId.value,
  });
};
</script>
