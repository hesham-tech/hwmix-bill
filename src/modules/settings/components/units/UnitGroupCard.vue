<template>
  <v-card
    class="unit-group-card elevation-2 rounded-xl cursor-pointer h-100"
    :class="{ 'system-card': isSystemGroup }"
    @click="$emit('open', group)"
  >
    <!-- شريط العنوان العلوي -->
    <div class="card-header pa-4 pb-3 d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-3 flex-grow-1 min-width-0">
        <!-- أيقونة نوع المجموعة -->
        <v-avatar :color="typeColor" size="40" rounded="lg" class="flex-shrink-0">
          <v-icon :icon="typeIcon" size="20" color="white" />
        </v-avatar>
        <div class="min-width-0">
          <div class="text-subtitle-1 font-weight-bold text-truncate">{{ group.name }}</div>
        </div>
      </div>
      <!-- badge النظام للسوبر أدمن -->
      <v-chip v-if="isSystemGroup" size="x-small" color="secondary" variant="tonal" class="flex-shrink-0">
        <v-icon icon="ri-lock-line" size="10" class="me-1" />
        نظام
      </v-chip>
    </div>

    <v-divider />

    <!-- قسم الوحدات -->
    <div class="pa-4 pt-3">
      <div class="text-caption text-medium-emphasis mb-2 font-weight-medium">الوحدات</div>

      <div v-if="visibleUnits.length" class="d-flex flex-wrap gap-1 align-center">
        <v-chip
          v-for="unit in visibleUnits"
          :key="unit.id"
          size="x-small"
          color="primary"
          variant="tonal"
          class="font-weight-medium"
        >
          {{ unit.name }}
        </v-chip>
        <!-- +X إن زادت الوحدات عن الحد -->
        <v-chip
          v-if="hiddenCount > 0"
          size="x-small"
          color="grey"
          variant="tonal"
        >
          +{{ hiddenCount }} أخرى
        </v-chip>
      </div>
      <div v-else class="text-caption text-disabled">لا توجد وحدات</div>
    </div>

    <!-- Footer: عدد التحويلات -->
    <div class="card-footer pa-3 pt-0 d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
        <v-icon icon="ri-shuffle-line" size="14" />
        <span>{{ conversionsCount }} قاعدة تحويل</span>
      </div>
      <v-icon icon="ri-arrow-left-s-line" size="18" color="grey" />
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  group: { type: Object, required: true },
  isSuperAdmin: { type: Boolean, default: false },
  maxVisibleUnits: { type: Number, default: 5 },
});

defineEmits(['open']);

const isSystemGroup = computed(() => props.group.company_id === null);

const visibleUnits = computed(() =>
  (props.group.units ?? []).slice(0, props.maxVisibleUnits)
);

const hiddenCount = computed(() =>
  Math.max(0, (props.group.units?.length ?? 0) - props.maxVisibleUnits)
);

const conversionsCount = computed(() => props.group.conversions?.length ?? 0);

const typeMap = {
  weight: { label: 'وزن وكتلة', icon: 'ri-scales-3-line',   color: 'blue-darken-2'  },
  length: { label: 'طول ومسافة', icon: 'ri-ruler-line',      color: 'green-darken-2' },
  volume: { label: 'حجم وسعة',   icon: 'ri-drop-line',       color: 'cyan-darken-2'  },
  area:   { label: 'مساحة',      icon: 'ri-map-2-line',      color: 'teal-darken-2'  },
  count:  { label: 'عد وتعبئة',  icon: 'ri-stack-line',      color: 'orange-darken-2'},
  custom: { label: 'مخصص',       icon: 'ri-settings-3-line', color: 'purple-darken-2'},
};

const typeLabel = computed(() => typeMap[props.group.type]?.label ?? props.group.type);
const typeIcon  = computed(() => typeMap[props.group.type]?.icon  ?? 'ri-stack-line');
const typeColor = computed(() => typeMap[props.group.type]?.color ?? 'grey-darken-2');
</script>

<style scoped>
.unit-group-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
.unit-group-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
}
.system-card {
  border: 1px solid rgba(var(--v-theme-secondary), 0.3);
}
.cursor-pointer { cursor: pointer; }
.min-width-0 { min-width: 0; }
</style>
