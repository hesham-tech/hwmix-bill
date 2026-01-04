<template>
  <div class="text-center py-12">
    <v-icon :size="iconSize" :color="iconColor">
      {{ icon }}
    </v-icon>

    <h3 class="text-h6 mt-4">{{ title }}</h3>
    <p class="text-body-2 text-grey-darken-1 mt-2">{{ message }}</p>

    <slot name="action">
      <v-btn v-if="showAction" class="mt-4" color="primary" variant="elevated" @click="$emit('action')">
        {{ actionText }}
      </v-btn>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'ri-inbox-line',
  },
  iconSize: {
    type: [String, Number],
    default: 80,
  },
  iconColor: {
    type: String,
    default: 'grey-lighten-1',
  },
  title: {
    type: String,
    default: 'لا توجد بيانات',
  },
  message: {
    type: String,
    default: 'ابدأ بإضافة عنصر جديد',
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  actionText: {
    type: String,
    default: 'إضافة',
  },
});

defineEmits(['action']);
</script>
