<template>
  <div class="message-list-page">
    <AppPageHeader title="سجل وحركات الرسائل SMS" subtitle="متابعة وتدقيق حركات تسليم الرسائل الصادرة والواردة وبث رسائل جديدة للعملاء" icon="ri-message-2-line" sticky>
      <template #controls>
        <v-col cols="12" md="4" class="d-flex gap-2 align-center justify-end">
          <AppButton
            variant="flat"
            color="success"
            prepend-icon="ri-send-plane-line"
            class="rounded-md font-weight-bold"
            @click="openSendDialog"
          >
            إرسال رسالة جديدة
          </AppButton>
          <AppButton
            variant="tonal"
            color="primary"
            prepend-icon="ri-refresh-line"
            class="rounded-md font-weight-bold"
            :loading="loading"
            @click="loadData"
          >
            تحديث
          </AppButton>
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <!-- الفلاتر -->
      <v-card rounded="md" class="border shadow-sm mb-6">
        <v-card-text class="py-4">
          <v-row dense>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.direction"
                :items="directionItems"
                item-title="text"
                item-value="value"
                label="اتجاه الرسالة"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="onFilterChange"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.status"
                :items="statusItems"
                item-title="text"
                item-value="value"
                label="حالة التسليم"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="onFilterChange"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- جدول البيانات والـ Pagination -->
      <v-card rounded="md" class="border shadow-sm overflow-hidden mb-6">
        <AppDataTable
          :headers="headers"
          :items="messages"
          :loading="loading"
          :total-items="totalMessages"
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          title="سجل الرسائل المرسلة والمستقبلة"
          icon="ri-list-check-2"
          @update:options="handleOptionsUpdate"
        >
          <!-- نص الرسالة -->
          <template #item.message_body="{ item }">
            <div 
              class="clickable-message text-truncate font-weight-medium" 
              style="max-width: 450px; cursor: pointer; text-align: start;"
              @click="viewMessage(item)"
            >
              {{ item.message_body }}
            </div>
          </template>

          <!-- اتجاه الرسالة -->
          <template #item.direction="{ item }">
            <v-chip :color="item.direction === 'incoming' ? 'indigo' : 'teal'" size="small" variant="flat" class="font-weight-bold px-3">
              <v-icon :icon="item.direction === 'incoming' ? 'ri-download-line' : 'ri-upload-line'" size="14" class="me-1" />
              {{ item.direction === 'incoming' ? 'واردة' : 'صادرة' }}
            </v-chip>
          </template>

          <!-- حالة الرسالة -->
          <template #item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- الخط المستخدم -->
          <template #item.line="{ item }">
            <span class="text-caption font-weight-bold text-grey">
              {{ item.line ? item.line.carrier + ' (' + (item.line.phone_number || 'غير محدد') + ')' : 'غير متوفر' }}
            </span>
          </template>

          <!-- البوابة -->
          <template #item.device.device_name="{ item }">
            <span class="font-weight-medium">
              {{ item.device?.device_name || 'غير معروف' }}
            </span>
          </template>

          <!-- تاريخ الإرسال -->
          <template #item.created_at="{ item }">
            <span class="font-weight-medium text-caption text-grey">
              {{ formatDate(item.created_at) }}
            </span>
          </template>
        </AppDataTable>
      </v-card>
    </v-container>

    <!-- نافذة عرض تفاصيل الرسالة ومحتواها بالكامل -->
    <v-dialog v-model="viewDialog" max-width="500px">
      <v-card class="rounded-lg border">
        <v-card-title class="text-h5 font-weight-bold text-primary pt-6 px-6 d-flex align-center">
          <v-icon icon="ri-mail-open-line" color="primary" class="me-2" />
          عرض تفاصيل الرسالة
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="viewDialog = false">
            <v-icon icon="ri-close-line" />
          </v-btn>
        </v-card-title>
        
        <v-card-text class="px-6 pt-4">
          <div class="mb-4">
            <span class="font-weight-bold text-grey">الطرف الآخر: </span>
            <span class="font-weight-bold text-primary">{{ selectedMessage?.phone_number }}</span>
            <v-chip 
              :color="selectedMessage?.direction === 'incoming' ? 'indigo' : 'teal'" 
              size="small"
              variant="flat"
              class="font-weight-bold ms-2"
            >
              {{ selectedMessage?.direction === 'incoming' ? 'واردة' : 'صادرة' }}
            </v-chip>
          </div>
          
          <div class="mb-4">
            <span class="font-weight-bold text-grey">الحالة والتاريخ: </span>
            <v-chip :color="getStatusColor(selectedMessage?.status)" size="small" variant="flat" class="font-weight-bold px-3">
              {{ getStatusText(selectedMessage?.status) }}
            </v-chip>
            <span class="text-caption text-grey ms-2">{{ formatDate(selectedMessage?.created_at) }}</span>
          </div>

          <v-divider class="mb-4"></v-divider>

          <div class="message-body-container">
            <div class="message-body-label mb-2 font-weight-bold text-grey">محتوى الرسالة:</div>
            <div class="message-body-text">{{ selectedMessage?.message_body }}</div>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer></v-spacer>
          <AppButton variant="text" color="primary" class="px-6" @click="viewDialog = false">
            إغلاق
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- نافذة منبثقة لبث وإرسال رسالة جديدة -->
    <v-dialog v-model="sendDialog" max-width="600px" persistent>
      <v-card class="rounded-lg border">
        <v-card-title class="text-h5 font-weight-bold text-primary pt-6 px-6">
          <v-icon icon="ri-send-plane-line" color="primary" class="me-2" />
          إرسال رسالة SMS جديدة
        </v-card-title>
        
        <v-card-text class="px-6 pt-4">
          <v-form ref="sendForm" v-model="formValid">
            <!-- اختيار شريحة الاتصال -->
            <v-select
              v-model="form.sms_line_id"
              :items="lines"
              item-title="displayName"
              item-value="id"
              label="اختر الشريحة / الخط"
              variant="outlined"
              :rules="[v => !!v || 'يرجى اختيار خط الإرسال']"
              class="mb-4"
              :loading="loadingLines"
            ></v-select>

            <!-- رقم المستلم -->
            <v-text-field
              v-model="form.phone_number"
              label="رقم هاتف المستلم (صيغة دولية أو محلية)"
              variant="outlined"
              placeholder="مثال: +2010XXXXXXXX"
              :rules="[v => !!v || 'يرجى إدخال رقم المستلم']"
              class="mb-4"
            ></v-text-field>

            <!-- نص الرسالة -->
            <v-textarea
              v-model="form.message_body"
              label="نص رسالة الـ SMS"
              variant="outlined"
              rows="4"
              counter
              :rules="[v => !!v || 'نص الرسالة مطلوب']"
              placeholder="اكتب رسالتك هنا..."
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer></v-spacer>
          <AppButton variant="text" color="grey" @click="sendDialog = false" :disabled="sending">
            إلغاء
          </AppButton>
          <AppButton color="success" class="px-6" :loading="sending" :disabled="!formValid" @click="sendSms">
            إرسال الرسالة
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
/* تعليق عربي مختصر: صفحة عرض ومتابعة حركات إرسال واستقبال رسائل الـ SMS وبثها للعملاء */

import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const api = useApi('v1/sms-gateway/messages');
const linesApi = useApi('v1/sms-gateway/lines');

// State
const loading = ref(false);
const sending = ref(false);
const sendDialog = ref(false);
const viewDialog = ref(false);
const selectedMessage = ref(null);
const formValid = ref(false);
const loadingLines = ref(false);

const messages = ref([]);
const lines = ref([]);
const totalMessages = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

const filters = ref({
  direction: null,
  status: null,
});

const form = ref({
  sms_line_id: null,
  phone_number: '',
  message_body: '',
});

const directionItems = [
  { text: 'الكل', value: null },
  { text: 'واردة (Incoming)', value: 'incoming' },
  { text: 'صادرة (Outgoing)', value: 'outgoing' },
];

const statusItems = [
  { text: 'الكل', value: null },
  { text: 'مجدولة (Queued)', value: 'queued' },
  { text: 'قيد الإرسال (Sending)', value: 'sending' },
  { text: 'تم الإرسال (Sent)', value: 'sent' },
  { text: 'تم التسليم (Delivered)', value: 'delivered' },
  { text: 'فشلت (Failed)', value: 'failed' },
];

const headers = [
  { title: 'رقم المستلم / المرسل', key: 'phone_number', align: 'start' },
  { title: 'نص الرسالة', key: 'message_body', width: '40%' },
  { title: 'الاتجاه', key: 'direction', align: 'center' },
  { title: 'حالة التسليم', key: 'status', align: 'center' },
  { title: 'الخط المستخدم', key: 'line' },
  { title: 'البوابة', key: 'device.device_name' },
  { title: 'التاريخ والوقت', key: 'created_at' },
];

const sendForm = ref(null);

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      per_page: itemsPerPage.value,
      direction: filters.value.direction,
      status: filters.value.status,
    };
    const response = await api.get(params, { showLoading: false });
    if (response && response.status) {
      messages.value = response.data?.items || [];
      totalMessages.value = response.data?.meta?.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

const handleOptionsUpdate = (options) => {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage;
  loadData();
};

const fetchActiveLines = async () => {
  loadingLines.value = true;
  try {
    const response = await linesApi.get({}, { showLoading: false });
    if (response && response.status) {
      lines.value = (response.data || []).map(line => ({
        id: line.id,
        displayName: `${line.carrier} (${line.phone_number || 'غير مكتشف'}) - البوابة: ${line.device?.device_name}`,
      }));
    }
  } finally {
    loadingLines.value = false;
  }
};

const onFilterChange = () => {
  page.value = 1;
  loadData();
};

const openSendDialog = () => {
  form.value = {
    sms_line_id: null,
    phone_number: '',
    message_body: '',
  };
  sendDialog.value = true;
  fetchActiveLines();
};

const sendSms = async () => {
  sending.value = true;
  try {
    const response = await api.request('POST', 'send', form.value);
    if (response && response.status) {
      toast.success('تم جدولة إرسال الرسالة بنجاح وبثها للهاتف.');
      sendDialog.value = false;
      await loadData();
    }
  } finally {
    sending.value = false;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'delivered': return 'success';
    case 'sent': return 'primary';
    case 'queued': return 'warning';
    case 'sending': return 'info';
    case 'failed': return 'error';
    default: return 'grey';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'delivered': return 'تم التسليم';
    case 'sent': return 'تم الإرسال للشبكة';
    case 'queued': return 'في الانتظار (Queued)';
    case 'sending': return 'جاري الإرسال';
    case 'failed': return 'فشل الإرسال';
    default: return status || '';
  }
};

const viewMessage = (item) => {
  selectedMessage.value = item;
  viewDialog.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(loadData);
</script>

<style scoped>
.message-list-page :deep(.v-container) {
  max-width: 100% !important;
}
.clickable-message:hover {
  text-decoration: underline;
  color: rgb(var(--v-theme-primary)) !important;
}
.message-body-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  unicode-bidi: plaintext;
  text-align: start;
  font-size: 1.05rem;
  line-height: 1.6;
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
</style>
