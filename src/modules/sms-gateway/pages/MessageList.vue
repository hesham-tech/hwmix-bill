<template>
  <v-container fluid class="py-6">
    <!-- رأس الصفحة -->
    <v-row class="mb-6" align="center">
      <v-col cols="12" sm="6">
        <h1 class="text-h4 font-weight-bold primary--text">
          <v-icon large left color="primary">mdi-message-text</v-icon>
          سجل وحركات الرسائل SMS
        </h1>
        <p class="text-subtitle-1 grey--text text--darken-1 mt-1">
          متابعة وتدقيق حركات تسليم الرسائل الصادرة والواردة وبث رسائل جديدة للعملاء.
        </p>
      </v-col>
      <v-col cols="12" sm="6" class="text-sm-left">
        <v-btn color="success" class="px-6 mr-2" large rounded @click="openSendDialog">
          <v-icon left>mdi-send</v-icon>
          إرسال رسالة جديدة
        </v-btn>
        <v-btn color="primary" icon large class="elevation-1" @click="fetchMessages">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- الفلاتر -->
    <v-card class="mb-6 rounded-lg elevation-1">
      <v-card-text class="py-4">
        <v-row dense>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="filters.direction"
              :items="directionItems"
              label="اتجاه الرسالة"
              outlined
              dense
              hide-details
              @change="onFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="filters.status"
              :items="statusItems"
              label="حالة التسليم"
              outlined
              dense
              hide-details
              @change="onFilterChange"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- جدول البيانات والـ Pagination -->
    <v-card class="elevation-2 rounded-lg">
      <v-data-table
        :headers="headers"
        :items="messages"
        :options.sync="options"
        :server-items-length="totalMessages"
        :loading="loading"
        loading-text="جاري تحميل سجل الرسائل..."
        no-data-text="لا يوجد حركات رسائل متطابقة."
        class="elevation-0"
      >
        <!-- اتجاه الرسالة -->
        <template #[`item.direction`]="{ item }">
          <v-chip :color="item.direction === 'incoming' ? 'indigo' : 'teal'" text-color="white" small class="font-weight-bold">
            <v-icon left small>
              {{ item.direction === 'incoming' ? 'mdi-call-received' : 'mdi-call-made' }}
            </v-icon>
            {{ item.direction === 'incoming' ? 'واردة' : 'صادرة' }}
          </v-chip>
        </template>

        <!-- حالة الرسالة -->
        <template #[`item.status`]="{ item }">
          <v-chip :color="getStatusColor(item.status)" text-color="white" small class="font-weight-bold">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <!-- الخط المستخدم -->
        <template #[`item.line`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ item.line ? item.line.carrier + ' (' + item.line.phone_number + ')' : 'غير متوفر' }}
          </span>
        </template>

        <!-- تاريخ الإرسال -->
        <template #[`item.created_at`]="{ item }">
          <span class="font-weight-medium text-body-2">{{ item.created_at }}</span>
        </template>
      </v-data-table>
    </v-card>

    <!-- نافذة منبثقة لبث وإرسال رسالة جديدة -->
    <v-dialog v-model="sendDialog" max-width="600px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold primary--text pt-6 px-6">
          <v-icon color="primary" class="mr-2">mdi-send</v-icon>
          إرسال رسالة SMS جديدة
        </v-card-title>
        
        <v-card-text class="px-6 pt-4">
          <v-form ref="sendForm" v-model="formValid">
            <!-- اختيار شريحة الاتصال -->
            <v-select
              v-model="form.sms_line_id"
              :items="lines"
              item-text="displayName"
              item-value="id"
              label="اختر الشريحة / الخط"
              outlined
              :rules="[v => !!v || 'يرجى اختيار خط الإرسال']"
              class="mb-4"
              :loading="loadingLines"
            ></v-select>

            <!-- رقم المستلم -->
            <v-text-field
              v-model="form.phone_number"
              label="رقم هاتف المستلم (صيغة دولية أو محلية)"
              outlined
              placeholder="مثال: +966500000000"
              :rules="[v => !!v || 'يرجى إدخال رقم المستلم']"
              class="mb-4"
            ></v-text-field>

            <!-- نص الرسالة -->
            <v-textarea
              v-model="form.message_body"
              label="نص رسالة الـ SMS"
              outlined
              rows="4"
              counter
              :rules="[v => !!v || 'نص الرسالة مطلوب']"
              placeholder="اكتب رسالتك هنا..."
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text large @click="sendDialog = false" :disabled="sending">
            إلغاء
          </v-btn>
          <v-btn color="success" depressed large class="px-6 rounded-lg" @click="sendSms" :loading="sending" :disabled="!formValid">
            إرسال الرسالة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- شريط التنبيه Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" bottom left>
      {{ snackbar.text }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">إغلاق</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { apiClient } from '@/api';

export default {
  name: 'MessageList',
  data() {
    return {
      loading: false,
      sending: false,
      sendDialog: false,
      formValid: false,
      loadingLines: false,
      messages: [],
      lines: [],
      totalMessages: 0,
      options: {},
      filters: {
        direction: null,
        status: null,
      },
      form: {
        sms_line_id: null,
        phone_number: '',
        message_body: '',
      },
      directionItems: [
        { text: 'الكل', value: null },
        { text: 'واردة (Incoming)', value: 'incoming' },
        { text: 'صادرة (Outgoing)', value: 'outgoing' },
      ],
      statusItems: [
        { text: 'الكل', value: null },
        { text: 'مجدولة (Queued)', value: 'queued' },
        { text: 'قيد الإرسال (Sending)', value: 'sending' },
        { text: 'تم الإرسال (Sent)', value: 'sent' },
        { text: 'تم التسليم (Delivered)', value: 'delivered' },
        { text: 'فشلت (Failed)', value: 'failed' },
      ],
      headers: [
        { text: 'رقم المستلم / المرسل', value: 'phone_number', align: 'start', class: 'subtitle-1 font-weight-bold' },
        { text: 'نص الرسالة', value: 'message_body', width: '40%' },
        { text: 'الاتجاه', value: 'direction' },
        { text: 'حالة التسليم', value: 'status', align: 'center' },
        { text: 'الخط المستخدم', value: 'line' },
        { text: 'البوابة', value: 'device.device_name' },
        { text: 'التاريخ والوقت', value: 'created_at' },
      ],
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  watch: {
    options: {
      handler() {
        this.fetchMessages();
      },
      deep: true,
    },
  },
  methods: {
    async fetchMessages() {
      this.loading = true;
      const { page, itemsPerPage } = this.options;
      
      try {
        const response = await apiClient.get('v1/sms-gateway/messages', {
          params: {
            page: page || 1,
            per_page: itemsPerPage || 20,
            direction: this.filters.direction,
            status: this.filters.status,
          },
        });
        
        if (response.data && response.data.status) {
          const payload = response.data.data;
          this.messages = payload.items;
          this.totalMessages = payload.meta.total;
        } else {
          this.showSnackbar('فشل جلب سجل الرسائل.', 'error');
        }
      } catch (error) {
        console.error(error);
        this.showSnackbar('حدث خطأ أثناء تحميل الرسائل.', 'error');
      } finally {
        this.loading = false;
      }
    },
    async fetchActiveLines() {
      this.loadingLines = true;
      try {
        const response = await apiClient.get('v1/sms-gateway/lines');
        if (response.data && response.data.status) {
          this.lines = response.data.data.map(line => ({
            id: line.id,
            displayName: `${line.carrier} (${line.phone_number || 'غير مكتشف'}) - البوابة: ${line.device?.device_name}`,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingLines = false;
      }
    },
    onFilterChange() {
      this.options.page = 1;
      this.fetchMessages();
    },
    openSendDialog() {
      this.form = {
        sms_line_id: null,
        phone_number: '',
        message_body: '',
      };
      this.sendDialog = true;
      this.fetchActiveLines();
    },
    async sendSms() {
      if (!this.$refs.sendForm.validate()) return;
      this.sending = true;
      try {
        const response = await apiClient.post('v1/sms-gateway/messages/send', this.form);
        if (response.data && response.data.status) {
          this.showSnackbar('تم جدولة إرسال الرسالة بنجاح وبثها للهاتف.', 'success');
          this.sendDialog = false;
          this.fetchMessages();
        } else {
          this.showSnackbar('فشل بث وجدولة الرسالة.', 'error');
        }
      } catch (error) {
        console.error(error);
        this.showSnackbar('حدث خطأ أثناء الاتصال بالخادم.', 'error');
      } finally {
        this.sending = false;
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'delivered': return 'success';
        case 'sent': return 'primary';
        case 'queued': return 'warning';
        case 'sending': return 'info';
        case 'failed': return 'error';
        default: return 'grey';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'delivered': return 'تم التسليم';
        case 'sent': return 'تم الإرسال للشبكة';
        case 'queued': return 'في الانتظار (Queued)';
        case 'sending': return 'جاري الإرسال';
        case 'failed': return 'فشل الإرسال';
        default: return status;
      }
    },
    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
</style>
