<template>
  <v-container fluid class="py-6">
    <!-- رأس الصفحة -->
    <v-row class="mb-6" align="center">
      <v-col cols="12" sm="6">
        <h1 class="text-h4 font-weight-bold primary--text">
          <v-icon large left color="primary">mdi-cellphone-link</v-icon>
          بوابات الهواتف الذكية (SMS Gateways)
        </h1>
        <p class="text-subtitle-1 grey--text text--darken-1 mt-1">
          إدارة ومراقبة الهواتف الموثقة كبوابات رسائل في النظام.
        </p>
      </v-col>
      <v-col cols="12" sm="6" class="text-sm-left">
        <v-btn color="primary" class="px-6" large rounded @click="fetchDevices" :loading="loading">
          <v-icon left>mdi-refresh</v-icon>
          تحديث القائمة
        </v-btn>
      </v-col>
    </v-row>

    <!-- بطاقة البيانات -->
    <v-card class="elevation-2 rounded-lg">
      <v-card-title class="py-4 px-6 grey lighten-4">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="البحث عن جهاز..."
          single-line
          hide-details
          outlined
          dense
          class="max-width-300"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="devices"
        :search="search"
        :loading="loading"
        loading-text="جاري تحميل البوابات..."
        no-data-text="لا يوجد أجهزة مسجلة حالياً."
        class="elevation-0"
      >
        <!-- تنسيق عمود الحالة -->
        <template #[`item.status`]="{ item }">
          <v-chip :color="getStatusColor(item.status)" text-color="white" small class="font-weight-bold">
            <v-icon left small>
              {{ item.status === 'active' ? 'mdi-wifi' : 'mdi-wifi-off' }}
            </v-icon>
            {{ item.status === 'active' ? 'نشط (Online)' : 'غير متصل (Offline)' }}
          </v-chip>
        </template>

        <!-- تنسيق عمود آخر ظهور -->
        <template #[`item.last_seen_at`]="{ item }">
          <span class="font-weight-medium">
            {{ item.last_seen_at ? item.last_seen_at : 'لم يظهر بعد' }}
          </span>
        </template>

        <!-- تنسيق عمود الإجراءات -->
        <template #[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                color="error"
                v-bind="attrs"
                v-on="on"
                @click="confirmDecouple(item)"
              >
                <v-icon>mdi-link-off</v-icon>
              </v-btn>
            </template>
            <span>إلغاء ربط وحذف الجهاز</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- حوار تأكيد الحذف وإلغاء الربط -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold error--text pt-6 px-6">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          تأكيد إلغاء ربط الجهاز؟
        </v-card-title>
        
        <v-card-text class="px-6 pt-4 text-subtitle-1">
          هل أنت متأكد من رغبتك في إلغاء إقران الجهاز
          <strong class="primary--text">"{{ selectedDevice?.device_name }}"</strong>؟
          سيؤدي هذا إلى إيقاف كافة خطوط الاتصال التابعة له ومسح سجلاته نهائياً من السيرفر.
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-1" text large @click="deleteDialog = false">
            تراجع
          </v-btn>
          <v-btn color="error" depressed large class="px-6 rounded-lg" @click="decoupleDevice" :loading="decoupleLoading">
            تأكيد الإلغاء والحذف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- شريط التنبيه اللحظي Snackbar -->
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
  name: 'DeviceList',
  data() {
    return {
      search: '',
      loading: false,
      decoupleLoading: false,
      deleteDialog: false,
      selectedDevice: null,
      devices: [],
      headers: [
        { text: 'اسم الجهاز', value: 'device_name', align: 'start', class: 'subtitle-1 font-weight-bold' },
        { text: 'الشركة المصنعة', value: 'brand' },
        { text: 'الموديل', value: 'model' },
        { text: 'إصدار أندرويد', value: 'android_version' },
        { text: 'إصدار التطبيق', value: 'app_version' },
        { text: 'حالة التواجد', value: 'status', sortable: false },
        { text: 'آخر ظهور نشط', value: 'last_seen_at' },
        { text: 'إجراءات', value: 'actions', sortable: false, align: 'center' },
      ],
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  created() {
    this.fetchDevices();
  },
  methods: {
    async fetchDevices() {
      this.loading = true;
      try {
        const response = await apiClient.get('v1/sms-gateway/devices');
        if (response.data && response.data.status) {
          this.devices = response.data.data;
        } else {
          this.showSnackbar('فشل جلب قائمة الأجهزة.', 'error');
        }
      } catch (error) {
        console.error(error);
        this.showSnackbar('حدث خطأ أثناء الاتصال بالسيرفر.', 'error');
      } finally {
        this.loading = false;
      }
    },
    confirmDecouple(device) {
      this.selectedDevice = device;
      this.deleteDialog = true;
    },
    async decoupleDevice() {
      if (!this.selectedDevice) return;
      this.decoupleLoading = true;
      try {
        const response = await apiClient.delete(`v1/sms-gateway/devices/${this.selectedDevice.id}`);
        if (response.data && response.data.status) {
          this.showSnackbar('تم إلغاء ربط وحذف الجهاز بنجاح.', 'success');
          this.deleteDialog = false;
          this.fetchDevices();
        } else {
          this.showSnackbar('فشل إلغاء ربط الجهاز.', 'error');
        }
      } catch (error) {
        console.error(error);
        this.showSnackbar('حدث خطأ أثناء إلغاء الربط.', 'error');
      } finally {
        this.decoupleLoading = false;
      }
    },
    getStatusColor(status) {
      return status === 'active' ? 'success' : 'grey darken-1';
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
