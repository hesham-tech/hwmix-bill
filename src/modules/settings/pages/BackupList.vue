<template>
  <div class="backup-page">
    <div class="page-header mb-8 d-flex justify-space-between align-center">
      <div>
        <h1 class="text-h3 font-weight-bold primary--text mb-2">النسخ الاحتياطي</h1>
        <p class="text-subtitle-1 text-grey-darken-1">إدارة النسخ الاحتياطية واستعادة النظام</p>
      </div>
      <div class="d-flex gap-3">
        <v-btn color="warning" variant="tonal" prepend-icon="ri-settings-4-line" @click="openSettings"> الإعدادات </v-btn>
        <v-btn color="primary" prepend-icon="ri-database-2-line" :loading="loadingBackup" @click="runBackup"> إنشاء نسخة الآن </v-btn>
      </div>
    </div>

    <v-card rounded="xl" elevation="2">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="backups"
          :loading="loading"
          hover
          no-data-text="لا يوجد نسخ احتياطية مسجلة"
          loading-text="جاري تحميل البيانات..."
        >
          <template #[`item.filename`]="{ item }">
            <div class="font-weight-medium text-primary">
              {{ item.filename }}
            </div>
          </template>

          <template #[`item.size_bytes`]="{ item }">
            {{ formatSize(item.size_bytes) }}
          </template>

          <template #[`item.status`]="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" class="font-weight-bold">
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template #[`item.completed_at`]="{ item }">
            {{ new Date(item.completed_at).toLocaleString('ar-EG') }}
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="d-flex justify-end gap-1">
              <v-tooltip text="تحميل">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="ri-download-line"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="backupService.download(item.id)"
                  />
                </template>
              </v-tooltip>

              <v-tooltip text="استعادة">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon="ri-history-line" variant="text" color="warning" size="small" @click="confirmRestore(item)" />
                </template>
              </v-tooltip>

              <v-tooltip text="حذف">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="confirmDelete(item)" />
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Settings Dialog -->
    <v-dialog v-model="settingsDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          <h3 class="text-h5 font-weight-bold">إعدادات النسخ التلقائي</h3>
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-form ref="settingsForm">
            <v-select v-model="settings.backup_frequency" label="تكرار النسخ الاحتياطي" :items="frequencies" variant="outlined" class="mb-4" />
            <v-text-field v-model="settings.backup_time" label="وقت التنفيذ" type="time" variant="outlined" class="mb-4" />
            <v-text-field v-model="settings.backup_retention_days" label="فترة الاحتفاظ (بالأيام)" type="number" variant="outlined" class="mb-4" />
            <v-checkbox v-model="settings.backup_include_files" label="تضمين ملفات المشروع (Storage)" color="primary" hide-details />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn color="grey-darken-1" variant="text" @click="settingsDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingSettings" @click="saveSettings">حفظ الإعدادات</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Restore Confirmation Dialog -->
    <v-dialog v-model="restoreDialog" max-width="600">
      <v-card border="error md" rounded="xl">
        <v-card-title class="pa-6 pb-2 text-error d-flex align-center">
          <v-icon icon="ri-error-warning-line" class="me-2" />
          تحذير: استعادة النظام
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <p class="text-body-1 mb-4">
            أنت على وشك استعادة النظام من نسخة <strong>{{ selectedBackup?.filename }}</strong
            >.
          </p>
          <v-alert type="error" variant="tonal" class="mb-4 text-body-2">
            هذه العملية ستقوم بمسح كافة البيانات الحالية واستبدالها بالبيانات الموجودة في النسخة الاحتياطية. لا يمكن التراجع عن هذا الإجراء.
          </v-alert>
          <v-text-field
            v-model="restoreToken"
            label="رمز التأكيد (Secure Token)"
            variant="outlined"
            placeholder="أدخل رمز الاستعادة السري"
            type="password"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn color="grey-darken-1" variant="text" @click="restoreDialog = false">إلغاء</v-btn>
          <v-btn color="error" variant="flat" :loading="restoring" @click="performRestore"> تأكيد الاستعادة الآن </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">حذف نسخة احتياطية</v-card-title>
        <v-card-text class="pa-6 pt-2"> هل أنت متأكد من حذف هذا الملف؟ لن تتمكن من استعادة البيانات منه لاحقاً. </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn color="grey-darken-1" variant="text" @click="deleteDialog = false">تراجع</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteBackup">حذف نهائي</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import backupService from '@/api/services/backup.service';
import { toast } from 'vue3-toastify';

const backups = ref([]);
const loading = ref(false);
const loadingBackup = ref(false);
const headers = [
  { title: 'الملف', key: 'filename', align: 'start' },
  { title: 'النوع', key: 'type', align: 'center' },
  { title: 'الحجم', key: 'size_bytes', align: 'center' },
  { title: 'الحالة', key: 'status', align: 'center' },
  { title: 'التاريخ', key: 'completed_at', align: 'center' },
  { title: 'إجراءات', key: 'actions', align: 'end', sortable: false },
];

const fetchBackups = async () => {
  loading.value = true;
  try {
    const response = await backupService.getAll();
    backups.value = response.data;
  } finally {
    loading.value = false;
  }
};

const runBackup = async () => {
  loadingBackup.value = true;
  try {
    await backupService.runManual();
    fetchBackups();
  } finally {
    loadingBackup.value = false;
  }
};

// Settings
const settingsDialog = ref(false);
const savingSettings = ref(false);
const settings = ref({
  backup_frequency: 'daily',
  backup_time: '03:00',
  backup_retention_days: 7,
  backup_include_files: false,
});

const frequencies = [
  { title: 'يومياً', value: 'daily' },
  { title: 'أسبوعياً', value: 'weekly' },
  { title: 'شهرياً', value: 'monthly' },
  { title: 'معطل', value: 'none' },
];

const openSettings = async () => {
  settingsDialog.value = true;
  try {
    const response = await backupService.getSettings();
    if (response.data && response.data[0]) {
      // Map array of {key, value} to our object if needed,
      // but backend updateSettings expects object and getSettings likely returns normalized object
      // Actually backend getSettings returns all rows from backup_settings.
      // Let's normalize it here.
      const rawSettings = response.data;
      rawSettings.forEach(s => {
        if (s.key === 'backup_include_files') {
          settings.value[s.key] = s.value == '1';
        } else if (s.key === 'backup_retention_days') {
          settings.value[s.key] = parseInt(s.value);
        } else if (settings.value.hasOwnProperty(s.key)) {
          settings.value[s.key] = s.value;
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
};

const saveSettings = async () => {
  savingSettings.value = true;
  try {
    await backupService.updateSettings(settings.value);
    settingsDialog.value = false;
  } finally {
    savingSettings.value = false;
  }
};

// Delete
const deleteDialog = ref(false);
const selectedBackup = ref(null);
const deleting = ref(false);

const confirmDelete = item => {
  selectedBackup.value = item;
  deleteDialog.value = true;
};

const deleteBackup = async () => {
  deleting.value = true;
  try {
    await backupService.delete(selectedBackup.value.id);
    deleteDialog.value = false;
    fetchBackups();
  } finally {
    deleting.value = false;
  }
};

// Restore
const restoreDialog = ref(false);
const restoring = ref(false);
const restoreToken = ref('');

const confirmRestore = item => {
  selectedBackup.value = item;
  restoreToken.value = '';
  restoreDialog.value = true;
};

const performRestore = async () => {
  if (!restoreToken.value) {
    toast.error('يرجى إدخال رمز التأكيد');
    return;
  }

  restoring.value = true;
  try {
    await backupService.restore(selectedBackup.value.id, restoreToken.value);
    restoreDialog.value = false;
    // Potentially reload page or notify user that system is refreshing
    toast.info('تمت العملية، جاري إعادة تشغيل النظام...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } finally {
    restoring.value = false;
  }
};

// Helpers
const formatSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStatusColor = status => {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'error';
    case 'running':
      return 'info';
    default:
      return 'grey';
  }
};

const getStatusText = status => {
  switch (status) {
    case 'success':
      return 'ناجح';
    case 'failed':
      return 'فاشل';
    case 'running':
      return 'قيد التنفيذ';
    default:
      return status;
  }
};

onMounted(() => {
  fetchBackups();
});
</script>

<style scoped>
.backup-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
}

.gap-3 {
  gap: 12px;
}
.gap-1 {
  gap: 4px;
}
</style>
