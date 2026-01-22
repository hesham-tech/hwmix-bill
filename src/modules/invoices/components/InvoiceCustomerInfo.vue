<template>
  <v-card variant="outlined" class="mb-6 rounded-lg bg-card border-dashed">
    <v-card-text>
      <v-row class="mx-0">
        <v-col cols="12" sm="6">
          <CustomerSelector
            :model-value="selectedCustomer"
            label="العميل / المورد *"
            required
            :rules="[v => !!v || 'يجب اختيار العميل']"
            :error-messages="errors.user_id"
            @update:model-value="$emit('update:selectedCustomer', $event)"
            @create="$emit('create-customer')"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <AppAutocomplete
            :model-value="modelValue.invoice_type_id"
            :items="invoiceTypes"
            item-title="name"
            item-value="id"
            label="نوع الفاتورة *"
            density="comfortable"
            prepend-inner-icon="ri-file-chart-line"
            required
            :error-messages="errors.invoice_type_id"
            @update:model-value="$emit('update:prop', { key: 'invoice_type_id', value: $event })"
          />
        </v-col>
        <v-col cols="6" md="4">
          <AppInput
            :model-value="modelValue.issue_date"
            type="date"
            label="تاريخ الفاتورة *"
            prepend-inner-icon="ri-calendar-line"
            required
            :error-messages="errors.issue_date"
            @update:model-value="$emit('update:prop', { key: 'issue_date', value: $event })"
          />
        </v-col>
        <v-col cols="6" md="4">
          <AppInput
            :model-value="modelValue.due_date"
            type="date"
            label="تاريخ الاستحقاق"
            prepend-inner-icon="ri-calendar-check-line"
            @update:model-value="$emit('update:prop', { key: 'due_date', value: $event })"
          />
        </v-col>
        <v-col cols="12" md="4">
          <AppInput
            :model-value="modelValue.reference_number"
            label="رقم المرجع (يدوي)"
            placeholder="مثلاً: INV-123"
            prepend-inner-icon="ri-hashtag"
            variant="outlined"
            @update:model-value="$emit('update:prop', { key: 'reference_number', value: $event })"
          />
        </v-col>
        <v-col cols="12" md="5">
          <AppAutocomplete
            :model-value="modelValue.warehouse_id"
            :items="warehouses"
            item-title="name"
            item-value="id"
            label="المستودع *"
            density="comfortable"
            prepend-inner-icon="ri-building-2-line"
            required
            :status-messages="errors.warehouse_id"
            @update:model-value="$emit('update:prop', { key: 'warehouse_id', value: $event })"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import CustomerSelector from './CustomerSelector.vue';

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  selectedCustomer: {
    type: Object,
    default: null,
  },
  invoiceTypes: {
    type: Array,
    required: true,
  },
  warehouses: {
    type: Array,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(['update:selectedCustomer', 'create-customer', 'update:prop']);
</script>

<style scoped>
.bg-card {
  background: rgba(var(--v-theme-surface), 0.4);
}

.border-dashed {
  border-style: dashed !important;
}
</style>
