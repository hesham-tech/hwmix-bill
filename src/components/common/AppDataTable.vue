<template>
  <v-card>
    <!-- Header with title and actions -->
    <v-card-title v-if="title" class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
        <v-icon v-if="icon" :icon="icon" />
        <span>{{ title }}</span>
      </div>

      <div class="d-flex gap-2">
        <slot name="actions" />

        <v-text-field
          v-if="searchable"
          v-model="searchModel"
          density="compact"
          placeholder="بحث..."
          prepend-inner-icon="ri-search-line"
          variant="outlined"
          hide-details
          clearable
          style="max-width: 300px"
        />
      </div>
    </v-card-title>

    <!-- Data Table -->
    <v-data-table-server
      v-model:items-per-page="itemsPerPageModel"
      v-model:page="pageModel"
      v-model:sort-by="sortByModel"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :search="searchModel"
      class="elevation-0"
      density="comfortable"
      :items-per-page-options="itemsPerPageOptions"
      :no-data-text="emptyText"
      :hide-default-footer="hidePagination"
      @update:options="handleOptionsUpdate"
      @click:row="(event, { item }) => $emit('click:row', item)"
    >
      <!-- Custom slots for columns -->
      <!-- Pass through all slots meant for v-data-table -->
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot
          v-if="slot.startsWith('item.') || slot.startsWith('header.') || ['no-data', 'loading', 'body', 'footer', 'top', 'bottom'].includes(slot)"
          :name="slot"
          v-bind="scope || {}"
        />
      </template>

      <!-- Actions column -->
      <template v-if="showActions" #item.actions="{ item }">
        <div class="d-flex gap-1">
          <v-btn
            v-if="canView && (!permissionModule || can(`${permissionModule}.view_all`, { resource: item }))"
            icon="ri-eye-line"
            size="small"
            variant="text"
            color="info"
            @click="$emit('view', item)"
          />

          <v-btn
            v-if="canEdit && (!permissionModule || can(`${permissionModule}.update_all`, { resource: item }))"
            icon="ri-edit-line"
            size="small"
            variant="text"
            color="primary"
            @click="$emit('edit', item)"
          />

          <v-btn
            v-if="canDelete && (!permissionModule || can(`${permissionModule}.delete_all`, { resource: item }))"
            icon="ri-delete-bin-line"
            size="small"
            variant="text"
            color="error"
            @click="$emit('delete', item)"
          />

          <slot name="extra-actions" :item="item" />
        </div>
      </template>

      <!-- Loading state -->
      <template #loading>
        <v-skeleton-loader type="table-row@5" />
      </template>

      <!-- Empty state -->
      <template #no-data>
        <div class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1"> ri-inbox-line </v-icon>
          <p class="text-h6 text-grey mt-4">{{ emptyText }}</p>
          <p class="text-body-2 text-grey-darken-1">{{ emptySubtext }}</p>

          <slot name="empty-action" />
        </div>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

const { can } = usePermissions();

const props = defineProps({
  // Table data
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },

  // Pagination
  page: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  sortBy: {
    type: Array,
    default: () => [],
  },

  // Search
  searchable: {
    type: Boolean,
    default: true,
  },
  search: {
    type: String,
    default: '',
  },

  // Header
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },

  // Permissions
  permissionModule: {
    type: String,
    default: '',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  canView: {
    type: Boolean,
    default: true,
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
  canDelete: {
    type: Boolean,
    default: true,
  },

  // Empty state
  emptyText: {
    type: String,
    default: 'لا توجد بيانات',
  },
  emptySubtext: {
    type: String,
    default: 'ابدأ بإضافة عنصر جديد',
  },

  // UI
  hidePagination: {
    type: Boolean,
    default: false,
  },

  // Options
  itemsPerPageOptions: {
    type: Array,
    default: () => [
      { value: 10, title: '10' },
      { value: 25, title: '25' },
      { value: 50, title: '50' },
      { value: 100, title: '100' },
      { value: -1, title: 'الكل' },
    ],
  },
});

const emit = defineEmits(['update:page', 'update:itemsPerPage', 'update:sortBy', 'update:search', 'update:options', 'view', 'edit', 'delete']);

// v-model bindings
const pageModel = computed({
  get: () => props.page,
  set: val => emit('update:page', val),
});

const itemsPerPageModel = computed({
  get: () => props.itemsPerPage,
  set: val => emit('update:itemsPerPage', val),
});

const sortByModel = computed({
  get: () => props.sortBy,
  set: val => emit('update:sortBy', val),
});

const searchModel = computed({
  get: () => props.search,
  set: val => emit('update:search', val),
});

// Handle options update from v-data-table-server
const handleOptionsUpdate = options => {
  emit('update:options', options);
};
</script>

<style scoped>
.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
