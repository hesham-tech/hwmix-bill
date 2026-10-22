<template>
  <v-card
    variant="flat"
    border
    class="tool-card rounded-xl pa-5 d-flex flex-column h-100 hover-lift tour-tool-card"
    :to="tool.route"
    elevation="0"
  >
    <div class="d-flex align-center justify-space-between mb-4">
      <v-avatar :color="tool.iconColor || 'primary'" size="52" rounded="lg" class="elevation-1">
        <v-icon :icon="tool.icon || 'ri-tools-line'" color="white" size="28" />
      </v-avatar>

      <v-chip
        v-if="tool.badge"
        :color="tool.badgeColor || 'primary'"
        size="small"
        variant="tonal"
        class="font-weight-bold px-3"
      >
        {{ tool.badge }}
      </v-chip>
    </div>

    <h3 class="text-h6 font-weight-bold mb-2 text-slate-800 line-clamp-1">
      {{ tool.title }}
    </h3>

    <p class="text-body-2 text-grey-darken-1 mb-5 flex-grow-1 line-clamp-3 leading-relaxed">
      {{ tool.description }}
    </p>

    <div class="d-flex align-center justify-space-between pt-3 border-t">
      <span class="text-caption font-weight-medium text-grey">
        أداة مجانية بدون تسجيل
      </span>

      <v-btn
        color="primary"
        variant="text"
        density="comfortable"
        class="font-weight-bold pe-0"
        append-icon="ri-arrow-left-line"
      >
        بدء الاستخدام
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  tool: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.tool-card {
  transition: all 0.25s ease-in-out;
  background-color: #ffffff;
  cursor: pointer;
  text-decoration: none;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.leading-relaxed {
  line-height: 1.6;
}
</style>
