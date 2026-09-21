<template>
  <div class="digital-services-config-page">
    <v-card class="mb-4">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="providers">
          <v-icon start>ri-global-line</v-icon>
          شبكات الدفع (مزودي الخدمة)
        </v-tab>
        <v-tab value="definitions">
          <v-icon start>ri-list-settings-line</v-icon>
          الخدمات المُعرفة
        </v-tab>
      </v-tabs>
    </v-card>

    <v-window v-model="activeTab">
      <!-- Tab 1: Service Providers -->
      <v-window-item value="providers">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between pt-4 px-4">
            <div>
              <div class="text-h6 font-weight-bold">إدارة شبكات الدفع الأساسية</div>
              <div class="text-caption text-grey">أضف الشبكات مثل (فوري، أمان، فودافون كاش، مصاري)</div>
            </div>
            <v-btn color="primary" prepend-icon="ri-add-line" @click="openProviderForm()">
              إضافة شبكة دفع
            </v-btn>
          </v-card-title>
          <v-divider />
          
          <v-data-table
            :headers="providerHeaders"
            :items="providers"
            :loading="loadingProviders"
            hover
          >
            <template #item.is_active="{ item }">
              <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
                {{ item.is_active ? 'نشط' : 'معطل' }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <v-btn icon="ri-edit-line" size="small" variant="text" color="primary" @click="openProviderForm(item)" />
              <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="deleteProvider(item.id)" />
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- Tab 2: Service Definitions -->
      <v-window-item value="definitions">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between pt-4 px-4">
            <div>
              <div class="text-h6 font-weight-bold">إدارة الخدمات المُعرفة</div>
              <div class="text-caption text-grey">اربط الخدمات (إيداع، سحب، دفع فواتير) بكل شبكة</div>
            </div>
            <v-btn color="primary" prepend-icon="ri-add-line" @click="openDefinitionForm()">
              إضافة خدمة
            </v-btn>
          </v-card-title>
          <v-divider />

          <v-data-table
            :headers="definitionHeaders"
            :items="definitions"
            :loading="loadingDefinitions"
            hover
          >
            <template #item.operation_type="{ item }">
              <v-chip size="small" :color="getOperationColor(item.operation_type)">
                {{ getOperationLabel(item.operation_type) }}
              </v-chip>
            </template>
            <template #item.is_active="{ item }">
              <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
                {{ item.is_active ? 'نشط' : 'معطل' }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <v-btn icon="ri-edit-line" size="small" variant="text" color="primary" @click="openDefinitionForm(item)" />
              <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="deleteDefinition(item.id)" />
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Provider Form Dialog -->
    <v-dialog v-model="providerDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white">
          {{ editingProvider ? 'تعديل شبكة دفع' : 'إضافة شبكة دفع' }}
        </v-card-title>
        <v-card-text class="pt-5">
          <v-form ref="providerFormRef" v-model="providerFormValid" @submit.prevent="saveProvider">
            <v-text-field v-model="providerForm.name" label="اسم الشبكة (مثال: فوري)" variant="outlined" :rules="[v => !!v || 'مطلوب']" />
            <v-text-field v-model="providerForm.code" label="كود مميز (مثال: FAWRY)" variant="outlined" :rules="[v => !!v || 'مطلوب']" />
            <v-switch v-model="providerForm.is_active" label="نشط" color="success" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="error" variant="tonal" @click="providerDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="elevated" :loading="saving" :disabled="!providerFormValid" @click="saveProvider">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Definition Form Dialog -->
    <v-dialog v-model="definitionDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white">
          {{ editingDefinition ? 'تعديل خدمة' : 'إضافة خدمة' }}
        </v-card-title>
        <v-card-text class="pt-5">
          <v-form ref="definitionFormRef" v-model="definitionFormValid" @submit.prevent="saveDefinition">
            <v-select v-model="definitionForm.service_provider_id" :items="providers" item-title="name" item-value="id" label="الشبكة التابعة لها" variant="outlined" :rules="[v => !!v || 'مطلوب']" />
            <v-text-field v-model="definitionForm.name" label="اسم الخدمة (مثال: سحب نقدي)" variant="outlined" :rules="[v => !!v || 'مطلوب']" />
            <v-select v-model="definitionForm.operation_type" :items="operationTypes" item-title="text" item-value="value" label="نوع العملية (تأثير مالي)" variant="outlined" :rules="[v => !!v || 'مطلوب']" />
            <v-switch v-model="definitionForm.is_active" label="نشط" color="success" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="error" variant="tonal" @click="definitionDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="elevated" :loading="saving" :disabled="!definitionFormValid" @click="saveDefinition">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import digitalServicesService from '@/api/services/digital-services.service';
import notificationManager from '@/services/notificationManager';

const activeTab = ref('providers');

// Data
const providers = ref([]);
const definitions = ref([]);
const loadingProviders = ref(false);
const loadingDefinitions = ref(false);
const saving = ref(false);

const providerHeaders = [
  { title: 'اسم الشبكة', key: 'name' },
  { title: 'الكود', key: 'code' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'الإجراءات', key: 'actions', align: 'end', sortable: false },
];

const definitionHeaders = [
  { title: 'الشبكة التابعة', key: 'provider_name' },
  { title: 'اسم الخدمة', key: 'name' },
  { title: 'النوع (التأثير)', key: 'operation_type' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'الإجراءات', key: 'actions', align: 'end', sortable: false },
];

const operationTypes = [
  { value: 'cash_in', text: 'إيداع نقدي للمحفظة' },
  { value: 'cash_out', text: 'سحب نقدي للعميل' },
  { value: 'bill_payment', text: 'دفع فواتير' },
  { value: 'transfer', text: 'تحويل' },
];

const getOperationLabel = (type) => operationTypes.find(t => t.value === type)?.text || type;
const getOperationColor = (type) => {
  if(type === 'cash_in') return 'success';
  if(type === 'cash_out') return 'error';
  return 'info';
};

// Form Refs
const providerDialog = ref(false);
const editingProvider = ref(null);
const providerFormRef = ref(null);
const providerFormValid = ref(false);
const providerForm = ref({ name: '', code: '', is_active: true });

const definitionDialog = ref(false);
const editingDefinition = ref(null);
const definitionFormRef = ref(null);
const definitionFormValid = ref(false);
const definitionForm = ref({ service_provider_id: null, name: '', operation_type: '', is_active: true });

// Fetch Data
const fetchProviders = async () => {
  loadingProviders.value = true;
  try {
    const res = await digitalServicesService.getServiceProviders();
    providers.value = res.data.data || [];
  } catch (error) {
    console.error('fetchProviders error:', error);
    notificationManager.error('فشل جلب الشبكات');
  } finally {
    loadingProviders.value = false;
  }
};

const fetchDefinitions = async () => {
  loadingDefinitions.value = true;
  try {
    const res = await digitalServicesService.getServiceDefinitions();
    definitions.value = res.data.data || [];
  } catch (error) {
    console.error('fetchDefinitions error:', error);
    notificationManager.error('فشل جلب الخدمات');
  } finally {
    loadingDefinitions.value = false;
  }
};

onMounted(() => {
  fetchProviders();
  fetchDefinitions();
});

// Providers Actions
const openProviderForm = (item = null) => {
  editingProvider.value = item;
  if (item) {
    providerForm.value = { ...item };
  } else {
    providerForm.value = { name: '', code: '', is_active: true };
  }
  providerDialog.value = true;
};

const saveProvider = async () => {
  if (!providerFormValid.value) return;
  saving.value = true;
  try {
    if (editingProvider.value) {
      await digitalServicesService.put(`service-providers/${editingProvider.value.id}`, providerForm.value);
    } else {
      await digitalServicesService.post('service-providers', providerForm.value);
    }
    notificationManager.success('تم الحفظ بنجاح');
    providerDialog.value = false;
    fetchProviders();
  } catch (error) {
    notificationManager.error(error.response?.data?.message || 'خطأ أثناء الحفظ');
  } finally {
    saving.value = false;
  }
};

const deleteProvider = async (id) => {
  if (!confirm('تأكيد الحذف؟')) return;
  try {
    await digitalServicesService.deleteCustom(`service-providers/${id}`);
    notificationManager.success('تم الحذف بنجاح');
    fetchProviders();
  } catch (error) {
    notificationManager.error('فشل الحذف');
  }
};

// Definitions Actions
const openDefinitionForm = (item = null) => {
  editingDefinition.value = item;
  if (item) {
    definitionForm.value = { ...item };
  } else {
    definitionForm.value = { service_provider_id: null, name: '', operation_type: '', is_active: true };
  }
  definitionDialog.value = true;
};

const saveDefinition = async () => {
  if (!definitionFormValid.value) return;
  saving.value = true;
  try {
    if (editingDefinition.value) {
      await digitalServicesService.put(`service-definitions/${editingDefinition.value.id}`, definitionForm.value);
    } else {
      await digitalServicesService.post('service-definitions', definitionForm.value);
    }
    notificationManager.success('تم الحفظ بنجاح');
    definitionDialog.value = false;
    fetchDefinitions();
  } catch (error) {
    notificationManager.error(error.response?.data?.message || 'خطأ أثناء الحفظ');
  } finally {
    saving.value = false;
  }
};

const deleteDefinition = async (id) => {
  if (!confirm('تأكيد الحذف؟')) return;
  try {
    await digitalServicesService.deleteCustom(`service-definitions/${id}`);
    notificationManager.success('تم الحذف بنجاح');
    fetchDefinitions();
  } catch (error) {
    notificationManager.error('فشل الحذف');
  }
};
</script>
