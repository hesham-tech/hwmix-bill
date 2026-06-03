<!-- تعليق عربي: صفحة إدارة وإعداد بوابات الدفع الإلكتروني المتعددة للشركة، تتيح سرد البوابات وتنشيطها وحذفها وتعيين البوابة الافتراضية للمعاملات. -->

<template>
  <div class="payment-gateway-settings-page">
    <!-- Header -->
    <div class="page-header mb-8 d-flex align-center justify-between flex-wrap gap-4">
      <div>
        <div class="d-flex align-center gap-2 mb-2">
          <v-btn icon="ri-arrow-right-line" variant="text" @click="router.push({ name: 'settings' })" />
          <h1 class="text-h3 font-weight-bold primary--text">بوابات الدفع الإلكتروني</h1>
        </div>
        <p class="text-subtitle-1 text-grey-darken-1">تهيئة وإعداد بوابات الدفع Stripe و Paymob لتوفير الدفع الإلكتروني الآمن لعملائك</p>
      </div>
      <div>
        <v-btn
          color="primary"
          prepend-icon="ri-add-line"
          class="rounded-pill font-weight-bold tour-payment-add"
          elevation="2"
          @click="openAddDialog"
        >
          إضافة بوابة دفع
        </v-btn>
      </div>
    </div>

    <!-- Payment Gateways Table Card -->
    <AppCard title="بوابات الدفع المتاحة للشركة" icon="ri-bank-card-line" icon-color="primary" class="tour-payment-list">
      <v-table class="gateways-table">
        <thead>
          <tr>
            <th class="text-start">اسم البوابة</th>
            <th class="text-start">المشغل (Driver)</th>
            <th class="text-center">وضع التجربة</th>
            <th class="text-center">حالة التنشيط</th>
            <th class="text-center">الافتراضي</th>
            <th class="text-end">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="gateways.length === 0">
            <td colspan="6" class="text-center py-8 text-grey-darken-1">
              <v-icon icon="ri-bank-card-2-line" size="40" class="mb-2 d-block mx-auto text-grey-lighten-1" />
              لا توجد بوابات دفع مضافة حالياً. قم بإضافة بوابة دفع للبدء.
            </td>
          </tr>
          <tr v-for="gateway in gateways" :key="gateway.id">
            <td class="font-weight-bold">{{ gateway.name }}</td>
            <td>
              <v-chip size="small" :color="getDriverColor(gateway.driver)" variant="tonal" class="text-uppercase font-weight-bold">
                {{ gateway.driver }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-chip
                size="small"
                :color="gateway.is_test_mode ? 'warning' : 'success'"
                variant="flat"
                class="font-weight-bold"
              >
                {{ gateway.is_test_mode ? 'وضع تجريبي' : 'وضع حقيقي' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-switch
                v-model="gateway.is_active"
                color="success"
                hide-details
                inset
                density="compact"
                class="d-inline-block"
                @update:model-value="toggleGatewayActive(gateway)"
              />
            </td>
            <td class="text-center">
              <v-chip
                v-if="gateway.is_default"
                color="warning"
                size="small"
                variant="flat"
                prepend-icon="ri-star-fill"
                class="font-weight-bold"
              >
                الافتراضية
              </v-chip>
              <v-btn
                v-else
                size="x-small"
                variant="outlined"
                color="grey-darken-1"
                class="rounded-pill"
                :disabled="!gateway.is_active"
                @click="setGatewayDefault(gateway)"
              >
                تعيين كافتراضي
              </v-btn>
            </td>
            <td class="text-end">
              <div class="d-flex align-center justify-end gap-1">
                <v-tooltip text="تعديل الإعدادات" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="tooltipProps"
                      icon="ri-edit-line"
                      variant="text"
                      color="info"
                      size="small"
                      @click="openEditDialog(gateway)"
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
                      @click="confirmDeleteGateway(gateway)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </AppCard>

    <!-- Add/Edit Gateway Modal Dialog -->
    <v-dialog v-model="showDialog" max-width="700" persistent>
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h4 font-weight-bold mb-4 d-flex align-center gap-2">
          <v-icon :icon="isEdit ? 'ri-edit-box-line' : 'ri-add-circle-line'" color="primary" />
          <span>{{ isEdit ? 'تعديل بوابة الدفع' : 'إضافة بوابة دفع جديدة' }}</span>
        </v-card-title>

        <v-card-text class="pa-2">
          <v-form ref="formRef" v-model="formValid">
            <v-row dense>
              <!-- Gateway Name -->
              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.name"
                  label="اسم البوابة (تسمية توضيحية) *"
                  placeholder="مثال: الدفع عبر فيزا / ماستر كارد"
                  required
                />
              </v-col>

              <!-- Driver Selection -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.driver"
                  :items="[
                    { title: 'Stripe Gateway', value: 'stripe' },
                    { title: 'Paymob Gateway', value: 'paymob' }
                  ]"
                  label="نوع بوابة الدفع (Driver) *"
                  variant="outlined"
                  density="comfortable"
                  :disabled="isEdit"
                  required
                  @update:model-value="onDriverChange"
                />
              </v-col>

              <!-- Stripe Config Fields -->
              <template v-if="formData.driver === 'stripe'">
                <v-col cols="12">
                  <AppInput
                    v-model="formData.config.publishable_key"
                    label="Publishable Key *"
                    placeholder="pk_test_..."
                    dir="ltr"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <AppInput
                    v-model="formData.config.secret_key"
                    label="Secret Key *"
                    :type="showSecret ? 'text' : 'password'"
                    placeholder="sk_test_..."
                    dir="ltr"
                    required
                  >
                    <template v-slot:append-inner>
                      <v-btn icon variant="text" size="x-small" density="comfortable" @click.stop="showSecret = !showSecret">
                        <v-icon :icon="showSecret ? 'ri-eye-off-line' : 'ri-eye-line'" />
                      </v-btn>
                    </template>
                  </AppInput>
                </v-col>

                <v-col cols="12">
                  <AppInput
                    v-model="formData.config.webhook_secret"
                    label="Webhook Secret"
                    :type="showWebhook ? 'text' : 'password'"
                    placeholder="whsec_..."
                    dir="ltr"
                  >
                    <template v-slot:append-inner>
                      <v-btn icon variant="text" size="x-small" density="comfortable" @click.stop="showWebhook = !showWebhook">
                        <v-icon :icon="showWebhook ? 'ri-eye-off-line' : 'ri-eye-line'" />
                      </v-btn>
                    </template>
                  </AppInput>
                </v-col>
              </template>

              <!-- Paymob Config Fields -->
              <template v-if="formData.driver === 'paymob'">
                <v-col cols="12">
                  <AppInput
                    v-model="formData.config.api_key"
                    label="API Key *"
                    :type="showSecret ? 'text' : 'password'"
                    placeholder="أدخل مفتاح الـ API الخاص بـ Paymob..."
                    dir="ltr"
                    required
                  >
                    <template v-slot:append-inner>
                      <v-btn icon variant="text" size="x-small" density="comfortable" @click.stop="showSecret = !showSecret">
                        <v-icon :icon="showSecret ? 'ri-eye-off-line' : 'ri-eye-line'" />
                      </v-btn>
                    </template>
                  </AppInput>
                </v-col>

                <v-col cols="12" md="6">
                  <AppInput
                    v-model="formData.config.integration_id"
                    label="Integration ID *"
                    placeholder="معرف الدمج (Integration ID)"
                    dir="ltr"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <AppInput
                    v-model="formData.config.iframe_id"
                    label="Iframe ID *"
                    placeholder="معرف الإطار (Iframe ID)"
                    dir="ltr"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <AppInput
                    v-model="formData.config.hmac_secret"
                    label="HMAC Secret *"
                    :type="showWebhook ? 'text' : 'password'"
                    placeholder="أدخل HMAC Secret للتحقق من المعاملات..."
                    dir="ltr"
                    required
                  >
                    <template v-slot:append-inner>
                      <v-btn icon variant="text" size="x-small" density="comfortable" @click.stop="showWebhook = !showWebhook">
                        <v-icon :icon="showWebhook ? 'ri-eye-off-line' : 'ri-eye-line'" />
                      </v-btn>
                    </template>
                  </AppInput>
                </v-col>
              </template>

              <!-- Switches for Active, Test Mode, and Default -->
              <v-col cols="12" class="d-flex align-center flex-wrap gap-4 mt-2">
                <v-switch
                  v-model="formData.is_active"
                  label="تنشيط البوابة مباشرة"
                  color="success"
                  hide-details
                  density="comfortable"
                />
                <v-switch
                  v-model="formData.is_test_mode"
                  label="وضع التجربة (Test Mode)"
                  color="warning"
                  hide-details
                  density="comfortable"
                />
                <v-switch
                  v-model="formData.is_default"
                  label="تعيين كبوابة دفع افتراضية للنظام"
                  color="info"
                  hide-details
                  density="comfortable"
                  :disabled="isDefaultDisabled"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="d-flex justify-end gap-2 mt-4">
          <v-btn variant="text" color="grey" @click="showDialog = false">إلغاء</v-btn>
          <v-btn color="success" :loading="saving" :disabled="!formValid" prepend-icon="ri-save-line" class="px-6 rounded-pill font-weight-bold" @click="saveGateway">
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold text-error mb-2">حذف بوابة الدفع</v-card-title>
        <v-card-text class="text-body-1 text-grey-darken-3">
          هل أنت متأكد من رغبتك في حذف بوابة الدفع <strong>"{{ gatewayToDelete?.name }}"</strong> نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
        </v-card-text>
        <v-card-actions class="d-flex justify-end gap-2">
          <v-btn variant="text" color="grey" @click="showDeleteDialog = false">تراجع</v-btn>
          <v-btn color="error" :loading="deleting" class="px-4 rounded-pill" @click="deleteGateway">حذف نهائي</v-btn>
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
// تعليق عربي لقواعد الكلاسات: منطق الربط وإعدادات بوابات الدفع الإلكتروني
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const gatewaysApi = useApi('/api/payment-gateways');

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showSecret = ref(false);
const showWebhook = ref(false);
const showDialog = ref(false);
const showDeleteDialog = ref(false);

const formValid = ref(false);
const formRef = ref(null);
const isEdit = ref(false);

const gateways = ref([]);
const gatewayToDelete = ref(null);

const formData = ref({
  id: null,
  name: '',
  driver: 'stripe',
  is_active: true,
  is_test_mode: true,
  is_default: false,
  config: {
    secret_key: '',
    publishable_key: '',
    webhook_secret: '',
  }
});

const isDefaultDisabled = computed(() => {
  if (isEdit.value && formData.value.is_default) {
    return true;
  }
  return false;
});

const loadPaymentGateways = async () => {
  loading.value = true;
  try {
    const response = await gatewaysApi.get(null, { showLoading: false, showError: false });
    gateways.value = response.data || [];
  } catch (e) {
    toast.error('حدث خطأ أثناء تحميل بوابات الدفع الإلكتروني');
  } finally {
    loading.value = false;
  }
};

const getDriverColor = (driver) => {
  if (driver === 'stripe') return 'primary';
  return 'indigo';
};

const onDriverChange = (driver) => {
  if (driver === 'stripe') {
    formData.value.config = {
      secret_key: '',
      publishable_key: '',
      webhook_secret: '',
    };
  } else {
    formData.value.config = {
      api_key: '',
      integration_id: '',
      iframe_id: '',
      hmac_secret: '',
    };
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  formData.value = {
    id: null,
    name: '',
    driver: 'stripe',
    is_active: true,
    is_test_mode: true,
    is_default: gateways.value.length === 0, // تلقائياً أول بوابة مضافة تكون افتراضية
    config: {
      secret_key: '',
      publishable_key: '',
      webhook_secret: '',
    }
  };
  showSecret.value = false;
  showWebhook.value = false;
  showDialog.value = true;
};

const openEditDialog = (gateway) => {
  isEdit.value = true;
  
  // فك التغليف للبيانات للتعديل
  const configData = {};
  if (gateway.driver === 'stripe') {
    configData.secret_key = gateway.config.secret_key || '';
    configData.publishable_key = gateway.config.publishable_key || '';
    configData.webhook_secret = gateway.config.webhook_secret || '';
  } else {
    configData.api_key = gateway.config.api_key || '';
    configData.integration_id = gateway.config.integration_id || '';
    configData.iframe_id = gateway.config.iframe_id || '';
    configData.hmac_secret = gateway.config.hmac_secret || '';
  }

  formData.value = {
    id: gateway.id,
    name: gateway.name || '',
    driver: gateway.driver || 'stripe',
    is_active: !!gateway.is_active,
    is_test_mode: !!gateway.is_test_mode,
    is_default: !!gateway.is_default,
    config: configData,
  };
  
  showSecret.value = false;
  showWebhook.value = false;
  showDialog.value = true;
};

const saveGateway = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) {
    toast.error('يرجى التحقق من المدخلات بشكل صحيح.');
    return;
  }

  saving.value = true;
  try {
    let response;
    
    // إزالة كلمات المرور المقنعة (التي لم تتغير) لتفادي إعادة حفظها وهي مقنعة
    const sanitizedConfig = { ...formData.value.config };
    Object.keys(sanitizedConfig).forEach(key => {
      if (typeof sanitizedConfig[key] === 'string' && sanitizedConfig[key].includes('****')) {
        delete sanitizedConfig[key];
      }
    });

    const payload = {
      name: formData.value.name,
      driver: formData.value.driver,
      is_active: formData.value.is_active,
      is_test_mode: formData.value.is_test_mode,
      is_default: formData.value.is_default,
      config: sanitizedConfig
    };

    if (isEdit.value) {
      response = await gatewaysApi.update(formData.value.id, payload, { showLoading: false });
    } else {
      response = await gatewaysApi.create(payload, { showLoading: false });
    }

    if (response.data) {
      toast.success(isEdit.value ? 'تم تحديث بوابة الدفع بنجاح' : 'تم إضافة بوابة الدفع بنجاح');
      showDialog.value = false;
      await loadPaymentGateways();
    }
  } catch (e) {
    console.error('Save payment gateway failed', e);
  } finally {
    saving.value = false;
  }
};

const toggleGatewayActive = async (gateway) => {
  try {
    const payload = {
      name: gateway.name,
      driver: gateway.driver,
      is_active: gateway.is_active,
      is_test_mode: gateway.is_test_mode,
      is_default: gateway.is_default,
      config: {} // نرسل التكوين فارغ لكي لا نعدله ونبقي عليه مشفر بالخلفية
    };
    await gatewaysApi.update(gateway.id, payload, { showLoading: false });
    toast.success(`تم ${gateway.is_active ? 'تنشيط' : 'تعطيل'} بوابة الدفع "${gateway.name}" بنجاح.`);
    await loadPaymentGateways();
  } catch (e) {
    gateway.is_active = !gateway.is_active;
    console.error(e);
  }
};

const setGatewayDefault = async (gateway) => {
  try {
    const response = await gatewaysApi.request('PATCH', `${gateway.id}/set-default`, null, { showLoading: true });
    if (response.status) {
      toast.success(`تم تعيين بوابة الدفع "${gateway.name}" كبوابة افتراضية للنظام.`);
      await loadPaymentGateways();
    }
  } catch (e) {
    console.error(e);
  }
};

const confirmDeleteGateway = (gateway) => {
  gatewayToDelete.value = gateway;
  showDeleteDialog.value = true;
};

const deleteGateway = async () => {
  if (!gatewayToDelete.value) return;
  deleting.value = true;
  try {
    const response = await gatewaysApi.remove(gatewayToDelete.value.id, { showLoading: false });
    if (response.status) {
      toast.success('تم حذف بوابة الدفع بنجاح');
      showDeleteDialog.value = false;
      await loadPaymentGateways();
    } else {
      toast.error(response.message || 'فشل حذف بوابة الدفع');
    }
  } catch (e) {
    console.error(e);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await loadPaymentGateways();
});
</script>

<style scoped>
.payment-gateway-settings-page {
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
.gateways-table th {
  font-weight: bold !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
