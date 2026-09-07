<template>
  <div class="upm-root">

    <!-- ══════════════════════════════════════════════
         STICKY HEADER  — لا يتحرك مع السكرول أبداً
         ══════════════════════════════════════════ -->
    <div class="upm-sticky-header">

      <!-- صف 1: الشركة + الإحصاء + الأزرار -->
      <div class="upm-top-row">
        <!-- Company selector -->
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

        <!-- Right side: stats + actions -->
        <div class="d-flex align-center gap-2 flex-wrap">
          <v-chip
            v-if="hasChanges"
            size="x-small"
            color="warning"
            variant="tonal"
            prepend-icon="ri-edit-line"
          >
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

          <v-btn
            variant="text"
            color="grey-darken-1"
            size="small"
            rounded="lg"
            class="font-weight-bold"
            @click="$emit('cancel')"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            size="small"
            rounded="lg"
            :loading="loading"
            :disabled="!hasChanges"
            class="px-4 font-weight-bold"
            prepend-icon="ri-save-3-line"
            @click="handleSave"
          >
            حفظ
          </v-btn>
        </div>
      </div>

      <!-- صف 2: Tabs -->
      <div class="upm-tabs-row">
        <button
          v-for="nav in navigationItems"
          :key="nav.value"
          class="upm-tab"
          :class="{ 'upm-tab--active': tab === nav.value }"
          @click="tab = nav.value"
        >
          <v-icon :icon="tab === nav.value ? nav.activeIcon : nav.icon" size="16" class="me-1" />
          <span>{{ nav.label }}</span>
          <span v-if="nav.count > 0" class="upm-tab-badge">{{ nav.count }}</span>
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         BODY — يسكرول الـ dialog فقط، لا نضيف سكرول
         ══════════════════════════════════════════ -->
    <div class="upm-body">

      <!-- ─── تبويب الأدوار ─── -->
      <template v-if="tab === 'roles'">
        <div v-if="store.loading" class="upm-center py-16">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="store.roles.length">
          <p class="text-caption text-grey-darken-1 mb-4">
            اختر دوراً أو أكثر. كل دور يمنح حزمة من الصلاحيات المحددة مسبقاً.
          </p>
          <div class="upm-role-grid">
            <div
              v-for="role in store.roles"
              :key="role.id"
              class="upm-role-card"
              :class="{ 'upm-role-card--on': isRoleSelected(role.name) }"
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
              <div class="text-caption text-grey-darken-1 upm-clamp2 mb-3">
                {{ role.description || 'لا يوجد وصف.' }}
              </div>

              <div class="upm-role-card__foot">
                <v-chip
                  size="x-small"
                  :color="isRoleSelected(role.name) ? 'primary' : 'grey'"
                  :variant="isRoleSelected(role.name) ? 'flat' : 'tonal'"
                >
                  <v-icon start icon="ri-key-fill" size="10" />
                  {{ role.permissions_count || 0 }}
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

      <!-- ─── تبويب الصلاحيات ─── -->
      <template v-if="tab === 'permissions'">

        <!-- شريط البحث + سويتش الخبير -->
        <div class="upm-perm-toolbar">
          <v-text-field
            v-model="permissionSearch"
            placeholder="ابحث عن صلاحية..."
            prepend-inner-icon="ri-search-2-line"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            rounded="lg"
            class="upm-search-field"
          />
          <label class="upm-expert-label">
            <span class="text-caption font-weight-bold">{{ expertMode ? 'وضع الخبير' : 'المبسّط' }}</span>
            <v-switch
              v-model="expertMode"
              color="primary"
              hide-details
              density="compact"
              inset
              class="ms-2"
            />
          </label>
        </div>

        <!-- Expert notice -->
        <v-alert
          v-if="expertMode"
          type="info"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mb-3"
          icon="ri-shield-flash-line"
        >
          <span class="text-caption">
            <strong>وضع الخبير:</strong>
            تظهر الصلاحيات الموروثة من الأدوار للمراجعة فقط ولا يمكن سحبها من هنا.
          </span>
        </v-alert>

        <v-alert
          v-else-if="selectedPermissions.length > 0"
          type="success"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mb-3"
          icon="ri-checkbox-circle-line"
        >
          <span class="text-caption">
            لديك <strong>{{ selectedPermissions.length }}</strong> صلاحية مباشرة مخصصة لهذا المستخدم.
          </span>
        </v-alert>

        <!-- Permission groups -->
        <div v-if="Object.keys(filteredPermissions).length" class="upm-groups">
          <div
            v-for="(group, groupKey) in filteredPermissions"
            :key="groupKey"
            class="upm-group"
          >
            <!-- Group header -->
            <div class="upm-group__hd" @click="toggleGroupOpen(groupKey)">
              <div class="d-flex align-center gap-2">
                <div class="upm-group-icon">
                  <v-icon :icon="getGroupIcon(groupKey)" size="16" color="primary" />
                </div>
                <div>
                  <div class="text-body-2 font-weight-bold">{{ fixLabel(group.name?.label) || groupKey }}</div>
                  <div class="text-caption text-grey">{{ countGroupPerms(group) }} صلاحية</div>
                </div>
              </div>

              <div class="d-flex align-center gap-2">
                <v-btn
                  size="x-small"
                  :color="allDirectInGroupSelected(group) ? 'grey' : 'primary'"
                  variant="tonal"
                  rounded="lg"
                  class="font-weight-bold"
                  @click.stop="toggleGroup(group)"
                >
                  {{ allDirectInGroupSelected(group) ? 'إلغاء الكل' : 'تحديد الكل' }}
                </v-btn>

                <v-chip
                  v-if="countSelectedInGroup(group) > 0"
                  size="x-small"
                  color="primary"
                  variant="tonal"
                >
                  {{ countSelectedInGroup(group) }}
                </v-chip>

                <v-icon
                  :icon="openGroups.includes(groupKey) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
                  size="18"
                  color="grey"
                />
              </div>
            </div>

            <!-- Group body -->
            <v-expand-transition>
              <div v-if="openGroups.includes(groupKey)" class="upm-group__bd">
                <template v-for="(perm, pKey) in group" :key="pKey">
                  <div
                    v-if="pKey !== 'name' && perm && typeof perm === 'object' && (expertMode || !isPermissionInherited(perm.key))"
                    class="upm-perm-row"
                    :class="{
                      'upm-perm-row--inherited': isPermissionInherited(perm.key),
                      'upm-perm-row--on': selectedPermissions.includes(perm.key)
                    }"
                    @click="!isPermissionInherited(perm.key) && togglePermission(perm.key)"
                  >
                    <div
                      class="upm-cb"
                      :class="{
                        'upm-cb--on': selectedPermissions.includes(perm.key),
                        'upm-cb--inherited': isPermissionInherited(perm.key)
                      }"
                    >
                      <v-icon
                        v-if="selectedPermissions.includes(perm.key) || isPermissionInherited(perm.key)"
                        icon="ri-check-line"
                        size="11"
                        color="white"
                      />
                    </div>

                    <div class="flex-grow-1 min-w-0">
                      <div class="d-flex align-center flex-wrap gap-1">
                        <span
                          class="text-body-2"
                          :class="isPermissionInherited(perm.key) ? 'text-grey-darken-1' : 'font-weight-medium'"
                        >{{ fixLabel(perm.label) }}</span>
                        <v-chip
                          v-if="isPermissionInherited(perm.key)"
                          size="x-small"
                          color="info"
                          variant="tonal"
                        >
                          <v-icon start icon="ri-shield-user-line" size="10" />
                          موروثة
                        </v-chip>
                      </div>
                      <div class="upm-perm-key">{{ perm.key }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </v-expand-transition>
          </div>
        </div>

        <!-- Empty search -->
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
// مدير الأدوار والصلاحيات الفردية لمستخدم محدد ضمن نطاق شركة
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '../store/user.store';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { userService } from '@/api';

const props = defineProps({
  user: { type: Object, required: true },
});
const emit = defineEmits(['save', 'cancel']);

const store       = useUserStore();
const globalStore = useGlobalUserStore();

const loading             = ref(false);
const tab                 = ref('roles');
const expertMode          = ref(false);
const permissionSearch    = ref('');
const selectedRoles       = ref([]);
const selectedPermissions = ref([]);
const originalRoles       = ref([]);
const originalPermissions = ref([]);
const selectedSyncCompanyId = ref(null);
const openGroups            = ref([]);

// ── إصلاح ترميز النص العربي المكسور ─────────────────
const fixLabel = (str) => {
  if (!str || typeof str !== 'string') return str;
  try {
    // نحول bytes اللاتينية المخطوئة إلى UTF-8 صحيح
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
};

// ── التبويبات ────────────────────────────────────────
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

// ── كشف التغييرات ─────────────────────────────────────
const hasChanges = computed(() => {
  const rChanged = selectedRoles.value.length !== originalRoles.value.length ||
                   selectedRoles.value.some(r => !originalRoles.value.includes(r));
  const pChanged = selectedPermissions.value.length !== originalPermissions.value.length ||
                   selectedPermissions.value.some(p => !originalPermissions.value.includes(p));
  return rChanged || pChanged;
});

// ── تهيئة ─────────────────────────────────────────────
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

    openGroups.value = Object.keys(store.availablePermissions ?? {});
  } finally {
    store.loading = false;
  }
});

// ── مراقبة تغيير الشركة ───────────────────────────────
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
  } catch (e) {
    console.error('Failed to load user roles:', e);
  } finally {
    loading.value = false;
  }
});

// ── منطق الأدوار ──────────────────────────────────────
const isRoleSelected = name => selectedRoles.value.includes(name);
const toggleRole = name => {
  const i = selectedRoles.value.indexOf(name);
  if (i > -1) selectedRoles.value.splice(i, 1);
  else         selectedRoles.value.push(name);
};
const getRoleIcon = name => {
  const map = { admin:'ri-admin-line', manager:'ri-briefcase-line',
    accountant:'ri-calculator-line', cashier:'ri-money-dollar-circle-line',
    sales:'ri-store-2-line', warehouse:'ri-home-gear-line',
    customer:'ri-user-heart-line', viewer:'ri-eye-line' };
  const lower = (name || '').toLowerCase();
  for (const [k, icon] of Object.entries(map)) { if (lower.includes(k)) return icon; }
  return 'ri-shield-user-line';
};

// ── منطق الصلاحيات ───────────────────────────────────
const inheritedPermissions = computed(() => {
  const s = new Set();
  selectedRoles.value.forEach(roleName => {
    store.roles.find(x => x.name === roleName)?.permissions?.forEach(p => s.add(p));
  });
  return s;
});
const isPermissionInherited = key => inheritedPermissions.value.has(key);
const togglePermission = key => {
  if (isPermissionInherited(key)) return;
  const i = selectedPermissions.value.indexOf(key);
  if (i > -1) selectedPermissions.value.splice(i, 1);
  else         selectedPermissions.value.push(key);
};
const toggleGroupOpen = key => {
  const i = openGroups.value.indexOf(key);
  if (i > -1) openGroups.value.splice(i, 1);
  else         openGroups.value.push(key);
};

const filteredPermissions = computed(() => {
  const out   = {};
  const query = permissionSearch.value.toLowerCase().trim();
  let src = store.availablePermissions;
  if (Array.isArray(src) && src.length === 1 && !src[0].name) src = src[0];
  if (!src || typeof src !== 'object') return out;

  Object.entries(src).forEach(([gKey, group]) => {
    if (!group?.name) return;
    const fg = { name: group.name };
    let hit  = false;
    const gLabel = fixLabel(group.name?.label)?.toLowerCase() || '';
    const groupMatch = !query || gLabel.includes(query);

    Object.entries(group).forEach(([pKey, p]) => {
      if (pKey === 'name' || !p || typeof p !== 'object') return;
      const pLabel = fixLabel(p.label)?.toLowerCase() || '';
      const match  = !query || groupMatch || pLabel.includes(query) || p.key?.toLowerCase().includes(query);
      if (match) { fg[pKey] = p; hit = true; }
    });
    if (hit) out[gKey] = fg;
  });
  return out;
});

const countGroupPerms          = g => Object.keys(g).filter(k => k !== 'name').length;
const countSelectedInGroup     = g => Object.entries(g)
  .filter(([k, p]) => k !== 'name' && p?.key &&
    (selectedPermissions.value.includes(p.key) || isPermissionInherited(p.key))).length;
const allDirectInGroupSelected = g => {
  const perms = Object.entries(g).filter(([k,p])=>k!=='name'&&p?.key&&!isPermissionInherited(p.key)).map(([,p])=>p.key);
  return perms.length > 0 && perms.every(p => selectedPermissions.value.includes(p));
};
const toggleGroup = g => {
  const perms  = Object.entries(g).filter(([k,p])=>k!=='name'&&p?.key&&!isPermissionInherited(p.key)).map(([,p])=>p.key);
  const allSel = allDirectInGroupSelected(g);
  perms.forEach(p => {
    const i = selectedPermissions.value.indexOf(p);
    if (allSel) { if (i > -1) selectedPermissions.value.splice(i, 1); }
    else         { if (i === -1) selectedPermissions.value.push(p); }
  });
};
const getGroupIcon = key => ({
  admin:'ri-admin-line', companies:'ri-community-line', users:'ri-user-settings-line',
  warehouses:'ri-home-gear-line', products:'ri-box-3-line', invoices:'ri-file-list-3-line',
  transactions:'ri-hand-coin-line', cash_boxes:'ri-safe-2-line', reports:'ri-bar-chart-2-line',
  balance:'ri-scales-line', settings:'ri-settings-3-line', roles:'ri-shield-user-line',
  profits:'ri-funds-line', stocks:'ri-stack-line', installments:'ri-calendar-todo-line',
  payments:'ri-money-dollar-circle-line', customers:'ri-user-heart-line', exports:'ri-download-2-line',
})[key] || 'ri-folder-keyhole-line';

// ── حفظ ──────────────────────────────────────────────
const handleSave = async () => {
  loading.value = true;
  try {
    await store.updateUser(props.user.id, {
      roles:           selectedRoles.value,
      permissions:     selectedPermissions.value,
      sync_company_id: selectedSyncCompanyId.value,
    });
    emit('save');
  } catch (e) {
    console.error('Failed to update permissions:', e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ══════════════════════════════════════════════════════
   المكوّن — بدون overflow خاص به
   الـ Dialog يملك سكرول واحد، نحن لا نضيف سكرولاً ثانياً
══════════════════════════════════════════════════════ */
.upm-root {
  display: block;
  background: #f8fafc;
  min-height: 500px;
}

/* ══════════════════════════════════════════════════════
   Sticky Header — يبقى ثابتاً بينما يسكرول v-card-text
   position:sticky يعمل داخل الـ scroll container للـ dialog
══════════════════════════════════════════════════════ */
.upm-sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  /* shadow خفيف يدل على أنه ثابت */
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* صف الشركة + الأزرار */
.upm-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 12px;
}

/* إحصاء صغير */
.upm-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.6;
}
.upm-stat-pill--roles { background: rgba(var(--v-theme-primary), 0.1); color: rgb(var(--v-theme-primary)); }
.upm-stat-pill--perms { background: rgba(var(--v-theme-secondary), 0.1); color: rgb(var(--v-theme-secondary)); }

/* صف التبويبات */
.upm-tabs-row {
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 2px;
  background: white;
  border-top: 1px solid #f1f5f9;
}
.upm-tab {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-family: inherit;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  position: relative;
  bottom: -1px;
  transition: color .2s, border-color .2s;
}
.upm-tab:hover    { color: rgb(var(--v-theme-primary)); }
.upm-tab--active  {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  border-bottom-color: rgb(var(--v-theme-primary));
}
.upm-tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  color: white;
  font-size: 0.62rem; font-weight: 700;
  margin-inline-start: 5px;
}

/* ══════════════════════════════════════════════════════
   Body — بدون سكرول خاص
══════════════════════════════════════════════════════ */
.upm-body {
  padding: 16px;
  /* NO overflow-y — الـ dialog يسكرول */
}

.upm-center {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
}

/* ══════════════════════════════════════════════════════
   Roles
══════════════════════════════════════════════════════ */
.upm-role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.upm-role-card {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .2s;
  display: flex; flex-direction: column;
}
.upm-role-card:hover {
  border-color: rgba(var(--v-theme-primary), .4);
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), .1);
  transform: translateY(-2px);
}
.upm-role-card--on {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), .03);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), .12);
}
.upm-role-card__top {
  display: flex; justify-content: space-between; align-items: flex-start;
}
.upm-role-icon {
  width:40px; height:40px; border-radius:10px;
  background: rgba(var(--v-theme-primary),.09);
  display:flex; align-items:center; justify-content:center;
}
.upm-check-ring {
  width:22px; height:22px; border-radius:50%;
  border: 2px solid #d1d5db;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition: background .2s, border-color .2s; background:white;
}
.upm-check-ring--on { background: rgb(var(--v-theme-primary)); border-color: rgb(var(--v-theme-primary)); }
.upm-role-card__foot { margin-top: auto; }
.upm-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2; line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

/* ══════════════════════════════════════════════════════
   Permissions toolbar
══════════════════════════════════════════════════════ */
.upm-perm-toolbar {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 14px; flex-wrap: nowrap;
}
.upm-search-field { flex: 1; min-width: 0; }
.upm-expert-label {
  display: flex; align-items: center; flex-shrink: 0;
  white-space: nowrap; cursor: pointer;
}

/* ══════════════════════════════════════════════════════
   Permission groups
══════════════════════════════════════════════════════ */
.upm-groups { display: flex; flex-direction: column; gap: 8px; }
.upm-group  { background:#fff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; }
.upm-group__hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 14px; cursor:pointer; gap:10px;
  transition: background .15s;
}
.upm-group__hd:hover { background:#f8fafc; }
.upm-group-icon {
  width:32px; height:32px; border-radius:8px;
  background: rgba(var(--v-theme-primary),.08);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.upm-group__bd { border-top:1px solid #f1f5f9; }

/* Permission row */
.upm-perm-row {
  display:flex; align-items:center; gap:12px;
  padding:9px 14px; cursor:pointer; border-bottom:1px solid #f8fafc;
  transition: background .15s;
}
.upm-perm-row:last-child { border-bottom:none; }
.upm-perm-row:hover:not(.upm-perm-row--inherited) { background: rgba(var(--v-theme-primary),.03); }
.upm-perm-row--on       { background: rgba(var(--v-theme-primary),.04); }
.upm-perm-row--inherited{ background: rgba(var(--v-theme-info),.02); cursor:default; }

/* Custom checkbox */
.upm-cb {
  width:18px; height:18px; border-radius:5px; border:2px solid #d1d5db;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:all .15s; background:white;
}
.upm-cb--on       { background: rgb(var(--v-theme-primary)); border-color: rgb(var(--v-theme-primary)); }
.upm-cb--inherited{ background: rgb(var(--v-theme-info));    border-color: rgb(var(--v-theme-info)); opacity:.75; }

/* permission key monospace */
.upm-perm-key {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.68rem;
  color: #9ca3af;
  margin-top: 1px;
}

/* ══════════════════════════════════════════════════════
   Responsive
══════════════════════════════════════════════════════ */
@media (max-width: 600px) {
  .upm-root { background: white; }
  .upm-top-row { padding: 8px 12px; gap: 6px; }
  .upm-tabs-row { padding: 0 12px; }
  .upm-body { padding: 12px; }
  .upm-role-grid { grid-template-columns: repeat(auto-fill, minmax(145px,1fr)); gap:8px; }
  .upm-perm-toolbar { flex-wrap: wrap; }
  .upm-expert-label { width: 100%; justify-content: space-between; }
  .upm-stat-pill { display: none; }
}
</style>
