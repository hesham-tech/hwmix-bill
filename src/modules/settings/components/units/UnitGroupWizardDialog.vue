<template>
  <v-dialog v-model="model" max-width="700" persistent scrollable>
    <v-card class="rounded-xl">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3">
        <div class="d-flex align-center gap-3">
          <v-avatar color="primary" size="40" rounded="lg">
            <v-icon icon="ri-stack-line" size="20" color="white" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">إضافة مجموعة وحدات جديدة</div>
            <div class="text-caption text-medium-emphasis">الخطوة {{ step }} من 3</div>
          </div>
        </div>
        <v-btn icon="ri-close-line" variant="text" @click="handleClose" />
      </v-card-title>

      <!-- Stepper -->
      <div class="px-6 py-4">
        <div class="d-flex align-center justify-space-between position-relative" style="height: 56px;">
          <!-- خلفية الخط الواصل -->
          <div class="position-absolute w-100" style="height: 2px; background-color: rgba(var(--v-border-color), 0.12); top: 50%; transform: translateY(-50%); z-index: 0; left: 0; right: 0;"></div>
          <!-- خط التقدم الملون -->
          <div class="position-absolute" :style="{ height: '2px', backgroundColor: 'rgb(var(--v-theme-primary))', top: '50%', transform: 'translateY(-50%)', zIndex: 0, width: progressWidth, right: 0, left: 'auto', transition: 'width 0.3s ease' }"></div>

          <div v-for="n in 3" :key="n" class="d-flex flex-column align-center position-relative" style="z-index: 1; width: 80px;">
            <v-avatar
              :color="step >= n ? 'primary' : 'grey-lighten-4'"
              :class="{ 'text-white': step >= n, 'text-grey-darken-1': step < n }"
              size="32"
              class="font-weight-bold elevation-1 border"
              :style="{ borderColor: step >= n ? 'rgb(var(--v-theme-primary))' : 'rgba(var(--v-border-color), 0.12)', transition: 'all 0.3s ease' }"
            >
              <v-icon v-if="step > n" icon="ri-check-line" size="16" />
              <span v-else class="text-caption">{{ n }}</span>
            </v-avatar>
            <span class="text-caption font-weight-bold mt-1 text-no-wrap" :class="step >= n ? 'text-primary' : 'text-medium-emphasis'" style="transition: color 0.3s ease;">
              {{ stepTitles[n-1] }}
            </span>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- محتوى الخطوات -->
      <v-card-text class="pa-5" style="min-height:360px">

        <!-- ======= الخطوة 1: بيانات المجموعة ======= -->
        <template v-if="step === 1">
          <!-- خيار طريقة الإنشاء بطاقات كرتية متميزة -->
          <v-row class="mb-5">
            <v-col cols="12" sm="6">
              <v-card
                class="selector-card rounded-xl cursor-pointer pa-4 border d-flex align-start gap-4 h-100"
                :class="{ 'border-primary elevation-2': !useTemplate, 'bg-grey-lighten-5': useTemplate }"
                variant="outlined"
                @click="useTemplate = false"
              >
                <v-avatar color="primary" variant="tonal" rounded="lg" size="48">
                  <v-icon icon="ri-add-circle-line" size="24" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold" :class="{ 'text-primary': !useTemplate }">إنشاء مجموعة</div>
                  <div class="text-caption text-medium-emphasis mt-1">ابدأ من الصفر وقم بإضافة الوحدات وقواعد التحويل يدوياً بما يناسب نشاطك.</div>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card
                class="selector-card rounded-xl cursor-pointer pa-4 border d-flex align-start gap-4 h-100"
                :class="{ 'border-primary elevation-2': useTemplate, 'bg-grey-lighten-5': !useTemplate }"
                variant="outlined"
                @click="useTemplate = true"
              >
                <v-avatar color="secondary" variant="tonal" rounded="lg" size="48">
                  <v-icon icon="ri-file-copy-line" size="24" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold" :class="{ 'text-secondary': useTemplate }">نسخ مجموعة جاهزة</div>
                  <div class="text-caption text-medium-emphasis mt-1">اختر من القوالب الافتراضية للنظام (أوزان، أطوال، أحجام...) واختصر الوقت.</div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- اختيار Template -->
          <template v-if="useTemplate">
            <div v-if="loadingTemplates" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="40" />
            </div>
            <v-row v-else class="gy-3">
              <v-col v-for="tpl in templates" :key="tpl.id" cols="12" sm="6" md="4">
                <v-card
                  class="template-card rounded-xl cursor-pointer pa-4 border d-flex flex-column justify-center align-center text-center h-100"
                  :class="{ 'border-primary bg-primary-lighten-5': selectedTemplate?.id === tpl.id }"
                  variant="outlined"
                  @click="applyTemplate(tpl)"
                >
                  <v-avatar :color="typeMap[tpl.type]?.color ?? 'grey'" variant="tonal" size="48" class="mb-3">
                    <v-icon :icon="typeMap[tpl.type]?.icon ?? 'ri-stack-line'" size="24" />
                  </v-avatar>
                  <div class="text-subtitle-2 font-weight-bold mb-1">{{ tpl.name }}</div>
                  <div class="text-caption text-medium-emphasis lh-sm" :title="tpl.units?.map(u => u.name).join(' · ')">
                    {{ tpl.units?.map(u => u.name).join(' · ') }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-divider class="my-4" />
          </template>

          <!-- حقول بيانات المجموعة (الإنشاء اليدوي فقط) -->
          <v-form v-if="!useTemplate" ref="step1FormRef" class="mt-6 mx-auto" style="max-width: 500px;">
            <div class="text-subtitle-2 font-weight-bold mb-2">اسم مجموعة الوحدات الجديدة</div>
            <v-text-field
              v-model="form.name"
              placeholder="مثال: وحدات التعبئة والتغليف الخاصة، وحدات الأمتار"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="ri-edit-box-line"
              clearable
              :rules="[rules.required]"
              class="rounded-xl"
            />
          </v-form>
        </template>

        <!-- ======= الخطوة 2: الوحدات ======= -->
        <template v-if="step === 2">
          <!-- اسم المجموعة لتأكيد أو تعديل التسمية -->
          <v-text-field
            v-model="form.name"
            label="اسم مجموعة الوحدات *"
            variant="outlined"
            density="compact"
            class="mb-4"
            placeholder="مثال: وحدات الوزن"
            :rules="[rules.required]"
            hide-details="auto"
          />

          <!-- Form إضافة وحدة -->
          <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-3">إضافة وحدة جديدة</div>
            <v-form ref="unitFormRef">
              <v-row dense>
                <v-col cols="12" sm="5">
                  <v-text-field
                    v-model="unitDraft.name"
                    label="الاسم *"
                    variant="outlined"
                    density="compact"
                    placeholder="مثال: كيلوجرام"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model="unitDraft.code"
                    label="الرمز *"
                    variant="outlined"
                    density="compact"
                    placeholder="kg"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" sm="2">
                  <v-text-field
                    v-model.number="unitDraft.decimal_places"
                    type="number"
                    label="كسور"
                    variant="outlined"
                    density="compact"
                    min="0"
                    max="6"
                    :rules="[rules.integer]"
                  />
                </v-col>
                <v-col cols="12" sm="2" class="d-flex align-center">
                  <v-btn color="primary" variant="flat" rounded="lg" size="small"
                    prepend-icon="ri-add-line" @click="addUnit">
                    إضافة
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>

          <!-- قائمة الوحدات المضافة -->
          <div class="text-caption font-weight-bold text-medium-emphasis mb-2">
            الوحدات المضافة ({{ form.units.length }})
          </div>
          <div v-if="!form.units.length" class="text-center py-6 text-disabled text-caption">
            <v-icon icon="ri-inbox-line" size="32" class="d-block mb-2" />
            لم تُضف وحدات بعد
          </div>
          <v-list v-else density="compact" rounded="lg" variant="outlined" class="pa-1">
            <v-list-item
              v-for="unit in form.units"
              :key="unit.temp_uuid"
              :title="unit.name"
              :subtitle="`${unit.code} · ${unit.decimal_places} خانات عشرية`"
              rounded="lg"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="32" rounded>
                  <v-icon icon="ri-scales-3-line" size="16" />
                </v-avatar>
              </template>
              <template #append>
                <v-btn icon="ri-delete-bin-line" variant="text" color="error" size="x-small"
                  @click="removeUnit(unit.temp_uuid)" />
              </template>
            </v-list-item>
          </v-list>
        </template>

        <!-- ======= الخطوة 3: التحويلات (اختيارية) ======= -->
        <template v-if="step === 3">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <div class="text-subtitle-2 font-weight-bold">قواعد التحويل</div>
              <div class="text-caption text-medium-emphasis">اختياري — يمكن إضافتها لاحقاً</div>
            </div>
          </div>

          <!-- Form إضافة تحويل -->
          <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
            <v-form ref="convFormRef">
              <v-row dense align="center">
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="convDraft.from_unit_temp_uuid"
                    :items="form.units"
                    item-title="name"
                    item-value="temp_uuid"
                    label="من *"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" sm="1" class="text-center">
                  <v-icon icon="ri-arrow-left-right-line" color="grey" />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="convDraft.to_unit_temp_uuid"
                    :items="form.units"
                    item-title="name"
                    item-value="temp_uuid"
                    label="إلى *"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required, rules.differentUnit]"
                  />
                </v-col>
                <v-col cols="12" sm="2">
                  <v-text-field
                    v-model.number="convDraft.factor"
                    type="number"
                    step="0.000001"
                    label="المعامل *"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required, rules.positive]"
                  />
                </v-col>
                <v-col cols="12" sm="1" class="d-flex justify-center">
                  <v-btn icon="ri-add-line" color="primary" variant="flat" size="small" rounded
                    @click="addConversion" />
                </v-col>
              </v-row>
            </v-form>
          </v-card>

          <!-- معاينة التحويلات -->
          <div v-if="!form.conversions.length" class="text-center py-4 text-disabled text-caption">
            <v-icon icon="ri-shuffle-line" size="28" class="d-block mb-1" />
            لا توجد تحويلات — يمكن الإنهاء بدونها
          </div>
          <v-list v-else density="compact" rounded="lg" variant="outlined" class="pa-1">
            <v-list-item
              v-for="(conv, i) in form.conversions"
              :key="i"
              rounded="lg"
            >
              <template #title>
                <span class="font-weight-medium">
                  1 {{ unitName(conv.from_unit_temp_uuid) }}
                  <v-icon icon="ri-arrow-left-right-line" size="14" class="mx-1 text-grey" />
                  {{ conv.factor }} {{ unitName(conv.to_unit_temp_uuid) }}
                </span>
              </template>
              <template #append>
                <v-btn icon="ri-delete-bin-line" variant="text" color="error" size="x-small"
                  @click="removeConversion(i)" />
              </template>
            </v-list-item>
          </v-list>
        </template>

      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-4 gap-2">
        <v-btn variant="text" color="grey" @click="step > 1 ? step-- : handleClose()">
          {{ step > 1 ? 'السابق' : 'إلغاء' }}
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="step < 3"
          color="primary"
          variant="flat"
          rounded="lg"
          :disabled="step === 2 && !form.units.length"
          @click="nextStep"
        >
          التالي
          <v-icon icon="ri-arrow-left-line" end />
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="flat"
          rounded="lg"
          :loading="saving"
          prepend-icon="ri-check-line"
          @click="submit"
        >
          إنهاء وحفظ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useApi } from '@/composables/useApi';

const uuidv4 = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'uuid-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
};

const model  = defineModel({ type: Boolean });
const emit   = defineEmits(['saved']);

const apiBuild     = useApi('unit-groups/build');
const apiTemplates = useApi('unit-groups/templates');

// خطوة الـ Wizard
const step = ref(1);
const stepTitles = ['بيانات المجموعة', 'الوحدات', 'التحويلات'];
const progressWidth = computed(() => `${(step.value - 1) * 50}%`);

// بيانات النموذج الكاملة — تُرسَل دفعة واحدة عند الإنهاء
const form = reactive({
  name:        '',
  type:        'custom',
  units:       [],      // [{ temp_uuid, name, code, decimal_places, is_active }]
  conversions: [],      // [{ from_unit_temp_uuid, to_unit_temp_uuid, factor }]
});

// Templates
const useTemplate      = ref(false);
const selectedTemplate = ref(null);
const templates        = ref([]);
const loadingTemplates = ref(false);

// Draft للوحدة الجديدة
const unitDraft = reactive({ name: '', code: '', decimal_places: 0 });
// Draft للتحويل الجديد
const convDraft = reactive({ from_unit_temp_uuid: null, to_unit_temp_uuid: null, factor: 1 });

const saving = ref(false);

// Form refs
const step1FormRef = ref(null);
const unitFormRef  = ref(null);
const convFormRef  = ref(null);

const groupTypes = [
  { label: 'وزن وكتلة', value: 'weight' },
  { label: 'طول ومسافة', value: 'length' },
  { label: 'حجم وسعة',   value: 'volume' },
  { label: 'مساحة',      value: 'area'   },
  { label: 'عد وتعبئة',  value: 'count'  },
  { label: 'مخصص',       value: 'custom' },
];

const typeMap = {
  weight: { icon: 'ri-scales-3-line',   color: 'blue-darken-2'   },
  length: { icon: 'ri-ruler-line',      color: 'green-darken-2'  },
  volume: { icon: 'ri-drop-line',       color: 'cyan-darken-2'   },
  area:   { icon: 'ri-map-2-line',      color: 'teal-darken-2'   },
  count:  { icon: 'ri-stack-line',      color: 'orange-darken-2' },
  custom: { icon: 'ri-settings-3-line', color: 'purple-darken-2' },
};

const rules = {
  required:      v  => (v !== null && v !== undefined && String(v).trim() !== '') || 'مطلوب',
  integer:       v  => Number.isInteger(Number(v)) || 'عدد صحيح',
  positive:      v  => Number(v) > 0 || 'يجب أن يكون أكبر من صفر',
  differentUnit: v  => v !== convDraft.from_unit_temp_uuid || 'يجب اختيار وحدة مختلفة',
};

// تحميل Templates عند التبديل لوضع Template
watch(useTemplate, async (val) => {
  if (val && !templates.value.length) {
    loadingTemplates.value = true;
    try {
      const res = await apiTemplates.get();
      templates.value = res.data ?? res;
    } finally {
      loadingTemplates.value = false;
    }
  }
});

// تطبيق Template على النموذج
const applyTemplate = (tpl) => {
  selectedTemplate.value = tpl;
  form.name = tpl.name;
  form.type = tpl.type;

  // نسخ الوحدات مع إنشاء temp_uuid لكل وحدة
  const uuidMap = {};
  form.units = (tpl.units ?? []).map(u => {
    const tmp = uuidv4();
    uuidMap[u.id] = tmp;
    return { temp_uuid: tmp, name: u.name, code: u.code, decimal_places: u.decimal_places ?? 0, is_active: true };
  });

  // نسخ التحويلات مع استبدال IDs بـ temp_uuid
  form.conversions = (tpl.conversions ?? []).map(c => ({
    from_unit_temp_uuid: uuidMap[c.from_unit_id],
    to_unit_temp_uuid:   uuidMap[c.to_unit_id],
    factor:              c.factor,
  })).filter(c => c.from_unit_temp_uuid && c.to_unit_temp_uuid);

  // الانتقال التلقائي للخطوة الثانية
  step.value = 2;
};

// الانتقال للخطوة التالية مع validation
const nextStep = async () => {
  if (step.value === 1) {
    if (!useTemplate.value) {
      const { valid } = await step1FormRef.value?.validate() ?? { valid: false };
      if (!valid) return;
    } else {
      if (!selectedTemplate.value) return;
    }
  } else if (step.value === 2) {
    if (!form.name || String(form.name).trim() === '') {
      return;
    }
  }
  step.value++;
};

// إضافة وحدة للمصفوفة
const addUnit = async () => {
  const { valid } = await unitFormRef.value?.validate() ?? { valid: false };
  if (!valid) return;
  form.units.push({
    temp_uuid:      uuidv4(),
    name:           unitDraft.name,
    code:           unitDraft.code,
    decimal_places: unitDraft.decimal_places ?? 0,
    is_active:      true,
  });
  Object.assign(unitDraft, { name: '', code: '', decimal_places: 0 });
  unitFormRef.value?.reset();
};

const removeUnit = (uuid) => {
  form.units       = form.units.filter(u => u.temp_uuid !== uuid);
  form.conversions = form.conversions.filter(
    c => c.from_unit_temp_uuid !== uuid && c.to_unit_temp_uuid !== uuid
  );
};

// إضافة تحويل للمصفوفة
const addConversion = async () => {
  const { valid } = await convFormRef.value?.validate() ?? { valid: false };
  if (!valid) return;
  form.conversions.push({
    from_unit_temp_uuid: convDraft.from_unit_temp_uuid,
    to_unit_temp_uuid:   convDraft.to_unit_temp_uuid,
    factor:              convDraft.factor,
  });
  Object.assign(convDraft, { from_unit_temp_uuid: null, to_unit_temp_uuid: null, factor: 1 });
  convFormRef.value?.reset();
};

const removeConversion = (index) => {
  form.conversions.splice(index, 1);
};

// اسم الوحدة بالـ temp_uuid
const unitName = (uuid) => form.units.find(u => u.temp_uuid === uuid)?.name ?? uuid;

// إرسال كل البيانات دفعة واحدة
const submit = async () => {
  saving.value = true;
  try {
    await apiBuild.create({ ...form }, { successMessage: 'تم إنشاء مجموعة الوحدات بنجاح.' });
    emit('saved');
    handleClose();
  } finally {
    saving.value = false;
  }
};

const handleClose = () => {
  model.value = false;
  // reset بعد animation الإغلاق
  setTimeout(resetForm, 300);
};

const resetForm = () => {
  step.value = 1;
  useTemplate.value = false;
  selectedTemplate.value = null;
  Object.assign(form, { name: '', type: 'custom', units: [], conversions: [] });
  Object.assign(unitDraft, { name: '', code: '', decimal_places: 0 });
  Object.assign(convDraft, { from_unit_temp_uuid: null, to_unit_temp_uuid: null, factor: 1 });
};
</script>

<style scoped>
.selector-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-width: 1.5px !important;
}
.selector-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.template-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-width: 1.5px !important;
}
.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}
.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}
.bg-primary-lighten-5 {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
.flex-1 { flex: 1; }
</style>
