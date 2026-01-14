<template>
  <v-dialog v-model="internalValue" max-width="800px">
    <v-card v-if="task" class="rounded-xl overflow-hidden">
      <v-card-title class="pa-6 bg-grey-lighten-5 d-flex align-center gap-3">
        <v-chip :color="getStatusColor(task.status)" variant="flat" size="small">
          {{ translateStatus(task.status) }}
        </v-chip>
        <span class="text-h6 font-weight-bold">{{ task.title }}</span>
        <v-spacer />
        <v-btn icon="ri-close-line" variant="text" @click="$emit('update:modelValue', false)" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-row no-gutters>
          <!-- Details Column -->
          <v-col cols="12" md="7" class="pa-6 border-e border-grey-lighten-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">الوصف</h4>
            <p class="text-body-1 text-grey-darken-2 mb-6 whitespace-pre-wrap">{{ task.description || 'لا يوجد وصف لهذه المهمة.' }}</p>

            <v-divider class="mb-6" />

            <h4 class="text-subtitle-1 font-weight-bold mb-4">المرفقات</h4>
            <div class="d-flex flex-wrap gap-2 mb-4">
              <v-chip
                v-for="file in task.attachments"
                :key="file.id"
                size="small"
                variant="tonal"
                closable
                color="grey-darken-2"
                @click="download(file)"
              >
                <template #prepend><v-icon icon="ri-file-line" size="14" class="me-1" /></template>
                {{ file.file_name }}
              </v-chip>
              <v-btn icon="ri-upload-cloud-2-line" variant="tonal" size="x-small" @click="$refs.fileInput.click()" />
              <input type="file" ref="fileInput" class="d-none" @change="uploadAttachment" />
            </div>

            <v-divider class="mb-6" />

            <h4 class="text-subtitle-1 font-weight-bold mb-4">النشاط والتعليقات</h4>
            <div class="activities-container mb-4">
              <div v-for="activity in task.activities" :key="activity.id" class="activity-item mb-4 d-flex gap-3">
                <v-avatar size="32" color="primary">
                  <span class="text-caption">{{ activity.user?.nickname?.[0] || 'U' }}</span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="font-weight-bold text-body-2">{{ activity.user?.nickname || 'مستخدم' }}</span>
                    <span class="text-caption text-grey">{{ formatDateTime(activity.created_at) }}</span>
                  </div>
                  <v-card variant="flat" :color="activity.type === 'comment' ? 'blue-lighten-5' : 'grey-lighten-4'" class="pa-3 rounded-lg">
                    <p class="text-body-2 mb-0">{{ activity.content }}</p>
                  </v-card>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2">
              <v-text-field
                v-model="newComment"
                placeholder="أضف تعليقاً..."
                variant="outlined"
                density="comfortable"
                hide-details
                @keyup.enter="addComment"
              />
              <v-btn color="primary" icon="ri-send-plane-2-line" @click="addComment" :loading="commentLoading" />
            </div>
          </v-col>

          <!-- Sidebar Column -->
          <v-col cols="12" md="5" class="pa-6 bg-grey-lighten-5">
            <div class="mb-6">
              <h4 class="text-caption font-weight-bold text-grey-darken-1 mb-2">تحديث الحالة</h4>
              <v-select
                v-model="task.status"
                :items="statusItems"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="updateStatus"
              />
            </div>

            <div class="mb-6">
              <h4 class="text-caption font-weight-bold text-grey-darken-1 mb-2">التقدم</h4>
              <v-slider v-model="task.progress" color="primary" thumb-label step="5" @end="updateProgress">
                <template #append>
                  <span class="text-caption font-weight-bold">{{ task.progress }}%</span>
                </template>
              </v-slider>
            </div>

            <v-divider class="mb-6" />

            <div class="mb-6">
              <h4 class="text-caption font-weight-bold text-grey-darken-1 mb-2">المسؤولين</h4>
              <div class="d-flex flex-wrap gap-2">
                <v-chip v-for="assign in task.assignments" :key="assign.id" size="small" variant="outlined" color="primary">
                  {{ assign.assignable.name || assign.assignable.nickname || assign.assignable.title }}
                </v-chip>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="text-caption font-weight-bold text-grey-darken-1 mb-2">الموعد النهائي</h4>
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-calendar-event-line" size="18" color="primary" />
                <span class="text-body-2">{{ formatDate(task.deadline) }}</span>
              </div>
            </div>

            <div class="mb-6">
              <h4 class="text-caption font-weight-bold text-grey-darken-1 mb-2">بواسطة</h4>
              <div class="d-flex align-center gap-2">
                <v-avatar size="24" color="grey-lighten-2">
                  <span class="text-caption">{{ task.creator?.nickname?.[0] }}</span>
                </v-avatar>
                <span class="text-body-2">{{ task.creator?.nickname || 'نظام' }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-else class="rounded-xl pa-12 text-center">
      <v-progress-circular indeterminate color="primary" />
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import taskService from '@/api/services/task.service';
import dayjs from 'dayjs';
import { toast } from 'vue3-toastify';

const props = defineProps(['modelValue', 'taskId']);
const emit = defineEmits(['update:modelValue', 'updated']);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const task = ref(null);
const loading = ref(true);
const newComment = ref('');
const commentLoading = ref(false);

const statusItems = [
  { title: 'قيد الانتظار', value: 'pending' },
  { title: 'جاري العمل', value: 'doing' },
  { title: 'قيد المراجعة', value: 'review' },
  { title: 'مكتملة', value: 'completed' },
  { title: 'ملغاة', value: 'cancelled' },
];

const fetchTask = async () => {
  if (!props.taskId) return;
  loading.value = true;
  try {
    const response = await taskService.getOne(props.taskId);
    task.value = response.data[0]; // BaseService.getOne returns normalized {data: [item]}
  } catch (e) {
    console.error('Error fetching task details', e);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async newStatus => {
  try {
    await taskService.update(task.value.id, { status: newStatus });
    toast.success('تم تحديث الحالة');
    fetchTask(); // Refresh for activities
    emit('updated');
  } catch (e) {
    toast.error('فشل تحديث الحالة');
  }
};

const updateProgress = async () => {
  try {
    await taskService.update(task.value.id, { progress: task.value.progress });
    emit('updated');
  } catch (e) {
    toast.error('فشل تحديث التقدم');
  }
};

const addComment = async () => {
  if (!newComment.value.trim()) return;
  commentLoading.value = true;
  try {
    await taskService.addComment(task.value.id, newComment.value);
    newComment.value = '';
    fetchTask();
  } catch (e) {
    toast.error('فشل إضافة التعليق');
  } finally {
    commentLoading.value = false;
  }
};

const uploadAttachment = async event => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    await taskService.uploadAttachment(task.value.id, formData);
    toast.success('تم رفع الملف');
    fetchTask();
  } catch (e) {
    toast.error('فشل رفع الملف');
  }
};

const download = file => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  window.open(`${baseUrl}/storage/${file.file_path}`, '_blank');
};

const getStatusColor = s => {
  return { pending: 'grey', doing: 'primary', review: 'amber', completed: 'success', cancelled: 'error' }[s] || 'grey';
};

const translateStatus = s => statusItems.find(i => i.value === s)?.title || s;

const formatDate = d => (d ? dayjs(d).format('YYYY-MM-DD') : 'بدون موعد');
const formatDateTime = d => dayjs(d).format('DD/MM HH:mm');

watch(() => props.taskId, fetchTask);

onMounted(fetchTask);
</script>

<style scoped>
.activities-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
.gap-3 {
  gap: 12px;
}
.gap-2 {
  gap: 8px;
}
</style>
