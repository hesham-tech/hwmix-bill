<template>
  <div class="branches-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">إدارة الفروع</h1>
      <p class="text-body-1 text-grey">عرض وإدارة فروع شركتك، وتعيين الفرع الافتراضي.</p>
    </div>

    <v-card class="premium-card">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon icon="ri-git-branch-line" class="me-2" color="primary" />
        <span class="text-h6 font-weight-bold">قائمة الفروع</span>
        <v-spacer />
        <v-btn 
          v-if="canCreate"
          color="primary" 
          prepend-icon="ri-add-line" 
          class="rounded-lg"
          @click="handleCreate"
        > 
          إضافة فرع جديد 
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="branches"
        :loading="loading"
        density="comfortable"
        hover
        class="branch-table"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary-lighten-5" class="me-3 rounded-lg">
              <v-icon icon="ri-building-line" color="primary" size="18" />
            </v-avatar>
            <div>
              <div class="font-weight-bold text-primary">{{ item.name }}</div>
              <div class="text-caption text-grey">{{ item.email || 'لا يوجد بريد إلكتروني' }}</div>
            </div>
          </div>
        </template>

        <template #item.is_default="{ item }">
          <v-chip 
            v-if="item.is_default" 
            color="success" 
            size="small" 
            variant="flat"
            prepend-icon="ri-check-line"
          >
            الافتراضي
          </v-chip>
          <span v-else class="text-grey text-caption">-</span>
        </template>

        <template #item.phone="{ item }">
          <div v-if="item.phone" class="d-flex align-center">
            <v-icon icon="ri-phone-line" size="14" class="me-1 text-grey" />
            <span class="text-body-2">{{ item.phone }}</span>
          </div>
          <span v-else class="text-grey">-</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-2">
            <v-tooltip location="top" text="تعديل">
              <template #activator="{ props }">
                <v-btn 
                  v-if="canUpdate"
                  v-bind="props"
                  icon="ri-edit-line" 
                  size="small" 
                  variant="tonal" 
                  color="primary" 
                  @click="handleEdit(item)" 
                />
              </template>
            </v-tooltip>
            <v-tooltip location="top" text="حذف" v-if="!item.is_default && canDelete">
              <template #activator="{ props }">
                <v-btn 
                  v-bind="props"
                  icon="ri-delete-bin-line" 
                  size="small" 
                  variant="tonal" 
                  color="error" 
                  @click="handleDelete(item)" 
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-10">
            <v-icon icon="ri-git-branch-line" size="64" color="grey-lighten-2" class="mb-4" />
            <div class="text-h6 text-grey">لا توجد فروع مضافة</div>
            <p class="text-caption text-grey mb-4">ابدأ بإضافة أول فرع لشركتك الآن</p>
            <v-btn v-if="canCreate" color="primary" variant="outlined" @click="handleCreate">إضافة فرع</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Form Dialog -->
    <v-dialog v-model="showDialog" max-width="600" persistent transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden">
        <header class="dialog-premium-header pa-4 text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'" class="me-2" />
            <span class="text-h6 font-weight-bold">{{ isEdit ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد' }}</span>
          </div>
          <v-btn icon="ri-close-line" variant="text" color="white" @click="showDialog = false" />
        </header>

        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="isFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field 
                  v-model="formData.name" 
                  label="اسم الفرع *" 
                  placeholder="مثلاً: الفرع الرئيسي، فرع القاهرة..."
                  variant="outlined"
                  :rules="[v => !!v || 'اسم الفرع مطلوب']"
                  prepend-inner-icon="ri-building-line"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="formData.phone" 
                  label="رقم الهاتف" 
                  variant="outlined"
                  prepend-inner-icon="ri-phone-line"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="formData.email" 
                  label="البريد الإلكتروني" 
                  variant="outlined"
                  prepend-inner-icon="ri-mail-line"
                  :rules="[v => !v || /.+@.+\..+/.test(v) || 'بريد إلكتروني غير صحيح']"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea 
                  v-model="formData.address" 
                  label="العنوان" 
                  variant="outlined"
                  prepend-inner-icon="ri-map-pin-line"
                  rows="2"
                />
              </v-col>

              <v-col cols="12">
                <v-checkbox 
                  v-model="formData.is_default" 
                  label="تعيين كفرع افتراضي للشركة" 
                  color="primary"
                  hint="سيتم تعيين هذا الفرع تلقائياً عند دخول المستخدمين"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn variant="text" color="grey" @click="showDialog = false" class="px-6">إلغاء</v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            :loading="saving" 
            @click="handleSave"
            class="px-10 rounded-lg"
            :disabled="!isFormValid"
          >
            حفظ البيانات
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="d-flex align-center text-error">
          <v-icon icon="ri-error-warning-line" class="me-2" />
          تأكيد الحذف
        </v-card-title>
        <v-card-text class="pt-2">
          هل أنت متأكد من حذف الفرع "<strong>{{ selectedItem?.name }}</strong>"؟
          <br>
          <span class="text-caption text-grey">هذا الإجراء قد يؤثر على البيانات المرتبطة بهذا الفرع.</span>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" color="grey" @click="showDeleteDialog = false">تراجع</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete" class="px-6 rounded-lg">حذف نهائي</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'vue3-toastify';

const userStore = useUserStore();
const api = useApi('/api/branches');

// Permissions
const canCreate = computed(() => userStore.hasPermission(PERMISSIONS.BRANCHES_CREATE));
const canUpdate = computed(() => userStore.hasPermission([PERMISSIONS.BRANCHES_UPDATE_ALL, PERMISSIONS.BRANCHES_UPDATE_SELF]));
const canDelete = computed(() => userStore.hasPermission(PERMISSIONS.BRANCHES_DELETE_ALL));

const branches = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const isFormValid = ref(false);

const formData = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  is_default: false
});

const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'اسم الفرع', key: 'name', align: 'start' },
  { title: 'الهاتف', key: 'phone' },
  { title: 'الافتراضي', key: 'is_default', align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const fetchBranches = async () => {
  loading.value = true;
  try {
    const response = await api.get({}, { showLoading: false });
    branches.value = response.data || [];
  } catch (error) {
    console.error('Fetch branches failed:', error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = {
    name: '',
    address: '',
    phone: '',
    email: '',
    is_default: false
  };
  showDialog.value = true;
};

const handleEdit = (item) => {
  selectedItem.value = item;
  formData.value = { 
    ...item,
    is_default: !!item.is_default 
  };
  showDialog.value = true;
};

const handleDelete = (item) => {
  if (item.is_default) {
    toast.warning('لا يمكن حذف الفرع الافتراضي للشركة');
    return;
  }
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, formData.value, { successMessage: 'تم تحديث بيانات الفرع بنجاح' });
    } else {
      await api.create(formData.value, { successMessage: 'تم إضافة الفرع بنجاح' });
    }
    showDialog.value = false;
    fetchBranches();
  } catch (error) {
    // Error handled by useApi
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await api.delete(selectedItem.value.id, { successMessage: 'تم حذف الفرع بنجاح' });
    showDeleteDialog.value = false;
    fetchBranches();
  } catch (error) {
    // Error handled by useApi
  } finally {
    deleting.value = false;
  }
};

onMounted(fetchBranches);
</script>

<style scoped>
.branches-page {
  max-width: 1200px;
  margin: 0 auto;
}

.premium-card {
  border-radius: 16px !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
}

.dialog-premium-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.branch-table :deep(thead) {
  background-color: #f8fafc;
}

.gap-2 {
  gap: 8px;
}

.text-xxs {
  font-size: 0.65rem !important;
}
</style>
