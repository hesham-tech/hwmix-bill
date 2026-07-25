<template>
  <div class="hwnix-cash-messages-wrapper">
    <AppDataTable
      table-key="hwnix-cash-messages.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.messages"
      :loading="store.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash_messages"
      title="سجل الرسائل"
      subtitle="استعراض وبحث في جميع الرسائل الواردة على الخطوط"
      icon="ri-message-3-line"
      @update:page="store.page = $event; store.fetchMessages()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchMessages()"
      @update:filters="applyFilters"
    >
      <template #actions>
        <AppButton
          variant="tonal"
          color="primary"
          prepend-icon="ri-refresh-line"
          :loading="store.loading"
          @click="store.fetchMessages()"
        >
          تحديث البيانات
        </AppButton>
      </template>
      <!-- المرسل -->
      <template #item.sender="{ item }">
        <div class="d-flex align-center gap-2">
          <v-avatar color="primary" variant="tonal" size="28">
            <v-icon icon="ri-user-shared-line" size="14" />
          </v-avatar>
          <div class="d-flex flex-column">
            <span class="font-weight-bold text-body-2">{{ item.sender_name || item.sender || item.phone_number || 'مرسل عام' }}</span>
            <span v-if="item.sender_name && item.phone_number" class="text-caption text-grey font-mono">{{ item.phone_number }}</span>
          </div>
        </div>
      </template>

      <!-- المزود -->
      <template #item.provider="{ item }">
        <HwnixCashProviderChip :provider="item.carrier || item.provider || item.phone_number" size="small" />
      </template>

      <!-- نص الرسالة -->
      <template #item.body="{ item }">
        <div class="message-body-cell font-weight-medium text-body-2 py-2" :title="item.message_body || item.body">
          {{ item.message_body || item.body || '—' }}
        </div>
      </template>

      <!-- معالجة -->
      <template #item.is_processed="{ item }">
        <v-chip
          :color="(item.is_processed || item.status === 'received' || item.status === 'processed') ? 'success' : 'default'"
          size="small"
          variant="tonal"
          class="font-weight-bold"
        >
          {{ (item.is_processed || item.status === 'processed') ? 'معالجة' : 'مستلمة' }}
        </v-chip>
      </template>

      <!-- وقت الاستلام -->
      <template #item.received_at="{ item }">
        <div class="d-flex align-center gap-1 text-caption text-grey-darken-1">
          <v-icon icon="ri-time-line" size="14" />
          <span>{{ formatDateTime(item.sent_at || item.created_at || item.received_at) }}</span>
        </div>
      </template>

      <!-- الإجراءات السريعة -->
      <template #item.actions="{ item }">
        <v-tooltip text="إضافة إلى مصادر الرسائل المعتمدة" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              v-if="can(PERMISSIONS.HWNIX_CASH_MESSAGE_SOURCES_CREATE)"
              icon="ri-radar-line"
              size="small"
              variant="text"
              color="primary"
              @click="openAddSourceDialog(item)"
            />
          </template>
        </v-tooltip>
      </template>
    </AppDataTable>

    <!-- Dialog إضافة مصدر رسائل جديد بنقرة واحدة -->
    <v-dialog v-model="sourceDialog" max-width="480" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-3 d-flex align-center gap-2">
          <v-icon icon="ri-radar-line" color="primary" />
          إضافة إلى مصادر الرسائل المعتمدة
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <div class="text-body-2 text-grey mb-4">
            سيتم اعتماد هذا المرسل كـ <strong>مصدر مالي رسمي</strong> في النظام ليتم استخراج البيانات المالية من رسائله آلياً.
          </div>

          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="sourceForm.sender_identifier"
                label="معرف المرسل *"
                variant="outlined"
                density="compact"
                prepend-inner-icon="ri-user-shared-line"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
              />
            </v-col>

            <v-col cols="12" class="mt-2">
              <v-select
                v-model="sourceForm.provider"
                label="مزود الخدمة *"
                :items="providerOptions"
                variant="outlined"
                density="compact"
                prepend-inner-icon="ri-smartphone-line"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
              />
            </v-col>

            <v-col cols="12" class="mt-2">
              <v-textarea
                v-model="sourceForm.description"
                label="وصف المصدر (اختياري)"
                rows="2"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="sourceDialog = false">إلغاء</AppButton>
          <AppButton
            color="primary"
            :loading="savingSource"
            prepend-icon="ri-add-line"
            @click="saveSource"
          >
            إضافة للمصادر
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useHwnixCashMessageStore } from '../store/hwnix-cash-message.store';
import { useHwnixCashMessageSourceStore } from '../store/hwnix-cash-message-source.store';
import { PERMISSIONS } from '@/config/permissions';
import { useUserStore } from '@/stores/user';
import HwnixCashProviderChip from '../components/HwnixCashProviderChip.vue';
import AppButton from '@/components/common/AppButton.vue';

const store = useHwnixCashMessageStore();
const sourceStore = useHwnixCashMessageSourceStore();
const userStore = useUserStore();
const can = permission => userStore.hasPermission(permission);

const sourceDialog = ref(false);
const savingSource = ref(false);
const sourceForm = ref({
  sender_identifier: '',
  provider: 'vodafone_cash',
  description: '',
  is_active: true,
});

const headers = [
  { title: 'المرسل', key: 'sender', sortable: true },
  { title: 'المزود', key: 'provider', sortable: true },
  { title: 'نص الرسالة', key: 'body', sortable: false },
  { title: 'معالجة', key: 'is_processed', sortable: true },
  { title: 'وقت الاستلام', key: 'received_at', sortable: true },
  { title: 'إضافة لمصدر معتمد', key: 'actions', sortable: false, align: 'center' },
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
    key: 'is_processed',
    label: 'حالة المعالجة',
    type: 'select',
    items: [
      { title: 'معالجة', value: '1' },
      { title: 'لم تُعالج', value: '0' },
    ],
  },
  { key: 'date_from', label: 'من تاريخ', type: 'date' },
  { key: 'date_to', label: 'إلى تاريخ', type: 'date' },
];

function openAddSourceDialog(message) {
  const sender = message.sender || '';
  let provider = message.provider || 'vodafone_cash';

  // الذكاء الاصطناعي/الاستنتاج التلقائي لمزود الخدمة بناء على اسم المرسل
  const lowerSender = sender.toLowerCase();
  if (lowerSender.includes('vf') || lowerSender.includes('voda')) {
    provider = 'vodafone_cash';
  } else if (lowerSender.includes('orange')) {
    provider = 'orange_cash';
  } else if (lowerSender.includes('etisalat') || lowerSender.includes('e&')) {
    provider = 'etisalat_cash';
  } else if (lowerSender.includes('we')) {
    provider = 'we_cash';
  }

  sourceForm.value = {
    sender_identifier: sender,
    provider: provider,
    description: `مصدر معتمد مضاف تلقائياً من سجل الرسائل (${sender})`,
    is_active: true,
  };

  sourceDialog.value = true;
}

async function saveSource() {
  if (!sourceForm.value.sender_identifier) return;
  savingSource.value = true;
  try {
    await sourceStore.createSource(sourceForm.value);
    sourceDialog.value = false;
  } catch (e) {
    console.error(e);
  } finally {
    savingSource.value = false;
  }
}

function truncate(text, length) {
  if (!text) return '—';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function applyFilters(filters) {
  store.providerFilter = filters.provider ?? null;
  store.isProcessedFilter = filters.is_processed ?? null;
  store.dateFrom = filters.date_from ?? null;
  store.dateTo = filters.date_to ?? null;
  store.page = 1;
  store.fetchMessages();
}

onMounted(() => store.fetchMessages());
</script>

<style scoped>
.message-body-cell {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}
</style>
