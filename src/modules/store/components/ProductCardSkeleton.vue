<template>
  <v-card class="h-100 d-flex flex-column" elevation="1" rounded="lg">
    <v-skeleton-loader type="image" height="200"></v-skeleton-loader>
    <v-card-text>
      <v-skeleton-loader type="list-item-avatar" class="mb-2 px-0"></v-skeleton-loader>
      <v-skeleton-loader type="heading" class="mb-2"></v-skeleton-loader>
      <v-skeleton-loader type="text" width="60%"></v-skeleton-loader>
    </v-card-text>
    <v-card-actions class="px-4 pb-4 mt-auto">
      <v-skeleton-loader type="button" width="100%"></v-skeleton-loader>
    </v-card-actions>
  </v-card>
</template>

<script setup>
// Skeleton loader for ProductCard
</script>
