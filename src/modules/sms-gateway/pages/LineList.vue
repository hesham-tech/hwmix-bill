<template>
  <v-container fluid class="py-6">
    <!-- رأس الصفحة -->
    <v-row class="mb-6" align="center">
      <v-col cols="12" sm="6">
        <h1 class="text-h4 font-weight-bold primary--text">
          <v-icon large left color="primary">mdi-sim</v-icon>
          خطوط الاتصال والشرائح المتاحة
        </h1>
        <p class="text-subtitle-1 grey--text text--darken-1 mt-1">
          عرض ومراقبة قوة الإشارة وحالة التشغيل لشرائح الاتصال بالبوابات.
        </p>
      </v-col>
      <v-col cols="12" sm="6" class="text-sm-left">
        <v-btn color="primary" class="px-6" large rounded @click="fetchLines" :loading="loading">
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
          label="البحث عن شريحة أو مزود..."
          single-line
          hide-details
          outlined
          dense
          class="max-width-300"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="lines"
        :search="search"
        :loading="loading"
        loading-text="جاري تحميل الخطوط..."
        no-data-text="لا يوجد شرائح نشطة حالياً بالبوابات."
        class="elevation-0"
      >
        <!-- منفذ الشريحة -->
        <template #[`item.slot_index`]="{ item }">
          <v-chip outlined color="primary" small class="font-weight-bold">
            Slot {{ item.slot_index + 1 }}
          </v-chip>
        </template>

        <!-- قوة الإشارة (مؤشر مرئي ذكي) -->
        <template #[`item.signal_strength`]="{ item }">
          <v-row align="center" no-gutters>
            <v-col cols="auto" class="mr-2">
              <v-icon :color="getSignalColor(item.signal_strength)">
                {{ getSignalIcon(item.signal_strength) }}
              </v-icon>
            </v-col>
            <v-col>
              <span class="text-body-2 font-weight-medium grey--text text--darken-2">
                {{ item.signal_strength !== null ? item.signal_strength + ' dBm' : 'غير متوفر' }}
              </span>
            </v-col>
          </v-row>
        </template>

        <!-- الجهاز المرتبط -->
        <template #[`item.device`]="{ item }">
          <span class="font-weight-medium primary--text">
            {{ item.device?.device_name || 'جهاز غير معروف' }}
          </span>
        </template>

        <!-- حالة التشغيل للخط -->
        <template #[`item.status`]="{ item }">
          <v-chip :color="getStatusColor(item.status)" text-color="white" small class="font-weight-bold">
            {{ item.status === 'active' ? 'نشط' : 'معطل' }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

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
  name: 'LineList',
  data() {
    return {
      search: '',
      loading: false,
      lines: [],
      headers: [
        { text: 'المنفذ', value: 'slot_index', align: 'start', class: 'subtitle-1 font-weight-bold' },
        { text: 'مزود الشبكة (Carrier)', value: 'carrier' },
        { text: 'رقم الهاتف المكتشف', value: 'phone_number' },
        { text: 'قوة الإشارة (Signal)', value: 'signal_strength' },
        { text: 'نوع الشبكة', value: 'network_type' },
        { text: 'البوابة المرتبطة', value: 'device' },
        { text: 'حالة الخط', value: 'status', align: 'center' },
      ],
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    };
  },
  created() {
    this.fetchLines();
  },
  methods: {
    async fetchLines() {
      this.loading = true;
      try {
        const response = await apiClient.get('v1/sms-gateway/lines');
        if (response.data && response.data.status) {
          this.lines = response.data.data;
        } else {
          this.showSnackbar('فشل جلب قائمة خطوط الاتصال.', 'error');
        }
      } catch (error) {
        console.error(error);
        this.showSnackbar('حدث خطأ أثناء الاتصال بالسيرفر.', 'error');
      } finally {
        this.loading = false;
      }
    },
    getSignalIcon(strength) {
      if (strength === null) return 'mdi-signal-cellular-outline';
      const dbm = Math.abs(strength);
      if (dbm <= 70) return 'mdi-signal-cellular-3';
      if (dbm <= 85) return 'mdi-signal-cellular-2';
      if (dbm <= 100) return 'mdi-signal-cellular-1';
      return 'mdi-signal-cellular-outline';
    },
    getSignalColor(strength) {
      if (strength === null) return 'grey';
      const dbm = Math.abs(strength);
      if (dbm <= 70) return 'success';
      if (dbm <= 85) return 'warning';
      return 'error';
    },
    getStatusColor(status) {
      return status === 'active' ? 'success' : 'error';
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
