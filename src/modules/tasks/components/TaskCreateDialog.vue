<template>
  <v-dialog v-model="internalValue" max-width="600px">
    <v-card class="rounded-md overflow-hidden">
      <v-card-title class="pa-2 bg-primary text-white d-flex align-center gap-3">
        <v-icon icon="ri-add-circle-line" size="28" />
        <span class="text-h5 font-weight-bold">إسناد مهمة جديدة</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="formData.title"
            label="عنوان المهمة"
            placeholder="مثال: مراجعة مخزون شهر يناير"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'العنوان مطلوب']"
            class="mb-4"
          />

          <v-textarea
            v-model="formData.description"
            label="تفاصيل المهمة"
            placeholder="اشرح المطلوب بالتفصيل..."
            variant="outlined"
            density="comfortable"
            auto-grow
            rows="3"
            class="mb-4"
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="formData.priority" label="الأولوية" :items="priorityItems" variant="outlined" density="comfortable" class="mb-4" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.deadline"
                label="الموعد النهائي"
                type="datetime-local"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
            </v-col>
          </v-row>

          <v-divider class="mb-4" />

          <h3 class="text-subtitle-1 font-weight-bold mb-3">إسناد إلى:</h3>

          <v-autocomplete
            v-model="selectedAssignees"
            :items="combinedAssignees"
            label="اختر موظفين أو مجموعات"
            variant="outlined"
            density="comfortable"
            multiple
            chips
            closable-chips
            item-title="title"
            item-value="id"
            return-object
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :prepend-icon="item.raw.type === 'user' ? 'ri-user-line' : 'ri-team-line'">
                <template #title>
                  {{ item.raw.title }}
                  <v-chip size="x-small" :color="item.raw.type === 'user' ? 'info' : 'success'" class="ms-2">
                    {{ item.raw.type === 'user' ? 'موظف' : 'مجموعة' }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-2">
        <v-spacer />
        <v-btn variant="text" color="grey-darken-1" class="px-6" @click="$emit('update:modelValue', false)">إلغاء</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          class="px-8 rounded-md font-weight-bold"
          :loading="loading"
          :disabled="!valid || selectedAssignees.length === 0"
          @click="submit"
        >
          إنشاء المهمة
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import taskService from '@/api/services/task.service';
import userService from '@/api/services/user.service';
import taskGroupService from '@/api/services/task-group.service';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'created']);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const valid = ref(false);
const loading = ref(false);
const form = ref(null);

const formData = ref({
  title: '',
  description: '',
  priority: 'medium',
  deadline: null,
});

const selectedAssignees = ref([]);
const users = ref([]);
const groups = ref([]);

const priorityItems = [
  { title: 'عاجل جداً', value: 'urgent' },
  { title: 'عالي', value: 'high' },
  { title: 'متوسط', value: 'medium' },
  { title: 'منخفض', value: 'low' },
];

const combinedAssignees = computed(() => {
  const u = users.value.map(user => ({
    id: user.id,
    title: user.nickname || user.name || user.username,
    type: 'user',
  }));
  const g = groups.value.map(group => ({
    id: group.id,
    title: group.name,
    type: 'group',
  }));
  return [...u, ...g];
});

const fetchData = async () => {
  try {
    const [uRes, gRes] = await Promise.all([userService.getAll({ per_page: 100 }), taskGroupService.getAll()]);
    users.value = uRes.data;
    groups.value = gRes.data;
  } catch (e) {
    console.error('Error fetching assignees', e);
  }
};

const submit = async () => {
  loading.value = true;
  try {
    const payload = {
      ...formData.value,
      assignments: selectedAssignees.value.map(a => ({ type: a.type, id: a.id })),
    };
    await taskService.create(payload);
    emit('created');
    emit('update:modelValue', false);
    reset();
  } catch (e) {
    // Error handled in BaseService
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  formData.value = { title: '', description: '', priority: 'medium', deadline: null };
  selectedAssignees.value = [];
};

onMounted(fetchData);
</script>
