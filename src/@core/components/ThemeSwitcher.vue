<script setup>
import { useTheme } from 'vuetify';

const props = defineProps({
  themes: {
    type: Array,
    required: true,
  },
});

const { name: themeName, global: globalTheme } = useTheme();

const {
  state: currentThemeName,
  next: getNextThemeName,
  index: currentThemeIndex,
} = useCycleList(
  props.themes.map(t => t.name),
  { initialValue: themeName }
);

const changeTheme = () => {
  globalTheme.name.value = getNextThemeName();
};

// Update icon if theme is changed from other sources
watch(
  () => globalTheme.name.value,
  val => {
    currentThemeName.value = val;
  }
);
</script>

<template>
  <VTooltip open-delay="1000" scroll-strategy="close">
    <template #activator="{ props: tooltipProps }">
      <IconBtn v-bind="tooltipProps" @click="changeTheme">
        <VIcon :icon="props.themes[currentThemeIndex].icon" />
      </IconBtn>
    </template>
    <span class="text-capitalize">{{ currentThemeName }}</span>
  </VTooltip>
</template>
