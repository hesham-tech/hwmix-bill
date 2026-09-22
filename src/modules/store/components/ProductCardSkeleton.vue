<template>
  <div class="product-skeleton" :class="{ 'list-skeleton': listView }">
    <template v-if="!listView">
      <v-skeleton-loader
        type="image"
        height="220"
        class="rounded-t-xl"
      ></v-skeleton-loader>
      <div class="pa-4">
        <v-skeleton-loader type="text" width="60%" class="mb-2"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="mb-1"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="80%" class="mb-4"></v-skeleton-loader>
        <v-skeleton-loader type="button" width="100%"></v-skeleton-loader>
      </div>
    </template>
    <template v-else>
      <div class="d-flex gap-4 pa-3">
        <v-skeleton-loader type="image" width="100" height="100" class="rounded-xl flex-shrink-0"></v-skeleton-loader>
        <div class="flex-grow-1">
          <v-skeleton-loader type="text" width="80%" class="mb-2"></v-skeleton-loader>
          <v-skeleton-loader type="text" class="mb-3"></v-skeleton-loader>
          <v-skeleton-loader type="button" width="120px"></v-skeleton-loader>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  listView: { type: Boolean, default: false }
})
</script>

<style scoped>
.product-skeleton {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}
</style>
