<template>
  <v-card class="user-permission-manager-premium overflow-hidden" elevation="0">
    <div class="main-layout-wrapper d-flex">
      <!-- Vertical Premium Navigation Rail -->
      <div class="nav-rail-glass py-6">
        <div class="nav-rail-content d-flex flex-column gap-4 px-3">
          <v-btn
            v-for="nav in navigationItems"
            :key="nav.value"
            :active="tab === nav.value"
            :color="tab === nav.value ? 'primary' : 'grey-darken-1'"
            variant="text"
            class="nav-item-premium py-8 rounded-md"
            block
            @click="tab = nav.value"
          >
            <div class="d-flex flex-column align-center gap-2">
              <v-icon :icon="tab === nav.value ? nav.activeIcon : nav.icon" size="28" />
              <span class="text-caption font-weight-bold">{{ nav.label }}</span>
              <v-badge v-if="nav.count" :content="nav.count" color="primary" floating offset-x="-10" offset-y="-10" />
            </div>
          </v-btn>
        </div>
      </div>

      <!-- Main Content Area with Glassmorphism -->
      <div class="flex-grow-1 content-glass-bg">
        <v-window v-model="tab" class="content-window">
          <!-- Roles Segment -->
          <v-window-item value="roles" class="h-100">
            <div class="d-flex flex-column h-100">
              <div class="flex-grow-1 overflow-y-auto pa-6">
                <div class="section-banner pa-6 rounded-md mb-6 elevation-1 overflow-hidden">
                  <div class="d-flex align-center justify-space-between relative-z">
                    <div>
                      <h3 class="text-h6 font-weight-bold primary--text mb-1">الأدوار الوظيفية</h3>
                      <p class="text-body-2 text-grey-darken-1">حدد الأدوار التي تعكس مسؤوليات المستخدم في النظام</p>
                    </div>
                    <v-chip color="primary" variant="flat" size="large" class="px-6 font-weight-bold">
                      {{ selectedRoles.length }} / {{ store.roles.length }} موزع
                    </v-chip>
                  </div>
                  <div class="banner-circle shadow-accent"></div>
                </div>

                <v-row v-if="store.roles.length" dense class="role-grid">
                  <v-col v-for="(role, index) in store.roles" :key="role.id" cols="12" sm="6" lg="4">
                    <v-hover v-slot="{ isHovering, props }">
                      <v-card
                        v-bind="props"
                        :variant="isRoleSelected(role.name) ? 'flat' : 'outlined'"
                        :color="isRoleSelected(role.name) ? 'primary' : 'grey-lighten-2'"
                        class="role-premium-card transition-all"
                        :class="{ 'selected-float': isRoleSelected(role.name), 'hover-scale': isHovering }"
                        @click="toggleRole(role.name)"
                      >
                        <v-card-text class="pa-4">
                          <div class="d-flex align-start gap-3">
                            <v-checkbox-btn v-model="selectedRoles" :value="role.name" color="primary" hide-details density="compact" @click.stop />
                            <div class="flex-grow-1">
                              <div class="d-flex align-center justify-space-between mb-1">
                                <span class="font-weight-bold text-body-1">{{ role.label || role.name }}</span>
                              </div>
                              <p class="text-caption text-grey-darken-1 mb-2 line-clamp-2">{{ role.description || 'لا يوجد وصف متاح' }}</p>
                              <div class="d-flex gap-2">
                                <v-chip v-if="role.permissions_count" size="x-small" variant="tonal" color="primary">
                                  <v-icon icon="ri-key-fill" size="10" class="me-1" />
                                  {{ role.permissions_count }} صلاحية
                                </v-chip>
                              </div>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-hover>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-window-item>

          <!-- Permissions Segment -->
          <v-window-item value="permissions" class="h-100">
            <div class="d-flex flex-column h-100">
              <!-- Glass-Sticky Permissions Toolbar -->
              <div class="permissions-toolbar-glass px-6 py-4 border-b">
                <v-row dense align="center">
                  <v-col cols="12" md="7">
                    <v-text-field
                      v-model="permissionSearch"
                      placeholder="ابحث عن صلاحية محددة..."
                      prepend-inner-icon="ri-search-2-line"
                      variant="solo"
                      flat
                      density="comfortable"
                      hide-details
                      clearable
                      class="premium-search-field"
                      bg-color="grey-lighten-4"
                    />
                  </v-col>
                  <v-col cols="12" md="5">
                    <v-btn-toggle v-model="expertMode" mandatory color="primary" variant="tonal" class="w-100 expert-toggle-group" divided>
                      <v-btn :value="false" block class="flex-grow-1">
                        <v-icon icon="ri-filter-3-line" class="me-2" />
                        المبسط
                      </v-btn>
                      <v-btn :value="true" block class="flex-grow-1">
                        <v-icon icon="ri-magic-line" class="me-2" />
                        الخبير
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>
                </v-row>

                <v-slide-y-transition>
                  <v-alert
                    v-if="expertMode"
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mt-4 rounded-md text-caption border-none glass-alert-info"
                  >
                    <v-icon icon="ri-shield-flash-line" size="16" class="me-2" />
                    <strong>وضع الخبير نشط:</strong> يظهر الصلاحيات الموروثة من الأدوار لتمكين المراجعة الشاملة.
                  </v-alert>
                  <v-alert
                    v-else-if="selectedPermissions.length > 0"
                    type="success"
                    variant="tonal"
                    density="compact"
                    class="mt-4 rounded-md text-caption border-none glass-alert-success"
                  >
                    <v-icon icon="ri-checkbox-circle-line" size="16" class="me-2" />
                    لديك <strong>{{ selectedPermissions.length }}</strong> صلاحية مباشرة مخصصة لهذا المستخدم.
                  </v-alert>
                </v-slide-y-transition>
              </div>

              <!-- Permission Content with Staggered Groups -->
              <div class="flex-grow-1 overflow-y-auto pa-6">
                <v-row v-if="Object.keys(filteredPermissions).length">
                  <v-col v-for="(group, key) in filteredPermissions" :key="key" cols="12">
                    <div class="permission-group-premium rounded-md overflow-hidden elevation-1 bg-white mb-6">
                      <div class="group-header pa-4 d-flex align-center justify-space-between border-b bg-grey-lighten-5">
                        <div class="d-flex align-center gap-3">
                          <v-avatar color="primary" variant="tonal" size="36">
                            <v-icon :icon="getGroupIcon(key)" size="20" />
                          </v-avatar>
                          <div>
                            <span class="font-weight-bold text-subtitle-2">{{ group.name?.label || key }}</span>
                            <div class="text-caption text-grey">{{ Object.keys(group).length - 1 }} صلاحية</div>
                          </div>
                        </div>
                        <v-btn size="small" variant="tonal" :color="allInGroupSelected(group) ? 'grey' : 'primary'" @click="toggleGroup(group)">
                          {{ allInGroupSelected(group) ? 'إلغاء الكل' : 'تحديد الكل' }}
                        </v-btn>
                      </div>

                      <v-list density="comfortable" class="py-0">
                        <template v-for="(perm, pKey) in group" :key="pKey">
                          <template v-if="pKey !== 'name' && (expertMode || !isPermissionInherited(perm.key))">
                            <v-list-item class="premium-perm-item px-4">
                              <template #prepend>
                                <v-checkbox-btn
                                  v-model="selectedPermissions"
                                  :value="perm.key"
                                  :disabled="isPermissionInherited(perm.key)"
                                  color="primary"
                                  hide-details
                                />
                              </template>
                              <v-list-item-title class="d-flex align-center gap-2">
                                <span :class="{ 'text-grey opacity-60 italic': isPermissionInherited(perm.key) }" class="font-weight-medium">
                                  {{ perm.label }}
                                </span>
                                <v-chip
                                  v-if="isPermissionInherited(perm.key)"
                                  size="x-small"
                                  color="primary"
                                  variant="tonal"
                                  class="px-2 font-weight-bold"
                                >
                                  من الأدوار
                                </v-chip>
                              </v-list-item-title>
                              <v-list-item-subtitle class="text-caption opacity-40">
                                {{ perm.key }}
                              </v-list-item-subtitle>
                            </v-list-item>
                            <v-divider :key="'div-' + pKey" inset />
                          </template>
                        </template>
                      </v-list>
                    </div>
                  </v-col>
                </v-row>

                <!-- Advanced Empty State -->
                <div v-else class="h-100 d-flex flex-column align-center justify-center py-12 opacity-40">
                  <v-icon icon="ri-search-eye-line" size="100" />
                  <h4 class="text-h6 font-weight-bold mt-4">لا توجد صلاحيات تطابق بحثك</h4>
                  <p class="text-body-2">حاول استخدام كلمات مفتاحية أخرى</p>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </div>
    </div>

    <!-- Premium Glassmorphic Footer -->
    <v-divider />
    <div class="glass-footer pa-4 d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2 text-grey-darken-1">
        <v-icon icon="ri-lock-2-line" size="16" />
        <span class="text-caption">يتم تشفير وتأمين جميع تحديثات الصلاحيات فوراً</span>
      </div>
      <div class="d-flex gap-3">
        <v-btn variant="text" color="grey-darken-1" class="font-weight-bold" @click="$emit('cancel')"> تجاهل </v-btn>
        <v-btn
          color="primary"
          size="large"
          class="px-8 font-weight-bold elevation-2"
          :loading="loading"
          prepend-icon="ri-shield-flash-line"
          rounded="md"
          @click="handleSave"
        >
          تحديث الصلاحيات
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../store/user.store';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['save', 'cancel']);

const store = useUserStore();
const loading = ref(false);
const tab = ref('roles');
const expertMode = ref(false);
const permissionSearch = ref('');
const selectedRoles = ref([]);
const selectedPermissions = ref([]);

const navigationItems = computed(() => [
  {
    label: 'الأدوار',
    value: 'roles',
    icon: 'ri-shield-user-line',
    activeIcon: 'ri-shield-check-fill',
    count: selectedRoles.value.length,
  },
  {
    label: 'الصلاحيات',
    value: 'permissions',
    icon: 'ri-key-2-line',
    activeIcon: 'ri-key-fill',
    count: selectedPermissions.value.length,
  },
]);

onMounted(async () => {
  store.loading = true;
  try {
    await Promise.all([store.fetchRoles(), store.fetchAvailablePermissions()]);
    selectedRoles.value = props.user.roles?.map(r => (typeof r === 'object' ? r.name : r)) || [];
    selectedPermissions.value = props.user.direct_permissions?.map(p => (typeof p === 'object' ? p.name : p)) || [];
  } finally {
    store.loading = false;
  }
});

const getUserInitials = () => {
  const fullName = props.user.full_name || props.user.username || 'User';
  const names = fullName.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
};

const isRoleSelected = roleName => selectedRoles.value.includes(roleName);

const toggleRole = roleName => {
  const index = selectedRoles.value.indexOf(roleName);
  if (index > -1) {
    selectedRoles.value.splice(index, 1);
  } else {
    selectedRoles.value.push(roleName);
  }
};

const inheritedPermissions = computed(() => {
  const perms = new Set();
  selectedRoles.value.forEach(roleName => {
    const roleObj = store.roles.find(r => r.name === roleName);
    if (roleObj && roleObj.permissions) {
      roleObj.permissions.forEach(p => perms.add(p));
    }
  });
  return perms;
});

const isPermissionInherited = permKey => inheritedPermissions.value.has(permKey);

const filteredPermissions = computed(() => {
  const result = {};
  const query = permissionSearch.value.toLowerCase();

  let permissionsSource = store.availablePermissions;
  // Unwrap if it's the BaseService array wrapper
  if (Array.isArray(permissionsSource) && permissionsSource.length === 1 && !permissionsSource[0].name) {
    permissionsSource = permissionsSource[0];
  }

  if (!permissionsSource || typeof permissionsSource !== 'object') return result;

  Object.entries(permissionsSource).forEach(([groupKey, group]) => {
    if (!group || typeof group !== 'object' || !group.name) return;

    const filteredGroup = { name: group.name };
    let hasMatch = false;

    if (group.name?.label?.toLowerCase().includes(query)) {
      hasMatch = true;
      Object.entries(group).forEach(([pKey, p]) => {
        if (pKey !== 'name' && p && typeof p === 'object') filteredGroup[pKey] = p;
      });
    } else {
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
  if (!group || typeof group !== 'object') return false;
  const perms = Object.entries(group)
    .filter(([k, p]) => k !== 'name' && p && p.key)
    .map(([, p]) => p.key);
  return perms.length > 0 && perms.every(p => selectedPermissions.value.includes(p) || isPermissionInherited(p));
};

const toggleGroup = group => {
  if (!group || typeof group !== 'object') return;
  const perms = Object.entries(group)
    .filter(([k, p]) => k !== 'name' && p && p.key)
    .map(([, p]) => p.key);
  const allSelected = allInGroupSelected(group);

  perms.forEach(p => {
    if (!p || isPermissionInherited(p)) return;

    const index = selectedPermissions.value.indexOf(p);
    if (allSelected) {
      if (index > -1) selectedPermissions.value.splice(index, 1);
    } else {
      if (index === -1) selectedPermissions.value.push(p);
    }
  });
};

const handleSave = async () => {
  loading.value = true;
  try {
    const payload = {
      roles: selectedRoles.value,
      permissions: selectedPermissions.value,
    };
    await store.updateUser(props.user.id, payload);
    emit('save');
  } catch (error) {
    console.error('Failed to update permissions:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.user-permission-manager-premium {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 800px;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* Main Layout */
.main-layout-wrapper {
  flex-grow: 1;
  overflow: hidden;
}

/* Navigation Rail Glass */
.nav-rail-glass {
  width: 120px;
  background: white;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 15;
}

.nav-item-premium {
  height: auto !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item-premium :deep(.v-btn__content) {
  opacity: 0.6;
}

.nav-item-premium.v-btn--active :deep(.v-btn__content) {
  opacity: 1;
}

.nav-item-premium.v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

/* Content Area */
.content-glass-bg {
  background: #f1f5f9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-window {
  height: 100%;
}

/* Section Banner */
.section-banner {
  background: white;
  position: relative;
}

.relative-z {
  position: relative;
  z-index: 2;
}

.banner-circle {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.05);
  z-index: 1;
}

/* Role Cards */
.role-premium-card {
  cursor: pointer;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.selected-float {
  background: white !important;
  box-shadow: 0 10px 25px rgba(var(--v-theme-primary), 0.15) !important;
  transform: translateY(-5px);
}

.hover-scale {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05) !important;
}

/* Permissions Toolbar */
.permissions-toolbar-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.premium-search-field :deep(.v-field) {
  border-radius: 16px !important;
}

.expert-toggle-group {
  border-radius: 16px !important;
  height: 48px !important;
}

/* Permissions Group */
.permission-group-premium {
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.premium-perm-item {
  transition: all 0.2s ease;
}

.premium-perm-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}

/* Glass Alerts */
.glass-alert-info {
  background: rgba(var(--v-theme-info), 0.05) !important;
}
.glass-alert-success {
  background: rgba(var(--v-theme-success), 0.05) !important;
}

/* Custom Utilities */
.shadow-accent {
  box-shadow: 0 0 50px rgba(var(--v-theme-primary), 0.1);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer Glass */
.glass-footer {
  background: white;
  z-index: 20;
}

/* Transitions */
.transition-all {
  transition: all 0.3s ease;
}

/* Responsive Overrides */
@media (max-width: 959px) {
  .user-permission-manager-premium {
    height: 100vh; /* Fixed height to force internal scroll */
    max-width: 100%;
  }

  /* Ensure content wrappers take full available height */
  .main-layout-wrapper {
    flex-direction: column;
    height: calc(100vh - 80px - 72px); /* Subtract header and footer */
  }

  .content-glass-bg,
  .content-window {
    height: 100%;
  }

  .nav-rail-glass {
    width: 100%;
    height: auto;
    border-left: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 8px 0 !important;
  }

  .nav-rail-content {
    flex-direction: row !important;
    justify-content: center;
    padding: 0 4px !important;
    gap: 8px !important;
  }

  .nav-item-premium {
    flex: 1;
    min-width: 0;
    max-width: 140px;
    padding: 8px 4px !important;
    border-radius: 12px !important;
  }

  .nav-item-premium .v-icon {
    font-size: 20px !important;
  }

  .nav-item-premium .text-caption {
    font-size: 0.65rem !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content-glass-bg {
    padding-bottom: 80px; /* Space for footer if needed */
  }

  .permissions-toolbar-glass {
    padding: 12px 16px !important;
  }

  .expert-toggle-group {
    margin-top: 12px;
  }

  .glass-footer {
    padding: 12px 16px !important;
    flex-direction: column;
    gap: 16px;
    align-items: stretch !important;
  }

  .glass-footer .d-flex.gap-3 {
    justify-content: space-between;
  }

  .glass-footer .v-btn {
    flex: 1;
  }

  .section-banner {
    padding: 16px !important;
    margin-bottom: 16px !important;
  }

  .section-banner h3 {
    font-size: 1.1rem !important;
  }

  .section-banner .v-chip {
    padding: 0 12px !important;
    height: 32px !important;
    font-size: 0.8rem !important;
  }

  .role-premium-card {
    margin-bottom: 4px;
  }
}

@media (max-width: 599px) {
  .glass-header .header-text p {
    font-size: 0.85rem !important;
  }

  .role-grid .v-col {
    padding: 4px !important;
  }
}
</style>
