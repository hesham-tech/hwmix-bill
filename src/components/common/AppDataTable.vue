<template>
  <v-card>
    <!-- Header with title and actions -->
    <v-card-title v-if="title" class="d-flex flex-wrap align-center justify-space-between gap-2">
      <div class="d-flex align-center gap-2">
        <v-icon v-if="icon" :icon="icon" />
        <span>{{ title }}</span>
      </div>

      <div class="d-flex flex-wrap gap-2 flex-grow-1 justify-end">
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
          class="search-field"
        />
      </div>
    </v-card-title>

    <!-- Data Table -->
    <v-data-table-server
      v-model:items-per-page="itemsPerPageModel"
      v-model:page="pageModel"
      v-model:sort-by="sortByModel"
      :headers="processedHeaders"
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
      @contextmenu:row="handleContextMenu"
    >
      <!-- Custom slots for columns -->
      <!-- Pass through all slots meant for v-data-table -->
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot
          v-if="
            (slot.startsWith('item.') && slot !== 'item.actions') ||
            slot.startsWith('header.') ||
            ['no-data', 'loading', 'body', 'footer', 'top', 'bottom'].includes(slot)
          "
          :name="slot"
          v-bind="scope || {}"
        />
      </template>

      <!-- Actions column (Centralized logic) -->
      <template v-if="showActions" #item.actions="{ item }">
        <div class="d-flex align-center gap-1">
          <!-- Default View Button -->
          <AppButton
            v-if="canView && (!permissionModule || can(`${permissionModule}.view_all`, { resource: item }))"
            icon="ri-eye-line"
            size="small"
            variant="text"
            color="info"
            tooltip="عرض التفاصيل"
            @click="$emit('view', item)"
          />

          <!-- Default Edit Button -->
          <AppButton
            v-if="canEdit && (!permissionModule || can(`${permissionModule}.update_all`, { resource: item }))"
            icon="ri-edit-line"
            size="small"
            variant="text"
            color="primary"
            tooltip="تعديل"
            @click="$emit('edit', item)"
          />

          <!-- Default Delete Button -->
          <AppButton
            v-if="canDelete && (!permissionModule || can(`${permissionModule}.delete_all`, { resource: item }))"
            icon="ri-delete-bin-line"
            size="small"
            variant="text"
            color="error"
            tooltip="حذف"
            @click="$emit('delete', item)"
          />

          <!-- Extra Actions Slot -->
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

    <!-- Context Menu -->
    <v-menu v-model="menuModel" :target="[menuProps.x, menuProps.y]" transition="scale-transition" offset="5">
      <v-list density="compact" min-width="180" class="rounded-lg border shadow-lg context-menu-list">
        <div class="px-4 py-2 text-caption text-grey-darken-1 border-bottom d-flex align-center gap-2 bg-grey-lighten-4">
          <v-icon icon="ri-settings-4-line" size="14" />
          <span>الاجرائات</span>
        </div>

        <v-list-item
          v-if="canView && (!permissionModule || can(`${permissionModule}.view_all`, { resource: menuProps.item }))"
          prepend-icon="ri-eye-line"
          title="عرض التفاصيل"
          @click="$emit('view', menuProps.item)"
        />
        <v-list-item
          v-if="canEdit && (!permissionModule || can(`${permissionModule}.update_all`, { resource: menuProps.item }))"
          prepend-icon="ri-edit-line"
          title="تعديل"
          class="text-primary"
          @click="$emit('edit', menuProps.item)"
        />

        <!-- Render Extra Actions in Menu -->
        <template v-if="$slots['extra-actions']">
          <div class="extra-actions-container">
            <slot name="extra-actions" :item="menuProps.item" :in-menu="true" />
          </div>
        </template>

        <v-divider v-if="canDelete" />

        <v-list-item
          v-if="canDelete && (!permissionModule || can(`${permissionModule}.delete_all`, { resource: menuProps.item }))"
          prepend-icon="ri-delete-bin-line"
          title="حذف"
          class="text-error"
          @click="$emit('delete', menuProps.item)"
        />
      </v-list>
    </v-menu>
  </v-card>
</template>

<script setup>
import { computed, ref, reactive, nextTick } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import AppButton from '@/components/common/AppButton.vue';

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
  stickyActions: {
    type: Boolean,
    default: true,
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

const emit = defineEmits([
  'update:page',
  'update:itemsPerPage',
  'update:sortBy',
  'update:search',
  'update:options',
  'view',
  'edit',
  'delete',
  'click:row',
]);

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

// Process headers to add fixed property to actions column
const processedHeaders = computed(() => {
  if (!props.stickyActions || !props.showActions) return props.headers;

  return props.headers.map((header, index) => {
    // Check if this is the last column (actions column)
    if (index === props.headers.length - 1 && header.key === 'actions') {
      return {
        ...header,
        fixed: true,
        width: header.width || '130px',
      };
    }
    return header;
  });
});

// --- Context Menu Logic ---
const menuModel = ref(false);
const menuProps = reactive({
  x: 0,
  y: 0,
  item: null,
  activator: null,
});

const handleContextMenu = (event, { item }) => {
  event.preventDefault();
  menuModel.value = false;
  nextTick(() => {
    menuProps.x = event.clientX;
    menuProps.y = event.clientY;
    menuProps.item = item;
    menuModel.value = true;
  });
};
</script>

<style scoped>
.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.search-field {
  max-width: 300px;
  min-width: 200px;
}

@media (max-width: 600px) {
  .search-field {
    max-width: 100%;
    min-width: 100%;
    flex-basis: 100%;
  }
}

:deep(th),
:deep(td) {
  white-space: nowrap !important;
}

/* Highlight the row being context-clicked if we wanted to (optional) */
:deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}

/* Make AppButtons inside menu look like list items */
.context-menu-list :deep(.extra-actions-container) {
  display: flex;
  flex-direction: column;
}

.context-menu-list :deep(.v-btn) {
  width: 100% !important;
  justify-content: flex-start !important;
  border-radius: 0 !important;
  text-transform: none !important;
  height: 40px !important;
  padding: 0 16px !important;
  font-weight: normal !important;
  box-shadow: none !important;
  background: transparent !important;
}

.context-menu-list :deep(.v-btn:hover) {
  background: rgba(var(--v-theme-primary), 0.04) !important;
}

.context-menu-list :deep(.v-btn__content) {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

/* Add text to buttons in menu if they only have icons */
.context-menu-list :deep(.v-btn[tooltip]::after) {
  content: attr(tooltip);
  font-size: 0.875rem;
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
