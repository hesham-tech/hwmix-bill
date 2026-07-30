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

      <!-- الجهاز والخط -->
      <template #item.device_line="{ item }">
        <div class="d-flex flex-column">
          <!-- اسم الهاتف المخصص المعين من قبل المستخدم -->
          <span class="font-weight-bold text-body-2 text-high-emphasis">
            {{ item.device?.name || item.device?.device_name || item.device_name || 'جهاز المستلم' }}
          </span>
          <!-- رقم الخط والاسم الفعلي المكتشف للهاتف -->
          <div class="d-flex align-center gap-1 text-caption">
            <span class="text-primary font-weight-medium font-mono dir-ltr">
              {{ item.line?.phone_number || item.line_phone_number || (item.line?.slot_index !== undefined ? 'خط SIM ' + (item.line.slot_index + 1) : 'غير محدد') }}
            </span>
            <span
              v-if="item.device?.device_name && item.device?.name && item.device.name !== item.device.device_name"
              class="text-grey text-caption"
              :title="'الاسم الفعلي للهاتف: ' + item.device.device_name"
            >
              • {{ item.device.device_name }}
            </span>
          </div>
        </div>
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

      <!-- نص الرسالة -->
      <template #item.body="{ item }">
        <div
          class="message-body-cell font-weight-medium text-body-2 py-2 cursor-pointer text-primary-hover"
          title="انقر لعرض تفاصيل الرسالة والنص بالكامل"
          @click="openDetailDialog(item)"
        >
          <span>{{ formatShortText(item.message_body || item.body, 7) }}</span>
        </div>
      </template>

      <!-- معالجة -->
      <template #item.is_processed="{ item }">
        <v-chip
          :color="(item.is_processed || item.status === 'received' || item.status === 'processed') ? 'success' : 'default'"
          size="small"
          variant="tonal"
          class="font-weight-bold cursor-pointer"
          @click="openDetailDialog(item)"
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
        <div class="d-flex align-center justify-center gap-1">
          <v-tooltip text="عرض تفاصيل الرسالة" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-eye-line"
                size="small"
                variant="text"
                color="info"
                @click="openDetailDialog(item)"
              />
            </template>
          </v-tooltip>

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
        </div>
      </template>
    </AppDataTable>

    <!-- Dialog عرض تفاصيل الرسالة بالكامل -->
    <v-dialog v-model="detailDialog" max-width="640">
      <v-card rounded="xl" v-if="selectedMessage">
        <v-card-title class="text-h6 pa-6 pb-3 d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-icon icon="ri-message-3-line" color="primary" />
            <span>تفاصيل الرسالة القصيرة (SMS Details)</span>
          </div>
          <v-btn icon="ri-close-line" variant="text" size="small" @click="detailDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <!-- نص الرسالة الكلي -->
          <div class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-2 font-weight-bold text-grey-darken-2">نص الرسالة بالكامل:</span>
              <AppButton
                size="x-small"
                variant="tonal"
                color="primary"
                prepend-icon="ri-file-copy-line"
                @click="copyMessageBody(selectedMessage.message_body || selectedMessage.body)"
              >
                نسخ النص
              </AppButton>
            </div>
            <v-sheet
              rounded="lg"
              color="grey-lighten-4"
              class="pa-4 text-body-1 font-weight-medium text-pre-wrap border"
              style="line-height: 1.7; word-break: break-word;"
            >
              {{ selectedMessage.message_body || selectedMessage.body || 'لا يوجد نص محتوى' }}
            </v-sheet>
          </div>

          <!-- شبكة التفاصيل والمواصفات -->
          <v-row dense class="mt-2">
            <v-col cols="12" sm="6">
              <v-list-item density="compact" class="px-0">
                <template #prepend><v-icon icon="ri-cellphone-line" color="primary" class="me-2" /></template>
                <v-list-item-title class="text-caption text-grey">الجهاز المستلم</v-list-item-title>
                <v-list-item-subtitle class="font-weight-bold text-body-2 text-high-emphasis">
                  {{ selectedMessage.device?.name || selectedMessage.device?.device_name || selectedMessage.device_name || 'جهاز المستلم' }}
                  <span
                    v-if="selectedMessage.device?.device_name && selectedMessage.device?.name && selectedMessage.device.name !== selectedMessage.device.device_name"
                    class="text-grey font-weight-normal text-caption ms-1"
                  >
                    ({{ selectedMessage.device.device_name }})
                  </span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" sm="6">
              <v-list-item density="compact" class="px-0">
                <template #prepend><v-icon icon="ri-sim-card-line" color="primary" class="me-2" /></template>
                <v-list-item-title class="text-caption text-grey">خط الاستلام (SIM)</v-list-item-title>
                <v-list-item-subtitle class="font-weight-bold text-body-2 text-primary font-mono dir-ltr text-right">
                  {{ selectedMessage.line?.phone_number || selectedMessage.line_phone_number || (selectedMessage.line?.slot_index !== undefined ? 'خط SIM ' + (selectedMessage.line.slot_index + 1) : 'غير محدد') }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" sm="6">
              <v-list-item density="compact" class="px-0">
                <template #prepend><v-icon icon="ri-user-shared-line" color="primary" class="me-2" /></template>
                <v-list-item-title class="text-caption text-grey">المرسل / جهة الاتصال</v-list-item-title>
                <v-list-item-subtitle class="font-weight-bold text-body-2 text-high-emphasis">
                  {{ selectedMessage.sender_name || selectedMessage.sender || selectedMessage.phone_number }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" sm="6">
              <v-list-item density="compact" class="px-0">
                <template #prepend><v-icon icon="ri-time-line" color="primary" class="me-2" /></template>
                <v-list-item-title class="text-caption text-grey">توقيت الاستلام والإرسال</v-list-item-title>
                <v-list-item-subtitle class="font-weight-medium text-body-2">
                  {{ formatDateTime(selectedMessage.sent_at || selectedMessage.created_at || selectedMessage.received_at) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" sm="6">
              <v-list-item density="compact" class="px-0">
                <template #prepend><v-icon icon="ri-checkbox-circle-line" color="primary" class="me-2" /></template>
                <v-list-item-title class="text-caption text-grey">حالة الرسالة والمعالجة</v-list-item-title>
                <v-list-item-subtitle class="mt-1">
                  <v-chip
                    :color="(selectedMessage.is_processed || selectedMessage.status === 'received' || selectedMessage.status === 'processed') ? 'success' : 'default'"
                    size="small"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ (selectedMessage.is_processed || selectedMessage.status === 'processed') ? 'معالجة مالية' : 'رسالة مستلمة' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" v-if="selectedMessage.message_ref">
              <v-list-item density="compact" class="px-0">
                <template #prepend><v-icon icon="ri-hashtag" color="primary" class="me-2" /></template>
                <v-list-item-title class="text-caption text-grey">معرف الرسالة المرجعي (Message Ref)</v-list-item-title>
                <v-list-item-subtitle class="font-mono text-caption text-grey-darken-2">
                  {{ selectedMessage.message_ref }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <AppButton
            v-if="can(PERMISSIONS.HWNIX_CASH_MESSAGE_SOURCES_CREATE)"
            variant="tonal"
            color="primary"
            prepend-icon="ri-radar-line"
            @click="detailDialog = false; openAddSourceDialog(selectedMessage)"
          >
            إضافة لمصادر الرسائل
          </AppButton>
          <v-spacer />
          <AppButton variant="text" @click="detailDialog = false">إغلاق</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import AppButton from '@/components/common/AppButton.vue';

import notificationManager from '@/services/notificationManager';

const store = useHwnixCashMessageStore();
const sourceStore = useHwnixCashMessageSourceStore();
const userStore = useUserStore();
const can = permission => userStore.hasPermission(permission);

const detailDialog = ref(false);
const selectedMessage = ref(null);

const sourceDialog = ref(false);
const savingSource = ref(false);
const sourceForm = ref({
  sender_identifier: '',
  provider: 'vodafone_cash',
  description: '',
  is_active: true,
});

function openDetailDialog(message) {
  selectedMessage.value = message;
  detailDialog.value = true;
}

function copyMessageBody(text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  notificationManager.success('تم نسخ نص الرسالة للحافظة بنجاح.');
}

function formatShortText(text, wordCount = 7) {
  if (!text) return '—';
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}

const headers = [
  { title: 'الجهاز والخط', key: 'device_line', sortable: false },
  { title: 'المرسل', key: 'sender', sortable: true },
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
