<template>
  <slot v-if="hasPermission" />
  <slot v-else name="fallback">
    <div v-if="showMessage" class="permission-denied">
      <v-alert type="warning" variant="tonal" density="compact">
        <v-icon icon="ri-lock-line" class="me-2" />
        {{ message || 'ليس لديك صلاحية لعرض هذا المحتوى' }}
      </v-alert>
    </div>
  </slot>
</template>

<script setup>
import { computed } from 'vue';
import { usePermissions } from '@/composables';

const props = defineProps({
  permission: {
    type: [String, Array],
    required: true,
  },
  showMessage: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  requireAll: {
    type: Boolean,
    default: false,
  },
});

const { hasPermission: checkPermission } = usePermissions();

const hasPermission = computed(() => {
  if (Array.isArray(props.permission)) {
    if (props.requireAll) {
      // User must have ALL permissions
      return props.permission.every(p => checkPermission(p));
    } else {
      // User must have AT LEAST ONE permission
      return props.permission.some(p => checkPermission(p));
    }
  }

  return checkPermission(props.permission);
});
</script>

<style scoped>
.permission-denied {
  padding: 8px 0;
}
</style>
