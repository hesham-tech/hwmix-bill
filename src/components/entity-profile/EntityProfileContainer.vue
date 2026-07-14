<template>
  <div class="entity-profile-container pa-4 pa-md-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-4">
      <div class="d-flex align-center gap-3">
        <AppButton icon="ri-arrow-right-line" variant="text" @click="$router.back()" />
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">
            <slot name="title" :entity="entityData">{{ entityData?.name || 'تفاصيل الكيان' }}</slot>
          </h1>
          <p class="text-subtitle-2 text-grey">
            <slot name="subtitle" :entity="entityData">عرض البيانات والنشاطات التفصيلية</slot>
          </p>
        </div>
      </div>
      
      <!-- Header Actions Slot -->
      <div class="d-flex gap-2">
        <slot name="header-actions" :entity="entityData" :refresh="fetchData" />
      </div>
    </div>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" md="4">
        <v-skeleton-loader type="card" height="450" class="rounded-md" />
      </v-col>
      <v-col cols="12" md="8">
        <v-skeleton-loader type="article, table" height="450" class="rounded-md" />
      </v-col>
    </v-row>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <v-icon icon="ri-error-warning-line" size="64" color="error" class="mb-4" />
      <h3 class="text-h5 text-grey">فشل تحميل البيانات</h3>
      <p class="text-body-2 text-grey-darken-1 mt-2">عذراً، حدث خطأ أثناء محاولة جلب تفاصيل الكيان المطلوبة.</p>
      <AppButton variant="tonal" color="primary" class="mt-4" @click="fetchData">إعادة المحاولة</AppButton>
    </div>

    <!-- Empty/Not Found State -->
    <div v-else-if="!entityData" class="text-center py-16">
      <v-icon icon="ri-file-search-line" size="64" color="grey-lighten-2" />
      <h3 class="text-h5 text-grey mt-4">الكيان غير موجود</h3>
      <slot name="empty-actions" />
    </div>

    <!-- Content -->
    <v-row v-else>
      <!-- Sidebar Info Section -->
      <v-col cols="12" md="4">
        <slot name="sidebar" :entity="entityData" :refresh="fetchData">
          <!-- Fallback default sidebar card -->
          <v-card class="rounded-md border border-grey-lighten-4 pa-4 elevation-sm">
            <div class="text-center mb-4">
              <v-avatar size="100" color="grey-lighten-3" class="mb-3">
                <v-icon icon="ri-user-line" size="48" color="grey-darken-1" />
              </v-avatar>
              <h3 class="text-h6 font-weight-bold">{{ entityData?.name }}</h3>
            </div>
            <v-divider class="my-4" />
            <v-list density="compact">
              <v-list-item v-if="entityData?.email" prepend-icon="ri-mail-line" :title="entityData.email" subtitle="البريد" />
              <v-list-item v-if="entityData?.phone" prepend-icon="ri-phone-line" :title="entityData.phone" subtitle="الهاتف" />
            </v-list>
          </v-card>
        </slot>
      </v-col>

      <!-- Dynamic Tabbed Main Content -->
      <v-col cols="12" md="8">
        <v-card class="rounded-md border border-grey-lighten-4 h-100 overflow-hidden elevation-sm">
          <!-- Dynamic Tabs -->
          <v-tabs v-model="activeTab" bg-color="white" color="primary" density="comfortable" align-tabs="start" class="border-b">
            <v-tab
              v-for="group in activeGroups"
              :key="group.key"
              :value="group.key"
              :prepend-icon="group.icon"
              class="px-5 font-weight-medium"
            >
              {{ group.title }}
            </v-tab>
          </v-tabs>

          <!-- Dynamic Windows -->
          <v-window v-model="activeTab" class="pa-4">
            <v-window-item
              v-for="group in activeGroups"
              :key="group.key"
              :value="group.key"
            >
              <!-- Render all widgets belonging to this group -->
              <div v-for="widget in group.widgets" :key="widget.id" class="mb-6 last-mb-0">
                <!-- If widget is set to lazy, we only mount it if active, but default dynamic components handle this well -->
                <component :is="widget.component" />
              </div>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
// حاوية بصريّة عامة لإدارة وعرض تفاصيل الكيانات المختلفة ودورة حياة الـ Widgets ديناميكياً
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import resolver from '@core/entity-profile/resolver';
import registry from '@core/entity-profile/registry';
import { provideEntityProfile } from '@core/entity-profile/profileContext';
import { AppButton } from '@/components';

// ضمان تهيئة سجل الـ Widgets في حال عدم إتمام تحميل البلجن غير المتزامن
registry.discoverWidgets();

const props = defineProps({
  entityId: {
    type: [String, Number],
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },
  fetchAction: {
    type: Function,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();

const entityData = ref(null);
const loading = ref(true);
const error = ref(false);
const activeTab = ref('');

// تفعيل وتوفير سياق البيانات الموحد لجميع المكونات الأبناء
provideEntityProfile({
  entityId: props.entityId,
  entityType: props.entityType,
  entityData: entityData,
  refresh: () => fetchData(),
});

// جلب تفاصيل الكيان الأساسية (المستوى الأول من جلب البيانات الهجين)
const fetchData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const result = await props.fetchAction(props.entityId);
    entityData.value = result;
  } catch (err) {
    console.error(`Failed to fetch entity detail for type ${props.entityType}:`, err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// حل وتصفية الـ Widgets الفعالة وترتيبها
const resolvedWidgets = computed(() => {
  if (!entityData.value) return [];
  return resolver.resolve(props.entityType, entityData.value);
});

// تقسيم الـ Widgets المسموح بها ديناميكياً إلى مجموعات لتجنب عرض تبويبات فارغة
const activeGroups = computed(() => {
  const groupsMap = {
    core: { title: 'البيانات الأساسية', icon: 'ri-information-line', widgets: [] },
    financial: { title: 'المالية والعهد', icon: 'ri-bank-card-2-line', widgets: [] },
    operational: { title: 'العمليات التشغيلية', icon: 'ri-hand-coin-line', widgets: [] },
    history: { title: 'السجلات والنشاط', icon: 'ri-history-line', widgets: [] },
    system: { title: 'إعدادات النظام', icon: 'ri-settings-4-line', widgets: [] }
  };

  resolvedWidgets.value.forEach(widget => {
    const groupKey = widget.group || 'core';
    if (groupsMap[groupKey]) {
      groupsMap[groupKey].widgets.push(widget);
    } else {
      // مجموعة ديناميكية احتياطية في حال إدخال تصنيف جديد مستقبلاً
      groupsMap[groupKey] = { title: groupKey, icon: 'ri-menu-line', widgets: [widget] };
    }
  });

  // إرجاع المجموعات التي تحتوي على مكونات نشطة فقط
  return Object.keys(groupsMap)
    .filter(key => groupsMap[key].widgets.length > 0)
    .map(key => ({ key, ...groupsMap[key] }));
});

// ربط التبويب النشط برابط المتصفح للروابط العميقة (Deep Linking)
watch(activeGroups, (newGroups) => {
  if (newGroups.length > 0 && !activeTab.value) {
    // تحديد التبويب الافتراضي من الرابط إن وجد، أو عرض أول تبويب نشط
    const queryTab = route.query.tab;
    const tabExists = newGroups.some(g => g.key === queryTab);
    activeTab.value = tabExists ? queryTab : newGroups[0].key;
  }
}, { immediate: true });

// تحديث الرابط عند تغيير التبويب يدوياً
watch(activeTab, (newTab) => {
  if (newTab && route.query.tab !== newTab) {
    router.replace({ query: { ...route.query, tab: newTab } });
  }
});

onMounted(fetchData);
</script>

<style scoped>
.entity-profile-container {
  max-width: 1400px;
  margin: 0 auto;
}
.last-mb-0:last-child {
  margin-bottom: 0 !important;
}
</style>
