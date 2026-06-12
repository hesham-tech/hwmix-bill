<!--   شاشة إدارة حسابات البريد الإلكتروني المتعددة للشركة، تدعم عرض القائمة، إضافة/تعديل الحسابات، اختبار الاتصال وتحديد الحساب الافتراضي والنشط -->

<template>
  <div class="mail-settings-page">
    <!-- Header -->
    <div class="page-header mb-8 d-flex align-center justify-between flex-wrap gap-4">
      <div>
        <div class="d-flex align-center gap-2 mb-2">
          <v-btn icon="ri-arrow-right-line" variant="text" @click="router.push({ name: 'settings' })" />
          <h1 class="text-h3 font-weight-bold primary--text">إعدادات البريد الإلكتروني</h1>
        </div>
        <p class="text-subtitle-1 text-grey-darken-1">إضافة وإدارة خوادم SMTP أو مزودي الخدمة وتعيين الحساب الافتراضي للمراسلات التلقائية</p>
      </div>
      <div>
        <v-btn color="primary" prepend-icon="ri-add-line" class="rounded-pill font-weight-bold tour-mail-add" elevation="2" @click="openAddDialog">
          إضافة حساب بريد
        </v-btn>
      </div>
    </div>

    <!-- Mail Accounts Table Card -->
    <AppCard title="حسابات البريد الإلكتروني المتاحة" icon="ri-mail-settings-line" icon-color="primary" class="tour-mail-list">
      <v-table class="mail-accounts-table">
        <thead>
          <tr>
            <th class="text-start">العنوان</th>
            <th class="text-start">مزود الخدمة</th>
            <th class="text-start">البريد الإلكتروني</th>
            <th class="text-start">اسم المرسل</th>
            <th class="text-center">حالة التنشيط</th>
            <th class="text-center">الافتراضي</th>
            <th class="text-end">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="mailAccounts.length === 0">
            <td colspan="7" class="text-center py-8 text-grey-darken-1">
              <v-icon icon="ri-mail-open-line" size="40" class="mb-2 d-block mx-auto text-grey-lighten-1" />
              لا توجد حسابات بريد مضافة حالياً. قم بإضافة حساب بريد للبدء.
            </td>
          </tr>
          <tr v-for="account in mailAccounts" :key="account.id">
            <td class="font-weight-bold">
              {{ account.title }}
              <v-chip v-if="account.is_global" color="purple" size="x-small" variant="flat" class="ms-2 font-weight-bold">سيستم</v-chip>
            </td>
            <td>
              <v-chip size="small" :color="getTransportColor(account.mail_transport)" variant="tonal" class="text-uppercase">
                {{ account.mail_transport }}
              </v-chip>
            </td>
            <td class="text-ltr">{{ account.mail_from_address }}</td>
            <td>{{ account.mail_from_name }}</td>
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
                class="tour-mail-default font-weight-bold"
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
                      icon="ri-mail-send-line"
                      variant="text"
                      color="primary"
                      size="small"
                      class="tour-mail-test"
                      @click="openTestMailDialog(account)"
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
    <v-dialog v-model="showDialog" max-width="700" persistent>
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h4 font-weight-bold mb-4 d-flex align-center gap-2">
          <v-icon :icon="isEdit ? 'ri-edit-box-line' : 'ri-add-circle-line'" color="primary" />
          <span>{{ isEdit ? 'تعديل حساب بريد' : 'إضافة حساب بريد جديد' }}</span>
        </v-card-title>

        <v-card-text class="pa-2">
          <v-form ref="formRef" v-model="formValid">
            <v-row dense>
              <!-- Account Title -->
              <v-col cols="12" md="6">
                <AppInput v-model="formData.title" label="عنوان الحساب (تسمية توضيحية) *" placeholder="مثال: بريد الفواتير الأساسي" required />
              </v-col>

              <!-- Transport Selection -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.mail_transport"
                  :items="[
                    { title: 'SMTP Server', value: 'smtp' },
                    { title: 'Mailgun Service', value: 'mailgun' },
                    { title: 'Amazon SES', value: 'ses' },
                  ]"
                  label="مزود الخدمة (Transport) *"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>

              <!-- Default Sender Address -->
              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.mail_from_address"
                  label="البريد الإلكتروني للمرسل الافتراضي *"
                  placeholder="noreply@example.com"
                  type="email"
                  dir="ltr"
                  required
                />
              </v-col>

              <!-- Default Sender Name -->
              <v-col cols="12" md="6">
                <AppInput v-model="formData.mail_from_name" label="اسم المرسل الافتراضي *" placeholder="مثال: شركة هيرميس للفواتير" required />
              </v-col>

              <!-- SMTP Config Fields -->
              <template v-if="formData.mail_transport === 'smtp'">
                <v-col cols="12" md="8">
                  <AppInput v-model="formData.mail_host" label="عنوان خادم SMTP *" placeholder="smtp.mailtrap.io" dir="ltr" required />
                </v-col>

                <v-col cols="12" md="4">
                  <AppInput v-model="formData.mail_port" label="منفذ خادم SMTP *" placeholder="587" type="number" dir="ltr" required />
                </v-col>

                <v-col cols="12" md="6">
                  <AppInput v-model="formData.mail_username" label="اسم المستخدم لـ SMTP *" placeholder="username / api_key" dir="ltr" required />
                </v-col>

                <v-col cols="12" md="6">
                  <AppInput
                    v-model="formData.mail_password"
                    label="كلمة مرور SMTP"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="ri-lock-line"
                    placeholder="••••••••••••"
                    dir="ltr"
                  >
                    <template v-slot:append-inner>
                      <v-btn icon variant="text" size="x-small" density="comfortable" @click.stop="showPassword = !showPassword">
                        <v-icon :icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'" />
                      </v-btn>
                    </template>
                  </AppInput>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.mail_encryption"
                    :items="[
                      { title: 'TLS (افتراضي)', value: 'tls' },
                      { title: 'SSL', value: 'ssl' },
                      { title: 'بدون تشفير', value: null },
                    ]"
                    label="نوع التشفير"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </template>

              <!-- Switches for Active and Default -->
              <v-col cols="12" class="d-flex align-center flex-wrap gap-4 mt-2">
                <v-switch v-model="formData.is_active" label="تنشيط الحساب مباشرة" color="success" hide-details density="comfortable" />
                <v-switch
                  v-model="formData.is_default"
                  label="تعيين كحساب بريد افتراضي للنظام"
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

    <!-- SMTP Connection Test Dialog -->
    <v-dialog v-model="showTestDialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold mb-2">إرسال بريد تجريبي</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            أدخل البريد الإلكتروني الذي ترغب في استقبال رسالة الاختبار عليه للتأكد من فاعلية خادم البريد المختار:
            <strong>({{ activeAccountForTest?.title }})</strong>
          </p>
          <AppInput v-model="testEmail" label="البريد المستلم" placeholder="recipient@example.com" type="email" dir="ltr" required />
        </v-card-text>
        <v-card-actions class="d-flex justify-end gap-2">
          <v-btn variant="text" color="grey" @click="showTestDialog = false">إلغاء</v-btn>
          <v-btn color="primary" :loading="testingMail" :disabled="!testEmail" @click="testMailConnection">إرسال</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold text-error mb-2">حذف حساب البريد</v-card-title>
        <v-card-text class="text-body-1 text-grey-darken-3">
          هل أنت متأكد من رغبتك في حذف خادم البريد <strong>"{{ accountToDelete?.title }}"</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
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
const mailApi = useApi('/api/mail-settings');
const userStore = useUserStore();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showPassword = ref(false);
const showDialog = ref(false);
const showTestDialog = ref(false);
const showDeleteDialog = ref(false);

const formValid = ref(false);
const formRef = ref(null);
const isEdit = ref(false);
const testEmail = ref('');
const testingMail = ref(false);

const mailAccounts = ref([]);
const activeAccountForTest = ref(null);
const accountToDelete = ref(null);

const formData = ref({
  id: null,
  title: '',
  mail_transport: 'smtp',
  mail_host: '',
  mail_port: 587,
  mail_username: '',
  mail_password: '',
  mail_encryption: 'tls',
  mail_from_address: '',
  mail_from_name: '',
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

const loadMailAccounts = async () => {
  loading.value = true;
  try {
    const response = await mailApi.get(null, { showLoading: false, showError: false });
    mailAccounts.value = response.data || [];
  } catch (e) {
    toast.error('حدث خطأ أثناء تحميل حسابات البريد الإلكتروني');
  } finally {
    loading.value = false;
  }
};

const getTransportColor = transport => {
  if (transport === 'smtp') return 'primary';
  if (transport === 'mailgun') return 'purple';
  return 'indigo';
};

const openAddDialog = () => {
  isEdit.value = false;
  formData.value = {
    id: null,
    title: '',
    mail_transport: 'smtp',
    mail_host: '',
    mail_port: 587,
    mail_username: '',
    mail_password: '',
    mail_encryption: 'tls',
    mail_from_address: '',
    mail_from_name: '',
    is_active: true,
    is_default: mailAccounts.value.length === 0, // تلقائياً أول خادم مضاف يكون افتراضي
    is_global: false,
  };
  showDialog.value = true;
};

const openEditDialog = account => {
  isEdit.value = true;
  formData.value = {
    id: account.id,
    title: account.title || '',
    mail_transport: account.mail_transport || 'smtp',
    mail_host: account.mail_host || '',
    mail_port: account.mail_port || 587,
    mail_username: account.mail_username || '',
    mail_password: account.mail_password || '', // إظهار كلمة المرور الحالية المسترجعة من الباك اند
    mail_encryption: account.mail_encryption || 'tls',
    mail_from_address: account.mail_from_address || '',
    mail_from_name: account.mail_from_name || '',
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
      response = await mailApi.update(formData.value.id, formData.value, { showLoading: false });
    } else {
      response = await mailApi.create(formData.value, { showLoading: false });
    }

    if (response.data) {
      toast.success(isEdit.value ? 'تم تحديث حساب البريد بنجاح' : 'تم إضافة حساب البريد بنجاح');
      showDialog.value = false;
      await loadMailAccounts();
    }
  } catch (e) {
    console.error('Save mail settings failed', e);
  } finally {
    saving.value = false;
  }
};

const toggleAccountActive = async account => {
  try {
    const payload = {
      title: account.title,
      mail_transport: account.mail_transport,
      mail_host: account.mail_host,
      mail_port: account.mail_port,
      mail_username: account.mail_username,
      mail_from_address: account.mail_from_address,
      mail_from_name: account.mail_from_name,
      is_active: account.is_active,
      is_default: account.is_default,
    };
    await mailApi.update(account.id, payload, { showLoading: false });
    toast.success(`تم ${account.is_active ? 'تنشيط' : 'تعطيل'} حساب البريد "${account.title}" بنجاح.`);
    await loadMailAccounts();
  } catch (e) {
    // التراجع في حال الفشل
    account.is_active = !account.is_active;
    console.error(e);
  }
};

const setAccountDefault = async account => {
  try {
    const response = await mailApi.request('POST', `${account.id}/set-default`, null, { showLoading: true });
    if (response.status) {
      toast.success(`تم تعيين حساب البريد "${account.title}" كحساب افتراضي للنظام.`);
      await loadMailAccounts();
    }
  } catch (e) {
    console.error(e);
  }
};

const openTestMailDialog = account => {
  activeAccountForTest.value = account;
  testEmail.value = '';
  showTestDialog.value = true;
};

const testMailConnection = async () => {
  if (!testEmail.value || !activeAccountForTest.value) return;
  testingMail.value = true;
  try {
    const response = await mailApi.request('POST', `${activeAccountForTest.value.id}/test`, { recipient: testEmail.value }, { showLoading: false });
    toast.success(response.message || 'تم إرسال بريد الاختبار بنجاح، يرجى التحقق من صندوق الوارد.');
    showTestDialog.value = false;
  } catch (e) {
    console.error('Test mail connection failed', e);
  } finally {
    testingMail.value = false;
  }
};

const confirmDeleteAccount = account => {
  accountToDelete.value = account;
  showDeleteDialog.value = true;
};

const deleteAccount = async () => {
  if (!accountToDelete.value) return;
  deleting.value = true;
  try {
    const response = await mailApi.remove(accountToDelete.value.id, { showLoading: false });
    if (response.status) {
      toast.success('تم حذف حساب البريد الإلكتروني بنجاح');
      showDeleteDialog.value = false;
      await loadMailAccounts();
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
  await loadMailAccounts();
});
</script>

<style scoped>
.mail-settings-page {
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
.mail-accounts-table th {
  font-weight: bold !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
