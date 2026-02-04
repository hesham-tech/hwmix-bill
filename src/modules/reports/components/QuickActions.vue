<template>
  <AppCard title="إجراءات سريعة" icon="ri-flashlight-line" class="h-100">
    <template #actions>
      <v-chip size="x-small" color="primary" variant="flat" class="font-weight-black">أكثر استخداماً</v-chip>
    </template>

    <v-list class="pa-0">
      <v-list-item
        v-for="action in actions"
        :key="action.title"
        class="border-b last-child-no-border py-3 px-4 clickable-action"
        @click="$emit('action-click', action.route)"
      >
        <template #prepend>
          <v-avatar :color="`${action.color}-lighten-5`" size="40" class="me-3">
            <v-icon :icon="action.icon" :color="action.color" />
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-bold text-body-1">{{ action.title }}</v-list-item-title>
        <v-list-item-subtitle class="text-caption">{{ action.subtitle }}</v-list-item-subtitle>

        <template #append>
          <v-icon icon="ri-arrow-left-s-line" color="grey-lighten-1" size="small" />
        </template>
      </v-list-item>
    </v-list>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/common/AppCard.vue';

defineProps({
  actions: {
    type: Array,
    required: true,
  },
});

defineEmits(['action-click']);
</script>
