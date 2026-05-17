<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const props = defineProps({
  themes: {
    type: Array,
    required: true,
  },
});

const { name: themeName, global: globalTheme } = useTheme();

// Get active theme details
const activeTheme = computed(() => {
  return props.themes.find(t => t.name === globalTheme.name.value) || props.themes[0];
});

// Premium Arabic theme labels
const themeLabels = {
  light: 'الوضع النهاري',
  dark: 'الوضع الليلي',
  cozy: 'الوضع الدافئ (كوزي)',
};

const selectTheme = (themeNameValue) => {
  globalTheme.name.value = themeNameValue;
  localStorage.setItem('theme', themeNameValue);
};
</script>

<template>
  <v-menu location="bottom end" transition="slide-y-transition">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        color="primary"
        class="rounded-lg"
        size="34"
      >
        <v-icon size="20">{{ activeTheme.icon }}</v-icon>
      </v-btn>
    </template>
    
    <v-list density="compact" min-width="190" class="pa-1 rounded-lg">
      <v-list-item
        v-for="theme in props.themes"
        :key="theme.name"
        :active="globalTheme.name.value === theme.name"
        @click="selectTheme(theme.name)"
        class="rounded-lg my-1 theme-item"
        :class="{ 'theme-active': globalTheme.name.value === theme.name }"
      >
        <!-- Icon Prepend -->
        <template #prepend>
          <v-icon :icon="theme.icon" size="18" class="me-2" />
        </template>

        <!-- Label Title -->
        <v-list-item-title class="text-caption font-weight-bold">
          {{ themeLabels[theme.name] || theme.name }}
        </v-list-item-title>

        <!-- Checkmark Append -->
        <template #append v-if="globalTheme.name.value === theme.name">
          <v-icon icon="ri-check-line" size="18" class="ms-2 active-check" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.theme-item {
  transition: all 0.2s ease;
  cursor: pointer;
}
.theme-active {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
.active-check {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
