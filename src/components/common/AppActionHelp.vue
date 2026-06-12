<!--   مكون أيقونة المساعدة التوجيهي (AppActionHelp) لعرض تأثير العمليات على المخزون والحسابات عند تمرير الماوس أو النقر -->
<template>
  <div v-if="helpData" class="d-inline-flex align-center">
    <!-- Tooltip on Hover -->
    <v-tooltip location="top" class="custom-help-tooltip">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon="ri-question-line"
          variant="text"
          :color="color"
          :size="size"
          density="comfortable"
          class="help-icon-btn ms-1"
          @click.stop="openDialog"
        />
      </template>
      <span>{{ helpData.tooltip }}</span>
    </v-tooltip>

    <!-- Dialog on Click -->
    <v-dialog v-model="dialogOpen" max-width="500" scrollable transition="dialog-bottom-transition">
      <v-card class="rounded-xl overflow-hidden border-0 elevation-24">
        <!-- Dialog Header -->
        <div class="help-header-bg pa-5 text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="ri-sparkling-line" class="me-2" size="24" />
            <h3 class="text-subtitle-1 font-weight-black mb-0">{{ helpData.title }}</h3>
          </div>
          <v-btn icon="ri-close-line" variant="text" color="white" size="small" @click="dialogOpen = false" />
        </div>

        <!-- Dialog Content -->
        <v-card-text class="pa-5 bg-neutral-lighten-5">
          <div class="text-body-2 text-grey-darken-3 mb-4 leading-relaxed font-weight-bold">
            عند تأكيد وحفظ هذا الإجراء، سيقوم النظام بالخطوات التالية بشكل تلقائي:
          </div>

          <v-list class="bg-transparent pa-0 gap-3 d-flex flex-column">
            <v-list-item v-for="(point, idx) in helpData.points" :key="idx" class="help-point-item px-4 py-3 rounded-lg border bg-white">
              <template #prepend>
                <v-avatar color="primary-lighten-5" rounded size="36" class="me-3">
                  <v-icon :icon="point.icon" color="primary" size="20" />
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2 leading-relaxed text-grey-darken-4 text-wrap">
                {{ point.text }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="pa-4 border-t bg-white">
          <v-btn block variant="flat" color="primary" class="font-weight-black rounded-lg" height="44" @click="dialogOpen = false"> فهمت ذلك </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { actionHelpTexts } from '@/config/actionHelpTexts';

const props = defineProps({
  actionKey: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'secondary',
  },
  size: {
    type: String,
    default: 'small',
  },
});

const dialogOpen = ref(false);

const helpData = computed(() => {
  return actionHelpTexts[props.actionKey] || null;
});

const openDialog = () => {
  dialogOpen.value = true;
};
</script>

<style scoped>
.help-icon-btn {
  opacity: 0.75;
  transition: all 0.25s ease;
}

.help-icon-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.help-header-bg {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1e293b 100%);
}

.help-point-item {
  border-color: rgba(var(--v-border-color), 0.08) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.help-point-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.gap-3 {
  gap: 12px;
}

.leading-relaxed {
  line-height: 1.6 !important;
}

.text-wrap {
  white-space: normal !important;
}
</style>
