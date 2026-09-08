<template>
  <div class="upm-root">

    <!-- ══════════════════════════════════════════════
         STICKY HEADER
    ══════════════════════════════════════════════ -->
    <div class="upm-sticky-header">

      <!-- صف 1: الشركة + الإحصاء + الأزرار -->
      <div class="upm-top-row">
        <div class="d-flex align-center gap-2 flex-shrink-0 flex-wrap">
          <v-icon icon="ri-community-line" color="primary" size="16" />
          <v-select
            v-model="selectedSyncCompanyId"
            :items="props.user.companies || []"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            style="min-width:180px; max-width:240px"
            :loading="loading"
          />
        </div>

        <div class="d-flex align-center gap-2 flex-wrap">
          <v-chip v-if="hasChanges" size="x-small" color="warning" variant="tonal" prepend-icon="ri-edit-line">
            تغييرات غير محفوظة
          </v-chip>
          <div class="upm-stat-pill upm-stat-pill--roles">
            <v-icon icon="ri-shield-user-line" size="12" />
            <span>{{ selectedRoles.length }} دور</span>
          </div>
          <div class="upm-stat-pill upm-stat-pill--perms">
            <v-icon icon="ri-key-2-line" size="12" />
            <span>{{ selectedPermissions.length }} صلاحية</span>
          </div>
          <v-btn variant="text" color="grey-darken-1" size="small" rounded="lg" class="font-weight-bold" @click="$emit('cancel')">إلغاء</v-btn>
          <v-btn color="primary" size="small" rounded="lg" :loading="loading" :disabled="!hasChanges" class="px-4 font-weight-bold" prepend-icon="ri-save-3-line" @click="handleSave">حفظ</v-btn>
        </div>
      </div>

      <!-- صف 2: Tabs + أدوات البحث -->
      <div class="upm-tabs-row">
        <div class="upm-tabs-nav">
          <button
            v-for="nav in navigationItems" :key="nav.value"
            class="upm-tab" :class="{ 'upm-tab--active': tab === nav.value }"
            @click="tab = nav.value"
          >
            <v-icon :icon="tab === nav.value ? nav.activeIcon : nav.icon" size="16" class="me-1" />
            <span>{{ nav.label }}</span>
            <span v-if="nav.count > 0" class="upm-tab-badge">{{ nav.count }}</span>
          </button>
        </div>

        <!-- أدوات البحث — تظهر فقط في تبويب الصلاحيات -->
        <div v-if="tab === 'permissions'" class="upm-tabs-tools">
          <v-text-field
            v-model="permissionSearch"
            placeholder="ابحث عن صلاحية أو وحدة..."
            prepend-inner-icon="ri-search-2-line"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            rounded="lg"
            class="upm-search-field"
          />
          <label class="upm-expert-label">
            <span class="text-caption font-weight-bold">{{ expertMode ? 'خبير' : 'مبسّط' }}</span>
            <v-switch v-model="expertMode" color="primary" hide-details density="compact" inset class="ms-1" />
          </label>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         BODY
    ══════════════════════════════════════════════ -->
    <div class="upm-body">

      <!-- ─── تبويب الأدوار ─── -->
      <template v-if="tab === 'roles'">
        <div v-if="store.loading" class="upm-center py-16">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <template v-else-if="store.roles.length">
          <p class="text-caption text-grey-darken-1 mb-4">اختر دوراً أو أكثر. كل دور يمنح حزمة من الصلاحيات المحددة مسبقاً.</p>
          <div class="upm-role-grid">
            <div
              v-for="role in store.roles" :key="role.id"
              class="upm-role-card" :class="{ 'upm-role-card--on': isRoleSelected(role.name) }"
              @click="toggleRole(role.name)"
            >
              <div class="upm-role-card__top">
                <div class="upm-role-icon">
                  <v-icon :icon="getRoleIcon(role.name)" size="20" color="primary" />
                </div>
                <div class="upm-check-ring" :class="{ 'upm-check-ring--on': isRoleSelected(role.name) }">
                  <v-icon v-if="isRoleSelected(role.name)" icon="ri-check-line" size="11" color="white" />
                </div>
              </div>
              <div class="text-body-2 font-weight-bold mt-2 mb-1">{{ role.label || role.name }}</div>
              <div class="text-caption text-grey-darken-1 upm-clamp2 mb-3">{{ role.description || 'لا يوجد وصف.' }}</div>
              <div class="upm-role-card__foot">
                <v-chip size="x-small" :color="isRoleSelected(role.name) ? 'primary' : 'grey'" :variant="isRoleSelected(role.name) ? 'flat' : 'tonal'">
                  <v-icon start icon="ri-key-fill" size="10" />{{ role.permissions_count || 0 }}
                </v-chip>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="upm-center py-16">
          <v-icon icon="ri-shield-flash-line" size="52" color="grey-lighten-2" class="mb-3" />
          <div class="text-body-2 font-weight-bold text-grey-darken-1">لا توجد أدوار مُعرَّفة</div>
          <div class="text-caption text-grey">أنشئ الأدوار من الإعدادات أولاً</div>
        </div>
      </template>

      <!-- ─── تبويب الصلاحيات (Matrix) ─── -->
      <template v-if="tab === 'permissions'">

        <!-- تنبيه وضع الخبير فقط -->
        <v-alert v-if="expertMode" type="info" variant="tonal" density="compact" rounded="lg" class="mb-3" icon="ri-shield-flash-line">
          <span class="text-caption"><strong>وضع الخبير:</strong> تظهر الصلاحيات الموروثة من الأدوار للمراجعة فقط.</span>
        </v-alert>


        <!-- ── MATRIX TABLE ── -->
        <div v-if="matrixGroups.length" class="upm-matrix-wrapper">
          <table class="upm-matrix">
            <!-- رأس الجدول -->
            <thead>
              <tr class="upm-matrix__header-row">
                <!-- عمود الوحدة -->
                <th class="upm-matrix__th upm-matrix__th--module">الوحدة</th>
                <!-- الأعمدة القياسية -->
                <th
                  v-for="col in STANDARD_COLUMNS"
                  :key="col.id"
                  class="upm-matrix__th"
                  :class="`upm-matrix__th--${col.group}`"
                >
                  <div class="upm-matrix__th-inner">
                    <span class="upm-matrix__th-group">{{ col.groupLabel }}</span>
                    <span class="upm-matrix__th-label">{{ col.label }}</span>
                  </div>
                </th>
                <!-- عمود الصلاحيات الخاصة -->
                <th class="upm-matrix__th upm-matrix__th--custom">خاص</th>
              </tr>
            </thead>

            <tbody>
              <template v-for="(group, groupIndex) in matrixGroups" :key="group.id">
                <!-- صف الوحدة الرئيسي -->
                <tr
                  class="upm-matrix__row"
                  :class="{
                    'upm-matrix__row--even':         groupIndex % 2 !== 0,
                    'upm-matrix__row--has-selected':  group.selectedCount > 0,
                    'upm-matrix__row--expanded':      expandedRows.has(group.id)
                  }"
                >
                  <!-- اسم الوحدة -->
                  <td class="upm-matrix__td upm-matrix__td--module">
                    <div class="upm-module-cell">
                      <div class="upm-module-icon">
                        <v-icon :icon="group.icon" size="14" color="primary" />
                      </div>
                      <div class="upm-module-info">
                        <div class="upm-module-name">{{ group.name }}</div>
                        <div v-if="group.selectedCount > 0" class="upm-module-count">
                          {{ group.selectedCount }}/{{ group.totalCount }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- خلايا الأعمدة القياسية -->
                  <td
                    v-for="col in STANDARD_COLUMNS"
                    :key="col.id"
                    class="upm-matrix__td"
                    :class="`upm-matrix__td--${col.group}`"
                  >
                    <template v-if="group.standard[col.id]">
                      <div
                        class="upm-matrix-cb"
                        :class="{
                          'upm-matrix-cb--on':        isChecked(group.standard[col.id].key),
                          'upm-matrix-cb--inherited': isPermissionInherited(group.standard[col.id].key),
                          'upm-matrix-cb--disabled':  isPermissionInherited(group.standard[col.id].key) && !expertMode
                        }"
                        @click="onCellClick(group.standard[col.id].key)"
                      >
                        <v-icon
                          v-if="isChecked(group.standard[col.id].key)"
                          :icon="isPermissionInherited(group.standard[col.id].key) ? 'ri-shield-user-fill' : 'ri-check-line'"
                          size="10"
                          color="white"
                        />
                      </div>
                    </template>
                    <!-- خلية فارغة -->
                    <span v-else class="upm-matrix-na">—</span>
                  </td>

                  <!-- عمود الصلاحيات الخاصة -->
                  <td class="upm-matrix__td upm-matrix__td--custom">
                    <button
                      v-if="group.custom.length"
                      class="upm-custom-btn"
                      :class="{ 'upm-custom-btn--has': group.customSelected > 0 }"
                      @click="toggleRow(group.id)"
                    >
                      <v-icon
                        :icon="expandedRows.has(group.id) ? 'ri-arrow-up-s-line' : 'ri-add-line'"
                        size="12"
                      />
                      <span>{{ group.custom.length }}</span>
                    </button>
                    <span v-else class="upm-matrix-na">—</span>
                  </td>
                </tr>

                <!-- صف الصلاحيات الخاصة (قابل للتوسع) -->
                <tr
                  v-if="group.custom.length && expandedRows.has(group.id)"
                  class="upm-matrix__custom-row"
                  :class="{ 'upm-matrix__custom-row--even': groupIndex % 2 !== 0 }"
                >
                  <td :colspan="STANDARD_COLUMNS.length + 2" class="upm-matrix__custom-td">
                    <div class="upm-custom-perms">
                      <div
                        v-for="perm in group.custom"
                        :key="perm.key"
                        class="upm-custom-perm"
                        :class="{
                          'upm-custom-perm--on':        isChecked(perm.key),
                          'upm-custom-perm--inherited': isPermissionInherited(perm.key)
                        }"
                        @click="onCellClick(perm.key)"
                      >
                        <div
                          class="upm-matrix-cb upm-matrix-cb--sm"
                          :class="{
                            'upm-matrix-cb--on':        isChecked(perm.key),
                            'upm-matrix-cb--inherited': isPermissionInherited(perm.key)
                          }"
                        >
                          <v-icon
                            v-if="isChecked(perm.key)"
                            :icon="isPermissionInherited(perm.key) ? 'ri-shield-user-fill' : 'ri-check-line'"
                            size="9"
                            color="white"
                          />
                        </div>
                        <div class="upm-custom-perm__info">
                          <div class="upm-custom-perm__label">{{ perm.label }}</div>
                          <div class="upm-custom-perm__key">{{ perm.key }}</div>
                        </div>
                        <v-chip v-if="isPermissionInherited(perm.key)" size="x-small" color="info" variant="tonal" class="ms-1">
                          <v-icon start icon="ri-shield-user-line" size="9" />موروثة
                        </v-chip>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- لا نتائج -->
        <div v-else class="upm-center py-16">
          <v-icon icon="ri-search-eye-line" size="52" color="grey-lighten-2" class="mb-3" />
          <div class="text-body-2 font-weight-bold text-grey-darken-1">لا توجد نتائج</div>
          <div class="text-caption text-grey">جرّب كلمات مختلفة</div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
// مدير الأدوار والصلاحيات — عرض Matrix مع صفوف قابلة للتوسع للصلاحيات المخصصة
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '../store/user.store';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { userService } from '@/api';

// ── ثوابت الأعمدة القياسية ──────────────────────────────
const STANDARD_COLUMNS = [
  { id: 'page',            label: 'صفحة',       groupLabel: '',       group: 'page'   },
  { id: 'view_all',        label: 'الكل',        groupLabel: 'عرض',    group: 'view'   },
  { id: 'view_children',   label: 'التابعين',    groupLabel: 'عرض',    group: 'view'   },
  { id: 'view_self',       label: 'الخاص',       groupLabel: 'عرض',    group: 'view'   },
  { id: 'create',          label: 'إضافة',       groupLabel: '',       group: 'create' },
  { id: 'update_all',      label: 'الكل',        groupLabel: 'تعديل',  group: 'update' },
  { id: 'update_children', label: 'التابعين',    groupLabel: 'تعديل',  group: 'update' },
  { id: 'update_self',     label: 'الخاص',       groupLabel: 'تعديل',  group: 'update' },
  { id: 'delete_all',      label: 'الكل',        groupLabel: 'حذف',    group: 'delete' },
  { id: 'delete_children', label: 'التابعين',    groupLabel: 'حذف',    group: 'delete' },
  { id: 'delete_self',     label: 'الخاص',       groupLabel: 'حذف',    group: 'delete' },
];
const STANDARD_IDS = new Set(STANDARD_COLUMNS.map(c => c.id));

// ── Props & Emits ────────────────────────────────────────
const props = defineProps({ user: { type: Object, required: true } });
const emit  = defineEmits(['save', 'cancel']);

// ── Stores ───────────────────────────────────────────────
const store       = useUserStore();
const globalStore = useGlobalUserStore();

// ── State ────────────────────────────────────────────────
const loading               = ref(false);
const tab                   = ref('roles');
const expertMode            = ref(false);
const permissionSearch      = ref('');
const selectedRoles         = ref([]);
const selectedPermissions   = ref([]);
const originalRoles         = ref([]);
const originalPermissions   = ref([]);
const selectedSyncCompanyId = ref(null);
const expandedRows          = ref(new Set());

// ── إصلاح الترميز العربي ────────────────────────────────
const fixLabel = (str) => {
  if (!str || typeof str !== 'string') return str;
  try { return decodeURIComponent(escape(str)); } catch { return str; }
};

// ── Tabs ─────────────────────────────────────────────────
const navigationItems = computed(() => [
  { label: 'الأدوار',     value: 'roles',       icon: 'ri-shield-user-line', activeIcon: 'ri-shield-check-fill', count: selectedRoles.value.length       },
  { label: 'الصلاحيات',  value: 'permissions',  icon: 'ri-key-2-line',       activeIcon: 'ri-key-fill',          count: selectedPermissions.value.length },
]);

// ── hasChanges ───────────────────────────────────────────
const hasChanges = computed(() => {
  const rChanged = selectedRoles.value.length !== originalRoles.value.length
                || selectedRoles.value.some(r => !originalRoles.value.includes(r));
  const pChanged = selectedPermissions.value.length !== originalPermissions.value.length
                || selectedPermissions.value.some(p => !originalPermissions.value.includes(p));
  return rChanged || pChanged;
});

// ── تهيئة ────────────────────────────────────────────────
onMounted(async () => {
  store.loading = true;
  try {
    await Promise.all([store.fetchRoles(), store.fetchAvailablePermissions()]);
    const userCompanyIds = props.user.companies?.map(c => c.id) ?? [];
    const authCompanyId  = globalStore.currentCompany?.id;
    selectedSyncCompanyId.value =
      (authCompanyId && userCompanyIds.includes(authCompanyId))
        ? authCompanyId
        : (userCompanyIds[0] ?? authCompanyId);
  } finally {
    store.loading = false;
  }
});

// ── تغيير الشركة ─────────────────────────────────────────
const lastFetchedId = ref(null);
watch(selectedSyncCompanyId, async newId => {
  if (!newId || newId === lastFetchedId.value) return;
  lastFetchedId.value = newId;
  loading.value = true;
  try {
    const res      = await userService.getOne(props.user.id, { sync_company_id: newId, permissions: 1 });
    const userData = res.data[0] ?? res.data;
    const roles    = userData.roles?.map(r => (typeof r === 'object' ? r.name : r)) ?? [];
    const perms    = userData.direct_permissions?.map(p => (typeof p === 'object' ? p.name : p)) ?? [];
    selectedRoles.value       = [...roles];
    originalRoles.value       = [...roles];
    selectedPermissions.value = [...perms];
    originalPermissions.value = [...perms];
  } catch (e) { console.error('Failed to load user roles:', e); }
  finally { loading.value = false; }
});

// ── منطق الأدوار ─────────────────────────────────────────
const isRoleSelected = name => selectedRoles.value.includes(name);
const toggleRole = name => {
  const i = selectedRoles.value.indexOf(name);
  if (i > -1) selectedRoles.value.splice(i, 1);
  else         selectedRoles.value.push(name);
};
const getRoleIcon = name => {
  const map = { admin:'ri-admin-line', manager:'ri-briefcase-line', accountant:'ri-calculator-line',
    cashier:'ri-money-dollar-circle-line', sales:'ri-store-2-line', warehouse:'ri-home-gear-line',
    customer:'ri-user-heart-line', viewer:'ri-eye-line' };
  const lower = (name || '').toLowerCase();
  for (const [k, icon] of Object.entries(map)) { if (lower.includes(k)) return icon; }
  return 'ri-shield-user-line';
};

// ── منطق الصلاحيات ───────────────────────────────────────
const inheritedPermissions = computed(() => {
  const s = new Set();
  selectedRoles.value.forEach(roleName => {
    store.roles.find(x => x.name === roleName)?.permissions?.forEach(p => s.add(p));
  });
  return s;
});
const isPermissionInherited = key => inheritedPermissions.value.has(key);
const isChecked = key =>
  selectedPermissions.value.includes(key) || isPermissionInherited(key);

const onCellClick = key => {
  if (isPermissionInherited(key)) return;
  const i = selectedPermissions.value.indexOf(key);
  if (i > -1) selectedPermissions.value.splice(i, 1);
  else         selectedPermissions.value.push(key);
};

const toggleRow = id => {
  const s = new Set(expandedRows.value);
  s.has(id) ? s.delete(id) : s.add(id);
  expandedRows.value = s;
};

// ── أيقونة المجموعة ──────────────────────────────────────
const getGroupIcon = key => ({
  admin:'ri-admin-line', companies:'ri-community-line', users:'ri-user-settings-line',
  warehouses:'ri-home-gear-line', products:'ri-box-3-line', invoices:'ri-file-list-3-line',
  transactions:'ri-hand-coin-line', cash_boxes:'ri-safe-2-line', reports:'ri-bar-chart-2-line',
  balance:'ri-scales-line', settings:'ri-settings-3-line', roles:'ri-shield-user-line',
  profits:'ri-funds-line', stocks:'ri-stack-line', installments:'ri-calendar-todo-line',
  payments:'ri-money-dollar-circle-line', customers:'ri-user-heart-line', exports:'ri-download-2-line',
  custodies:'ri-archive-drawer-line', owner_fund_transactions:'ri-group-line',
  expenses:'ri-receipt-line', revenues:'ri-hand-coin-line', categories:'ri-price-tag-3-line',
  brands:'ri-award-line', legal_documents:'ri-file-paper-2-line', backups:'ri-database-2-line',
  branches:'ri-building-2-line', attribute_values:'ri-list-settings-line', attributes:'ri-equalizer-line',
})[key] || 'ri-folder-keyhole-line';

// ── بناء مجموعات الـ Matrix ──────────────────────────────
const matrixGroups = computed(() => {
  let src = store.availablePermissions;
  if (Array.isArray(src) && src.length === 1 && !src[0].name) src = src[0];
  if (!src || typeof src !== 'object') return [];

  const query = permissionSearch.value.toLowerCase().trim();

  return Object.entries(src)
    .map(([groupKey, group]) => {
      if (!group?.name) return null;

      const groupName  = fixLabel(group.name?.label) || groupKey;
      const standard   = {};
      const custom     = [];

      Object.entries(group).forEach(([pKey, p]) => {
        if (pKey === 'name' || !p || typeof p !== 'object') return;
        const item = { id: pKey, key: p.key, label: fixLabel(p.label) || pKey };
        if (STANDARD_IDS.has(pKey)) standard[pKey] = item;
        else custom.push(item);
      });

      // فلترة البحث
      if (query) {
        const nameMatch = groupName.toLowerCase().includes(query);
        const stdMatch  = Object.values(standard).some(p =>
          p.label.toLowerCase().includes(query) || p.key.toLowerCase().includes(query)
        );
        const cusMatch  = custom.some(p =>
          p.label.toLowerCase().includes(query) || p.key.toLowerCase().includes(query)
        );
        if (!nameMatch && !stdMatch && !cusMatch) return null;
        // عند البحث: فتح الصفوف تلقائياً
        if (cusMatch) expandedRows.value = new Set([...expandedRows.value, groupKey]);
      }

      const allPerms      = [...Object.values(standard), ...custom];
      const selectedCount = allPerms.filter(p => isChecked(p.key)).length;
      const customSelected = custom.filter(p => isChecked(p.key)).length;

      return {
        id: groupKey, name: groupName,
        icon: getGroupIcon(groupKey),
        standard, custom,
        totalCount: allPerms.length,
        selectedCount, customSelected,
      };
    })
    .filter(Boolean);
});

// ── حفظ ──────────────────────────────────────────────────
const handleSave = async () => {
  loading.value = true;
  try {
    await store.updateUser(props.user.id, {
      roles:           selectedRoles.value,
      permissions:     selectedPermissions.value,
      sync_company_id: selectedSyncCompanyId.value,
    });
    emit('save');
  } catch (e) { console.error('Failed to update permissions:', e); }
  finally { loading.value = false; }
};
</script>

<style scoped>
/* ══════════════════════════════════════════════════════
   Root
══════════════════════════════════════════════════════ */
.upm-root {
  display: block;
  background: #f8fafc;
  min-height: 500px;
}

/* ══════════════════════════════════════════════════════
   Sticky Header
══════════════════════════════════════════════════════ */
.upm-sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.upm-top-row {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 6px; padding: 6px 12px;
}
.upm-stat-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 20px;
  font-size: 0.72rem; font-weight: 600; line-height: 1.6;
}
.upm-stat-pill--roles { background: rgba(var(--v-theme-primary), 0.1); color: rgb(var(--v-theme-primary)); }
.upm-stat-pill--perms { background: rgba(var(--v-theme-secondary), 0.1); color: rgb(var(--v-theme-secondary)); }

/* Tabs */
.upm-tab {
  display: inline-flex; align-items: center;
  padding: 6px 12px; font-size: 0.85rem; font-family: inherit;
  border: none; background: transparent; cursor: pointer;
  color: #6b7280; border-bottom: 2px solid transparent;
  position: relative; bottom: -1px;
  transition: color .2s, border-color .2s;
}
.upm-tab:hover    { color: rgb(var(--v-theme-primary)); }
.upm-tab--active  { color: rgb(var(--v-theme-primary)); font-weight: 700; border-bottom-color: rgb(var(--v-theme-primary)); }
.upm-tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgb(var(--v-theme-primary)); color: white;
  font-size: 0.62rem; font-weight: 700; margin-inline-start: 5px;
}

/* Body */
.upm-body { padding: 16px; }
.upm-center { display: flex; flex-direction: column; align-items: center; text-align: center; }

/* ══════════════════════════════════════════════════════
   Roles
══════════════════════════════════════════════════════ */
.upm-role-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 12px; }
.upm-role-card {
  background: #fff; border: 2px solid #e2e8f0; border-radius: 14px;
  padding: 14px; cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .2s;
  display: flex; flex-direction: column;
}
.upm-role-card:hover { border-color: rgba(var(--v-theme-primary),.4); box-shadow: 0 4px 16px rgba(var(--v-theme-primary),.1); transform: translateY(-2px); }
.upm-role-card--on  { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary),.03); box-shadow: 0 6px 20px rgba(var(--v-theme-primary),.12); }
.upm-role-card__top { display: flex; justify-content: space-between; align-items: flex-start; }
.upm-role-icon { width:40px; height:40px; border-radius:10px; background: rgba(var(--v-theme-primary),.09); display:flex; align-items:center; justify-content:center; }
.upm-check-ring { width:22px; height:22px; border-radius:50%; border:2px solid #d1d5db; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition: background .2s, border-color .2s; background:white; }
.upm-check-ring--on { background: rgb(var(--v-theme-primary)); border-color: rgb(var(--v-theme-primary)); }
.upm-role-card__foot { margin-top: auto; }
.upm-clamp2 { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* ══════════════════════════════════════════════════════
   Toolbar (قديم — محتفظ بها للمتوافقية)
══════════════════════════════════════════════════════ */
.upm-search-field { flex: 1; min-width: 0; max-width: 260px; }
.upm-expert-label { display: flex; align-items: center; flex-shrink: 0; white-space: nowrap; cursor: pointer; }

/* ── tabs-row مع أدوات البحث ── */
.upm-tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  gap: 8px;
  background: white;
  border-top: 1px solid #f1f5f9;
  flex-wrap: nowrap;
}
.upm-tabs-nav { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.upm-tabs-tools {
  display: flex; align-items: center; gap: 8px;
  flex: 1; justify-content: flex-end;
  padding: 4px 0;
}

/* ══════════════════════════════════════════════════════
   MATRIX TABLE
══════════════════════════════════════════════════════ */
.upm-matrix-wrapper {
  /* ── scroll عمودي وأفقي داخل الـ wrapper نفسه ──
     هذا ضروري لكي يعمل position:sticky على الـ thead
     لأن overflow-x وحده يكسر الـ sticky العمودي في المتصفحات ── */
  overflow: auto;
  max-height: min(62vh, 560px);
  min-height: 200px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  background: white;
}

.upm-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  min-width: 780px;
}

/* Header — فاتح واضح */
.upm-matrix__header-row { background: #f1f5f9; }

.upm-matrix__th {
  padding: 0;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-left: 1px solid #e2e8f0;
  white-space: nowrap;
  /* Sticky: يعمل لأن الـ dialog هو container الـ scroll العمودي */
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f1f5f9;
}
.upm-matrix__th:first-child { border-left: none; }
.upm-matrix__th--module { text-align: start; min-width: 160px; }
.upm-matrix__th--custom { min-width: 60px; }

/* color bands — ألوان صلبة opaque لمنع الشفافية عند التثبيت */
.upm-matrix__th--view   { background: #e6e7fa; } /* indigo فاتح */
.upm-matrix__th--update { background: #fdf3e0; } /* amber فاتح  */
.upm-matrix__th--delete { background: #fde8e8; } /* red فاتح    */
.upm-matrix__th--create { background: #e3f5eb; } /* green فاتح  */

.upm-matrix__th-inner {
  display: flex; flex-direction: column;
  align-items: center; padding: 8px 6px; gap: 1px;
}
.upm-matrix__th-group { font-size: 0.6rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px; min-height: 10px; color: #6b7280; }
.upm-matrix__th-label { font-size: 0.75rem; font-weight: 700; color: #374151; }

/* Rows */
.upm-matrix__row {
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s;
}
/* صفوف زوجية — لون مختلف قليلاً */
.upm-matrix__row--even { background: #f8fafc; }
.upm-matrix__row:hover { background: rgba(var(--v-theme-primary), 0.04) !important; }
.upm-matrix__row--has-selected { /* لا تغيير على الخلفية — نعتمد فقط على الـ zebra */ }
.upm-matrix__row--expanded { outline: 2px solid rgba(var(--v-theme-primary), 0.15); outline-offset: -1px; }

/* TD */
.upm-matrix__td {
  padding: 6px 4px;
  text-align: center;
  border-left: 1px solid #f1f5f9;
  vertical-align: middle;
}
.upm-matrix__td:first-child { border-left: none; }

/* color bands TD — شفافة جداً حتى لا تعطّل الـ zebra */
.upm-matrix__td--view   { background: rgba(99,102,241,0.025); }
.upm-matrix__td--update { background: rgba(245,158,11,0.025); }
.upm-matrix__td--delete { background: rgba(239,68,68,0.018); }
.upm-matrix__td--create { background: rgba(34,197,94,0.02); }
.upm-matrix__td--module { text-align: start; padding: 6px 10px; }


/* Module cell */
.upm-module-cell { display: flex; align-items: center; gap: 8px; }
.upm-module-icon {
  width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex; align-items: center; justify-content: center;
}
.upm-module-info { min-width: 0; }
.upm-module-name { font-weight: 600; font-size: 0.8rem; color: #1e293b; white-space: nowrap; }
.upm-module-count { font-size: 0.65rem; color: rgb(var(--v-theme-primary)); font-weight: 600; }

/* N/A dash */
.upm-matrix-na { color: #cbd5e1; font-size: 0.75rem; user-select: none; }

/* Checkbox cell */
.upm-matrix-cb {
  width: 20px; height: 20px; border-radius: 5px;
  border: 1.5px solid #d1d5db; background: white;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto; cursor: pointer; flex-shrink: 0;
  transition: all 0.15s;
}
.upm-matrix-cb:hover:not(.upm-matrix-cb--disabled) {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.12);
}
.upm-matrix-cb--on        { background: rgb(var(--v-theme-primary)); border-color: rgb(var(--v-theme-primary)); }
.upm-matrix-cb--inherited { background: rgb(var(--v-theme-info));    border-color: rgb(var(--v-theme-info)); opacity: 0.8; }
.upm-matrix-cb--disabled  { cursor: default; }
.upm-matrix-cb--sm        { width: 16px; height: 16px; border-radius: 4px; }

/* Custom btn */
.upm-custom-btn {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px; border-radius: 20px;
  border: 1.5px solid #e2e8f0; background: white;
  font-size: 0.72rem; font-weight: 600; cursor: pointer; color: #64748b;
  transition: all 0.15s;
}
.upm-custom-btn:hover { border-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-primary)); }
.upm-custom-btn--has {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
  color: rgb(var(--v-theme-primary));
}

/* Custom expanded row */
.upm-matrix__custom-row { background: #f1f5f9; }
.upm-matrix__custom-row--even { background: #eaeff5; }
.upm-matrix__custom-td { padding: 0; border-bottom: 1px solid #e2e8f0; }
.upm-custom-perms {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 10px 16px;
  border-top: 1px dashed #e2e8f0;
}
.upm-custom-perm {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 8px;
  border: 1.5px solid #e2e8f0; background: white;
  cursor: pointer; transition: all 0.15s;
}
.upm-custom-perm:hover:not(.upm-custom-perm--inherited) {
  border-color: rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
}
.upm-custom-perm--on        { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.04); }
.upm-custom-perm--inherited { border-color: rgb(var(--v-theme-info)); background: rgba(var(--v-theme-info), 0.04); cursor: default; }
.upm-custom-perm__info { min-width: 0; }
.upm-custom-perm__label { font-size: 0.78rem; font-weight: 600; color: #1e293b; }
.upm-custom-perm__key   { font-family: 'Courier New', monospace; font-size: 0.62rem; color: #9ca3af; }

/* ══════════════════════════════════════════════════════
   Responsive
══════════════════════════════════════════════════════ */
@media (max-width: 600px) {
  .upm-root          { background: white; }
  .upm-top-row       { padding: 8px 12px; gap: 6px; }
  .upm-body          { padding: 12px; }
  .upm-role-grid     { grid-template-columns: repeat(auto-fill, minmax(145px,1fr)); gap: 8px; }
  .upm-stat-pill     { display: none; }

  /* tabs-row: يتكدس عمودياً في الموبايل */
  .upm-tabs-row {
    flex-wrap: wrap;
    padding: 0 8px;
    gap: 0;
  }
  .upm-tabs-nav {
    width: 100%;
    border-bottom: 1px solid #f1f5f9;
  }

  /* أدوات البحث: صف كامل منفصل */
  .upm-tabs-tools {
    width: 100%;
    justify-content: flex-start;
    padding: 6px 0;
    gap: 6px;
    border-bottom: 1px solid #f1f5f9;
  }
  .upm-search-field { max-width: none; flex: 1; }
  .upm-expert-label span { display: none; } /* إخفاء نص مبسّط/خبير في الموبايل */

  /* مصفوفة الصلاحيات في الموبايل */
  .upm-matrix-wrapper { max-height: 50vh; border-radius: 8px; }
}
</style>
