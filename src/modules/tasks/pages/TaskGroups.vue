<template>
  <v-container fluid class="pa-2">
    <div class="d-flex align-center gap-3 mb-2">
      <v-icon icon="ri-team-line" color="primary" size="32" />
      <div>
        <h1 class="text-h4 font-weight-bold">مجموعات العمل</h1>
        <p class="text-subtitle-1 text-grey-darken-1 mb-0">أنشئ فرق عمل لتسهيل إسناد المهام</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="ri-group-line" class="px-6 rounded-md" @click="openCreateDialog"> مجموعة جديدة </v-btn>
    </div>

    <v-row v-if="!loading">
      <v-col v-for="group in groups" :key="group.id" cols="12" md="4">
        <v-card class="group-card rounded-md border-grey-lighten-4" variant="flat" border>
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center gap-3">
                <v-avatar :color="group.color || 'primary'" size="40">
                  <v-icon icon="ri-team-fill" color="white" size="20" />
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-bold mb-0">{{ group.name }}</h3>
                  <span class="text-caption text-grey">{{ group.users_count }} موظف</span>
                </div>
              </div>
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn icon="ri-more-2-fill" variant="text" size="small" v-bind="props" />
                </template>
                <v-list density="compact" class="rounded-md">
                  <v-list-item prepend-icon="ri-edit-line" title="تعديل" @click="editGroup(group)" />
                  <v-list-item prepend-icon="ri-delete-bin-line" title="حذف" color="error" @click="deleteGroup(group)" />
                </v-list>
              </v-menu>
            </div>

            <p class="text-body-2 text-grey-darken-1 mb-4 line-clamp-2 h-40">{{ group.description || 'لا يوجد وصف...' }}</p>

            <div class="d-flex align-center flex-wrap gap-1">
              <v-avatar v-for="user in group.users" :key="user.id" size="24" :color="user.color || 'grey-lighten-3'" class="border border-white">
                <v-tooltip activator="parent" location="top">{{ user.nickname || user.name }}</v-tooltip>
                <span class="text-overline">{{ user.nickname?.[0] || 'U' }}</span>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-skeleton-loader v-else type="card@3" class="bg-transparent" />

    <div v-if="!loading && groups.length === 0" class="text-center pa-4">
      <v-img src="/images/empty-groups.png" width="180" class="mx-auto mb-4 opacity-50" />
      <h3 class="text-h6 text-grey">لا يوجد مجموعات حالياً</h3>
      <v-btn color="primary" variant="text" @click="openCreateDialog">أنشئ أول مجموعة</v-btn>
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card class="rounded-md overflow-hidden">
        <v-card-title class="pa-2 bg-primary text-white font-weight-bold">
          {{ editingGroup ? 'تعديل مجموعة' : 'مجموعة عمل جديدة' }}
        </v-card-title>
        <v-card-text class="pa-2">
          <v-text-field v-model="formData.name" label="اسم المجموعة" variant="outlined" class="mb-4" />
          <v-textarea v-model="formData.description" label="الوصف" variant="outlined" rows="2" class="mb-4" />

          <h4 class="text-subtitle-2 mb-2">أعضاء المجموعة:</h4>
          <v-autocomplete
            v-model="formData.user_ids"
            :items="users"
            label="اختر الموظفين"
            item-title="nickname"
            item-value="id"
            multiple
            chips
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions class="pa-2 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="flat" class="px-8 rounded-md" :loading="saving" @click="saveGroup">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import taskGroupService from '@/api/services/task-group.service';
import userService from '@/api/services/user.service';

const groups = ref([]);
const users = ref([]);
const loading = ref(true);
const showDialog = ref(false);
const editingGroup = ref(null);
const saving = ref(false);

const formData = ref({
  name: '',
  description: '',
  user_ids: [],
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [gRes, uRes] = await Promise.all([taskGroupService.getAll(), userService.getAll({ per_page: 100 })]);
    groups.value = gRes.data;
    users.value = uRes.data;
  } catch (e) {
    console.error('Error fetching groups data', e);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  editingGroup.value = null;
  formData.value = { name: '', description: '', user_ids: [] };
  showDialog.value = true;
};

const editGroup = group => {
  editingGroup.value = group;
  formData.value = {
    name: group.name,
    description: group.description,
    user_ids: group.users.map(u => u.id),
  };
  showDialog.value = true;
};

const saveGroup = async () => {
  saving.value = true;
  try {
    if (editingGroup.value) {
      await taskGroupService.update(editingGroup.value.id, formData.value);
    } else {
      await taskGroupService.create(formData.value);
    }
    showDialog.value = false;
    fetchData();
  } catch (e) {
    // Error handled in BaseService
  } finally {
    saving.value = false;
  }
};

const deleteGroup = async group => {
  if (confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
    try {
      await taskGroupService.delete(group.id);
      fetchData();
    } catch (e) {
      // Error handled in BaseService
    }
  }
};

onMounted(fetchData);
</script>

<style scoped>
.group-card {
  transition: all 0.3s ease;
}
.group-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05) !important;
}
.h-40 {
  height: 40px;
}
.gap-3 {
  gap: 12px;
}
.gap-2 {
  gap: 8px;
}
</style>
