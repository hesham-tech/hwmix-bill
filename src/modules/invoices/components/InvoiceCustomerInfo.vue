<template>
  <div class="hyper-compact mt-4 mb-2">
    <v-row dense>
      <!-- Row: Responsive distribution -->
      <v-col cols="6" md="4" lg="2" class="pa-2">
        <CustomerSelector
          :model-value="selectedCustomer"
          label="العميل *"
          required
          density="compact"
          hide-details="auto"
          :rules="[v => !!v || 'مطلوب']"
          :error-messages="errors.user_id"
          @update:model-value="$emit('update:selectedCustomer', $event)"
          @create="$emit('create-customer')"
        />
      </v-col>
      
      <v-col cols="6" md="4" lg="2" class="pa-2">
        <AppAutocomplete
          :model-value="modelValue.invoice_type_id"
          :items="invoiceTypes"
          item-title="name"
          item-value="id"
          label="النوع *"
          density="compact"
          hide-details="auto"
          required
          :error-messages="errors.invoice_type_id"
          @update:model-value="$emit('update:prop', { key: 'invoice_type_id', value: $event })"
        />
      </v-col>

      <v-col cols="6" md="4" lg="2" class="pa-2">
        <AppAutocomplete
          :model-value="modelValue.warehouse_id"
          :items="warehouses"
          item-title="name"
          item-value="id"
          label="المخزن *"
          density="compact"
          hide-details="auto"
          required
          :error-messages="errors.warehouse_id"
          @update:model-value="$emit('update:prop', { key: 'warehouse_id', value: $event })"
        />
      </v-col>

      <v-col cols="6" md="4" lg="2" class="pa-2">
        <AppInput
          :model-value="modelValue.issue_date"
          type="date"
          label="التاريخ *"
          density="compact"
          hide-details="auto"
          required
          :error-messages="errors.issue_date"
          @update:model-value="$emit('update:prop', { key: 'issue_date', value: $event })"
        />
      </v-col>

      <v-col cols="6" md="4" lg="2" class="pa-2">
        <AppInput
          :model-value="modelValue.reference_number"
          label="المرجع"
          placeholder="#"
          density="compact"
          hide-details="auto"
          @update:model-value="$emit('update:prop', { key: 'reference_number', value: $event })"
        />
      </v-col>

      <v-col cols="6" md="4" lg="2" class="pa-2">
        <div class="d-flex align-center h-100 px-2 bg-neutral-lighten-5 rounded border border-opacity-50 unified-input-height">
          <AppSwitch
            :model-value="modelValue.price_type === 'wholesale'"
            label="سعر الجمله"
            hide-details
            density="compact"
            color="primary"
            class="ma-0 text-no-wrap"
            @update:model-value="$emit('update:prop', { key: 'price_type', value: $event ? 'wholesale' : 'retail' })"
          />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import CustomerSelector from './CustomerSelector.vue';
import { computed } from 'vue';

const props = defineProps({
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

const isInstallmentSale = computed(() => {
  const type = props.invoiceTypes.find(t => t.id === props.modelValue.invoice_type_id);
  return type?.code === 'installment_sale';
});
</script>

<style scoped>
.bg-card {
  background: rgba(var(--v-theme-surface), 0.4);
}

.border-dashed {
  border-style: dashed !important;
}
</style>
