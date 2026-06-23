<template>
  <v-navigation-drawer
    v-model="model"
    location="left"
    width="480"
    temporary
    class="unit-detail-drawer"
  >
    <template v-if="group">
      <!-- Header الـ Drawer -->
      <div class="drawer-header pa-5 d-flex align-center gap-3">
        <v-avatar :color="typeColor" size="42" rounded="lg">
          <v-icon :icon="typeIcon" size="22" color="white" />
        </v-avatar>
        <div class="flex-grow-1 min-width-0">
          <div class="text-subtitle-1 font-weight-bold text-truncate">{{ group.name }}</div>
        </div>
        <div class="d-flex gap-1">
          <!-- تعديل بيانات المجموعة -->
          <v-btn icon="ri-edit-line" variant="text" size="small" @click="editGroupDialog = true" />
          <!-- حذف المجموعة -->
          <v-btn icon="ri-delete-bin-line" variant="text" size="small" color="error"
            :disabled="isSystemGroup" @click="deleteGroupDialog = true" />
          <v-btn icon="ri-close-line" variant="text" size="small" @click="model = false" />
        </div>
      </div>

      <v-divider />

      <div class="overflow-y-auto" style="height: calc(100vh - 75px)">

        <!-- ======= قسم الوحدات ======= -->
        <div class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="text-subtitle-2 font-weight-bold">
              <v-icon icon="ri-stack-line" size="16" class="me-1" />
              الوحدات ({{ group.units?.length ?? 0 }})
            </div>
            <v-btn
              v-if="!isSystemGroup"
              size="small"
              color="primary"
              variant="tonal"
              prepend-icon="ri-add-line"
              rounded="lg"
              @click="openAddUnitDialog"
            >
              إضافة وحدة
            </v-btn>
          </div>

          <div v-if="!group.units?.length" class="text-center py-4 text-disabled text-caption">
            لا توجد وحدات مضافة
          </div>

          <v-list v-else density="compact" rounded="lg" variant="outlined" class="pa-1 mb-2">
            <v-list-item
              v-for="unit in group.units"
              :key="unit.id"
              :title="unit.name"
              rounded="lg"
            >
              <template #subtitle>
                <span class="text-caption">{{ unit.code }} · {{ unit.decimal_places }} خانة عشرية</span>
                <v-chip v-if="!unit.is_active" size="x-small" color="error" variant="tonal" class="ms-2">
                  معطّل
                </v-chip>
              </template>
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="30" rounded>
                  <v-icon icon="ri-scales-3-line" size="14" />
                </v-avatar>
              </template>
              <template #append>
                <div class="d-flex gap-1" v-if="!isSystemGroup">
                  <v-btn icon="ri-edit-line" variant="text" size="x-small"
                    @click="openEditUnitDialog(unit)" />
                  <v-btn icon="ri-delete-bin-line" variant="text" size="x-small" color="error"
                    @click="openDeleteUnitDialog(unit)" />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <v-divider />

        <!-- ======= قسم التحويلات ======= -->
        <div class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="text-subtitle-2 font-weight-bold">
              <v-icon icon="ri-shuffle-line" size="16" class="me-1" />
              التحويلات ({{ group.conversions?.length ?? 0 }})
            </div>
            <v-btn
              v-if="!isSystemGroup"
              size="small"
              color="secondary"
              variant="tonal"
              prepend-icon="ri-add-line"
              rounded="lg"
              @click="openAddConversionDialog"
            >
              إضافة تحويل
            </v-btn>
          </div>

          <div v-if="!group.conversions?.length" class="text-center py-4 text-disabled text-caption">
            لا توجد قواعد تحويل
          </div>

          <v-list v-else density="compact" rounded="lg" variant="outlined" class="pa-1">
            <v-list-item
              v-for="conv in group.conversions"
              :key="conv.id"
              rounded="lg"
            >
              <template #title>
                <span class="text-body-2 font-weight-medium">
                  1 {{ conv.from_unit?.name }}
                  <v-icon icon="ri-arrow-left-right-line" size="14" class="mx-1 text-grey" />
                  {{ conv.factor }} {{ conv.to_unit?.name }}
                </span>
              </template>
              <template #append>
                <div class="d-flex gap-1" v-if="!isSystemGroup">
                  <v-btn icon="ri-edit-line" variant="text" size="x-small"
                    @click="openEditConversionDialog(conv)" />
                  <v-btn icon="ri-delete-bin-line" variant="text" size="x-small" color="error"
                    @click="openDeleteConversionDialog(conv)" />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </template>

    <!-- ======= Dialogs ======= -->

    <!-- تعديل بيانات المجموعة -->
    <v-dialog v-model="editGroupDialog" max-width="420" persistent>
      <v-card class="rounded-xl pa-5">
        <div class="text-subtitle-1 font-weight-bold mb-4">تعديل بيانات المجموعة</div>
        <v-form ref="editGroupFormRef">
          <v-text-field v-model="editGroupForm.name" label="الاسم *" variant="outlined"
            density="compact" :rules="[rules.required]" />
        </v-form>
        <div class="d-flex justify-end gap-2 mt-4">
          <v-btn variant="text" @click="editGroupDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" :loading="savingGroup"
            @click="saveGroupEdit">
            حفظ
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- إضافة / تعديل وحدة -->
    <v-dialog v-model="unitDialog" max-width="440" persistent>
      <v-card class="rounded-xl pa-5">
        <div class="text-subtitle-1 font-weight-bold mb-4">
          {{ editingUnit ? 'تعديل وحدة' : 'إضافة وحدة جديدة' }}
        </div>
        <v-form ref="unitFormRef">
          <v-text-field v-model="unitForm.name" label="الاسم *" variant="outlined"
            density="compact" :rules="[rules.required]" class="mb-3" />
          <v-text-field v-model="unitForm.code" label="الرمز *" variant="outlined"
            density="compact" :rules="[rules.required]" class="mb-3" />
          <v-text-field v-model.number="unitForm.decimal_places" type="number" label="الخانات العشرية"
            variant="outlined" density="compact" min="0" max="6" class="mb-3" />
          <v-switch v-model="unitForm.is_active" label="الوحدة نشطة" color="primary" density="compact"
            inset />
        </v-form>
        <div class="d-flex justify-end gap-2 mt-4">
          <v-btn variant="text" @click="unitDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" :loading="savingUnit" @click="saveUnit">
            {{ editingUnit ? 'تحديث' : 'إضافة' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- إضافة / تعديل تحويل -->
    <v-dialog v-model="conversionDialog" max-width="460" persistent>
      <v-card class="rounded-xl pa-5">
        <div class="text-subtitle-1 font-weight-bold mb-4">
          {{ editingConversion ? 'تعديل قاعدة تحويل' : 'إضافة قاعدة تحويل' }}
        </div>
        <v-form ref="convFormRef">
          <v-select v-model="convForm.from_unit_id" :items="group?.units ?? []" item-title="name"
            item-value="id" label="من وحدة *" variant="outlined" density="compact"
            :rules="[rules.required]" class="mb-3" />
          <v-select v-model="convForm.to_unit_id" :items="group?.units ?? []" item-title="name"
            item-value="id" label="إلى وحدة *" variant="outlined" density="compact"
            :rules="[rules.required]" class="mb-3" />
          <v-text-field v-model.number="convForm.factor" type="number" step="0.000001"
            label="معامل التحويل *" variant="outlined" density="compact"
            :rules="[rules.required, rules.positive]" />
        </v-form>
        <div class="d-flex justify-end gap-2 mt-4">
          <v-btn variant="text" @click="conversionDialog = false">إلغاء</v-btn>
          <v-btn color="secondary" variant="flat" rounded="lg" :loading="savingConversion"
            @click="saveConversion">
            {{ editingConversion ? 'تحديث' : 'إضافة' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- تأكيد حذف الوحدة -->
    <v-dialog v-model="deleteUnitDialog" max-width="380">
      <v-card class="rounded-xl pa-5">
        <div class="d-flex align-center gap-3 mb-4">
          <v-avatar color="error" variant="tonal" size="40" rounded>
            <v-icon icon="ri-delete-bin-line" color="error" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">حذف وحدة</div>
        </div>
        <p class="text-body-2 mb-4">
          هل تريد حذف الوحدة <strong>{{ targetUnit?.name }}</strong>؟
          إذا كانت مستخدمة في منتجات أو فواتير سيتم تعطيلها بدلاً من حذفها.
        </p>
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="deleteUnitDialog = false">إلغاء</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deletingUnit"
            @click="confirmDeleteUnit">
            تأكيد الحذف
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- تأكيد حذف التحويل -->
    <v-dialog v-model="deleteConversionDialog" max-width="380">
      <v-card class="rounded-xl pa-5">
        <div class="d-flex align-center gap-3 mb-4">
          <v-avatar color="error" variant="tonal" size="40" rounded>
            <v-icon icon="ri-delete-bin-line" color="error" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">حذف قاعدة تحويل</div>
        </div>
        <p class="text-body-2 mb-4">
          هل تريد حذف قاعدة التحويل؟ لا يمكن التراجع عن هذه العملية.
        </p>
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="deleteConversionDialog = false">إلغاء</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deletingConversion"
            @click="confirmDeleteConversion">
            تأكيد الحذف
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- تأكيد حذف المجموعة -->
    <v-dialog v-model="deleteGroupDialog" max-width="380">
      <v-card class="rounded-xl pa-5">
        <div class="d-flex align-center gap-3 mb-4">
          <v-avatar color="error" variant="tonal" size="40" rounded>
            <v-icon icon="ri-delete-bin-line" color="error" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">حذف مجموعة وحدات</div>
        </div>
        <p class="text-body-2 mb-4">
          هل تريد حذف مجموعة <strong>{{ group?.name }}</strong>؟
          يجب حذف جميع الوحدات أولاً.
        </p>
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="deleteGroupDialog = false">إلغاء</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deletingGroup"
            @click="confirmDeleteGroup">
            تأكيد الحذف
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useApi } from '@/composables/useApi';

const model = defineModel({ type: Boolean });
const props = defineProps({
  group: { type: Object, default: null },
});
const emit = defineEmits(['updated', 'deleted']);

const apiUnits       = useApi('units');
const apiConversions = useApi('unit-conversions');
const apiGroups      = useApi('unit-groups');

const isSystemGroup = computed(() => props.group?.company_id === null);

const typeMap = {
  weight: { label: 'وزن وكتلة', icon: 'ri-scales-3-line',   color: 'blue-darken-2'  },
  length: { label: 'طول ومسافة', icon: 'ri-ruler-line',      color: 'green-darken-2' },
  volume: { label: 'حجم وسعة',   icon: 'ri-drop-line',       color: 'cyan-darken-2'  },
  area:   { label: 'مساحة',      icon: 'ri-map-2-line',      color: 'teal-darken-2'  },
  count:  { label: 'عد وتعبئة',  icon: 'ri-stack-line',      color: 'orange-darken-2'},
  custom: { label: 'مخصص',       icon: 'ri-settings-3-line', color: 'purple-darken-2'},
};
const typeLabel = computed(() => typeMap[props.group?.type]?.label ?? '');
const typeIcon  = computed(() => typeMap[props.group?.type]?.icon  ?? 'ri-stack-line');
const typeColor = computed(() => typeMap[props.group?.type]?.color ?? 'grey-darken-2');

const groupTypes = [
  { label: 'وزن وكتلة', value: 'weight' },
  { label: 'طول ومسافة', value: 'length' },
  { label: 'حجم وسعة',   value: 'volume' },
  { label: 'مساحة',      value: 'area'   },
  { label: 'عد وتعبئة',  value: 'count'  },
  { label: 'مخصص',       value: 'custom' },
];

const rules = {
  required: v => !!v || 'مطلوب',
  positive: v => Number(v) > 0 || 'يجب أن يكون أكبر من صفر',
};

// === تعديل بيانات المجموعة ===
const editGroupDialog  = ref(false);
const savingGroup      = ref(false);
const editGroupFormRef = ref(null);
const editGroupForm    = reactive({ name: '', type: 'count' });

watch(editGroupDialog, (val) => {
  if (val && props.group) {
    editGroupForm.name = props.group.name;
    editGroupForm.type = props.group.type;
  }
});

const saveGroupEdit = async () => {
  const { valid } = await editGroupFormRef.value?.validate() ?? { valid: false };
  if (!valid) return;
  savingGroup.value = true;
  try {
    await apiGroups.update(props.group.id, { ...editGroupForm });
    emit('updated');
    editGroupDialog.value = false;
  } finally {
    savingGroup.value = false;
  }
};

// === إضافة / تعديل وحدة ===
const unitDialog    = ref(false);
const savingUnit    = ref(false);
const unitFormRef   = ref(null);
const editingUnit   = ref(null);
const unitForm      = reactive({ name: '', code: '', decimal_places: 0, is_active: true });

const openAddUnitDialog = () => {
  editingUnit.value = null;
  Object.assign(unitForm, { name: '', code: '', decimal_places: 0, is_active: true });
  unitDialog.value = true;
};
const openEditUnitDialog = (unit) => {
  editingUnit.value = unit;
  Object.assign(unitForm, { name: unit.name, code: unit.code, decimal_places: unit.decimal_places, is_active: unit.is_active });
  unitDialog.value = true;
};

const saveUnit = async () => {
  const { valid } = await unitFormRef.value?.validate() ?? { valid: false };
  if (!valid) return;
  savingUnit.value = true;
  try {
    if (editingUnit.value) {
      await apiUnits.update(editingUnit.value.id, { ...unitForm });
    } else {
      await apiGroups.request('POST', `${props.group.id}/units`, { ...unitForm });
    }
    emit('updated');
    unitDialog.value = false;
  } finally {
    savingUnit.value = false;
  }
};

// === حذف وحدة ===
const deleteUnitDialog = ref(false);
const deletingUnit     = ref(false);
const targetUnit       = ref(null);

const openDeleteUnitDialog = (unit) => {
  targetUnit.value     = unit;
  deleteUnitDialog.value = true;
};

const confirmDeleteUnit = async () => {
  deletingUnit.value = true;
  try {
    await apiUnits.remove(targetUnit.value.id);
    emit('updated');
    deleteUnitDialog.value = false;
  } finally {
    deletingUnit.value = false;
  }
};

// === إضافة / تعديل تحويل ===
const conversionDialog  = ref(false);
const savingConversion  = ref(false);
const convFormRef       = ref(null);
const editingConversion = ref(null);
const convForm          = reactive({ from_unit_id: null, to_unit_id: null, factor: 1 });

const openAddConversionDialog = () => {
  editingConversion.value = null;
  Object.assign(convForm, { from_unit_id: null, to_unit_id: null, factor: 1 });
  conversionDialog.value = true;
};
const openEditConversionDialog = (conv) => {
  editingConversion.value = conv;
  Object.assign(convForm, { from_unit_id: conv.from_unit_id, to_unit_id: conv.to_unit_id, factor: conv.factor });
  conversionDialog.value = true;
};

const saveConversion = async () => {
  const { valid } = await convFormRef.value?.validate() ?? { valid: false };
  if (!valid) return;
  savingConversion.value = true;
  try {
    if (editingConversion.value) {
      await apiConversions.update(editingConversion.value.id, { ...convForm });
    } else {
      await apiGroups.request('POST', `${props.group.id}/conversions`, { ...convForm });
    }
    emit('updated');
    conversionDialog.value = false;
  } finally {
    savingConversion.value = false;
  }
};

// === حذف تحويل ===
const deleteConversionDialog = ref(false);
const deletingConversion     = ref(false);
const targetConversion       = ref(null);

const openDeleteConversionDialog = (conv) => {
  targetConversion.value      = conv;
  deleteConversionDialog.value = true;
};

const confirmDeleteConversion = async () => {
  deletingConversion.value = true;
  try {
    await apiConversions.remove(targetConversion.value.id);
    emit('updated');
    deleteConversionDialog.value = false;
  } finally {
    deletingConversion.value = false;
  }
};

// === حذف المجموعة كاملة ===
const deleteGroupDialog = ref(false);
const deletingGroup     = ref(false);

const confirmDeleteGroup = async () => {
  deletingGroup.value = true;
  try {
    await apiGroups.remove(props.group.id);
    emit('deleted');
    model.value = false;
    deleteGroupDialog.value = false;
  } finally {
    deletingGroup.value = false;
  }
};
</script>

<style scoped>
.unit-detail-drawer { border-left: 1px solid rgba(var(--v-border-color), 0.15); }
.drawer-header { background: rgba(var(--v-theme-surface-variant), 0.5); }
.min-width-0 { min-width: 0; }
</style>
