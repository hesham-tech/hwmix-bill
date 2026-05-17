<script setup>
const themes = [
  {
    name: 'light',
    icon: 'ri-sun-line',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
  },
  {
    name: 'cozy',
    icon: 'ri-cup-line',
  },
];
</script>

<template>
  <ThemeSwitcher :themes="themes" />
</template>
