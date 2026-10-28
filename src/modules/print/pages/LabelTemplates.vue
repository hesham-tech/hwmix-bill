<template>
  <section>
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold">قوالب الملصقات</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">صمّم ملصقات شركتك، راجع المسودة ثم انشرها لتصبح متاحة للطباعة.</p>
      </div>
      <v-btn v-if="permissions.manage" color="primary" prepend-icon="ri-add-line" @click="openCreate">إنشاء قالب</v-btn>
    </div>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }} <v-btn variant="text" @click="load">إعادة المحاولة</v-btn></v-alert>
    <div class="d-flex ga-3 align-center mb-4 flex-wrap">
      <v-text-field
        v-model="search"
        label="بحث باسم القالب"
        prepend-inner-icon="ri-search-line"
        density="compact"
        hide-details
        style="max-width: 340px"
      />
      <v-switch v-if="permissions.manage" v-model="includeArchived" label="إظهار المؤرشف" density="compact" hide-details @update:model-value="load" />
      <v-spacer /><v-btn variant="text" icon="ri-refresh-line" aria-label="تحديث القوالب" :loading="loading" @click="load" />
    </div>
    <v-progress-linear v-if="loading" indeterminate class="mb-4" />
    <v-row>
      <v-col v-for="template in filtered" :key="template.id" cols="12" sm="6" lg="4" xl="3">
        <v-card class="h-100" :class="{ 'default-template': template.is_default }">
          <TemplatePreview v-if="designFor(template)" :design="designFor(template)" :max-height="200" />
          <v-card-title class="text-wrap text-subtitle-1 font-weight-bold">{{ template.name }}</v-card-title>
          <v-card-text>
            <p v-if="template.description" class="text-body-2 mb-3">{{ template.description }}</p>
            <div class="d-flex ga-2 flex-wrap mb-3">
              <v-chip v-if="template.is_default" size="small" color="primary" prepend-icon="ri-star-fill">الافتراضي</v-chip>
              <v-chip v-if="template.archived" size="small" color="grey" prepend-icon="ri-archive-line">مؤرشف</v-chip>
              <v-chip v-else-if="template.published" size="small" color="success" prepend-icon="ri-checkbox-circle-line"
                >منشور · {{ template.published.version }}</v-chip
              >
              <v-chip v-if="template.has_draft" size="small" color="warning" prepend-icon="ri-edit-line">مسودة بتغييرات</v-chip>
            </div>
            <span v-if="designFor(template)">{{ designFor(template).widthMm }} × {{ designFor(template).heightMm }} مم</span>
            <div class="text-caption text-medium-emphasis mt-1">
              {{
                template.has_draft && template.published ? 'المعاينة تعرض النسخة المنشورة؛ المسودة لا تؤثر في الطباعة.' : 'قالب خاص بالشركة الحالية'
              }}
            </div>
          </v-card-text>
          <v-card-actions class="flex-wrap ga-1">
            <v-btn
              v-if="(permissions.manage || permissions.publish) && !template.archived"
              variant="text"
              color="primary"
              :to="`/app/label-templates/${template.id}/edit`"
              >{{ permissions.manage ? 'تعديل التصميم' : 'مراجعة ونشر' }}</v-btn
            >
            <v-btn v-if="!template.archived && (permissions.manage || permissions.set_default)" variant="text" @click="metadataTarget = template"
              >بيانات القالب</v-btn
            >
            <v-spacer />
            <v-menu
              ><template #activator="{ props }"><v-btn v-bind="props" icon="ri-more-2-fill" variant="text" aria-label="إجراءات القالب" /></template
              ><v-list>
                <v-list-item v-if="permissions.manage" title="نسخ القالب" prepend-icon="ri-file-copy-line" @click="openDuplicate(template)" />
                <v-list-item
                  v-if="permissions.set_default && template.published && !template.archived && !template.is_default"
                  title="تعيين افتراضي للشركة"
                  prepend-icon="ri-star-line"
                  @click="makeDefault(template)"
                />
                <v-list-item
                  v-if="permissions.manage && !template.archived"
                  title="أرشفة القالب"
                  prepend-icon="ri-archive-line"
                  @click="archiveTarget = template"
                /> </v-list
            ></v-menu>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-card v-if="!loading && !error && !filtered.length" class="pa-10 text-center mt-4"
      ><v-icon icon="ri-layout-line" size="48" color="primary" />
      <p class="my-3">لا توجد قوالب مطابقة. ابدأ بإنشاء قالب للشركة.</p></v-card
    >
    <TemplateMetadataDialog :target="metadataTarget" :permissions="permissions" @close="metadataTarget = null" @saved="metadataSaved" />
    <v-dialog :model-value="creationOpen" max-width="500" :persistent="busy" @update:model-value="!$event && closeCreation()"
      ><v-card :title="copySource ? 'نسخ القالب' : 'إنشاء قالب'">
        <v-card-text
          ><v-text-field v-model="creationName" label="اسم القالب" autofocus maxlength="150" />
          <template v-if="!copySource"
            ><v-select
              v-model="creationHeight"
              :items="[
                { title: '50 × 60 مم', value: 60 },
                { title: '50 × 30 مم', value: 30 },
                { title: '50 × 20 مم', value: 20 },
              ]"
              label="المقاس الابتدائي"
            /><v-select
              v-model="starter"
              :items="[
                { title: 'تصميم قياسي جاهز للتعديل', value: 'standard' },
                { title: 'ملصق فارغ', value: 'blank' },
              ]"
              label="نقطة البداية"
            />
            <p class="text-caption">يمكنك تعديل المقاس والعناصر لاحقًا من المحرر.</p></template
          >
          <v-checkbox v-else v-model="openAfterCopy" label="فتح تصميم النسخة بعد الحفظ" /><v-alert
            v-if="creationError"
            type="error"
            variant="tonal"
            >{{ creationError }}</v-alert
          ></v-card-text
        >
        <v-card-actions
          ><v-spacer /><v-btn :disabled="busy" @click="closeCreation">إلغاء</v-btn
          ><v-btn color="primary" :loading="busy" :disabled="!creationName.trim()" @click="createOrCopy">{{
            copySource ? 'حفظ النسخة' : 'إنشاء وفتح المحرر'
          }}</v-btn></v-card-actions
        >
      </v-card></v-dialog
    >
    <v-dialog v-model="discardCreation" max-width="420"
      ><v-card title="تجاهل بيانات غير محفوظة؟"
        ><v-card-text>لم يُنشأ القالب بعد. يمكنك العودة لإكمال بياناته.</v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn @click="discardCreation = false">العودة للتعديل</v-btn
          ><v-btn
            color="error"
            @click="
              discardCreation = false;
              creationOpen = false;
            "
            >تجاهل</v-btn
          ></v-card-actions
        ></v-card
      ></v-dialog
    >
    <v-dialog :model-value="!!archiveTarget" max-width="480" @update:model-value="!$event && (archiveTarget = null)">
      <v-card title="أرشفة القالب"
        ><v-card-text>
          <p class="mb-4">سيختفي القالب من اختيارات الطباعة، وتبقى نسخه محفوظة للرجوع إليها.</p>
          <v-select
            v-if="archiveTarget?.is_default"
            v-model="replacementId"
            :items="templates.filter(t => t.id !== archiveTarget.id && t.published && !t.archived)"
            item-title="name"
            item-value="id"
            label="اختر قالبًا افتراضيًا بديلًا"
          />
          <v-alert v-if="archiveError" type="error" variant="tonal">{{ archiveError }}</v-alert> </v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn @click="archiveTarget = null">إلغاء</v-btn
          ><v-btn color="error" :loading="busy" :disabled="archiveTarget?.is_default && !replacementId" @click="archive">أرشفة</v-btn></v-card-actions
        ></v-card
      >
    </v-dialog>
  </section>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { labelTemplateService as api, labelError } from '../templates-editor/labelTemplate.service';
import TemplatePreview from '../components/TemplatePreview.vue';
import TemplateMetadataDialog from '../components/TemplateMetadataDialog.vue';
import { createStarterDesign } from '../templates-editor/templateSchema';
const user = useUserStore(),
  router = useRouter(),
  templates = ref([]),
  permissions = ref({}),
  search = ref(''),
  includeArchived = ref(false),
  loading = ref(false),
  busy = ref(false),
  error = ref(''),
  archiveTarget = ref(null),
  replacementId = ref(null),
  archiveError = ref('');
let ticket = 0;
const filtered = computed(() => templates.value.filter(t => t.name.includes(search.value.trim())));
const designFor = t => t.published?.design || t.draft?.design;
async function load() {
  const current = ++ticket;
  templates.value = [];
  error.value = '';
  loading.value = true;
  try {
    const [list, meta] = await Promise.all([api.list(false, includeArchived.value), api.fields()]);
    if (current !== ticket) return;
    templates.value = list.data;
    permissions.value = meta.permissions;
  } catch (e) {
    if (current === ticket) error.value = labelError(e);
  } finally {
    if (current === ticket) loading.value = false;
  }
}
const creationInitial = ref(''),
  discardCreation = ref(false);
const metadataTarget = ref(null),
  creationOpen = ref(false),
  copySource = ref(null),
  creationName = ref(''),
  creationHeight = ref(60),
  starter = ref('standard'),
  openAfterCopy = ref(false),
  creationError = ref('');
function openCreate() {
  copySource.value = null;
  creationName.value = 'قالب ملصقات جديد';
  creationHeight.value = 60;
  starter.value = 'standard';
  creationError.value = '';
  creationInitial.value = creationName.value;
  discardCreation.value = false;
  creationOpen.value = true;
}
function openDuplicate(t) {
  copySource.value = t;
  creationName.value = `${t.name} — نسخة`.slice(0, 150);
  openAfterCopy.value = false;
  creationError.value = '';
  creationInitial.value = creationName.value;
  discardCreation.value = false;
  creationOpen.value = true;
}
function closeCreation() {
  if (busy.value) return;
  if (creationName.value !== creationInitial.value || (!copySource.value && (creationHeight.value !== 60 || starter.value !== 'standard'))) {
    discardCreation.value = true;
    return;
  }
  creationOpen.value = false;
}
async function createOrCopy() {
  busy.value = true;
  creationError.value = '';
  const company = user.currentCompany?.id;
  try {
    const d = createStarterDesign();
    d.heightMm = creationHeight.value;
    if (creationHeight.value < 60) {
      const ratio = (creationHeight.value - 2) / 58;
      d.elements = d.elements.map(e => ({ ...e, y: 1 + (e.y - 1) * ratio, height: e.height * ratio }));
    }
    if (starter.value === 'blank') d.elements = [];
    const result = copySource.value
      ? await api.duplicate(copySource.value.id, { name: creationName.value.trim() })
      : await api.create({ name: creationName.value.trim(), design: d });
    if (company !== user.currentCompany?.id) return;
    creationOpen.value = false;
    if (!copySource.value || openAfterCopy.value) await router.push(`/app/label-templates/${result.id}/edit`);
    else await load();
  } catch (e) {
    creationError.value = labelError(e);
  } finally {
    busy.value = false;
  }
}
async function metadataSaved() {
  metadataTarget.value = null;
  await load();
}
async function makeDefault(t) {
  busy.value = true;
  try {
    await api.setDefault(t.id);
    await load();
  } catch (e) {
    error.value = labelError(e);
  } finally {
    busy.value = false;
  }
}
async function archive() {
  busy.value = true;
  archiveError.value = '';
  try {
    await api.archive(archiveTarget.value.id, archiveTarget.value.lock_version, replacementId.value);
    archiveTarget.value = null;
    await load();
  } catch (e) {
    archiveError.value = labelError(e);
  } finally {
    busy.value = false;
  }
}
watch(archiveTarget, () => {
  replacementId.value = null;
  archiveError.value = '';
});
watch(
  () => user.currentCompany?.id,
  () => {
    archiveTarget.value = null;
    metadataTarget.value = null;
    creationOpen.value = false;
    permissions.value = {};
    load();
  }
);
onMounted(load);
</script>
<style scoped>
.default-template {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 1px;
}
</style>
