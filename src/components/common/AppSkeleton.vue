<template>
  <div class="app-skeleton">
    <!-- Table Skeleton -->
    <template v-if="type === 'table'">
      <v-skeleton-loader type="table-heading, table-row-divider@3" :loading="loading" />
    </template>

    <!-- Card Skeleton -->
    <template v-else-if="type === 'card'">
      <v-card>
        <v-skeleton-loader type="card" :loading="loading" />
      </v-card>
    </template>

    <!-- List Skeleton -->
    <template v-else-if="type === 'list'">
      <v-skeleton-loader type="list-item-avatar-three-line@3" :loading="loading" />
    </template>

    <!-- Form Skeleton -->
    <template v-else-if="type === 'form'">
      <v-skeleton-loader type="card-heading, list-item@3, actions" :loading="loading" />
    </template>

    <!-- Article/Details Skeleton -->
    <template v-else-if="type === 'article'">
      <v-skeleton-loader type="article, actions" :loading="loading" />
    </template>

    <!-- Dashboard Cards Skeleton -->
    <template v-else-if="type === 'dashboard'">
      <v-row>
        <v-col v-for="i in count" :key="i" cols="12" md="6" lg="3">
          <v-card>
            <v-skeleton-loader type="card" />
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Custom Skeleton -->
    <template v-else>
      <v-skeleton-loader :type="skeletonType" :loading="loading" />
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'card',
    validator: value => ['table', 'card', 'list', 'form', 'article', 'dashboard', 'custom'].includes(value),
  },
  loading: {
    type: Boolean,
    default: true,
  },
  count: {
    type: Number,
    default: 4,
  },
  // For custom skeleton type
  skeletonType: {
    type: String,
    default: 'card',
  },
});
</script>

<style scoped>
.app-skeleton {
  width: 100%;
}
</style>
