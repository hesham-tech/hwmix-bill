<!-- تعليق عربي: شاشة إدارة حسابات الواتساب المتعددة للشركة، تدعم عرض القائمة، إضافة/تعديل الحسابات، اختبار الاتصال وتحديد الحساب الافتراضي والنشط -->

<template>
  <div class="whatsapp-settings-page">
    <!-- Header -->
    <div class="page-header mb-8 d-flex align-center justify-between flex-wrap gap-4">
      <div>
        <div class="d-flex align-center gap-2 mb-2">
          <v-btn icon="ri-arrow-right-line" variant="text" @click="router.push({ name: 'settings' })" />
          <h1 class="text-h3 font-weight-bold primary--text">إعدادات الواتساب (WhatsApp Cloud API)</h1>
        </div>
        <p class="text-subtitle-1 text-grey-darken-1">ربط وإدارة حسابات Meta Cloud API وتعيين الحساب الافتراضي لإرسال التنبيهات والإشعارات الفورية</p>
      </div>
      <div>
        <v-btn
          color="primary"
          prepend-icon="ri-add-line"
          class="rounded-pill font-weight-bold tour-whatsapp-add"
          elevation="2"
          @click="openAddDialog"
        >
          إضافة حساب واتساب
        </v-btn>
      </div>
    </div>

    <!-- WhatsApp Accounts Table Card -->
    <AppCard title="حسابات الواتساب المتاحة" icon="ri-whatsapp-line" icon-color="primary" class="tour-whatsapp-list">
      <v-table class="whatsapp-accounts-table">
        <thead>
          <tr>
            <th class="text-start">العنوان</th>
            <th class="text-start">معرف الهاتف (Phone Number ID)</th>
            <th class="text-start">معرف حساب الأعمال (WABA ID)</th>
            <th class="text-center">حالة التنشيط</th>
            <th class="text-center">الافتراضي</th>
            <th class="text-end">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="whatsappAccounts.length === 0">
            <td colspan="6" class="text-center py-8 text-grey-darken-1">
              <v-icon icon="ri-whatsapp-line" size="40" class="mb-2 d-block mx-auto text-grey-lighten-1" />
              لا توجد حسابات واتساب مضافة حالياً. قم بإضافة حساب واتساب للبدء.
            </td>
          </tr>
          <tr v-for="account in whatsappAccounts" :key="account.id">
            <td class="font-weight-bold">
              {{ account.title }}
              <v-chip v-if="account.is_global" color="purple" size="x-small" variant="flat" class="ms-2 font-weight-bold">سيستم</v-chip>
            </td>
            <td class="text-ltr">{{ account.phone_number_id }}</td>
            <td class="text-ltr">{{ account.waba_id }}</td>
            <td class="text-center">
              <v-switch
                v-model="account.is_active"
                color="success"
                hide-details
                inset
                density="compact"
                class="d-inline-block"
                :disabled="account.is_global && !userStore.isAdmin"
                @update:model-value="toggleAccountActive(account)"
              />
            </td>
            <td class="text-center">
              <v-chip
                v-if="account.is_default"
                color="warning"
                size="small"
                variant="flat"
                prepend-icon="ri-star-fill"
                class="tour-whatsapp-default font-weight-bold"
              >
                الافتراضي
              </v-chip>
              <v-btn
                v-else
                size="x-small"
                variant="outlined"
                color="grey-darken-1"
                class="rounded-pill"
                :disabled="!account.is_active || (account.is_global && !userStore.isAdmin)"
                @click="setAccountDefault(account)"
              >
                تعيين كافتراضي
              </v-btn>
            </td>
            <td class="text-end">
              <div class="d-flex align-center justify-end gap-1">
                <v-tooltip text="اختبار الاتصال" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="tooltipProps"
                      icon="ri-message-3-line"
                      variant="text"
                      color="primary"
                      size="small"
                      class="tour-whatsapp-test"
                      @click="openTestDialog(account)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="تعديل الحساب" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="tooltipProps"
                      icon="ri-edit-line"
                      variant="text"
                      color="info"
                      size="small"
                      :disabled="account.is_global && !userStore.isAdmin"
                      @click="openEditDialog(account)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="حذف" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="tooltipProps"
                      icon="ri-delete-bin-line"
                      variant="text"
                      color="error"
                      size="small"
                      :disabled="account.is_global && !userStore.isAdmin"
                      @click="confirmDeleteAccount(account)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </AppCard>

    <!-- Add/Edit Account Modal Dialog -->
    <v-dialog v-model="showDialog" max-width="600" persistent>
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h4 font-weight-bold mb-4 d-flex align-center gap-2">
          <v-icon :icon="isEdit ? 'ri-edit-box-line' : 'ri-add-circle-line'" color="primary" />
          <span>{{ isEdit ? 'تعديل حساب واتساب' : 'إضافة حساب واتساب جديد' }}</span>
        </v-card-title>

        <v-card-text class="pa-2">
          <v-form ref="formRef" v-model="formValid">
            <v-row dense>
              <!-- Account Title -->
              <v-col cols="12">
                <AppInput
                  v-model="formData.title"
                  label="عنوان الحساب (تسمية توضيحية) *"
                  placeholder="مثال: رقم دعم العملاء، رقم الإرسال التلقائي"
                  required
                />
              </v-col>

              <!-- Phone Number ID -->
              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.phone_number_id"
                  label="معرف رقم الهاتف (Phone Number ID) *"
                  placeholder="رقم معرف الهاتف من Meta"
                  dir="ltr"
                  required
                />
              </v-col>

              <!-- WABA ID -->
              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.waba_id"
                  label="معرف حساب واتساب للأعمال (WABA ID) *"
                  placeholder="رقم معرف حساب الأعمال"
                  dir="ltr"
                  required
                />
              </v-col>

              <!-- Access Token -->
              <v-col cols="12">
                <AppInput
                  v-model="formData.access_token"
                  label="رمز الوصول للنظام (Access Token) *"
                  :type="showToken ? 'text' : 'password'"
                  prepend-inner-icon="ri-key-2-line"
                  :placeholder="isEdit && accountTokenConfigured ? '••••••••••••••••••••••••' : 'أدخل رمز الوصول الدائم طويل المدى'"
                  dir="ltr"
                  :required="!isEdit"
                >
                  <template v-slot:append-inner>
                    <v-btn icon variant="text" size="x-small" density="comfortable" @click.stop="showToken = !showToken">
                      <v-icon :icon="showToken ? 'ri-eye-off-line' : 'ri-eye-line'" />
                    </v-btn>
                  </template>
                </AppInput>
                <div v-if="isEdit && accountTokenConfigured" class="text-caption text-grey-darken-1 mt-1">
                  * اترك رمز الوصول فارغاً إذا كنت لا ترغب في تحديثه.
                </div>
              </v-col>

              <!-- Switches for Active and Default -->
              <v-col cols="12" class="d-flex align-center flex-wrap gap-4 mt-4">
                <v-switch
                  v-model="formData.is_active"
                  label="تنشيط الحساب مباشرة"
                  color="success"
                  hide-details
                  density="comfortable"
                />
                <v-switch
                  v-model="formData.is_default"
                  label="تعيين كحساب افتراضي للنظام"
                  color="warning"
                  hide-details
                  density="comfortable"
                  :disabled="isDefaultDisabled"
                />
                <v-switch
                  v-if="userStore.isAdmin"
                  v-model="formData.is_global"
                  label="تكامل سيستم عام (يظهر لجميع الشركات)"
                  color="purple"
                  hide-details
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="d-flex justify-end gap-2 mt-4">
          <v-btn variant="text" color="grey" @click="showDialog = false">إلغاء</v-btn>
          <v-btn
            color="success"
            :loading="saving"
            :disabled="!formValid"
            prepend-icon="ri-save-line"
            class="px-6 rounded-pill font-weight-bold"
            @click="saveAccount"
          >
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- WhatsApp Connection Test Dialog -->
    <v-dialog v-model="showTestDialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold mb-2">إرسال رسالة تجريبية</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            أدخل رقم الهاتف الذي ترغب في استقبال رسالة الاختبار عليه (بصيغة كود الدولة الكامل بدون أصفار أو علامة +، مثال: 201001234567) للتحقق من الاتصال بالحساب:
            <strong>({{ activeAccountForTest?.title }})</strong>
          </p>
          <AppInput
            v-model="testRecipient"
            label="رقم الهاتف المستلم (رمز الدولة + الرقم)"
            placeholder="201001234567"
            dir="ltr"
            required
          />
        </v-card-text>
        <v-card-actions class="d-flex justify-end gap-2">
          <v-btn variant="text" color="grey" @click="showTestDialog = false">إلغاء</v-btn>
          <v-btn color="primary" :loading="testingConnection" :disabled="!testRecipient" @click="testWhatsAppConnection">إرسال</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold text-error mb-2">حذف حساب الواتساب</v-card-title>
        <v-card-text class="text-body-1 text-grey-darken-3">
          هل أنت متأكد من رغبتك في حذف حساب الواتساب <strong>"{{ accountToDelete?.title }}"</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
        </v-card-text>
        <v-card-actions class="d-flex justify-end gap-2">
          <v-btn variant="text" color="grey" @click="showDeleteDialog = false">تراجع</v-btn>
          <v-btn color="error" :loading="deleting" class="px-4 rounded-pill" @click="deleteAccount">حذف نهائي</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Global Loader -->
    <v-overlay :model-value="loading" class="align-center justify-center" persistent>
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const whatsappApi = useApi('/api/whatsapp-settings');
const userStore = useUserStore();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showToken = ref(false);
const showDialog = ref(false);
const showTestDialog = ref(false);
const showDeleteDialog = ref(false);

const formValid = ref(false);
const formRef = ref(null);
const isEdit = ref(false);
const accountTokenConfigured = ref(false);
const testRecipient = ref('');
const testingConnection = ref(false);

const whatsappAccounts = ref([]);
const activeAccountForTest = ref(null);
const accountToDelete = ref(null);

const formData = ref({
  id: null,
  title: '',
  phone_number_id: '',
  waba_id: '',
  access_token: '',
  is_active: true,
  is_default: false,
  is_global: false,
});

// الحساب الافتراضي لا يمكن إلغاؤه من داخل خياراته لمنع حدوث سيناريو عدم وجود أي خادم افتراضي
const isDefaultDisabled = computed(() => {
  if (isEdit.value && formData.value.is_default) {
    return true;
  }
  return false;
});

const loadWhatsAppAccounts = async () => {
  loading.value = true;
  try {
    const response = await whatsappApi.get(null, { showLoading: false, showError: false });
    whatsappAccounts.value = response.data || [];
  } catch (e) {
    toast.error('حدث خطأ أثناء تحميل حسابات الواتساب');
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  accountTokenConfigured.value = false;
  formData.value = {
    id: null,
    title: '',
    phone_number_id: '',
    waba_id: '',
    access_token: '',
    is_active: true,
    is_default: whatsappAccounts.value.length === 0, // تلقائياً أول حساب مضاف يكون افتراضي
    is_global: false,
  };
  showDialog.value = true;
};

const openEditDialog = (account) => {
  isEdit.value = true;
  accountTokenConfigured.value = !!account.access_token_configured;
  formData.value = {
    id: account.id,
    title: account.title || '',
    phone_number_id: account.phone_number_id || '',
    waba_id: account.waba_id || '',
    access_token: '', // نتركها فارغة إلا في حال رغب في تغييرها
    is_active: !!account.is_active,
    is_default: !!account.is_default,
    is_global: !!account.is_global,
  };
  showDialog.value = true;
};

const saveAccount = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) {
    toast.error('يرجى التحقق من المدخلات بشكل صحيح.');
    return;
  }

  saving.value = true;
  try {
    let response;
    if (isEdit.value) {
      response = await whatsappApi.update(formData.value.id, formData.value, { showLoading: false });
    } else {
      response = await whatsappApi.create(formData.value, { showLoading: false });
    }

    if (response.data) {
      toast.success(isEdit.value ? 'تم تحديث حساب الواتساب بنجاح' : 'تم إضافة حساب الواتساب بنجاح');
      showDialog.value = false;
      await loadWhatsAppAccounts();
    }
  } catch (e) {
    console.error('Save whatsapp settings failed', e);
  } finally {
    saving.value = false;
  }
};

const toggleAccountActive = async (account) => {
  try {
    const payload = {
      title: account.title,
      phone_number_id: account.phone_number_id,
      waba_id: account.waba_id,
      is_active: account.is_active,
      is_default: account.is_default,
    };
    await whatsappApi.update(account.id, payload, { showLoading: false });
    toast.success(`تم ${account.is_active ? 'تنشيط' : 'تعطيل'} حساب الواتساب "${account.title}" بنجاح.`);
    await loadWhatsAppAccounts();
  } catch (e) {
    // التراجع في حال الفشل
    account.is_active = !account.is_active;
    console.error(e);
  }
};

const setAccountDefault = async (account) => {
  try {
    const response = await whatsappApi.request('POST', `${account.id}/set-default`, null, { showLoading: true });
    if (response.status) {
      toast.success(`تم تعيين حساب الواتساب "${account.title}" كحساب افتراضي للنظام.`);
      await loadWhatsAppAccounts();
    }
  } catch (e) {
    console.error(e);
  }
};

const openTestDialog = (account) => {
  activeAccountForTest.value = account;
  testRecipient.value = '';
  showTestDialog.value = true;
};

const testWhatsAppConnection = async () => {
  if (!testRecipient.value || !activeAccountForTest.value) return;
  testingConnection.value = true;
  try {
    const response = await whatsappApi.request('POST', `${activeAccountForTest.value.id}/test`, { recipient: testRecipient.value }, { showLoading: false });
    toast.success(response.message || 'تم إرسال رسالة الاختبار بنجاح، يرجى التحقق من جوال المستلم.');
    showTestDialog.value = false;
  } catch (e) {
    console.error('Test whatsapp connection failed', e);
  } finally {
    testingConnection.value = false;
  }
};

const confirmDeleteAccount = (account) => {
  accountToDelete.value = account;
  showDeleteDialog.value = true;
};

const deleteAccount = async () => {
  if (!accountToDelete.value) return;
  deleting.value = true;
  try {
    const response = await whatsappApi.remove(accountToDelete.value.id, { showLoading: false });
    if (response.status) {
      toast.success('تم حذف حساب الواتساب بنجاح');
      showDeleteDialog.value = false;
      await loadWhatsAppAccounts();
    } else {
      toast.error(response.message || 'فشل حذف الحساب');
    }
  } catch (e) {
    console.error(e);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await loadWhatsAppAccounts();
});
</script>

<style scoped>
.whatsapp-settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.text-ltr {
  direction: ltr;
}
.whatsapp-accounts-table th {
  font-weight: bold !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
