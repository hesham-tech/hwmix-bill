<template>
  <header class="app-page-header" :class="{ 'sticky-header': sticky }" :style="sticky ? { top: stickyTop + 'px' } : {}">
    <v-card flat color="transparent pa-2">
      <v-row align="center" no-gutters>
        <!-- Prepend Content (Icon or custom) -->
        <v-col v-if="$slots.prepend || icon" cols="auto" class="">
          <slot name="prepend">
            <v-avatar color="primary-lighten-5" rounded="md" size="30" class="elevation-sm">
              <v-icon :icon="icon" :color="iconColor" size="30" />
            </v-avatar>
          </slot>
        </v-col>

        <!-- Title & Subtitle Section -->
        <v-col cols="auto">
          <!-- Title Section -->
          <v-card-title class="pa-0 text-h5 font-weight-bold text-slate-800" :class="mobile ? 'text-subtitle-1' : 'text-md-h4'">
            <slot name="title">{{ title }}</slot>
          </v-card-title>

          <!-- Subtitle Section -->
          <v-card-subtitle
            v-if="$slots.subtitle || subtitle || $slots.details || details"
            class="pa-0 text-body-2 text-md-body-1 text-slate-500 opacity-100"
          >
            <div class="d-flex flex-column">
              <slot name="subtitle">{{ subtitle }}</slot>
              <div v-if="$slots.details || details" class="text-slate-400">
                <slot name="details">{{ details }}</slot>
              </div>
            </div>
          </v-card-subtitle>
        </v-col>

        <!-- Append Content -->
        <v-col v-if="$slots.append" cols="12" sm="auto" class="">
          <slot name="append"></slot>
        </v-col>
      </v-row>
    </v-card>

    <!-- Controls Section (Optional) -->
    <v-card v-if="$slots.controls" color="transparent" flat>
      <v-row align="center" no-gutters>
        <slot name="controls"></slot>
      </v-row>
    </v-card>
  </header>
</template>

<script setup>
import { useDisplay } from 'vuetify';

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: [String, Boolean],
    default: '',
  },
  iconColor: {
    type: String,
    default: 'primary',
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
    default: 79,
  },
});

const { mobile } = useDisplay();
</script>

<style scoped>
.app-page-header {
  background-color: var(--v-theme-background);
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
