<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center gap-3 mb-6">
      <v-icon icon="ri-list-check-3" color="primary" size="32" />
      <div>
        <h1 class="text-h4 font-weight-bold">إدارة المهام</h1>
        <p class="text-subtitle-1 text-grey-darken-1 mb-0">تابع مهامك ومهام الفريق لحظياً</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="ri-add-line" class="px-6 rounded-lg" @click="openCreateDialog"> مهمة جديدة </v-btn>
    </div>

    <!-- Filters -->
    <v-card class="mb-6 rounded-lg border-grey-lighten-4" variant="flat" border>
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" md="3">
            <v-select v-model="filters.status" label="الحالة" :items="statusItems" variant="outlined" density="compact" hide-details clearable />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.priority"
              label="الأولوية"
              :items="priorityItems"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              prepend-inner-icon="ri-search-line"
              label="بحث في المهام..."
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn icon="ri-refresh-line" variant="text" @click="fetchTasks" :loading="loading" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tasks List -->
    <v-row v-if="!loading">
      <v-col v-for="task in tasks" :key="task.id" cols="12" md="6" lg="4">
        <v-card class="task-card rounded-lg border-grey-lighten-4 transition-all" variant="flat" border @click="openTaskDetails(task)">
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <v-chip :color="getPriorityColor(task.priority)" size="x-small" variant="flat" class="font-weight-bold">
                {{ translatePriority(task.priority) }}
              </v-chip>
              <v-chip :color="getStatusColor(task.status)" size="x-small" variant="tonal">
                {{ translateStatus(task.status) }}
              </v-chip>
            </div>

            <h3 class="text-h6 font-weight-bold mb-2 text-truncate">{{ task.title }}</h3>
            <p class="text-body-2 text-grey-darken-1 mb-4 line-clamp-2">{{ task.description || 'لا يوجد وصف...' }}</p>

            <div class="d-flex align-center gap-2 mb-4">
              <v-icon icon="ri-calendar-line" size="14" color="grey" />
              <span class="text-caption text-grey">{{ formatDate(task.deadline) }}</span>
            </div>

            <v-progress-linear :model-value="task.progress" height="6" rounded color="primary" class="mb-4" />

            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <div class="d-flex align-center flex-row-reverse ms-2">
                  <v-avatar
                    v-for="(assign, index) in task.assignments.slice(0, 3)"
                    :key="assign.id"
                    size="28"
                    :color="assign.assignable.color || 'primary'"
                    class="border border-white ms-n2"
                    :style="{ zIndex: 10 - index }"
                  >
                    <span class="text-caption white--text">{{ assign.assignable.nickname?.[0] || assign.assignable.name?.[0] }}</span>
                  </v-avatar>
                  <v-avatar v-if="task.assignments.length > 3" size="28" color="grey-lighten-2" class="border border-white ms-n2" style="z-index: 0">
                    <span class="text-caption">+{{ task.assignments.length - 3 }}</span>
                  </v-avatar>
                </div>
              </div>
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-chat-4-line" size="16" color="grey" />
                <span class="text-caption text-grey">{{ task.activities_count || 0 }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading Skeleton -->
    <v-skeleton-loader v-else type="card@6" class="bg-transparent" />

    <div v-if="!loading && tasks.length === 0" class="text-center pa-12">
      <v-img src="/images/empty-tasks.png" width="200" class="mx-auto mb-4 opacity-50" />
      <h3 class="text-h6 text-grey">لا يوجد مهام حالياً</h3>
      <v-btn color="primary" variant="text" @click="openCreateDialog">إضافة مهمة جديدة</v-btn>
    </div>

    <!-- Dialogs -->
    <TaskCreateDialog v-model="showCreateDialog" @created="fetchTasks" />
    <TaskDetailsDialog v-if="selectedTask" v-model="showDetailsDialog" :task-id="selectedTask.id" @updated="fetchTasks" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import taskService from '@/api/services/task.service';
import TaskCreateDialog from '../components/TaskCreateDialog.vue';
import TaskDetailsDialog from '../components/TaskDetailsDialog.vue';
import dayjs from 'dayjs';

const tasks = ref([]);
const loading = ref(true);
const showCreateDialog = ref(false);
const showDetailsDialog = ref(false);
const selectedTask = ref(null);

const filters = ref({
  status: null,
  priority: null,
  search: '',
});

const statusItems = [
  { title: 'قيد الانتظار', value: 'pending' },
  { title: 'جاري العمل', value: 'doing' },
  { title: 'قيد المراجعة', value: 'review' },
  { title: 'مكتملة', value: 'completed' },
  { title: 'ملغاة', value: 'cancelled' },
];

const priorityItems = [
  { title: 'عاجل جداً', value: 'urgent' },
  { title: 'عالي', value: 'high' },
  { title: 'متوسط', value: 'medium' },
  { title: 'منخفض', value: 'low' },
];

const fetchTasks = async () => {
  loading.value = true;
  try {
    const response = await taskService.getAll({
      status: filters.value.status,
      priority: filters.value.priority,
      search: filters.value.search,
    });
    tasks.value = response.data;
    setupEchoListeners();
  } catch (e) {
    console.error('Error fetching tasks', e);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  showCreateDialog.value = true;
};

const openTaskDetails = task => {
  selectedTask.value = task;
  showDetailsDialog.value = true;
};

const getPriorityColor = p => {
  return { urgent: 'error', high: 'warning', medium: 'info', low: 'success' }[p] || 'grey';
};

const getStatusColor = s => {
  return { pending: 'grey', doing: 'primary', review: 'amber', completed: 'success', cancelled: 'error' }[s] || 'grey';
};

const translatePriority = p => priorityItems.find(i => i.value === p)?.title || p;
const translateStatus = s => statusItems.find(i => i.value === s)?.title || s;

const formatDate = d => (d ? dayjs(d).format('YYYY-MM-DD HH:mm') : 'بدون موعد');

const setupEchoListeners = () => {
  const companyId = JSON.parse(localStorage.getItem('user'))?.company_id;
  if (companyId) {
    import('@/plugins/echo').then(({ echo }) => {
      echo.private(`company.${companyId}`).listen('.task.updated', e => {
        console.log('Task updated:', e);
        fetchTasks();
      });
    });
  }
};

watch(filters, fetchTasks, { deep: true });

onMounted(fetchTasks);
</script>

<style scoped>
.task-card {
  cursor: pointer;
}
.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(var(--v-theme-primary), 0.1) !important;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.gap-3 {
  gap: 12px;
}
.gap-2 {
  gap: 8px;
}
</style>
