<template>
  <div class="units-page pa-6">
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold primary--text mb-1 d-flex align-center">
          <v-icon icon="ri-scales-3-line" class="me-3" color="primary" />
          وحدات القياس
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">إدارة مجموعات وحدات القياس، الوحدات الفردية، وقواعد التحويل الرياضي للمنتجات</p>
      </div>
      <AppButton
        prepend-icon="ri-add-line"
        color="primary"
        size="large"
        class="tour-group-add"
        @click="showWizard = true"
      >
        إضافة مجموعة وحدات
      </AppButton>
    </div>

    <!-- Search/Filter Bar -->
    <v-card class="elevation-1 border mb-6 rounded-lg pa-4">
      <v-row dense>
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            placeholder="البحث عن مجموعة أو وحدة..."
            prepend-inner-icon="ri-search-line"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="rounded-lg"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="50" />
      <p class="text-grey mt-2">جاري تحميل مجموعات الوحدات...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredGroups.length" class="text-center py-12">
      <v-avatar color="primary-lighten-5" size="80" class="mb-4">
        <v-icon icon="ri-scales-3-line" size="40" color="primary" />
      </v-avatar>
      <h3 class="text-h6 font-weight-bold mb-2">لا توجد مجموعات وحدات</h3>
      <p class="text-body-2 text-grey mb-4">اضغط على زر إضافة مجموعة وحدات للبدء.</p>
    </div>

    <!-- Groups Grid -->
    <v-row v-else>
      <v-col
        v-for="group in filteredGroups"
        :key="group.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <UnitGroupCard
          :group="group"
          :is-super-admin="isSuperAdmin"
          @open="openDetail"
        />
      </v-col>
    </v-row>

    <!-- Dialogs and Drawer -->
    <UnitGroupWizardDialog
      v-model="showWizard"
      @saved="loadGroups"
    />

    <UnitGroupDetailDrawer
      v-model="showDetail"
      :group="selectedGroup"
      @updated="onGroupUpdated"
      @deleted="loadGroups"
    />
  </div>
</template>

<script setup>
// صفحة إدارة وحدات القياس المحدثة (Unit Group Builder v2) تعرض المجموعات كبطاقات (Cards) وتتيح الإضافة عبر Wizard والتعديل عبر Drawer
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { PERMISSIONS } from '@/config/permissions';
import AppButton from '@/components/common/AppButton.vue';
import UnitGroupCard from '../components/units/UnitGroupCard.vue';
import UnitGroupWizardDialog from '../components/units/UnitGroupWizardDialog.vue';
import UnitGroupDetailDrawer from '../components/units/UnitGroupDetailDrawer.vue';

const userStore = useUserStore();
const isSuperAdmin = computed(() => userStore.hasPermission(PERMISSIONS.ADMIN_SUPER));

const apiGroups = useApi('unit-groups');

const groups = ref([]);
const loading = ref(false);
const search = ref('');

const showWizard = ref(false);
const showDetail = ref(false);
const selectedGroup = ref(null);

const loadGroups = async () => {
  loading.value = true;
  try {
    const res = await apiGroups.request('GET', 'company');
    groups.value = res.data ?? res;
  } catch (err) {
    console.error('Error loading groups:', err);
  } finally {
    loading.value = false;
  }
};

const openDetail = (group) => {
  selectedGroup.value = group;
  showDetail.value = true;
};

const onGroupUpdated = async () => {
  await loadGroups();
  if (selectedGroup.value) {
    selectedGroup.value = groups.value.find(g => g.id === selectedGroup.value.id) || null;
  }
};

const filteredGroups = computed(() => {
  if (!search.value) return groups.value;
  const s = search.value.toLowerCase();
  return groups.value.filter(g =>
    g.name?.toLowerCase().includes(s) ||
    g.units?.some(u => u.name?.toLowerCase().includes(s) || u.code?.toLowerCase().includes(s))
  );
});

onMounted(() => {
  loadGroups();
});
</script>

<style scoped>
.units-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
