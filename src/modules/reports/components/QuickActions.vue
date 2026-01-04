<template>
  <v-card>
    <v-card-title>
      <v-icon icon="ri-flashlight-line" class="me-2" />
      إجراءات سريعة
    </v-card-title>
    <v-card-text class="pa-0">
      <v-list>
        <v-list-item
          v-for="action in actions"
          :key="action.title"
          :prepend-icon="action.icon"
          :title="action.title"
          :subtitle="action.subtitle"
          @click="$emit('action-click', action.route)"
        >
          <template #append>
            <v-btn :color="action.color" variant="tonal" size="small" icon="ri-arrow-right-line" />
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  actions: {
    type: Array,
    required: true,
  },
});

defineEmits(['action-click']);
</script>
