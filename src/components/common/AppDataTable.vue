<template>
  <v-card>
    <!-- Header with title and actions -->
    <v-card-title v-if="title" class="d-flex flex-wrap align-center justify-space-between gap-2 border-bottom">
      <div class="d-flex align-center gap-2">
        <v-icon v-if="icon" :icon="icon" color="primary" size="20" />
        <span class="text-subtitle-1 font-weight-bold">{{ title }}</span>
      </div>

      <div class="d-flex flex-wrap gap-1 flex-grow-1 justify-end align-center">
        <!-- View Mode Toggle -->
        <v-btn-toggle v-if="showViewToggle" v-model="viewMode" mandatory density="compact" variant="tonal" color="primary" class="border rounded">
          <v-btn value="list" icon="ri-list-check" size="small" />
          <v-btn value="grid" icon="ri-grid-fill" size="small" />
        </v-btn-toggle>

        <!-- Advanced Toggle -->
        <AppButton
          v-if="hasAdvancedFilters"
          variant="tonal"
          :color="showAdvancedSearch ? 'primary' : 'grey-darken-1'"
          :prepend-icon="showAdvancedSearch ? 'ri-filter-off-line' : 'ri-filter-3-line'"
          size="small"
          class="font-weight-bold"
          @click="showAdvancedSearch = !showAdvancedSearch"
        >
          {{ showAdvancedSearch ? 'إخفاء الفلاتر' : 'بحث متقدم' }}
        </AppButton>

        <!-- Simple Search -->
        <AppInput
          v-if="searchable"
          v-model="searchModel"
          placeholder="بحث . . ."
          prepend-inner-icon="ri-search-line"
          class="search-input-mini"
          hide-details
          density="compact"
        />

        <slot name="actions" />
      </div>
    </v-card-title>

    <!-- Advanced Search Area -->
    <v-expand-transition>
      <div v-if="showAdvancedSearch" class="advanced-search-area bg-grey-lighten-5 border-bottom">
        <v-container fluid class="pa-2">
          <v-row dense>
            <slot name="filters">
              <!-- Dynamic Filters from Headers or Filters Prop -->
              <v-col v-for="item in filterableItems" :key="item.key" cols="12" sm="6" md="4" lg="3">
                <!-- Select Type -->
                <v-select
                  v-if="item.filterType === 'select' || item.type === 'select'"
                  v-model="filtersModel[item.key]"
                  :label="item.title"
                  :items="item.filterItems || item.items"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  class="filter-input-compact"
                />
                <!-- Date Type -->
                <AppInput
                  v-else-if="item.filterType === 'date' || item.type === 'date'"
                  v-model="filtersModel[item.key]"
                  :label="item.title"
                  type="date"
                  hide-details
                  density="compact"
                  class="filter-input-compact"
                />
                <!-- Default Text Type -->
                <AppInput
                  v-else
                  v-model="filtersModel[item.key]"
                  :label="item.title"
                  :placeholder="`ابحث بـ ${item.title}...`"
                  hide-details
                  density="compact"
                  class="filter-input-compact"
                />
              </v-col>
            </slot>
            <v-col cols="12" class="d-flex justify-end gap-2 mt-2">
              <AppButton variant="text" size="small" color="grey" @click="resetFilters">إعادة ضبط</AppButton>
              <AppButton variant="flat" size="small" color="primary" @click="applyFilters">تطبيق الفلاتر</AppButton>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-expand-transition>

    <template v-if="viewMode === 'list'">
      <!-- Data Table (Server Side) -->
      <v-data-table-server
        v-if="!virtual"
        v-model:items-per-page="itemsPerPageModel"
        v-model:page="pageModel"
        v-model:sort-by="sortByModel"
        :headers="processedHeaders"
        :items="items"
        :items-length="totalItems"
        :loading="loading"
        :search="searchModel"
        :height="tableHeight"
        fixed-header
        fixed-footer
        class="elevation-0"
        density="compact"
        hover
        striped="even"
        :items-per-page-options="itemsPerPageOptions"
        :no-data-text="emptyText"
        :hide-default-footer="hidePagination"
        :row-props="rowProps"
        @update:options="handleOptionsUpdate"
        @click:row="(event, { item }) => $emit('click:row', item)"
        @contextmenu:row="handleContextMenu"
      >
        <!-- Common Slots -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="scope || {}" />
        </template>

        <!-- Actions column (Server) -->
        <template v-if="showActions && !$slots['item.actions']" #item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <AppButton
              v-if="
                canView &&
                (!permissionModule || canAny(`${permissionModule}.view_all`, `${permissionModule}.view_children`, `${permissionModule}.view_self`))
              "
              icon="ri-eye-line"
              :size="mobile ? 'x-small' : 'small'"
              variant="text"
              color="info"
              tooltip="عرض التفاصيل"
              @click="$emit('view', item)"
            />
            <AppButton
              v-if="
                canEdit &&
                (!permissionModule ||
                  canAny(`${permissionModule}.update_all`, `${permissionModule}.update_children`, `${permissionModule}.update_self`))
              "
              icon="ri-edit-line"
              :size="mobile ? 'x-small' : 'small'"
              variant="text"
              color="primary"
              tooltip="تعديل"
              @click="$emit('edit', item)"
            />
            <AppButton
              v-if="
                canDelete &&
                (!permissionModule ||
                  canAny(`${permissionModule}.delete_all`, `${permissionModule}.delete_children`, `${permissionModule}.delete_self`))
              "
              icon="ri-delete-bin-line"
              :size="mobile ? 'x-small' : 'small'"
              variant="text"
              color="error"
              tooltip="حذف"
              @click="$emit('delete', item)"
            />
            <slot name="extra-actions" :item="item" />
          </div>
        </template>
      </v-data-table-server>

      <!-- Data Table (Virtual Scrolling) -->
      <v-data-table-virtual
        v-else
        v-model:sort-by="sortByModel"
        :headers="processedHeaders"
        :items="items"
        :loading="loading"
        :search="searchModel"
        :height="tableHeight"
        fixed-header
        class="elevation-0"
        density="compact"
        hover
        striped="even"
        :no-data-text="emptyText"
        :row-props="rowProps"
        @click:row="(event, { item }) => $emit('click:row', item)"
        @contextmenu:row="handleContextMenu"
      >
        <!-- Common Slots -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="scope || {}" />
        </template>

        <!-- Actions column (Virtual) -->
        <template v-if="showActions && !$slots['item.actions']" #item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <AppButton
              v-if="
                canView &&
                (!permissionModule || canAny(`${permissionModule}.view_all`, `${permissionModule}.view_children`, `${permissionModule}.view_self`))
              "
              icon="ri-eye-line"
              :size="mobile ? 'x-small' : 'small'"
              variant="text"
              color="info"
              tooltip="عرض التفاصيل"
              @click="$emit('view', item)"
            />
            <AppButton
              v-if="
                canEdit &&
                (!permissionModule ||
                  canAny(`${permissionModule}.update_all`, `${permissionModule}.update_children`, `${permissionModule}.update_self`))
              "
              icon="ri-edit-line"
              :size="mobile ? 'x-small' : 'small'"
              variant="text"
              color="primary"
              tooltip="تعديل"
              @click="$emit('edit', item)"
            />
            <AppButton
              v-if="
                canDelete &&
                (!permissionModule ||
                  canAny(`${permissionModule}.delete_all`, `${permissionModule}.delete_children`, `${permissionModule}.delete_self`))
              "
              icon="ri-delete-bin-line"
              :size="mobile ? 'x-small' : 'small'"
              variant="text"
              color="error"
              tooltip="حذف"
              @click="$emit('delete', item)"
            />
            <slot name="extra-actions" :item="item" />
          </div>
        </template>
      </v-data-table-virtual>
    </template>

    <!-- Grid View Area -->
    <div v-else-if="viewMode === 'grid'" class="grid-view-wrapper d-flex flex-column">
      <div :style="{ height: tableHeight, overflowY: 'auto' }" class="grid-view-scroll-container pa-4">
        <v-row dense>
          <slot name="grid" :items="items" />
        </v-row>
      </div>

      <!-- Manual Pagination for Grid Mode (If not virtual) -->
      <div v-if="!virtual && !hidePagination && totalItems > itemsPerPageModel" class="d-flex align-center justify-center py-3 border-top bg-surface">
        <v-pagination v-model="pageModel" :length="Math.ceil(totalItems / itemsPerPageModel)" :total-visible="5" density="compact" />
      </div>
    </div>

    <!-- Context Menu -->
    <v-menu v-model="menuModel" :target="[menuProps.x, menuProps.y]" transition="scale-transition" offset="5">
      <v-list density="compact" min-width="180" class="rounded-md border shadow-lg context-menu-list">
        <div class="px-4 py-2 text-caption text-grey-darken-1 border-bottom d-flex align-center gap-2 bg-grey-lighten-4">
          <v-icon icon="ri-settings-4-line" size="14" />
          <span>الاجرائات</span>
        </div>

        <v-list-item
          v-if="
            canView &&
            (!permissionModule || canAny(`${permissionModule}.view_all`, `${permissionModule}.view_children`, `${permissionModule}.view_self`))
          "
          prepend-icon="ri-eye-line"
          title="عرض التفاصيل"
          @click="$emit('view', menuProps.item)"
        />
        <v-list-item
          v-if="
            canEdit &&
            (!permissionModule || canAny(`${permissionModule}.update_all`, `${permissionModule}.update_children`, `${permissionModule}.update_self`))
          "
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
          v-if="
            canDelete &&
            (!permissionModule || canAny(`${permissionModule}.delete_all`, `${permissionModule}.delete_children`, `${permissionModule}.delete_self`))
          "
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
import { computed, ref, reactive, nextTick, watch } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const { can, canAny } = usePermissions();

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
  virtual: {
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

  // Table height - default: 100vh - (navbar ~80px + header ~150px + footer ~70px + margins ~50px)
  tableHeight: {
    type: String,
    default: 'calc(100vh - 350px)',
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
    default: false,
  },

  // Mobile Expansion Settings
  mobileHeadersCount: {
    type: Number,
    default: 3,
  },
  enableMobileExpansion: {
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
  rowProps: {
    type: [Function, Object],
    default: null,
  },
  virtual: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Array,
    default: () => [],
  },
  showViewToggle: {
    type: Boolean,
    default: false,
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
  'update:filters',
]);

import { useDisplay } from 'vuetify';
const { mobile } = useDisplay();

// Processed headers for mobile prioritization
const processedHeaders = computed(() => {
  let finalHeaders = [...props.headers];

  // 1. Logic for sticky actions (Desktop)
  if (props.stickyActions && props.showActions && !mobile.value) {
    finalHeaders = finalHeaders.map((header, index) => {
      if (index === finalHeaders.length - 1 && header.key === 'actions') {
        return { ...header, fixed: true, width: header.width || '130px' };
      }
      return header;
    });
  }

  // 2. Logic for Mobile View
  if (mobile.value && props.enableMobileExpansion) {
    // Keep prioritized count + Actions column
    const visibleCount = props.mobileHeadersCount;
    const prioritized = finalHeaders.filter((h, i) => i < visibleCount || h.key === 'actions');

    // Add expander column if not already there
    if (!prioritized.some(h => h.key === 'data-table-expand')) {
      prioritized.unshift({ title: '', key: 'data-table-expand', align: 'start', sortable: false, width: '48px' });
    }
    return prioritized;
  }

  return finalHeaders;
});

// Calculate hidden headers for expansion row
const hiddenHeaders = computed(() => {
  if (!mobile.value || !props.enableMobileExpansion) return [];
  const visibleKeys = processedHeaders.value.map(h => h.key);
  return props.headers.filter(h => !visibleKeys.includes(h.key) && h.key !== 'actions');
});

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

const viewMode = ref('list');

// Handle options update from v-data-table-server
const handleOptionsUpdate = options => {
  emit('update:options', options);
};

// --- Advanced Search & Filters Logic ---
const showAdvancedSearch = ref(false);
const filtersModel = reactive({});

// Initialize filtersModel based on filters prop OR headers
watch(
  () => [props.headers, props.filters],
  ([newHeaders, newFilters]) => {
    if (newFilters && newFilters.length > 0) {
      newFilters.forEach(f => {
        if (filtersModel[f.key] === undefined) {
          filtersModel[f.key] = null;
        }
      });
    } else {
      newHeaders.forEach(h => {
        if (h.filterable && filtersModel[h.key] === undefined) {
          filtersModel[h.key] = null;
        }
      });
    }
  },
  { immediate: true, deep: true }
);

const filterableItems = computed(() => {
  if (props.filters && props.filters.length > 0) {
    return props.filters;
  }
  return props.headers.filter(h => h.filterable);
});

const hasAdvancedFilters = computed(() => {
  return filterableItems.value.length > 0 || !!useSlots().filters;
});

const applyFilters = () => {
  emit('update:filters', { ...filtersModel });
  // If server-side, this usually triggers options update which parent handles
};

const resetFilters = () => {
  Object.keys(filtersModel).forEach(key => {
    filtersModel[key] = null;
  });
  emit('update:filters', {});
};

import { useSlots } from 'vue';
const slots = useSlots();
// --- End Filter Logic ---

// --- Context Menu Logic ---
const menuModel = ref(false);
const menuProps = reactive({
  x: 0,
  y: 0,
  item: null,
  activator: null,
});

const handleContextMenu = (event, { item }) => {
  if (mobile.value) return; // Disable context menu on mobile, rely on row click or actions
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
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.search-input-mini {
  max-width: 240px;
  transition: all 0.3s ease;
}

.advanced-search-area {
  transition: all 0.3s ease;
}

/* تصغير البادنج وتوحيد الارتفاعات للحقول المضيقة (السريع والمتقدم) */
.advanced-search-area :deep(.v-field),
.search-input-mini :deep(.v-field) {
  --v-field-padding-top: 0px !important;
  --v-field-padding-bottom: 0px !important;
  min-height: 28px !important;
  height: 28px !important;
  border-radius: 4px !important;
}

/* توحيد ارتفاع الأزرار في الهيدر مع حقل البحث */
.v-card-title :deep(.v-btn.v-btn--size-small),
.v-card-title :deep(.v-btn-toggle) {
  height: 28px !important;
  min-height: 28px !important;
}

.v-card-title :deep(.v-btn-toggle .v-btn) {
  height: 100% !important;
  min-height: 28px !important;
  border-radius: 0 !important;
}

.v-card-title :deep(.v-btn-toggle) {
  border-radius: 4px !important;
  overflow: hidden;
}

.advanced-search-area :deep(.v-field__input),
.search-input-mini :deep(.v-field__input) {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  min-height: 28px !important;
  height: 28px !important;
  font-size: 0.825rem !important;
  display: flex;
  align-items: center;
}

/* توحيد الـ Select مع الـ Text Input */
.advanced-search-area :deep(.v-select .v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  align-items: center;
}

.advanced-search-area :deep(.v-label.v-field-label),
.search-input-mini :deep(.v-label.v-field-label) {
  font-size: 0.8rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
}

.advanced-search-area :deep(.v-label.v-field-label--floating),
.search-input-mini :deep(.v-label.v-field-label--floating) {
  top: 0px !important;
  transform: translateY(-50%) scale(0.8) !important;
  background-color: var(--v-theme-surface) !important;
  padding: 0 4px !important;
}

.advanced-search-area :deep(.v-input__details),
.search-input-mini :deep(.v-input__details) {
  display: none !important;
}

/* ضبط الايكونات لتتناسب مع الارتفاع الصغير */
.advanced-search-area :deep(.v-field__append-inner),
.search-input-mini :deep(.v-field__append-inner),
.search-input-mini :deep(.v-field__prepend-inner) {
  padding-top: 0 !important;
  align-items: center;
}

.advanced-search-area :deep(.v-icon),
.search-input-mini :deep(.v-icon) {
  size: 16px !important;
}

.grid-view-wrapper {
  background-color: var(--v-theme-surface);
}

.grid-view-scroll-container {
  scrollbar-width: thin;
  overflow-y: auto;
  /* height: 100vh !important; */
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.grid-view-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.grid-view-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
