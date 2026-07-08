<template>
  <v-container class="py-8 text-right legal-compliance-report" fluid>
    <!-- Header with Back Button -->
    <div class="mb-8">
      <v-btn
        variant="text"
        color="primary"
        prepend-icon="ri-arrow-right-line"
        class="font-weight-bold mb-2 no-print"
        @click="$router.push('/app/admin/legal-documents')"
      >
        العودة للوحة التحكم
      </v-btn>
      <h1 class="text-h4 font-weight-black mb-2 text-primary d-flex align-center gap-2">
        <v-icon icon="ri-pie-chart-line" color="primary" />
        تقرير الامتثال وموافقات المستخدمين
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1" v-if="versionInfo">
        المستند: <span class="font-weight-bold text-primary">{{ versionInfo.title }}</span> | الإصدار: <span class="font-weight-bold text-success">v{{ versionInfo.version }}</span>
      </p>
    </div>

    <!-- statistics summary -->
    <v-row class="mb-8" v-if="!loading">
      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card border pa-6 rounded-xl elevation-1 bg-white">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-subtitle-2 text-grey-darken-1 font-weight-bold">إجمالي الموافقين</span>
              <h2 class="text-h3 font-weight-black mt-2 text-success">{{ acceptances.length }}</h2>
            </div>
            <v-avatar color="success-lighten-5" size="56" rounded="lg">
              <v-icon icon="ri-user-follow-line" color="success" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card border pa-6 rounded-xl elevation-1 bg-white">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-subtitle-2 text-grey-darken-1 font-weight-bold">تاريخ نشر هذا الإصدار</span>
              <h4 class="text-h5 font-weight-black mt-4 text-primary">
                {{ formatPublishDate(versionInfo?.published_at) }}
              </h4>
            </div>
            <v-avatar color="primary-lighten-5" size="56" rounded="lg">
              <v-icon icon="ri-calendar-event-line" color="primary" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main List Loader -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" width="6" class="mb-4" />
      <span class="text-subtitle-1 text-grey-darken-1">جاري تحميل تقرير الموافقات...</span>
    </div>

    <!-- Empty report state -->
    <v-card v-else-if="acceptances.length === 0" class="pa-12 text-center border rounded-xl bg-white elevation-1">
      <v-avatar color="primary-lighten-5" size="80" class="mb-6">
        <v-icon icon="ri-user-search-line" color="primary" size="40" />
      </v-avatar>
      <h2 class="text-h5 font-weight-bold mb-2">لا توجد موافقات مسجلة بعد</h2>
      <p class="text-body-1 text-grey">
        لم يقم أي مستخدم بالموافقة على هذا الإصدار من الشروط حتى الآن.
      </p>
    </v-card>

    <!-- Data Table -->
    <v-card v-else class="border rounded-xl bg-white elevation-1 pa-6">
      <div class="d-flex flex-column flex-sm-row justify-space-between align-stretch align-sm-center gap-4 mb-6">
        <v-text-field
          v-model="search"
          prepend-inner-icon="ri-search-line"
          label="البحث عن مستخدم بالاسم أو الإيميل"
          variant="outlined"
          density="comfortable"
          hide-details
          class="max-w-400"
        />

        <v-btn
          color="success"
          variant="elevated"
          prepend-icon="ri-file-excel-line"
          class="rounded-lg font-weight-bold px-6"
          @click="exportToCSV"
        >
          تصدير التقرير (CSV)
        </v-btn>
      </div>

      <v-table density="comfortable" class="compliance-table">
        <thead>
          <tr>
            <th class="text-right font-weight-bold">المستخدم</th>
            <th class="text-right font-weight-bold">البريد الإلكتروني</th>
            <th class="text-right font-weight-bold">تاريخ الموافقة</th>
            <th class="text-right font-weight-bold">عنوان الـ IP</th>
            <th class="text-right font-weight-bold">نظام المستخدم / المتصفح</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAcceptances" :key="item.id">
            <td class="font-weight-bold text-primary">{{ item.user_name }}</td>
            <td>{{ item.user_email }}</td>
            <td>{{ formatDate(item.accepted_at) }}</td>
            <td>
              <code class="bg-grey-lighten-4 px-2 py-0.5 rounded">{{ item.ip_address || 'غير مسجل' }}</code>
            </td>
            <td>
              <span class="text-caption text-grey text-truncate d-inline-block max-w-400" :title="item.user_agent">
                {{ item.user_agent || 'غير مسجل' }}
              </span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import notificationManager from '@/services/notificationManager';
import { formatDate as globalFormatDate, formatDateTime } from '@/utils/formatters';

const route = useRoute();
const loading = ref(true);
const acceptances = ref([]);
const versionInfo = ref(null);
const search = ref('');

const filteredAcceptances = computed(() => {
  if (!search.value) return acceptances.value;
  const q = search.value.toLowerCase();
  return acceptances.value.filter(item => {
    const name = (item.user_name || '').toLowerCase();
    const email = (item.user_email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return formatDateTime(dateString);
};

const formatPublishDate = (dateString) => {
  if (!dateString) return 'مسودة (لم ينشر)';
  return globalFormatDate(dateString);
};

const loadReport = async () => {
  const versionId = route.params.versionId;
  loading.value = true;
  try {
    const url = `v1/legal/admin/versions/${versionId}/report`;
    const response = await apiClient.get(url);
    if (response.data && response.data.status) {
      acceptances.value = response.data.data;
      if (acceptances.value.length > 0) {
        versionInfo.value = acceptances.value[0].version;
      } else {
        // Fetch document info if no acceptances exist yet
        // In our API structure we can fetch versions details or standard doc detail if needed
        // For simplicity, we just fallback or we could fetch the specific version details from somewhere.
        // Actually, we'll try to find it from documents list or show fallback.
        await fetchVersionDetailsFallback(versionId);
      }
    }
  } catch (err) {
    console.error('Failed to load compliance report:', err);
    notificationManager.error('حدث خطأ في تحميل تقرير الامتثال.');
  } finally {
    loading.value = false;
  }
};

const fetchVersionDetailsFallback = async (versionId) => {
  try {
    const res = await apiClient.get('v1/legal/admin/documents');
    if (res.data && res.data.status) {
      for (const doc of res.data.data) {
        if (doc.versions) {
          const match = doc.versions.find(v => v.id === parseInt(versionId));
          if (match) {
            versionInfo.value = match;
            break;
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const exportToCSV = () => {
  if (acceptances.value.length === 0) return;
  
  const headers = ['اسم المستخدم', 'البريد الإلكتروني', 'تاريخ الموافقة', 'عنوان الـ IP', 'نظام المستخدم / المتصفح'];
  const rows = filteredAcceptances.value.map(item => [
    item.user_name,
    item.user_email,
    formatDate(item.accepted_at),
    item.ip_address || '',
    (item.user_agent || '').replace(/,/g, ' ') // Escape commas
  ]);

  const csvContent = "\uFEFF" + [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `legal_compliance_report_v${versionInfo.value?.version || 'version'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  loadReport();
});
</script>

<script>
// تعليق عربي لقواعد الكلاسات: مكون يعرض تقارير الامتثال وموافقات المستخدمين التاريخية لإصدارات المستندات.
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.max-w-400 { max-width: 400px; }
.max-w-400 { max-width: 400px; }

.compliance-table th {
  color: #475569;
  font-size: 0.9rem;
}
.compliance-table td {
  font-size: 0.95rem;
}
</style>
