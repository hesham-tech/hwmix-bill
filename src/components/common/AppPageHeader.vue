<template>
  <header class="app-page-header" :class="{ 'sticky-header': sticky }" :style="sticky ? { top: stickyTop + 'px' } : {}">
    <v-card flat color="transparent" class="px-4 py-4 w-full d-flex align-center">
      <!-- Prepend Content -->
      <div v-if="$slots.prepend" class="me-4">
        <slot name="prepend"></slot>
      </div>

      <div class="flex-grow-1">
        <!-- Title Section -->
        <v-card-title class="pa-0 text-h4 font-weight-black text-slate-800 mb-1">
          <slot name="title">{{ title }}</slot>
        </v-card-title>

        <!-- Subtitle Section -->
        <v-card-subtitle class="pa-0 text-body-1 text-slate-500 opacity-100">
          <div class="d-flex flex-column">
            <slot name="subtitle">{{ subtitle }}</slot>
            <div v-if="$slots.details || details" class="text-slate-400 mt-1">
              <slot name="details">{{ details }}</slot>
            </div>
          </div>
        </v-card-subtitle>
      </div>

      <!-- Append Content -->
      <div v-if="$slots.append" class="ms-4">
        <slot name="append"></slot>
      </div>
    </v-card>

    <!-- Controls Section (Optional) -->
    <v-card v-if="$slots.controls" class="mx-4 mb-4 pa-3 border-slate-50" density="comfortable" flat>
      <v-row align="center" no-gutters>
        <slot name="controls"></slot>
      </v-row>
    </v-card>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  details: {
    type: String,
    default: '',
  },
  sticky: {
    type: Boolean,
    default: true,
  },
  stickyTop: {
    type: [Number, String],
    default: 77,
  },
});
</script>

<style scoped>
.app-page-header {
  background-color: #f8fafc;
  transition: all 0.3s ease;
  width: 100%;
}

.sticky-header {
  position: sticky;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.text-slate-800 {
  color: #1e293b !important;
}
.text-slate-500 {
  color: #64748b !important;
}
.text-slate-400 {
  color: #94a3b8 !important;
}
.border-slate-50 {
  border: 1px solid #f1f5f9 !important;
}
</style>
