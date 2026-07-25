<template>
  <div class="hwnix-cash-message-sources-wrapper">
    <AppDataTable
      table-key="hwnix-cash-message-sources.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.sources"
      :loading="store.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash_message_sources"
      title="مصادر الرسائل"
      subtitle="إدارة أسماء وأرقام المرسليين المعتمدين للتحليل المالي"
      icon="ri-radar-line"
      @update:page="store.page = $event; store.fetchSources()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchSources()"
      @edit="openFormDialog"
      @delete="confirmDelete"
      @update:filters="applyFilters"
    >
      <template #actions>
        <AppButton
          variant="tonal"
          color="primary"
          prepend-icon="ri-refresh-line"
          :loading="store.loading"
          @click="store.fetchSources()"
        >
          تحديث البيانات
        </AppButton>
        <AppButton
          v-if="can(PERMISSIONS.HWNIX_CASH_MESSAGE_SOURCES_CREATE)"
          prepend-icon="ri-add-line"
          color="primary"
          @click="openFormDialog(null)"
        >
          مصدر جديد
        </AppButton>
      </template>

      <!-- معرف المرسل -->
      <template #item.sender_identifier="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon icon="ri-user-shared-line" size="16" class="text-primary" />
          <span class="font-weight-bold font-mono">{{ item.sender_identifier }}</span>
        </div>
      </template>

      <!-- مزود الخدمة -->
      <template #item.provider="{ item }">
        <HwnixCashProviderChip :provider="item.provider" size="small" />
      </template>

      <!-- الوصف -->
      <template #item.description="{ item }">
        <span class="text-body-2 text-grey-darken-1">{{ item.description || '—' }}</span>
      </template>

      <!-- الحالة -->
      <template #item.is_active="{ item }">
        <v-switch
          :model-value="Boolean(item.is_active)"
          color="success"
          hide-details
          density="compact"
          :disabled="!can(PERMISSIONS.HWNIX_CASH_MESSAGE_SOURCES_EDIT_ALL)"
          @update:model-value="toggleActiveStatus(item, $event)"
        />
      </template>
    </AppDataTable>

    <!-- Dialog إضافة/تعديل مصدر -->
    <v-dialog v-model="formDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-radar-line" color="primary" />
          {{ isEditMode ? 'تعديل مصدر رسائل' : 'إضافة مصدر رسائل جديد' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent="saveSource">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.sender_identifier"
                  label="معرف / اسم المرسل *"
                  hint="مثال: VF-Cash أو VF-CashMsg"
                  persistent-hint
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                />
              </v-col>

              <v-col cols="12" class="mt-2">
                <v-select
                  v-model="formData.provider"
                  label="مزود الخدمة *"
                  :items="providerOptions"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                />
              </v-col>

              <v-col cols="12" class="mt-2">
                <v-textarea
                  v-model="formData.description"
                  label="الوصف (اختياري)"
                  rows="2"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" class="mt-1">
                <v-checkbox
                  v-model="formData.is_active"
                  label="تفعيل المصدر فوراً"
                  color="primary"
                  hide-details
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="formDialog = false">إلغاء</AppButton>
          <AppButton
            color="primary"
            :loading="store.loading"
            :disabled="!isFormValid"
            prepend-icon="ri-save-line"
            @click="saveSource"
          >
            {{ isEditMode ? 'تحديث' : 'حفظ' }}
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تأكيد الحذف -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-2">تأكيد الحذف</v-card-title>
        <v-card-text class="px-6 pb-4 text-body-2 text-grey">
          هل أنت متأكد من حذف هذا المصدر؟
        </v-card-text>
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="deleteDialog = false">إلغاء</AppButton>
          <AppButton color="error" :loading="store.loading" @click="doDelete">حذف</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHwnixCashMessageSourceStore } from '../store/hwnix-cash-message-source.store';
import { PERMISSIONS } from '@/config/permissions';
import { useUserStore } from '@/stores/user';
import HwnixCashProviderChip from '../components/HwnixCashProviderChip.vue';
import AppButton from '@/components/common/AppButton.vue';

const store = useHwnixCashMessageSourceStore();
const userStore = useUserStore();
const can = permission => userStore.hasPermission(permission);

const formDialog = ref(false);
const deleteDialog = ref(false);
const editingId = ref(null);
const deletingId = ref(null);
const formRef = ref(null);
const isFormValid = ref(false);

const isEditMode = computed(() => !!editingId.value);

const formData = ref({
  sender_identifier: '',
  provider: 'vodafone_cash',
  description: '',
  is_active: true,
});

const headers = [
  { title: 'معرف المرسل', key: 'sender_identifier', sortable: true },
  { title: 'مزود الخدمة', key: 'provider', sortable: true },
  { title: 'الوصف', key: 'description', sortable: false },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

const providerOptions = [
  { title: 'فودافون كاش (vodafone_cash)', value: 'vodafone_cash' },
  { title: 'اورنج كاش (orange_cash)', value: 'orange_cash' },
  { title: 'اتصالات كاش (etisalat_cash)', value: 'etisalat_cash' },
  { title: 'وي كاش (we_cash)', value: 'we_cash' },
];

const advancedFilters = [
  {
    key: 'provider',
    label: 'المزود',
    type: 'select',
    items: [
      { title: 'فودافون كاش', value: 'vodafone_cash' },
      { title: 'اورنج كاش', value: 'orange_cash' },
      { title: 'اتصالات كاش', value: 'etisalat_cash' },
      { title: 'وي كاش', value: 'we_cash' },
    ],
  },
  {
    key: 'is_active',
    label: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: '1' },
      { title: 'معطل', value: '0' },
    ],
  },
];

function openFormDialog(item) {
  if (item) {
    editingId.value = item.id;
    formData.value = {
      sender_identifier: item.sender_identifier,
      provider: item.provider,
      description: item.description || '',
      is_active: Boolean(item.is_active),
    };
  } else {
    editingId.value = null;
    formData.value = {
      sender_identifier: '',
      provider: 'vodafone_cash',
      description: '',
      is_active: true,
    };
  }
  formDialog.value = true;
}

async function saveSource() {
  if (isEditMode.value) {
    await store.updateSource(editingId.value, formData.value);
  } else {
    await store.createSource(formData.value);
  }
  formDialog.value = false;
}

async function toggleActiveStatus(item, val) {
  await store.updateSource(item.id, { is_active: val });
}

function confirmDelete(item) {
  deletingId.value = item.id;
  deleteDialog.value = true;
}

async function doDelete() {
  await store.deleteSource(deletingId.value);
  deleteDialog.value = false;
}

function applyFilters(filters) {
  store.providerFilter = filters.provider ?? null;
  store.isActiveFilter = filters.is_active ?? null;
  store.page = 1;
  store.fetchSources();
}

onMounted(() => store.fetchSources());
</script>
