<template>
  <div class="app-infinite-scroll">
    <!-- Items slot -->
    <slot />

    <!-- Intersection observer target -->
    <div
      v-if="hasMore && !disabled"
      v-intersect="{
        handler: onIntersect,
        options: {
          threshold: [0, 0.5, 1.0],
        },
      }"
      class="py-4 d-flex justify-center align-center"
    >
      <v-progress-circular v-if="loading" indeterminate color="primary" size="32" />
    </div>

    <!-- No more data message -->
    <div v-if="!hasMore && showNoMore" class="py-8 text-center">
      <div class="d-flex flex-column align-center text-grey">
        <v-icon icon="ri-check-double-line" size="32" class="mb-2 opacity-50" />
        <span class="text-body-2">{{ noMoreText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Generic Infinite Scroll Component
 * Uses v-intersect directive for better performance
 */
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showNoMore: {
    type: Boolean,
    default: true,
  },
  noMoreText: {
    type: String,
    default: 'لا يوجد المزيد من البيانات لعرضها',
  },
  offset: {
    type: Number,
    default: 200,
  },
});

const emit = defineEmits(['load']);

const onIntersect = (isIntersecting, entries, observer) => {
  if (isIntersecting && !props.loading && props.hasMore && !props.disabled) {
    emit('load');
  }
};
</script>

<style scoped>
.app-infinite-scroll {
  width: 100%;
}
</style>
