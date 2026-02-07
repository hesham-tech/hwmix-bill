<template>
  <div class="report-container">
    <!-- Header -->
    <div class="mb-2 d-flex align-center justify-space-between flex-wrap gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
        <p class="text-body-1 text-grey">{{ description }}</p>
      </div>
      <div class="d-flex align-center gap-2">
        <slot name="actions" />
        <AppButton variant="tonal" color="success" prepend-icon="ri-file-excel-2-line" :loading="exporting" @click="$emit('export')">
          تصدير
        </AppButton>
        <AppButton color="primary" prepend-icon="ri-refresh-line" :loading="loading" @click="$emit('refresh')"> تحديث </AppButton>
      </div>
    </div>

    <!-- Main Content -->
    <v-row class="mx-0">
      <!-- Sidebar Filters (Desktop) -->
      <v-col cols="12" md="3" class="ps-0">
        <v-card border flat class="rounded-md pa-2 sticky-top">
          <div class="d-flex align-center mb-4">
            <v-icon icon="ri-filter-3-line" color="primary" class="me-2" />
            <h3 class="text-subtitle-1 font-weight-bold">تصفية النتائج</h3>
          </div>
          <slot name="filters" />
        </v-card>
      </v-col>

      <!-- Results -->
      <v-col cols="12" md="9" class="pe-0">
        <!-- Summary Cards Slot -->
        <div class="mb-2">
          <slot name="summary" />
        </div>

        <!-- Charts Slot -->
        <div class="mb-2">
          <slot name="charts" />
        </div>

        <!-- Table Card -->
        <v-card border flat class="rounded-md overflow-hidden">
          <slot name="table" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  loading: Boolean,
  exporting: Boolean,
});

defineEmits(['refresh', 'export']);
</script>

<style scoped>
.sticky-top {
  position: sticky;
  top: 100px;
}
.report-container {
  min-height: calc(100vh - 150px);
}
</style>
