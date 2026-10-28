<template>
  <v-dialog :model-value="!!target" max-width="520" :persistent="busy" @update:model-value="!$event && close()">
    <v-card title="بيانات القالب">
      <v-card-text>
        <p class="text-body-2 text-medium-emphasis mb-4">هذه البيانات لا تغيّر تصميم الملصق ولا تحتاج إلى إعادة نشره.</p>
        <v-text-field v-model="name" label="اسم القالب" autofocus maxlength="150" counter :disabled="!permissions.manage || busy" />
        <v-textarea
          v-model="description"
          label="وصف القالب (اختياري)"
          placeholder="مثال: ملصق الملابس للمقاس 50 × 60 مم"
          rows="3"
          maxlength="1000"
          counter
          :disabled="!permissions.manage || busy"
        />
        <v-checkbox
          v-model="makeDefault"
          label="استخدامه افتراضيًا للشركة"
          :disabled="!permissions.set_default || !target?.published || target?.is_default || busy"
          hide-details
        />
        <p class="text-caption mt-2">
          {{
            target?.is_default
              ? 'هذا هو الافتراضي الحالي. اختر قالبًا آخر لتغييره.'
              : !target?.published
                ? 'انشر القالب أولًا لتتمكن من تعيينه افتراضيًا.'
                : 'يؤثر الافتراضي في طلبات الطباعة الجديدة لجميع مستخدمي الشركة.'
          }}
        </p>
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4"
          >{{ error }}
          <p v-if="conflict" class="mt-2">مدخلاتك محفوظة هنا. انسخها قبل إغلاق النافذة وتحديث قائمة القوالب.</p></v-alert
        >
      </v-card-text>
      <v-card-actions
        ><v-spacer /><v-btn :disabled="busy" @click="close">إلغاء</v-btn
        ><v-btn color="primary" :loading="busy" :disabled="!name.trim() || conflict || !changed" @click="save">حفظ البيانات</v-btn></v-card-actions
      >
    </v-card>
  </v-dialog>
  <v-dialog v-model="discardOpen" max-width="420"
    ><v-card title="تجاهل التعديلات؟"
      ><v-card-text>توجد بيانات لم تُحفظ. يمكنك العودة وإكمالها.</v-card-text
      ><v-card-actions
        ><v-spacer /><v-btn @click="discardOpen = false">العودة للتعديل</v-btn
        ><v-btn
          color="error"
          @click="
            discardOpen = false;
            $emit('close');
          "
          >تجاهل</v-btn
        ></v-card-actions
      ></v-card
    ></v-dialog
  >
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { labelTemplateService as api, labelError } from '../templates-editor/labelTemplate.service';
import { useUserStore } from '@/stores/user';
const props = defineProps({ target: Object, permissions: { type: Object, default: () => ({}) } }),
  emit = defineEmits(['close', 'saved']);
const user = useUserStore(),
  name = ref(''),
  description = ref(''),
  makeDefault = ref(false),
  busy = ref(false),
  error = ref(''),
  conflict = ref(false),
  discardOpen = ref(false);
const changed = computed(
  () =>
    !!props.target &&
    (name.value !== props.target.name || description.value !== (props.target.description || '') || makeDefault.value !== !!props.target.is_default)
);
watch(
  () => props.target,
  t => {
    name.value = t?.name || '';
    description.value = t?.description || '';
    makeDefault.value = !!t?.is_default;
    error.value = '';
    conflict.value = false;
    discardOpen.value = false;
  }
);
watch(
  () => user.currentCompany?.id,
  () => emit('close')
);
function close() {
  if (busy.value) return;
  if (changed.value) discardOpen.value = true;
  else emit('close');
}
async function save() {
  busy.value = true;
  error.value = '';
  const company = user.currentCompany?.id;
  try {
    const payload = { lock_version: props.target.lock_version, make_default: makeDefault.value && !props.target.is_default };
    if (props.permissions.manage) Object.assign(payload, { name: name.value.trim(), description: description.value.trim() || null });
    const result = await api.metadata(props.target.id, payload);
    if (company === user.currentCompany?.id) emit('saved', result);
  } catch (e) {
    error.value = labelError(e);
    conflict.value = e.response?.status === 409;
  } finally {
    busy.value = false;
  }
}
</script>
