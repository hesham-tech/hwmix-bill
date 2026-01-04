<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon icon="ri-bank-card-line" class="me-2" />
      طرق الدفع
      <v-spacer />
      <v-btn color="primary" prepend-icon="ri-add-line" @click="$emit('create')"> طريقة دفع جديدة </v-btn>
    </v-card-title>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :page="page"
        :items-length="total"
        @update:page="$emit('update:page', $event)"
        @update:items-per-page="$emit('update:items-per-page', $event)"
        density="comfortable"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="ri-money-dollar-circle-line" size="small" color="success" class="me-2" />
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.is_active ? 'نشط' : 'غير نشط' }}
          </v-chip>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn icon="ri-edit-line" size="small" variant="text" color="primary" @click="$emit('edit', item)" />
            <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="$emit('delete', item)" />
          </div>
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-4">
            <v-icon icon="ri-bank-card-line" size="48" color="grey" class="mb-2" />
            <div class="text-medium-emphasis">لا توجد طرق دفع</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    default: 0,
  },
});

defineEmits(['create', 'edit', 'delete', 'update:page', 'update:items-per-page']);

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'تاريخ الإضافة', key: 'created_at' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>
