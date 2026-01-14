<template>
  <v-container fluid class="pa-6">
    <v-card class="rounded-xl border border-grey-lighten-4 elevation-sm overflow-hidden">
      <v-card-title class="pa-6 d-flex align-center gap-3 bg-grey-lighten-5">
        <v-icon icon="ri-checkbox-multiple-line" color="primary" size="28" />
        <div>
          <h2 class="text-h5 font-weight-bold">قائمة فحص النظام</h2>
          <p class="text-caption text-grey-darken-1 mb-0">تابع تقدم اختبار موديولات النظام</p>
        </div>
        <v-spacer />
        <div class="text-right d-flex align-center gap-4">
          <v-chip color="primary" variant="flat" size="small" class="font-weight-bold px-4"> تم إنجاز: {{ progress }}% </v-chip>
          <v-btn icon="ri-refresh-line" variant="text" size="small" :loading="loading" @click="fetchData">
            <v-tooltip activator="parent" location="top">تحديث البيانات</v-tooltip>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6" v-if="!loading">
        <v-list class="pa-0">
          <!-- Pending Items Section -->
          <div v-if="pendingItems.length > 0">
            <v-slide-y-transition group>
              <div v-for="item in pendingItems" :key="getItemKey(item)">
                <v-card variant="flat" border class="mb-4 rounded-lg overflow-hidden border-grey-lighten-3 transition-all">
                  <div class="pa-3 d-flex align-center bg-grey-lighten-5">
                    <v-checkbox-btn :model-value="isChecked(item)" @update:model-value="toggleItem(item)" color="success" class="flex-grow-0" />
                    <v-icon :icon="item.icon" size="20" class="me-3" color="grey-darken-2" />
                    <span class="font-weight-bold text-subtitle-1">
                      {{ item.title }}
                    </span>
                    <v-spacer />
                    <div class="d-flex align-center gap-2">
                      <div
                        v-if="getNote(item)"
                        class="text-caption text-grey-darken-1 bg-amber-lighten-5 px-3 py-1 rounded-pill border border-amber-lighten-4 max-w-200 text-truncate"
                      >
                        {{ getNote(item) }}
                      </div>
                      <v-btn
                        icon="ri-sticky-note-line"
                        variant="text"
                        size="small"
                        :color="getNote(item) ? 'amber-darken-1' : 'grey'"
                        @click="openNoteDialog(item)"
                      >
                        <v-tooltip activator="parent" location="top">ملاحظات</v-tooltip>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Children for Pending Items -->
                  <v-list v-if="item.children" class="py-0">
                    <v-divider />
                    <v-list-item
                      v-for="child in sortChildren(item.children)"
                      :key="getItemKey(child)"
                      density="compact"
                      class="ps-10 border-b border-grey-lighten-4 ripple-0"
                    >
                      <template #prepend>
                        <v-checkbox-btn :model-value="isChecked(child)" @update:model-value="toggleItem(child)" color="success" class="flex-grow-0" />
                      </template>

                      <v-list-item-title class="text-body-2 d-flex align-center justify-space-between w-100">
                        <div class="d-flex align-center gap-2">
                          <v-icon v-if="child.icon" :icon="child.icon" size="16" color="grey" />
                          <span :class="{ 'text-grey text-decoration-line-through opacity-50': isChecked(child) }">
                            {{ child.title }}
                          </span>
                        </div>

                        <div class="d-flex align-center gap-2">
                          <div
                            v-if="getNote(child)"
                            class="text-caption text-grey-darken-1 bg-amber-lighten-5 px-2 py-0 rounded border border-amber-lighten-4 max-w-150 text-truncate"
                          >
                            {{ getNote(child) }}
                          </div>
                          <v-btn
                            icon="ri-sticky-note-2-line"
                            variant="text"
                            size="x-small"
                            :color="getNote(child) ? 'amber-darken-1' : 'grey-lighten-1'"
                            @click="openNoteDialog(child)"
                          />
                          <v-icon v-if="isChecked(child)" icon="ri-check-line" color="success" size="18" />
                        </div>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </div>
            </v-slide-y-transition>
          </div>

          <!-- Completed Section -->
          <div v-if="completedItems.length > 0" class="mt-8">
            <v-divider class="mb-6" />
            <div class="d-flex align-center gap-2 mb-4 px-2">
              <v-icon icon="ri-checkbox-circle-fill" color="success" size="20" />
              <h3 class="text-subtitle-1 font-weight-black text-success">الموديولات المكتملة</h3>
              <v-chip size="x-small" color="success" variant="tonal" class="ms-2">{{ completedItems.length }}</v-chip>
            </div>

            <v-slide-y-transition group>
              <div v-for="item in completedItems" :key="getItemKey(item)">
                <v-card variant="flat" border class="mb-4 rounded-lg overflow-hidden border-grey-lighten-3 transition-all checklist-item-checked">
                  <div class="pa-3 d-flex align-center bg-grey-lighten-5">
                    <v-checkbox-btn :model-value="isChecked(item)" @update:model-value="toggleItem(item)" color="success" class="flex-grow-0" />
                    <v-icon :icon="item.icon" size="20" class="me-3" color="grey-darken-2" />
                    <span class="font-weight-bold text-subtitle-1 text-grey text-decoration-line-through opacity-50">
                      {{ item.title }}
                    </span>
                    <v-spacer />
                    <div class="d-flex align-center gap-2">
                      <div
                        v-if="getNote(item)"
                        class="text-caption text-grey-darken-1 bg-amber-lighten-5 px-3 py-1 rounded-pill border border-amber-lighten-4 max-w-200 text-truncate"
                      >
                        {{ getNote(item) }}
                      </div>
                      <v-btn
                        icon="ri-sticky-note-line"
                        variant="text"
                        size="small"
                        :color="getNote(item) ? 'amber-darken-1' : 'grey'"
                        @click="openNoteDialog(item)"
                      >
                        <v-tooltip activator="parent" location="top">ملاحظات</v-tooltip>
                      </v-btn>
                      <v-chip size="x-small" color="success" variant="tonal" class="rounded">تم الفحص</v-chip>
                    </div>
                  </div>
                </v-card>
              </div>
            </v-slide-y-transition>
          </div>
        </v-list>

        <div v-if="pendingItems.length === 0 && completedItems.length === 0" class="text-center pa-12">
          <v-icon icon="ri-inbox-line" size="64" color="grey-lighten-2" />
          <p class="text-grey mt-4">لا توجد موديولات مبرمجة حالياً</p>
        </div>

        <div class="d-flex justify-center mt-6">
          <v-btn variant="text" color="error" prepend-icon="ri-refresh-line" size="small" @click="resetProgress">
            إعادة تعيين كافة التقدم (سيتم مسح الملف من الباك إند)
          </v-btn>
        </div>
      </v-card-text>

      <v-card-text v-else class="text-center pa-12">
        <v-progress-circular indeterminate color="primary" />
        <p class="text-grey mt-4">جاري تحميل البيانات من الباك إند...</p>
      </v-card-text>
    </v-card>

    <!-- Note Dialog -->
    <v-dialog v-model="noteDialog.show" max-width="500px">
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center gap-2">
          <v-icon icon="ri-sticky-note-line" />
          ملاحظات: {{ noteDialog.title }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-textarea
            v-model="noteDialog.text"
            placeholder="اكتب ملاحظاتك هنا..."
            variant="outlined"
            auto-grow
            rows="4"
            class="rounded-lg"
            color="primary"
            hide-details
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" color="grey-darken-1" @click="noteDialog.show = false" class="px-4"> إلغاء </v-btn>
          <v-btn variant="flat" color="primary" @click="saveNote" class="px-6 rounded-lg font-weight-bold"> حفظ الملاحظة </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import navigation from '@/config/navigation';
import apiClient from '@/api/axios.config';
import { useDebounceFn } from '@vueuse/core';

// --- Main Logic ---
const checklistData = ref({});
const loading = ref(true);

const noteDialog = ref({
  show: false,
  title: '',
  key: '',
  text: '',
});

// Robust Key Generation
const getItemKey = item => {
  return item.to || `group-${item.title}`;
};

// Calculate Progress
const progress = computed(() => {
  const allSupported = getAllSupportedItems();
  const total = allSupported.length;
  if (total === 0) return 0;

  const checkedCount = allSupported.filter(key => checklistData.value[key]?.checked).length;
  return Math.round((checkedCount / total) * 100);
});

const getAllSupportedItems = () => {
  const keys = [];
  navigation.forEach(item => {
    keys.push(getItemKey(item));
    if (item.children) {
      item.children.forEach(c => {
        keys.push(getItemKey(c));
      });
    }
  });
  return keys;
};

// Filter modules
const pendingItems = computed(() => {
  return navigation.filter(item => !isChecked(item));
});

const completedItems = computed(() => {
  return navigation.filter(item => isChecked(item));
});

// Helper: Children always sort completed to bottom within their parent
const sortChildren = children => {
  if (!children) return [];
  return [...children].sort((a, b) => {
    const aChecked = isChecked(a);
    const bChecked = isChecked(b);
    if (aChecked === bChecked) return 0;
    return aChecked ? 1 : -1;
  });
};

// State Helpers
const getEntry = key => {
  return checklistData.value[key] || { checked: false, note: '' };
};

const isChecked = item => {
  const key = getItemKey(item);
  return getEntry(key).checked;
};

const getNote = item => {
  const key = getItemKey(item);
  return getEntry(key).note || '';
};

// --- API Actions ---

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/dev/testing-checklist');
    checklistData.value = response.data || {};
  } catch (e) {
    console.error('Failed to fetch testing checklist', e);
  } finally {
    loading.value = false;
  }
};

const saveToServer = async () => {
  try {
    await apiClient.post('/dev/testing-checklist', checklistData.value);
  } catch (e) {
    console.error('Failed to save testing checklist', e);
  }
};

// Debounced save for consistency (used for notes, but could be for all)
const debouncedSave = useDebounceFn(saveToServer, 1000);

// Actions
const toggleItem = item => {
  const key = getItemKey(item);
  const entry = getEntry(key);

  checklistData.value = {
    ...checklistData.value,
    [key]: {
      ...entry,
      checked: !entry.checked,
    },
  };

  saveToServer();
};

const openNoteDialog = item => {
  const key = getItemKey(item);
  noteDialog.value = {
    show: true,
    title: item.title,
    key: key,
    text: getNote(item),
  };
};

const saveNote = () => {
  const key = noteDialog.value.key;
  const entry = getEntry(key);

  checklistData.value = {
    ...checklistData.value,
    [key]: {
      ...entry,
      note: noteDialog.value.text.trim(),
    },
  };

  saveToServer();
  noteDialog.value.show = false;
};

const resetProgress = async () => {
  if (confirm('هل أنت متأكد من مسح كافة علامات التقدم والملاحظات من الباك إند؟')) {
    checklistData.value = {};
    await apiClient.post('/dev/testing-checklist', {});
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.opacity-50 {
  opacity: 0.5;
}
.max-w-200 {
  max-width: 200px;
}
.max-w-150 {
  max-width: 150px;
}
.checklist-item-checked {
  background-color: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.05) !important;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.transition-all {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
