<template>
  <v-card class="rounded-xl border-grey-lighten-4 h-100" variant="flat" border>
    <v-card-title class="pa-5 d-flex align-center gap-3">
      <v-icon icon="ri-list-check-line" color="primary" />
      <span class="text-h6 font-weight-bold">مهامي اليوم</span>
      <v-spacer />
      <v-btn icon="ri-external-link-line" variant="text" size="small" to="/tasks" />
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
      <v-list v-if="tasks.length > 0" class="py-0">
        <v-list-item v-for="task in tasks" :key="task.id" class="border-b border-grey-lighten-4 pa-4" @click="goToTask(task)">
          <template #prepend>
            <v-checkbox-btn v-model="task.isDone" density="compact" color="success" class="me-2" @click.stop="toggleTask(task)" />
          </template>

          <v-list-item-title :class="{ 'text-decoration-line-through text-grey': task.status === 'completed' }" class="font-weight-bold">
            {{ task.title }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ task.description || 'لا يوجد وصف' }}
            <div class="d-flex align-center mt-2 flex-row-reverse justify-end">
              <v-avatar
                v-for="(assign, index) in task.assignments?.slice(0, 3)"
                :key="assign.id"
                size="24"
                :color="assign.assignable.color || 'primary'"
                class="border border-white ms-n1"
                :style="{ zIndex: 10 - index }"
              >
                <span class="text-caption white--text" style="font-size: 10px !important">
                  {{ assign.assignable.nickname?.[0] || assign.assignable.name?.[0] }}
                </span>
              </v-avatar>
            </div>
          </v-list-item-subtitle>

          <template #append>
            <v-chip :color="getPriorityColor(task.priority)" size="x-small" variant="flat">
              {{ translatePriority(task.priority) }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>

      <div v-else-if="!loading" class="text-center pa-12">
        <v-icon icon="ri-check-double-line" size="48" color="grey-lighten-3" class="mb-2" />
        <p class="text-grey mb-0">لا يوجد مهام تتطلب انتباهك حالياً</p>
      </div>

      <div v-else class="pa-6">
        <v-skeleton-loader type="list-item-three-line@3" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import taskService from '@/api/services/task.service';
import { useRouter } from 'vue-router';

const router = useRouter();
const tasks = ref([]);
const loading = ref(true);

const fetchDashboardTasks = async () => {
  loading.value = true;
  try {
    const response = await taskService.getAll({ status: 'pending', per_page: 5 });
    tasks.value = response.data || [];
  } catch (e) {
    console.error('Error fetching dashboard tasks', e);
  } finally {
    loading.value = false;
  }
};

const toggleTask = async task => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  try {
    await taskService.update(task.id, { status: newStatus });
    fetchDashboardTasks();
  } catch (e) {
    console.error('Failed to toggle task', e);
  }
};

const goToTask = task => {
  router.push({ name: 'tasks', query: { taskId: task.id } });
};

const getPriorityColor = p => {
  return { urgent: 'error', high: 'warning', medium: 'info', low: 'success' }[p] || 'grey';
};

const translatePriority = p => {
  return { urgent: 'عاجل', high: 'عالي', medium: 'متوسط', low: 'منخفض' }[p] || p;
};

onMounted(() => {
  fetchDashboardTasks();
});
</script>
