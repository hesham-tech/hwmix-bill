<template>
  <div class="units-page pa-6">
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold primary--text mb-1 d-flex align-center">
          <v-icon icon="ri-scales-3-line" class="me-3" color="primary" />
          وحدات القياس
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">إدارة مجموعات وحدات القياس، الوحدات الفردية، وقواعد التحويل الرياضي للمنتجات</p>
      </div>
    </div>

    <!-- Tabs Menu -->
    <v-card class="elevation-1 border mb-6 rounded-lg">
      <v-tabs v-model="activeTab" bg-color="transparent" color="primary" grow>
        <v-tab value="units" class="font-weight-bold">
          <v-icon icon="ri-grid-fill" class="me-2" />
          الوحدات الفردية
        </v-tab>
        <v-tab value="groups" class="font-weight-bold">
          <v-icon icon="ri-stack-fill" class="me-2" />
          مجموعات القياس
        </v-tab>
        <v-tab value="conversions" class="font-weight-bold">
          <v-icon icon="ri-shuffle-line" class="me-2" />
          قواعد التحويل
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Tabs Window -->
    <v-window v-model="activeTab">
      <!-- Tab 1: Units -->
      <v-window-item value="units">
        <v-card class="elevation-1 border rounded-lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <v-text-field
              v-model="searchUnit"
              placeholder="البحث عن وحدة..."
              prepend-inner-icon="ri-search-line"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 350px"
              class="rounded-lg"
            />
            <AppButton prepend-icon="ri-add-line" color="primary" size="small" @click="openAddUnit">
              وحدة جديدة
            </AppButton>
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="unitHeaders"
            :items="filteredUnits"
            :loading="loadingUnits"
            loading-text="جاري تحميل وحدات القياس..."
            no-data-text="لا توجد وحدات قياس مضافة بعد."
            class="modern-table"
          >
            <template #[`item.group`]="{ item }">
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.group?.name || 'غير محدد' }}
              </v-chip>
            </template>

            <template #[`item.is_active`]="{ item }">
              <div class="d-flex align-center">
                <AppSwitch
                  :model-value="!!item.is_active"
                  :loading="togglingUnitId === item.id"
                  @update:model-value="toggleUnitStatus(item)"
                />
                <span :class="item.is_active ? 'text-success' : 'text-error'" class="text-caption ms-2 font-weight-bold">
                  {{ item.is_active ? 'نشط' : 'معطل' }}
                </span>
              </div>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex align-center justify-end">
                <v-btn icon="ri-pencil-line" variant="text" color="primary" size="small" @click="openEditUnit(item)" />
                <v-btn icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="confirmDeleteUnit(item)" />
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- Tab 2: Groups -->
      <v-window-item value="groups">
        <v-card class="elevation-1 border rounded-lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <v-text-field
              v-model="searchGroup"
              placeholder="البحث عن مجموعة..."
              prepend-inner-icon="ri-search-line"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 350px"
              class="rounded-lg"
            />
            <AppButton prepend-icon="ri-add-line" color="primary" size="small" @click="openAddGroup">
              مجموعة جديدة
            </AppButton>
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="groupHeaders"
            :items="filteredGroups"
            :loading="loadingGroups"
            loading-text="جاري تحميل المجموعات..."
            no-data-text="لا توجد مجموعات قياس مضافة بعد."
            class="modern-table"
          >
            <template #[`item.type`]="{ item }">
              <v-chip size="small" color="secondary" variant="outlined">
                {{ getGroupTypeLabel(item.type) }}
              </v-chip>
            </template>

            <template #[`item.units`]="{ item }">
              <div class="d-flex flex-wrap gap-1 py-1">
                <v-chip v-for="unit in item.units" :key="unit.id" size="x-small" variant="flat" color="grey-lighten-3">
                  {{ unit.name }} ({{ unit.code }})
                </v-chip>
                <span v-if="!item.units?.length" class="text-caption text-grey">لا توجد وحدات</span>
              </div>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex align-center justify-end">
                <v-btn icon="ri-pencil-line" variant="text" color="primary" size="small" @click="openEditGroup(item)" />
                <v-btn icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="confirmDeleteGroup(item)" />
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- Tab 3: Conversions -->
      <v-window-item value="conversions">
        <v-card class="elevation-1 border rounded-lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <v-text-field
              v-model="searchConversion"
              placeholder="البحث عن قاعدة تحويل..."
              prepend-inner-icon="ri-search-line"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 350px"
              class="rounded-lg"
            />
            <AppButton prepend-icon="ri-add-line" color="primary" size="small" @click="openAddConversion">
              قاعدة تحويل جديدة
            </AppButton>
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="conversionHeaders"
            :items="filteredConversions"
            :loading="loadingConversions"
            loading-text="جاري تحميل قواعد التحويل..."
            no-data-text="لا توجد قواعد تحويل مضافة بعد."
            class="modern-table"
          >
            <template #[`item.group`]="{ item }">
              {{ item.group?.name }}
            </template>

            <template #[`item.conversion`]="{ item }">
              <div class="d-flex align-center font-weight-medium">
                1 {{ item.from_unit?.name }}
                <v-icon icon="ri-arrow-left-right-line" size="14" class="mx-2 text-grey" />
                {{ Number(item.factor).toLocaleString(undefined, { maximumFractionDigits: 6 }) }} {{ item.to_unit?.name }}
              </div>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex align-center justify-end">
                <v-btn icon="ri-pencil-line" variant="text" color="primary" size="small" @click="openEditConversion(item)" />
                <v-btn icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="confirmDeleteConversion(item)" />
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Unit Form Dialog -->
    <AppDialog
      v-model="showUnitDialog"
      :title="editingUnit ? 'تعديل وحدة قياس' : 'إضافة وحدة قياس جديدة'"
      icon="ri-scales-3-line"
      :loading="savingUnit"
      max-width="500"
      @confirm="saveUnit"
    >
      <v-form ref="unitFormRef" @submit.prevent="saveUnit">
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="unitForm.unit_group_id"
              label="مجموعة القياس *"
              :items="groups"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <AppInput v-model="unitForm.name" label="الاسم العربي *" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" sm="6">
            <AppInput v-model="unitForm.code" label="الرمز الرياضي / الكود *" placeholder="مثال: kg, pcs" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" sm="6">
            <AppInput v-model.number="unitForm.decimal_places" type="number" label="الكسور العشرية المسموحة *" min="0" max="6" :rules="[rules.required, rules.integer]" />
          </v-col>
          <v-col cols="12" sm="6" class="d-flex align-center">
            <v-checkbox v-model="unitForm.is_active" label="الوحدة نشطة ومتاحة للاستخدام" hide-details />
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Group Form Dialog -->
    <AppDialog
      v-model="showGroupDialog"
      :title="editingGroup ? 'تعديل مجموعة قياس' : 'إضافة مجموعة قياس جديدة'"
      icon="ri-stack-line"
      :loading="savingGroup"
      max-width="500"
      @confirm="saveGroup"
    >
      <v-form ref="groupFormRef" @submit.prevent="saveGroup">
        <v-row>
          <v-col cols="12">
            <AppInput v-model="groupForm.name" label="اسم المجموعة *" placeholder="مثال: وحدات الوزن" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="groupForm.type"
              label="نوع القياس الفعلي *"
              :items="groupTypes"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
            />
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Conversion Form Dialog -->
    <AppDialog
      v-model="showConversionDialog"
      :title="editingConversion ? 'تعديل قاعدة تحويل' : 'إضافة قاعدة تحويل جديدة'"
      icon="ri-shuffle-line"
      :loading="savingConversion"
      max-width="500"
      @confirm="saveConversion"
    >
      <v-form ref="conversionFormRef" @submit.prevent="saveConversion">
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="conversionForm.unit_group_id"
              label="مجموعة القياس *"
              :items="groups"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
              :disabled="editingConversion"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="conversionForm.from_unit_id"
              label="من الوحدة *"
              :items="availableUnitsInSelectedGroup"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
              :disabled="editingConversion"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="conversionForm.to_unit_id"
              label="إلى الوحدة *"
              :items="availableUnitsInSelectedGroup"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              :rules="[rules.required, rules.differentThanFrom]"
              :disabled="editingConversion"
            />
          </v-col>
          <v-col cols="12">
            <AppInput
              v-model.number="conversionForm.factor"
              type="number"
              step="0.000001"
              label="معامل التحويل (الضربي) *"
              placeholder="مثال: 1000 (لتحويل الكيلوجرام إلى جرام)"
              :rules="[rules.required, rules.positiveNumber]"
            />
            <div class="text-caption text-grey mt-1">
              ملاحظة: 1 من (الوحدة الأولى) = معامل التحويل × (الوحدة الثانية).
            </div>
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card class="rounded-lg pa-4 text-center">
        <v-card-text>
          <v-avatar color="error-lighten-5" size="72" class="mb-4">
            <v-icon icon="ri-delete-bin-7-line" color="error" size="36" />
          </v-avatar>
          <h3 class="text-h6 font-weight-bold mb-2">تأكيد الحذف</h3>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
        </v-card-text>
        <v-card-actions class="justify-center gap-2">
          <AppButton color="grey" variant="tonal" size="small" @click="showDeleteDialog = false">إلغاء</AppButton>
          <AppButton color="error" size="small" :loading="deleting" @click="confirmDelete">نعم، احذف</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';

// APIs
const apiUnits = useApi('units');
const apiGroups = useApi('unit-groups');
const apiConversions = useApi('unit-conversions');

// Active Tab
const activeTab = ref('units');

// Data Lists
const units = ref([]);
const groups = ref([]);
const conversions = ref([]);

// Loadings
const loadingUnits = ref(false);
const loadingGroups = ref(false);
const loadingConversions = ref(false);
const togglingUnitId = ref(null);

// Searches
const searchUnit = ref('');
const searchGroup = ref('');
const searchConversion = ref('');

// Dialogs State
const showUnitDialog = ref(false);
const editingUnit = ref(false);
const unitForm = ref({ id: null, unit_group_id: null, name: '', code: '', decimal_places: 0, is_active: true });
const unitFormRef = ref(null);
const savingUnit = ref(false);

const showGroupDialog = ref(false);
const editingGroup = ref(false);
const groupForm = ref({ id: null, name: '', type: 'count' });
const groupFormRef = ref(null);
const savingGroup = ref(false);

const showConversionDialog = ref(false);
const editingConversion = ref(false);
const conversionForm = ref({ id: null, unit_group_id: null, from_unit_id: null, to_unit_id: null, factor: 1 });
const conversionFormRef = ref(null);
const savingConversion = ref(false);

// Deletions
const showDeleteDialog = ref(false);
const deletingType = ref(null); // 'unit' | 'group' | 'conversion'
const itemToDelete = ref(null);
const deleting = ref(false);

// Constants
const groupTypes = [
  { label: 'وزن وكتلة (Weight)', value: 'weight' },
  { label: 'طول ومسافة (Length)', value: 'length' },
  { label: 'حجم وسعة (Volume)', value: 'volume' },
  { label: 'مساحة (Area)', value: 'area' },
  { label: 'عد وتعبئة (Count)', value: 'count' },
  { label: 'مخصص (Custom)', value: 'custom' },
];

const unitHeaders = [
  { title: 'الاسم', key: 'name', sortable: true },
  { title: 'الرمز', key: 'code', sortable: true },
  { title: 'مجموعة القياس', key: 'group', sortable: true },
  { title: 'الكسور العشرية', key: 'decimal_places', align: 'center', sortable: true },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الخيارات', key: 'actions', sortable: false, align: 'end' },
];

const groupHeaders = [
  { title: 'المجموعة', key: 'name', sortable: true },
  { title: 'النوع', key: 'type', sortable: true },
  { title: 'الوحدات المندرجة', key: 'units', sortable: false },
  { title: 'الخيارات', key: 'actions', sortable: false, align: 'end' },
];

const conversionHeaders = [
  { title: 'المجموعة', key: 'group', sortable: true },
  { title: 'قاعدة التحويل', key: 'conversion', sortable: false },
  { title: 'الخيارات', key: 'actions', sortable: false, align: 'end' },
];

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
  integer: v => Number.isInteger(Number(v)) || 'يجب إدخال عدد صحيح',
  positiveNumber: v => Number(v) > 0 || 'يجب أن يكون الرقم أكبر من صفر',
  differentThanFrom: v => !v || v !== conversionForm.value.from_unit_id || 'يجب اختيار وحدة مختلفة عن وحدة المصدر',
};

// Translate helpers
const getGroupTypeLabel = type => {
  const t = groupTypes.find(gt => gt.value === type);
  return t ? t.label.split(' (')[0] : type;
};

// Computed Filters
const filteredUnits = computed(() => {
  if (!searchUnit.value) return units.value;
  const s = searchUnit.value.toLowerCase();
  return units.value.filter(u =>
    u.name?.toLowerCase().includes(s) ||
    u.code?.toLowerCase().includes(s) ||
    u.group?.name?.toLowerCase().includes(s)
  );
});

const filteredGroups = computed(() => {
  if (!searchGroup.value) return groups.value;
  const s = searchGroup.value.toLowerCase();
  return groups.value.filter(g =>
    g.name?.toLowerCase().includes(s) ||
    getGroupTypeLabel(g.type).toLowerCase().includes(s)
  );
});

const filteredConversions = computed(() => {
  if (!searchConversion.value) return conversions.value;
  const s = searchConversion.value.toLowerCase();
  return conversions.value.filter(c =>
    c.group?.name?.toLowerCase().includes(s) ||
    c.from_unit?.name?.toLowerCase().includes(s) ||
    c.to_unit?.name?.toLowerCase().includes(s)
  );
});

const availableUnitsInSelectedGroup = computed(() => {
  if (!conversionForm.value.unit_group_id) return [];
  return units.value.filter(u => u.unit_group_id === conversionForm.value.unit_group_id);
});

// Load Data
const loadUnits = async () => {
  loadingUnits.value = true;
  try {
    const res = await apiUnits.get({ with_inactive: true });
    units.value = res.data || res;
  } finally {
    loadingUnits.value = false;
  }
};

const loadGroups = async () => {
  loadingGroups.value = true;
  try {
    const res = await apiGroups.get();
    groups.value = res.data || res;
  } finally {
    loadingGroups.value = false;
  }
};

const loadConversions = async () => {
  loadingConversions.value = true;
  try {
    const res = await apiConversions.get();
    conversions.value = res.data || res;
  } finally {
    loadingConversions.value = false;
  }
};

const loadAllData = () => {
  loadGroups();
  loadUnits();
  loadConversions();
};

onMounted(() => {
  loadAllData();
});

// Watch tab switches to reload if needed
watch(activeTab, (newTab) => {
  if (newTab === 'units') loadUnits();
  if (newTab === 'groups') loadGroups();
  if (newTab === 'conversions') loadConversions();
});

// Watch group change in conversion form to reset selected units
watch(() => conversionForm.value.unit_group_id, () => {
  if (!editingConversion.value) {
    conversionForm.value.from_unit_id = null;
    conversionForm.value.to_unit_id = null;
  }
});

// Toggle Unit Active Status
const toggleUnitStatus = async item => {
  togglingUnitId.value = item.id;
  try {
    const nextState = !item.is_active;
    await apiUnits.update(item.id, { is_active: nextState }, { showSuccess: true, successMessage: 'تم تعديل حالة النشاط بنجاح.' });
    item.is_active = nextState;
  } finally {
    togglingUnitId.value = null;
  }
};

// Unit Actions
const openAddUnit = () => {
  editingUnit.value = false;
  unitForm.value = { id: null, unit_group_id: groups.value[0]?.id || null, name: '', code: '', decimal_places: 0, is_active: true };
  showUnitDialog.value = true;
};

const openEditUnit = item => {
  editingUnit.value = true;
  unitForm.value = {
    id: item.id,
    unit_group_id: item.unit_group_id,
    name: item.name,
    code: item.code,
    decimal_places: item.decimal_places,
    is_active: !!item.is_active,
  };
  showUnitDialog.value = true;
};

const saveUnit = async () => {
  if (!unitFormRef.value) return;
  const { valid } = await unitFormRef.value.validate();
  if (!valid) return;

  savingUnit.value = true;
  try {
    if (editingUnit.value) {
      await apiUnits.update(unitForm.value.id, unitForm.value, { successMessage: 'تم تحديث وحدة القياس بنجاح.' });
    } else {
      await apiUnits.create(unitForm.value, { successMessage: 'تم إضافة وحدة القياس بنجاح.' });
    }
    showUnitDialog.value = false;
    loadUnits();
  } finally {
    savingUnit.value = false;
  }
};

const confirmDeleteUnit = item => {
  deletingType.value = 'unit';
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

// Group Actions
const openAddGroup = () => {
  editingGroup.value = false;
  groupForm.value = { id: null, name: '', type: 'count' };
  showGroupDialog.value = true;
};

const openEditGroup = item => {
  editingGroup.value = true;
  groupForm.value = {
    id: item.id,
    name: item.name,
    type: item.type,
  };
  showGroupDialog.value = true;
};

const saveGroup = async () => {
  if (!groupFormRef.value) return;
  const { valid } = await groupFormRef.value.validate();
  if (!valid) return;

  savingGroup.value = true;
  try {
    if (editingGroup.value) {
      await apiGroups.update(groupForm.value.id, groupForm.value, { successMessage: 'تم تحديث مجموعة القياس بنجاح.' });
    } else {
      await apiGroups.create(groupForm.value, { successMessage: 'تم إضافة مجموعة القياس بنجاح.' });
    }
    showGroupDialog.value = false;
    loadGroups();
  } finally {
    savingGroup.value = false;
  }
};

const confirmDeleteGroup = item => {
  deletingType.value = 'group';
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

// Conversion Actions
const openAddConversion = () => {
  editingConversion.value = false;
  conversionForm.value = { id: null, unit_group_id: groups.value[0]?.id || null, from_unit_id: null, to_unit_id: null, factor: 1 };
  showConversionDialog.value = true;
};

const openEditConversion = item => {
  editingConversion.value = true;
  conversionForm.value = {
    id: item.id,
    unit_group_id: item.unit_group_id,
    from_unit_id: item.from_unit_id,
    to_unit_id: item.to_unit_id,
    factor: Number(item.factor),
  };
  showConversionDialog.value = true;
};

const saveConversion = async () => {
  if (!conversionFormRef.value) return;
  const { valid } = await conversionFormRef.value.validate();
  if (!valid) return;

  savingConversion.value = true;
  try {
    if (editingConversion.value) {
      await apiConversions.update(conversionForm.value.id, conversionForm.value, { successMessage: 'تم تحديث قاعدة التحويل بنجاح.' });
    } else {
      await apiConversions.create(conversionForm.value, { successMessage: 'تم حفظ قاعدة التحويل بنجاح.' });
    }
    showConversionDialog.value = false;
    loadConversions();
  } finally {
    savingConversion.value = false;
  }
};

const confirmDeleteConversion = item => {
  deletingType.value = 'conversion';
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

// General Delete Confirmation
const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    if (deletingType.value === 'unit') {
      await apiUnits.remove(itemToDelete.value.id, { successMessage: 'تم حذف وحدة القياس بنجاح.' });
      loadUnits();
    } else if (deletingType.value === 'group') {
      await apiGroups.remove(itemToDelete.value.id, { successMessage: 'تم حذف مجموعة القياس بنجاح.' });
      loadGroups();
    } else if (deletingType.value === 'conversion') {
      await apiConversions.remove(itemToDelete.value.id, { successMessage: 'تم حذف قاعدة التحويل بنجاح.' });
      loadConversions();
    }
    showDeleteDialog.value = false;
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.units-page {
  max-width: 1400px;
  margin: 0 auto;
}

.modern-table :deep(.v-data-table-header) {
  background-color: #f8fafc !important;
}

.modern-table :deep(.v-data-table-header th) {
  font-weight: 700 !important;
  color: #334155 !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>
