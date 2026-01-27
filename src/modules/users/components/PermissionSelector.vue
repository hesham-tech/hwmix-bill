<template>
  <div class="permission-selector">
    <!-- Search and Expert Toggle -->
    <div class="pa-4 bg-white border-b sticky-top z-10 rounded-t-lg">
      <v-row align="center" dense>
        <v-col cols="12" :sm="showExpertToggle ? 8 : 12">
          <AppInput v-model="search" placeholder="ابحث عن صلاحية محددة..." prepend-inner-icon="ri-search-line" hide-details density="compact" />
        </v-col>
        <v-col v-if="showExpertToggle" cols="12" sm="4" class="text-end">
          <v-btn variant="text" size="small" color="primary" @click="expertMode = !expertMode">
            <v-icon :icon="expertMode ? 'ri-eye-line' : 'ri-settings-4-line'" class="me-1" />
            {{ expertMode ? 'الوضع المبسط' : 'وضع الخبير' }}
          </v-btn>
        </v-col>
      </v-row>

      <div v-if="expertMode && showExpertToggle" class="mt-3 text-caption text-warning d-flex align-center gap-2">
        <v-icon icon="ri-error-warning-line" size="14" />
        تنبيه: أنت تقوم بتعديل الصلاحيات المباشرة بدقة.
      </div>
    </div>

    <!-- Permissions List -->
    <div class="permissions-scroll-area pa-4 bg-grey-lighten-5">
      <div v-for="(group, key) in filteredPermissions" :key="key" class="mb-6">
        <div class="d-flex align-center gap-2 mb-3 px-2">
          <v-icon :icon="getGroupIcon(key)" color="primary" size="20" />
          <span class="font-weight-black text-subtitle-1">{{ group.name?.label || key }}</span>
          <v-spacer />
          <v-btn variant="text" size="x-small" color="grey" @click="toggleGroup(group)">
            {{ allInGroupSelected(group) ? 'إلغاء الكل' : 'تحديد الكل' }}
          </v-btn>
        </div>

        <v-card variant="flat" border class="rounded-lg shadow-sm">
          <v-list density="compact" class="py-0">
            <template v-for="(perm, pKey) in group" :key="pKey">
              <v-list-item v-if="pKey !== 'name'" class="perm-item border-b last-no-border">
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="isSelected(perm.key)"
                    :disabled="isInherited(perm.key)"
                    color="primary"
                    hide-details
                    @update:model-value="togglePermission(perm.key)"
                  />
                </template>

                <v-list-item-title :class="{ 'text-grey': isInherited(perm.key) }">
                  <span class="font-weight-medium">{{ perm.label }}</span>
                  <span v-if="isInherited(perm.key)" class="text-caption text-primary ms-2 italic"> (موروثة) </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption text-grey-lighten-1">
                  {{ perm.key }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </div>

      <div v-if="Object.keys(filteredPermissions).length === 0" class="text-center pa-12">
        <template v-if="search">
          <v-icon icon="ri-search-eye-line" size="48" color="grey-lighten-2" />
          <div class="text-body-1 text-grey mt-2">لا يوجد نتائج تطابق بحثك</div>
        </template>
        <template v-else>
          <v-icon icon="ri-shield-user-line" size="48" color="grey-lighten-2" />
          <div class="text-body-1 text-grey mt-2">لا يوجد صلاحيات متاحة للعرض</div>
          <div class="text-caption text-grey-lighten-1">يتم عرض الصلاحيات التي تمتلكها فقط لتقوم بمنحها</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AppInput from '@/components/common/AppInput.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  availablePermissions: {
    type: [Object, Array],
    required: true,
  },
  inheritedPermissions: {
    type: Array,
    default: () => [],
  },
  showExpertToggle: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const search = ref('');
const expertMode = ref(false);

const isSelected = key => props.modelValue.includes(key);
const isInherited = key => props.inheritedPermissions.includes(key);

const togglePermission = key => {
  if (isInherited(key)) return;

  const newValue = [...props.modelValue];
  const index = newValue.indexOf(key);
  if (index > -1) {
    newValue.splice(index, 1);
  } else {
    newValue.push(key);
  }
  emit('update:modelValue', newValue);
};

const filteredPermissions = computed(() => {
  const result = {};
  const query = search.value.toLowerCase();

  // Robust unwrap of availablePermissions
  let permissionsSource = props.availablePermissions;

  // If it's an array, check if it's the "wrapped object" format from BaseService.handleSuccess
  if (Array.isArray(permissionsSource)) {
    if (permissionsSource.length === 1) {
      const item = permissionsSource[0];
      // If the first item is an object and DOES NOT have its own 'name' property,
      // then it's likely the container object holding grouped permissions (admin, users, etc.)
      if (item && typeof item === 'object' && !item.name && !item.key) {
        permissionsSource = item;
      }
    } else if (permissionsSource.length === 0) {
      return result;
    }
  }

  if (!permissionsSource || typeof permissionsSource !== 'object') return result;

  Object.entries(permissionsSource).forEach(([groupKey, group]) => {
    // Basic defensive check: skip if group is null/undefined or doesn't have a name
    // A valid group object must have a 'name' property (which is an object with 'key' and 'label')
    if (!group || typeof group !== 'object' || !group.name) return;

    const filteredGroup = { name: group.name };
    let hasMatch = false;

    // Search in group label
    const groupLabel = group.name.label || '';
    if (groupLabel.toLowerCase().includes(query)) {
      hasMatch = true;
      Object.entries(group).forEach(([pKey, p]) => {
        if (pKey !== 'name' && p && typeof p === 'object') filteredGroup[pKey] = p;
      });
    } else {
      // Search in permission labels and keys
      Object.entries(group).forEach(([pKey, p]) => {
        if (pKey !== 'name' && p && typeof p === 'object' && (p.label?.toLowerCase().includes(query) || p.key?.toLowerCase().includes(query))) {
          filteredGroup[pKey] = p;
          hasMatch = true;
        }
      });
    }

    if (hasMatch) {
      result[groupKey] = filteredGroup;
    }
  });

  return result;
});

const getGroupIcon = groupKey => {
  const icons = {
    admin: 'ri-admin-line',
    companies: 'ri-community-line',
    users: 'ri-user-settings-line',
    warehouses: 'ri-home-gear-line',
    products: 'ri-box-3-line',
    invoices: 'ri-file-list-3-line',
    transactions: 'ri-hand-coin-line',
    cash_boxes: 'ri-safe-2-line',
  };
  return icons[groupKey] || 'ri-folder-keyhole-line';
};

const allInGroupSelected = group => {
  const perms = Object.entries(group)
    .filter(([k, p]) => k !== 'name' && p && p.key)
    .map(([, p]) => p.key);
  return perms.length > 0 && perms.every(p => isSelected(p) || isInherited(p));
};

const toggleGroup = group => {
  const perms = Object.entries(group)
    .filter(([k]) => k !== 'name')
    .map(([, p]) => p.key);
  const allSelected = allInGroupSelected(group);

  let newValue = [...props.modelValue];

  perms.forEach(p => {
    if (!p || isInherited(p)) return;

    const index = newValue.indexOf(p);
    if (allSelected) {
      if (index > -1) newValue.splice(index, 1);
    } else {
      if (index === -1) newValue.push(p);
    }
  });

  emit('update:modelValue', newValue);
};
</script>

<style scoped>
.permissions-scroll-area {
  max-height: 500px;
  overflow-y: auto;
  border-radius: 0 0 8px 8px;
}

.perm-item {
  transition: all 0.2s;
}

.perm-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.last-no-border {
  border-bottom: none !important;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.italic {
  font-style: italic;
}
</style>
