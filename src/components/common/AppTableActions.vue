<template>
  <v-list density="compact" min-width="180" class="rounded-md border shadow-lg context-menu-list">
    <div class="px-4 py-2 text-caption text-grey-darken-1 border-bottom d-flex align-center gap-2 bg-grey-lighten-4">
      <v-icon icon="ri-settings-4-line" size="14" />
      <span>الإجراءات</span>
    </div>

    <!-- View Action -->
    <v-list-item
      v-if="
        canView && (!permissionModule || canAny(`${permissionModule}.view_all`, `${permissionModule}.view_children`, `${permissionModule}.view_self`))
      "
      prepend-icon="ri-eye-line"
      title="عرض التفاصيل"
      @click="$emit('view', item)"
    />

    <!-- Edit Action -->
    <v-list-item
      v-if="
        canEdit &&
        (!permissionModule || canAny(`${permissionModule}.update_all`, `${permissionModule}.update_children`, `${permissionModule}.update_self`))
      "
      prepend-icon="ri-edit-line"
      title="تعديل"
      class="text-primary"
      @click="$emit('edit', item)"
    />

    <!-- Extra Actions Slot -->
    <slot name="extra-actions" :item="item" :in-menu="true" />

    <!-- Delete Action -->
    <template
      v-if="
        canDelete &&
        (!permissionModule || canAny(`${permissionModule}.delete_all`, `${permissionModule}.delete_children`, `${permissionModule}.delete_self`))
      "
    >
      <v-divider class="my-1" />
      <v-list-item prepend-icon="ri-delete-bin-line" title="حذف" class="text-error" @click="$emit('delete', item)" />
    </template>
  </v-list>
</template>

<script setup>
import { usePermissions } from '@/composables/usePermissions';

const props = defineProps({
  item: { type: Object, required: true },
  permissionModule: { type: String, default: '' },
  canView: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
});

defineEmits(['view', 'edit', 'delete']);

const { canAny } = usePermissions();
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
