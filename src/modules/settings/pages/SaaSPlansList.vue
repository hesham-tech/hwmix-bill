<!-- تعليق عربي: شاشة إدارة باقات الساس (SaaS Plans) للسوبر أدمن لإنشاء وتعديل الباقات والتحكم بمرونة في الميزات والحدود العددية للمستأجرين -->

<template>
  <div class="saas-plans-page">
    <!-- Header -->
    <div class="page-header mb-6 d-flex align-center justify-between flex-wrap gap-4">
      <div>
        <div class="d-flex align-center gap-2 mb-2">
          <v-btn icon="ri-arrow-right-line" variant="text" @click="router.push({ name: 'settings' })" />
          <h1 class="text-h3 font-weight-bold primary--text">إدارة باقات SaaS</h1>
        </div>
        <p class="text-subtitle-1 text-grey-darken-1">تحديد الميزات وتعيين قيود الموارد وتشكيل الباقات بمرونة كاملة للسوبر أدمن</p>
      </div>
      <div>
        <v-btn
          color="primary"
          prepend-icon="ri-add-line"
          class="rounded-pill font-weight-bold"
          elevation="2"
          @click="handleCreate"
        >
          إضافة باقة جديدة
        </v-btn>
      </div>
    </div>

    <!-- Plans Table -->
    <v-card class="rounded-xl border border-opacity-10 shadow-sm overflow-hidden">
      <v-card-title class="d-flex align-center py-4 px-6 bg-light-primary">
        <v-icon icon="ri-vip-crown-line" color="primary" class="me-2" />
        <span class="font-weight-bold text-h6">قائمة الباقات والأسعار</span>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="plans"
          :loading="loading"
          density="comfortable"
          class="plans-table"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar color="primary" variant="tonal" size="36" class="me-3">
                <v-icon :icon="item.icon || 'ri-vip-crown-line'" size="18" />
              </v-avatar>
              <div>
                <div class="font-weight-bold text-body-1">{{ item.name }}</div>
                <div class="text-caption text-grey">{{ item.code }}</div>
              </div>
            </div>
          </template>

          <template #item.price="{ item }">
            <span class="font-weight-bold text-primary">{{ item.price }} {{ item.currency }}</span>
          </template>

          <template #item.duration="{ item }">
            <span>{{ item.duration }} / {{ getDurationUnitLabel(item.duration_unit) }}</span>
          </template>

          <template #item.trial_days="{ item }">
            <v-chip size="small" color="info" variant="tonal">
              {{ item.trial_days }} يوم تجربة
            </v-chip>
          </template>

          <template #item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
              {{ item.is_active ? 'نشط' : 'معطل' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1 justify-end">
              <v-btn icon="ri-edit-line" size="small" variant="text" color="primary" @click="handleEdit(item)" />
              <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="handleDelete(item)" />
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-12 text-grey-darken-1">
              <v-icon icon="ri-vip-crown-line" size="64" class="mb-4 text-grey-lighten-1" />
              <div class="text-h6 mb-2">لا توجد باقات حالياً</div>
              <p class="text-body-2">قم بإنشاء باقتك الأولى لتظهر للمستخدمين بصفحة التسجيل والهبوط</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog Edit/Add -->
    <v-dialog v-model="showDialog" max-width="850" persistent scrollable>
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="ri-vip-crown-line" class="me-2" />
          <span class="font-weight-bold">{{ isEdit ? 'تعديل الباقة' : 'باقة جديدة' }}</span>
          <v-spacer />
          <v-btn icon="ri-close-line" color="white" variant="text" @click="showDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6" style="max-height: 70vh;">
          <v-form ref="formRef" v-model="formValid">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-primary">المعلومات الأساسية</h3>
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="اسم الباقة *"
                  placeholder="مثال: الباقة الاحترافية"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.code"
                  label="كود الباقة الفريد *"
                  placeholder="مثال: premium"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  :disabled="isEdit"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.price"
                  label="سعر الباقة *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="EGP"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.duration"
                  label="المدة *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.duration_unit"
                  label="وحدة المدة *"
                  :items="[
                    { title: 'أيام', value: 'days' },
                    { title: 'شهور', value: 'months' },
                    { title: 'سنوات', value: 'years' }
                  ]"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.trial_days"
                  label="أيام التجربة المجانية (Trial Days) *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.icon"
                  label="أيقونة الباقة (Icon Class)"
                  placeholder="مثال: ri-vip-crown-line"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="وصف الباقة"
                  placeholder="اكتب وصفاً موجزاً للميزات المعروضة للمستخدم"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="formData.is_active"
                  color="success"
                  label="تنشيط الباقة لعرضها بالموقع والاشتراكات"
                  inset
                />
              </v-col>
            </v-row>

            <v-divider class="mb-6" />

            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-primary">الميزات والصلاحيات (تفعيل / تعطيل)</h3>
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.payment_gateways"
                  color="primary"
                  label="تفعيل بوابات الدفع الإلكتروني (Stripe/Paymob)"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.export_import"
                  color="primary"
                  label="تفعيل استيراد وتصدير المنتجات بالخلفية"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.mail_settings"
                  color="primary"
                  label="إتاحة إعدادات خادم البريد المخصص للشركة"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.warehouses_multi"
                  color="primary"
                  label="تنشيط المخازن المتعددة"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.installment_system"
                  color="primary"
                  label="تنشيط نظام التقسيط وإدارة الخطط"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.activity_logs"
                  color="primary"
                  label="إتاحة الوصول لسجل الأنشطة والعمليات"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.reports_advanced"
                  color="primary"
                  label="تنشيط التقارير المالية المتقدمة"
                  inset
                  density="compact"
                />
              </v-col>
            </v-row>

            <v-divider class="mb-6" />

            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-primary">الحدود والقيود العددية (Numeric Limits)</h3>
            <p class="text-caption text-grey mb-4">* ملاحظة: اكتب القيمة (-1) أو اترك الحقل فارغاً لجعل الحد غير محدود</p>
            <v-row>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_users"
                  label="الحد الأقصى للمستخدمين"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_products"
                  label="الحد الأقصى للمنتجات"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_invoices"
                  label="الحد الأقصى للفواتير"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="featuresData.max_warehouses"
                  label="الحد الأقصى للمخازن"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer />
          <v-btn variant="text" class="rounded-pill font-weight-bold" @click="showDialog = false">إلغاء</v-btn>
          <v-btn color="primary" class="rounded-pill px-6 font-weight-bold" :loading="saving" @click="handleSave">حفظ الباقة</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">تأكيد الحذف</v-card-title>
        <v-card-text>
          هل أنت متأكد من حذف الباقة "<strong>{{ selectedItem?.name }}</strong>"؟
          <div class="text-caption text-error mt-2">لا يمكن الحذف إذا كانت الباقة مرتبطة باشتراك نشط حالي لبعض الشركات.</div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">إلغاء</v-btn>
          <v-btn color="error" class="rounded-pill font-weight-bold px-4" :loading="deleting" @click="confirmDelete">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';

const router = useRouter();
const api = useApi('/api/plans');

const plans = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formValid = ref(false);
const formRef = ref(null);

const formData = ref({
  name: '',
  code: '',
  description: '',
  price: 0,
  currency: 'EGP',
  duration: 1,
  duration_unit: 'months',
  trial_days: 0,
  is_active: true,
  max_users: null,
  max_products: null,
  max_invoices: null,
  icon: 'ri-vip-crown-line'
});

const featuresData = ref({
  payment_gateways: false,
  export_import: false,
  mail_settings: false,
  warehouses_multi: false,
  installment_system: false,
  activity_logs: false,
  reports_advanced: false,
  max_warehouses: null
});

const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'اسم الباقة والكود', key: 'name', sortable: true },
  { title: 'السعر', key: 'price', sortable: true },
  { title: 'المدة', key: 'duration', sortable: true },
  { title: 'فترة التجربة', key: 'trial_days', sortable: true },
  { title: 'حالة الباقة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب'
};

const getDurationUnitLabel = unit => {
  if (unit === 'days') return 'يوم';
  if (unit === 'months') return 'شهر';
  if (unit === 'years') return 'سنة';
  return unit;
};

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get();
    plans.value = response.data || [];
  } catch (error) {
    console.error('Failed to load plans:', error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = {
    name: '',
    code: '',
    description: '',
    price: 0,
    currency: 'EGP',
    duration: 1,
    duration_unit: 'months',
    trial_days: 0,
    is_active: true,
    max_users: null,
    max_products: null,
    max_invoices: null,
    icon: 'ri-vip-crown-line'
  };
  featuresData.value = {
    payment_gateways: false,
    export_import: false,
    mail_settings: false,
    warehouses_multi: false,
    installment_system: false,
    activity_logs: false,
    reports_advanced: false,
    max_warehouses: null
  };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = {
    name: item.name,
    code: item.code,
    description: item.description || '',
    price: item.price,
    currency: item.currency || 'EGP',
    duration: item.duration,
    duration_unit: item.duration_unit || 'months',
    trial_days: item.trial_days || 0,
    is_active: !!item.is_active,
    max_users: item.max_users === -1 ? null : item.max_users,
    max_products: item.max_products === -1 ? null : item.max_products,
    max_invoices: item.max_invoices === -1 ? null : item.max_invoices,
    icon: item.icon || 'ri-vip-crown-line'
  };

  // فك ميزات JSON وتعبئتها
  let feats = item.features || {};
  if (typeof feats === 'string') {
    try {
      feats = JSON.parse(feats);
    } catch (e) {
      feats = {};
    }
  }

  featuresData.value = {
    payment_gateways: !!feats.payment_gateways,
    export_import: !!feats.export_import,
    mail_settings: !!feats.mail_settings,
    warehouses_multi: !!feats.warehouses_multi,
    installment_system: !!feats.installment_system,
    activity_logs: !!feats.activity_logs,
    reports_advanced: !!feats.reports_advanced,
    max_warehouses: feats.max_warehouses === -1 || !feats.max_warehouses ? null : feats.max_warehouses
  };

  showDialog.value = true;
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  if (formRef.value) {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  saving.value = true;

  // إعداد حقل features كـ JSON object بالكامل للميزات والحدود
  const finalFeatures = {
    payment_gateways: !!featuresData.value.payment_gateways,
    export_import: !!featuresData.value.export_import,
    mail_settings: !!featuresData.value.mail_settings,
    warehouses_multi: !!featuresData.value.warehouses_multi,
    installment_system: !!featuresData.value.installment_system,
    activity_logs: !!featuresData.value.activity_logs,
    reports_advanced: !!featuresData.value.reports_advanced,
    max_users: formData.value.max_users !== null && formData.value.max_users !== '' ? Number(formData.value.max_users) : -1,
    max_products: formData.value.max_products !== null && formData.value.max_products !== '' ? Number(formData.value.max_products) : -1,
    max_invoices: formData.value.max_invoices !== null && formData.value.max_invoices !== '' ? Number(formData.value.max_invoices) : -1,
    max_warehouses: featuresData.value.max_warehouses !== null && featuresData.value.max_warehouses !== '' ? Number(featuresData.value.max_warehouses) : -1,
  };

  const payload = {
    ...formData.value,
    features: finalFeatures,
    // أيضاً نملأ الأعمدة المباشرة بقاعدة البيانات للحدود المتوافقة
    max_users: formData.value.max_users !== null && formData.value.max_users !== '' ? Number(formData.value.max_users) : -1,
    max_products: formData.value.max_products !== null && formData.value.max_products !== '' ? Number(formData.value.max_products) : -1,
    max_invoices: formData.value.max_invoices !== null && formData.value.max_invoices !== '' ? Number(formData.value.max_invoices) : -1,
  };

  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, payload, { successMessage: 'تم تحديث الباقة بنجاح' });
    } else {
      await api.create(payload, { successMessage: 'تم إضافة الباقة بنجاح' });
    }
    showDialog.value = false;
    loadData();
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await api.remove(selectedItem.value.id, { successMessage: 'تم حذف الباقة بنجاح' });
    showDeleteDialog.value = false;
    loadData();
  } catch (error) {
    console.error('Delete failed:', error);
  } finally {
    deleting.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.saas-plans-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
}

.plans-table {
  border: none;
}

.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
