<template>
  <header class="app-page-header" :class="{ 'sticky-header': sticky }" :style="sticky ? { top: stickyTop + 'px' } : {}">
    <v-card flat color="transparent" class="px-4 py-3 w-full">
      <v-row align="center" no-gutters>
        <!-- Prepend Content -->
        <v-col v-if="$slots.prepend" cols="auto" class="me-3 me-md-4">
          <slot name="prepend"></slot>
        </v-col>

        <!-- Title & Subtitle Section -->
        <v-col>
          <!-- Title Section -->
          <v-card-title class="pa-0 text-h5 text-md-h4 font-weight-black text-slate-800 mb-1">
            <slot name="title">{{ title }}</slot>
          </v-card-title>

          <!-- Subtitle Section -->
          <v-card-subtitle
            v-if="$slots.subtitle || subtitle || $slots.details || details"
            class="pa-0 text-body-2 text-md-body-1 text-slate-500 opacity-100"
          >
            <div class="d-flex flex-column">
              <slot name="subtitle">{{ subtitle }}</slot>
              <div v-if="$slots.details || details" class="text-slate-400 mt-1">
                <slot name="details">{{ details }}</slot>
              </div>
            </div>
          </v-card-subtitle>
        </v-col>

        <!-- Append Content -->
        <v-col v-if="$slots.append" cols="12" sm="auto" class="mt-3 mt-sm-0 ms-sm-4">
          <slot name="append"></slot>
        </v-col>
      </v-row>
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
