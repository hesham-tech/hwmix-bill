<template>
  <v-card ref="tableRootRef">
    <!-- Header with title and actions -->
    <v-card-title v-if="title" class="px-4 pt-4 pb-2 border-bottom d-flex flex-column ga-3">
      <!-- Row 1: Title and Actions -->
      <div class="d-flex flex-wrap align-center justify-space-between w-100 gap-2">
        <div class="d-flex align-center gap-3">
          <v-icon v-if="icon" :icon="icon" color="primary" size="24" class="opacity-80" />
          <div class="d-flex flex-column">
            <span class="text-h6 font-weight-bold lh-1">{{ title }}</span>
            <span v-if="subtitle" class="text-caption text-grey-darken-1 mt-n1">{{ subtitle }}</span>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-1 flex-grow-1 justify-end align-center">
          <!-- View Mode Toggle (Only if gridEnabled or showViewToggle is true) -->
          <v-btn-toggle
            v-if="showViewToggle || gridEnabled"
            v-model="viewMode"
            mandatory
            density="compact"
            variant="tonal"
            color="primary"
            class="border rounded"
            style="height: 28px"
          >
            <AppButton value="list" tooltip="قائمة" icon="ri-list-check" size="small" />
            <AppButton value="grid" tooltip="شبكة" icon="ri-grid-fill" size="small" />
          </v-btn-toggle>

          <slot name="actions" />
        </div>
      </div>

      <!-- Row 2: Search Controls -->
      <div v-if="searchable || hasAdvancedFilters" class="d-flex flex-wrap align-center gap-3 w-100 pb-2">
        <!-- Advanced Toggle (Priority Right in RTL) -->
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

        <v-spacer class="d-none d-sm-block" />

        <!-- Simple Search (Wider/Main) -->
        <AppInput
          v-if="searchable"
          v-model="searchModel"
          placeholder="بحث . . ."
          prepend-inner-icon="ri-search-line"
          class="flex-grow-1 search-input-mini"
          style="max-width: 100%"
          hide-details
          density="compact"
        />
      </div>
    </v-card-title>

    <!-- Advanced Search Area -->
    <v-expand-transition>
      <div v-if="showAdvancedSearch" class="advanced-search-area bg-grey-lighten-5 border-bottom">
        <v-container fluid class="pa-2">
          <v-row dense>
            <slot name="filters">
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
                <!-- Autocomplete Type -->
                <AppAutocomplete
                  v-else-if="item.filterType === 'autocomplete' || item.type === 'autocomplete'"
                  v-model="filtersModel[item.key]"
                  :label="item.title"
                  :api-endpoint="item.apiEndpoint"
                  :item-title="item.itemTitle || 'name'"
                  :item-value="item.itemValue || 'id'"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  class="filter-input-compact"
                />
                <!-- Default Text Type -->
                <AppInput
                  v-else
                  v-model="filtersModel[item.key]"
                  :label="item.title"
                  :placeholder="`ابحث بـ ${item.title}...`"
                  :type="item.inputType || 'text'"
                  hide-details
                  density="compact"
                  class="filter-input-compact"
                />
              </v-col>
            </slot>
            <v-col cols="12" class="d-flex justify-end gap-2 mt-2">
              <AppButton variant="text" size="small" color="grey" @click="resetFilters">إعادة ضبط</AppButton>
              <AppButton v-if="manualFilter" variant="flat" size="small" color="primary" @click="applyFilters"> تطبيق الفلاتر </AppButton>
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
        :height="calculatedTableHeight"
        fixed-header
        fixed-footer
        class="elevation-0"
        density="compact"
        hover
        striped="even"
        :items-per-page-options="itemsPerPageOptions"
        :no-data-text="emptyText"
        :hide-default-footer="true"
        :row-props="processedRowProps"
        @update:options="handleOptionsUpdate"
        @click:row="(event, { item }) => $emit('click:row', item)"
        @contextmenu:row="handleContextMenu"
      >
        <!-- Common Slots -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="{ ...(scope || {}), isGrid: false, viewMode: 'list' }" />
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
              @click.stop="$emit('view', item)"
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
              @click.stop="$emit('edit', item)"
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
              @click.stop="$emit('delete', item)"
            />
            <slot name="extra-actions" :item="item" />
          </div>
        </template>

        <!-- [NEW] Internal Infinite Scroll for List Mode -->
        <template v-if="infiniteScroll" #body.append>
          <tr v-if="items.length > 0">
            <td colspan="100" class="pa-0 border-0">
              <AppInfiniteScroll :loading="loading" :has-more="hasMore" :show-no-more="showNoMore" @load="$emit('load')" />
            </td>
          </tr>
        </template>

        <!-- [NEW] Consistent Empty State Slot -->
        <template #no-data>
          <div class="d-flex flex-column align-center justify-center py-10 text-center">
            <div class="bg-grey-lighten-5 rounded-circle pa-4 mb-3">
              <v-icon icon="ri-search-eye-line" size="32" color="grey-lighten-1" />
            </div>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-2">{{ emptyText }}</div>
            <div class="text-caption text-grey mb-3" style="max-width: 300px">{{ emptySubtext }}</div>
            <slot name="empty-actions" />
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
        :height="calculatedTableHeight"
        fixed-header
        class="elevation-0"
        density="compact"
        hover
        striped="even"
        :no-data-text="emptyText"
        :row-props="processedRowProps"
        @click:row="(event, { item }) => $emit('click:row', item)"
        @contextmenu:row="handleContextMenu"
      >
        <!-- Common Slots -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="{ ...(scope || {}), isGrid: false, viewMode: 'list' }" />
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
              @click.stop="$emit('view', item)"
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
              @click.stop="$emit('edit', item)"
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
              @click.stop="$emit('delete', item)"
            />
            <slot name="extra-actions" :item="item" />
          </div>
        </template>

        <!-- [NEW] Consistent Empty State Slot for Virtual -->
        <template #no-data>
          <div class="d-flex flex-column align-center justify-center py-10 text-center">
            <div class="bg-grey-lighten-5 rounded-circle pa-4 mb-3">
              <v-icon icon="ri-search-eye-line" size="32" color="grey-lighten-1" />
            </div>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-2">{{ emptyText }}</div>
            <div class="text-caption text-grey mb-3" style="max-width: 300px">{{ emptySubtext }}</div>
            <slot name="empty-actions" />
          </div>
        </template>
      </v-data-table-virtual>

      <!-- Manual Pagination for List Mode (Universal for Server-side) -->
      <div
        v-if="!virtual && !hidePagination"
        ref="paginationRef"
        class="d-flex align-center flex-wrap justify-center py-2 px-4 border-top bg-surface gap-4"
      >
        <div class="d-flex align-center gap-2 text-caption text-grey">
          <span>عدد الصفوف:</span>
          <v-select
            v-model="itemsPerPageModel"
            :items="itemsPerPageOptions"
            density="compact"
            variant="plain"
            hide-details
            class="items-per-page-select"
            style="width: 70px"
          />
        </div>

        <v-pagination
          v-model="pageModel"
          :length="Math.ceil(totalItems / itemsPerPageModel)"
          :total-visible="mobile ? 3 : 5"
          show-first-last-page
          density="compact"
        />

        <div class="text-caption text-grey d-none d-sm-block">{{ paginationInfo.from }}-{{ paginationInfo.to }} من {{ paginationInfo.total }}</div>
      </div>
    </template>

    <!-- Grid View Area -->
    <div v-else-if="viewMode === 'grid'" class="grid-view-wrapper d-flex flex-column">
      <div :style="{ height: calculatedTableHeight, overflowY: 'auto' }" class="grid-view-scroll-container pa-4">
        <!-- [NEW] Auto-Grid Generation -->
        <slot name="grid" :items="items">
          <v-container fluid class="pa-0 min-height-400">
            <v-row v-if="items.length > 0" dense>
              <v-col v-for="item in items" :key="item.id" cols="12" sm="6" md="4" lg="3">
                <v-card
                  rounded="lg"
                  class="grid-card border h-100 d-flex flex-column transition-all-cubic overflow-hidden"
                  @click="$emit('view', item)"
                >
                  <!-- [NEW] Card Media Group (Avatar/Image) -->
                  <div
                    v-if="gridOptions.avatarKey || gridOptions.imageKey"
                    class="pa-4 pb-0 d-flex justify-center"
                    :class="{ 'bg-grey-lighten-4': gridOptions.imageKey }"
                  >
                    <AppAvatar
                      v-if="gridOptions.avatarKey"
                      :img-url="item[gridOptions.avatarKey]"
                      :name="item[gridOptions.titleKey || headers[0]?.key]"
                      size="80"
                      class="border shadow-sm elevation-1"
                    />
                    <v-img
                      v-else-if="gridOptions.imageKey"
                      :src="item[gridOptions.imageKey] || '/placeholder-product.png'"
                      height="180"
                      width="100%"
                      cover
                      class="rounded-md elevation-1 bg-grey-lighten-4"
                    >
                      <template #placeholder>
                        <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                          <v-icon icon="ri-image-2-line" color="grey-lighten-1" size="48" />
                        </div>
                      </template>
                    </v-img>
                  </div>

                  <!-- Card Header -->
                  <div class="pa-3 bg-white d-flex flex-column align-center text-center">
                    <span class="text-subtitle-1 font-weight-black text-primary text-truncate w-100 px-2">
                      <slot :name="`item.${gridOptions.titleKey || headers[0]?.key}`" :item="item" :is-grid="true" view-mode="grid">
                        {{ item[gridOptions.titleKey || headers[0]?.key] || '---' }}
                      </slot>
                    </span>
                    <span v-if="gridOptions.subtitleKey && item[gridOptions.subtitleKey]" class="text-caption text-grey mt-n1">
                      <slot :name="`item.${gridOptions.subtitleKey}`" :item="item" :is-grid="true" view-mode="grid">
                        {{ item[gridOptions.subtitleKey] }}
                      </slot>
                    </span>
                  </div>

                  <v-divider class="opacity-10" />

                  <!-- Card Content -->
                  <v-card-text class="pa-3 flex-grow-1 bg-white">
                    <div class="d-flex flex-column ga-2">
                      <template v-if="gridOptions.bodyKeys?.length">
                        <div v-for="key in gridOptions.bodyKeys" :key="key" class="d-flex align-center justify-space-between text-caption ga-1">
                          <span class="text-grey">{{ headers.find(h => h.key === key)?.title || key }}:</span>
                          <span class="font-weight-medium text-right text-truncate" style="max-width: 140px">
                            <slot :name="`item.${key}`" :item="item" :is-grid="true" view-mode="grid">
                              {{ item[key] || '---' }}
                            </slot>
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        <div
                          v-for="(header, idx) in headers.slice(1).filter(h => h.key !== 'actions' && h.key !== gridOptions.subtitleKey)"
                          :key="header.key"
                          class="d-flex align-center justify-space-between text-caption"
                        >
                          <span v-if="idx < 4" class="text-grey">{{ header.title }}:</span>
                          <span v-if="idx < 4" class="font-weight-medium text-right text-truncate" style="max-width: 140px">
                            <slot :name="`item.${header.key}`" :item="item" :is-grid="true" view-mode="grid">
                              {{ item[header.key] || '---' }}
                            </slot>
                          </span>
                        </div>
                      </template>
                    </div>
                  </v-card-text>

                  <!-- Card Actions -->
                  <v-card-actions class="pa-1 bg-grey-lighten-5 border-top d-flex justify-center gap-1">
                    <AppButton icon="ri-eye-line" size="x-small" color="info" variant="text" @click.stop="$emit('view', item)" />
                    <AppButton v-if="canEdit" icon="ri-edit-line" size="x-small" color="primary" variant="text" @click.stop="$emit('edit', item)" />
                    <AppButton
                      v-if="canDelete"
                      icon="ri-delete-bin-line"
                      size="x-small"
                      color="error"
                      variant="text"
                      @click.stop="$emit('delete', item)"
                    />
                    <slot name="extra-actions" :item="item" />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </slot>

        <div v-if="infiniteScroll" class="px-4 pb-4">
          <AppInfiniteScroll :loading="loading" :has-more="hasMore" :show-no-more="showNoMore" @load="$emit('load')" />
        </div>

        <!-- [NEW] Empty State for Grid Mode -->
        <div v-if="!loading && items.length === 0" class="d-flex flex-column align-center justify-center py-12 text-center h-100">
          <div class="bg-grey-lighten-5 rounded-circle pa-6 mb-4">
            <v-icon icon="ri-search-eye-line" size="48" color="grey-lighten-1" />
          </div>
          <div class="text-h6 font-weight-bold text-grey-darken-2 mb-1">{{ emptyText }}</div>
          <div class="text-body-2 text-grey mb-4" style="max-width: 300px">{{ emptySubtext }}</div>
          <slot name="empty-actions" />
        </div>
      </div>

      <!-- Manual Pagination for Grid Mode (Universal) -->
      <div
        v-if="!virtual && !hidePagination"
        ref="paginationRef"
        class="d-flex align-center flex-wrap justify-center py-2 px-4 border-top bg-surface gap-4"
      >
        <div class="d-flex align-center gap-2 text-caption text-grey">
          <span>عدد الصفوف:</span>
          <v-select
            v-model="itemsPerPageModel"
            :items="itemsPerPageOptions"
            density="compact"
            variant="plain"
            hide-details
            class="items-per-page-select"
            style="width: 70px"
          />
        </div>

        <v-pagination
          v-model="pageModel"
          :length="Math.ceil(totalItems / itemsPerPageModel)"
          :total-visible="mobile ? 3 : 5"
          show-first-last-page
          density="compact"
        />

        <div class="text-caption text-grey d-none d-sm-block">{{ paginationInfo.from }}-{{ paginationInfo.to }} من {{ paginationInfo.total }}</div>
      </div>
    </div>

    <!-- Context Menu -->
    <v-menu v-model="menuModel" :target="[menuProps.x, menuProps.y]" transition="scale-transition" offset="5">
      <v-list density="compact" min-width="180" class="rounded-md border shadow-lg context-menu-list">
        <div class="px-4 py-2 text-caption text-grey-darken-1 border-bottom d-flex align-center gap-2 bg-grey-lighten-4">
          <v-icon icon="ri-settings-4-line" size="14" />
          <span>الإجراءات</span>
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
import { computed, ref, reactive, nextTick, watch, useSlots, useAttrs } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useWindowSize, useElementSize, useLocalStorage } from '@vueuse/core';
import { usePermissions } from '@/composables/usePermissions';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';

// --- Props & Emits ---
const props = defineProps({
  // Table data
  headers: { type: Array, required: true },
  items: { type: Array, default: () => [] },
  totalItems: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  virtual: { type: Boolean, default: false },

  // Pagination
  page: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  sortBy: { type: Array, default: () => [] },

  // Search & Filters
  searchable: { type: Boolean, default: true },
  search: { type: String, default: '' },
  filters: { type: Array, default: () => [] },

  // Header & Styling
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  fullHeight: { type: Boolean, default: true },
  tableHeight: { type: String, default: undefined },
  extraOffset: { type: Number, default: 0 },

  // Permissions & Actions
  permissionModule: { type: String, default: '' },
  showActions: { type: Boolean, default: true },
  canView: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  stickyActions: { type: Boolean, default: false },

  // Mobile
  mobileHeadersCount: { type: Number, default: 3 },
  enableMobileExpansion: { type: Boolean, default: true },

  // General UI
  hidePagination: { type: Boolean, default: false },
  emptyText: { type: String, default: 'لا توجد بيانات' },
  emptySubtext: { type: String, default: 'ابدأ بإضافة عنصر جديد' },
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
  rowProps: { type: [Function, Object], default: null },
  showViewToggle: { type: Boolean, default: false },
  gridEnabled: { type: Boolean, default: false }, // Automatically enable Grid view support
  rowClickable: { type: Boolean, default: null }, // Manual override for clickable rows

  infiniteScroll: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: false },
  showNoMore: { type: Boolean, default: false },

  // Grid View Configuration
  gridOptions: {
    type: Object,
    default: () => ({
      titleKey: null,
      subtitleKey: null,
      imageKey: null,
      avatarKey: null,
      bodyKeys: [], // If empty, falls back to headers
    }),
  },
  // If true, disables auto-filtering and shows 'Apply' button
  manualFilter: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  'update:page',
  'update:items-per-page',
  'update:sortBy',
  'update:search',
  'update:options',
  'view',
  'edit',
  'delete',
  'click:row',
  'update:filters',
  'load',
]);

// --- Core Composables ---
const route = useRoute();
const { canAny } = usePermissions();
const { mobile } = useDisplay();
const { height: windowHeight } = useWindowSize();
const slots = useSlots();

// --- Elements Measurement ---
const tableRootRef = ref(null);
// Lazy internal size measurement
const { height: internalHeaderHeight } = useElementSize(
  computed(() => {
    const el = tableRootRef.value?.$el || tableRootRef.value;
    return el?.querySelector?.('.v-card-title');
  })
);
const paginationRef = ref(null);
const { height: internalPaginationHeight } = useElementSize(paginationRef);

const calculatedTableHeight = computed(() => {
  // Manual override takes precedence
  if (props.tableHeight) return props.tableHeight;

  // If not full height and no manual height, return undefined to allow natural expansion
  if (!props.fullHeight) return undefined;

  // Find environment elements for dynamic calculation
  const navbarEl = document.querySelector('.v-app-bar');
  const breadcrumbsEl = document.querySelector('.sticky-breadcrumbs-container');
  const pageHeaderEl = document.querySelector('.app-page-header');

  const navbarH = navbarEl?.offsetHeight || 0;
  const breadcrumbsH = breadcrumbsEl?.offsetHeight || 0;
  const pageHeaderH = pageHeaderEl?.offsetHeight || 0;
  const tableHeaderH = internalHeaderHeight.value || 48;
  const paginationH = props.hidePagination ? 0 : internalPaginationHeight.value || 56;

  const basePadding = 48; // Total vertical padding/margins in common layouts
  const occupied = navbarH + breadcrumbsH + pageHeaderH + tableHeaderH + paginationH + basePadding + props.extraOffset;
  const remaining = windowHeight.value - occupied;

  return `${Math.max(remaining, 300)}px`;
});

const paginationInfo = computed(() => {
  const pp = props.itemsPerPage <= 0 ? props.totalItems : props.itemsPerPage;
  const from = props.totalItems === 0 ? 0 : (props.page - 1) * pp + 1;
  const to = Math.min(props.page * pp, props.totalItems);
  return { from, to, total: props.totalItems };
});

// --- Table Headers Processing ---
const processedHeaders = computed(() => {
  let finalHeaders = [...props.headers];

  // Sticky Actions (Desktop)
  if (props.stickyActions && props.showActions && !mobile.value) {
    finalHeaders = finalHeaders.map((header, index) => {
      if (index === finalHeaders.length - 1 && header.key === 'actions') {
        return { ...header, fixed: true, width: header.width || '130px' };
      }
      return header;
    });
  }

  // Mobile Priorities
  if (mobile.value && props.enableMobileExpansion) {
    const visibleCount = props.mobileHeadersCount;
    const prioritized = finalHeaders.filter((h, i) => i < visibleCount || h.key === 'actions');

    if (!prioritized.some(h => h.key === 'data-table-expand')) {
      prioritized.unshift({ title: '', key: 'data-table-expand', align: 'start', sortable: false, width: '48px' });
    }
    return prioritized;
  }

  return finalHeaders;
});

const hiddenHeaders = computed(() => {
  if (!mobile.value || !props.enableMobileExpansion) return [];
  const visibleKeys = processedHeaders.value.map(h => h.key);
  return props.headers.filter(h => !visibleKeys.includes(h.key) && h.key !== 'actions');
});

// --- Persistent View Preferences (Centralized) ---
const tablePreferences = useLocalStorage('app-table-preferences', {
  viewModes: {},
});

const pageId = computed(() => `${route.path}-${props.title || 'default'}`);

const viewMode = computed({
  get: () => tablePreferences.value.viewModes[pageId.value] || 'list',
  set: val => {
    tablePreferences.value.viewModes[pageId.value] = val;
  },
});

const showAdvancedSearch = ref(false);
const filtersModel = reactive({});

const pageModel = computed({
  get: () => props.page,
  set: val => {
    if (val === props.page) return;
    emit('update:page', val);
    // Notify parent about options change
    nextTick(() => {
      emit('update:options', {
        page: val,
        itemsPerPage: itemsPerPageModel.value,
        sortBy: sortByModel.value,
      });
    });
  },
});

const itemsPerPageModel = computed({
  get: () => props.itemsPerPage,
  set: val => {
    if (val === props.itemsPerPage) return;
    emit('update:items-per-page', val);
    // Notify parent about options change
    nextTick(() => {
      emit('update:options', {
        page: 1, // Reset to first page on per-page change
        itemsPerPage: val,
        sortBy: sortByModel.value,
      });
    });
  },
});

const sortByModel = computed({
  get: () => props.sortBy,
  set: val => emit('update:sortBy', val),
});

const searchModel = computed({
  get: () => props.search,
  set: val => emit('update:search', val),
});

// --- Row Logic ---
const isClickable = computed(() => {
  if (props.rowClickable !== null) return props.rowClickable;
  // If parent has @click:row listener
  return !!slots['click:row'] || !!slots['update:options'] || !!route.query.auto_click || !!attrs['onClick:row'];
});

// Use attrs to detect listeners that might not be in slots
const attrs = useAttrs();

// Refined Row Props to include cursor if clickable
const processedRowProps = computed(() => {
  return scope => {
    let base = {};
    if (typeof props.rowProps === 'function') {
      base = props.rowProps(scope) || {};
    } else if (props.rowProps) {
      base = { ...props.rowProps };
    }

    if (isClickable.value) {
      base.class = [base.class, 'cursor-pointer'].filter(Boolean).join(' ');
      base.style = { ...(base.style || {}), cursor: 'pointer' };
    }
    return base;
  };
});

// --- Filters Logic ---
const filterableItems = computed(() => {
  if (props.filters && props.filters.length > 0) return props.filters;
  return props.headers.filter(h => h.filterable);
});

const hasAdvancedFilters = computed(() => {
  return filterableItems.value.length > 0 || !!slots.filters;
});

watch(
  () => [props.headers, props.filters],
  ([newHeaders, newFilters]) => {
    const source = newFilters?.length > 0 ? newFilters : newHeaders.filter(h => h.filterable);
    source.forEach(f => {
      if (filtersModel[f.key] === undefined) filtersModel[f.key] = null;
    });
  },
  { immediate: true, deep: true }
);

const applyFilters = () => emit('update:filters', { ...filtersModel });

let filterTimeout;
const debouncedApplyFilters = () => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

// Deep watch for auto-submit
watch(
  filtersModel,
  () => {
    if (!props.manualFilter) {
      debouncedApplyFilters();
    }
  },
  { deep: true }
);

const resetFilters = () => {
  Object.keys(filtersModel).forEach(key => (filtersModel[key] = null));
  emit('update:filters', {});
};

// --- Menu & Interactions ---
const handleOptionsUpdate = options => emit('update:options', options);

const menuModel = ref(false);
const menuProps = reactive({ x: 0, y: 0, item: null });

const handleContextMenu = (event, { item }) => {
  if (mobile.value) return;
  event.preventDefault();
  menuModel.value = false;
  nextTick(() => {
    menuProps.x = event.clientX;
    menuProps.y = event.clientY;
    menuProps.item = item;
    menuModel.value = true;
  });
};

// Reset pagination when view mode changes (only on user interaction)
let isInitialLoad = true;
watch(viewMode, (newVal, oldVal) => {
  if (isInitialLoad) {
    isInitialLoad = false;
    return;
  }
  if (newVal !== oldVal) {
    pageModel.value = 1;
  }
});
</script>

<style scoped>
.gap-1 {
  gap: 0.25rem;
}
.gap-2 {
  gap: 0.5rem;
}

:deep(th),
:deep(td) {
  white-space: nowrap !important;
}

:deep(.v-data-table__tr:nth-child(even)) {
  background: rgba(var(--v-theme-primary), 0.03) !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.06) !important;
}

/* Context Menu Styling */
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

/* Dense UI Adjustments */
.advanced-search-area :deep(.v-field),
.search-input-mini :deep(.v-field) {
  --v-field-padding-top: 0px !important;
  --v-field-padding-bottom: 0px !important;
  min-height: 28px !important;
  height: 28px !important;
  border-radius: 4px !important;
}

.v-card-title :deep(.v-btn.v-btn--size-small),
.v-card-title :deep(.v-btn-toggle) {
  height: 28px !important;
  min-height: 28px !important;
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

.advanced-search-area :deep(.v-label.v-field-label),
.search-input-mini :deep(.v-label.v-field-label) {
  font-size: 0.8rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

.advanced-search-area :deep(.v-label.v-field-label--floating),
.search-input-mini :deep(.v-label.v-field-label--floating) {
  top: 0px !important;
  transform: translateY(-50%) scale(0.8) !important;
  background-color: var(--v-theme-surface) !important;
  padding: 0 4px !important;
}

/* Premium Grid Card Styles */
.grid-card {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
}

.grid-card:hover {
  transform: translateY(-8px) scale(1.01) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.2) !important;
  z-index: 10;
}

.transition-all-cubic {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
}
</style>
