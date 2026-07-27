<template>
  <div class="p-4 bg-grey-lighten-4 min-vh-100">
    <v-card class="bg-white elevation-1 rounded-xl border p-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h2 class="text-h5 font-weight-bold text-high-emphasis mb-1">
            <v-icon color="success" class="me-2">mdi-chart-line-up</v-icon> تقارير الاستهلاك والتكاليف (Cost Engine Logs)
          </h2>
          <p class="text-subtitle-2 text-grey-darken-1">سجل استهلاك الـ Tokens وحساب التكاليف الدقيقة (Append-Only Audit Log)</p>
        </div>
      </div>

      <v-alert type="info" variant="tonal" class="mb-4 text-subtitle-2 font-weight-bold bg-light-blue-lighten-5">
        جميع التكاليف تُحسب تلقائياً بواسطة Cost Engine فور انتهاء كل طلب وتُسجّل بدقة Decimal(12,6).
      </v-alert>

      <v-table class="bg-white">
        <thead>
          <tr>
            <th class="text-grey-darken-3 font-weight-bold">التاريخ</th>
            <th class="text-grey-darken-3 font-weight-bold">القدرة</th>
            <th class="text-grey-darken-3 font-weight-bold">الـ Tokens (دخل / خرج)</th>
            <th class="text-grey-darken-3 font-weight-bold">إجمالي التكلفة</th>
            <th class="text-grey-darken-3 font-weight-bold">زمن الاستجابة (Latency)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td class="text-grey-darken-1">{{ log.created_at || 'الان' }}</td>
            <td><code class="text-caption text-primary bg-grey-lighten-4 px-2 py-1 rounded">{{ log.capability_key }}</code></td>
            <td class="font-weight-bold text-grey-darken-3">{{ log.input_tokens }} / {{ log.output_tokens }}</td>
            <td class="text-success font-weight-bold">${{ log.total_cost ? log.total_cost.toFixed(6) : '0.000000' }}</td>
            <td class="text-grey-darken-1">{{ log.latency_ms }} ms</td>
          </tr>
          <tr v-if="!logs.length">
            <td colspan="5" class="text-center text-grey-darken-1 py-4">لا توجد حركات استهلاك سابقة حتى الآن</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAiUsageReport } from '../services/aiPlatformService';

const logs = ref([]);

onMounted(async () => {
  try {
    const res = await fetchAiUsageReport();
    if (res.data?.success) {
      logs.value = res.data.data;
    }
  } catch (e) {
    // fallback
  }
});
</script>

<style scoped>
.text-success { color: #10b981 !important; }
</style>
