<template>
  <div v-if="branchStore.hasBranches" :class="['branch-switcher-wrapper', { 'mobile-hide': !showOnMobile }]">
    <!-- Menu for multiple branches -->
    <v-menu v-if="branchStore.branches.length > 1" location="bottom end" transition="scale-transition">
      <template #activator="{ props }">
        <v-tooltip location="bottom" text="تبديل الفرع النشط">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="{ ...props, ...tooltipProps }"
              variant="text"
              color="primary"
              class="rounded-lg px-2 branch-btn"
              height="32"
              :loading="isSwitching"
            >
              <v-icon start icon="ri-git-branch-line" size="16" class="me-1" />
              <span class="branch-name text-caption font-weight-bold">
                {{ branchStore.activeBranch?.name || 'اختر الفرع' }}
              </span>
              <v-icon end icon="ri-arrow-down-s-line" size="12" class="ms-1" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <v-list density="compact" min-width="180" class="pa-1">
        <div class="text-xxs text-grey px-2 mb-1">الفروع المتاحة</div>
        <v-list-item
          v-for="branch in branchStore.branches"
          :key="branch.id"
          :value="branch.id"
          :active="branchStore.activeBranchId === branch.id"
          active-color="primary"
          rounded="md"
          class="mb-1 compact-list-item"
          @click="handleBranchSwitch(branch.id)"
        >
          <template #prepend>
            <v-icon 
              :icon="branchStore.activeBranchId === branch.id ? 'ri-checkbox-circle-fill' : 'ri-building-line'" 
              size="16"
              :color="branchStore.activeBranchId === branch.id ? 'primary' : 'grey'"
            />
          </template>
          
          <v-list-item-title class="text-caption font-weight-medium">
            {{ branch.name }}
          </v-list-item-title>
          
          <template #append v-if="branch.is_default">
            <v-chip size="x-small" color="info" variant="flat" class="text-xxs">الافتراضي</v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Static display for single branch -->
    <v-chip
      v-else
      variant="text"
      color="primary"
      class="rounded-lg px-2 branch-static-chip"
      label
      size="small"
      height="32"
    >
      <v-icon start icon="ri-git-branch-line" size="16" class="me-1" />
      <span class="text-caption font-weight-bold">
        {{ branchStore.activeBranch?.name }}
      </span>
    </v-chip>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBranchStore } from '@/stores/branch';
import { toast } from 'vue3-toastify';

const props = defineProps({
  showOnMobile: {
    type: Boolean,
    default: false
  }
});

const branchStore = useBranchStore();
const isSwitching = ref(false);

const handleBranchSwitch = async (branchId) => {
  if (branchStore.activeBranchId === branchId) return;

  try {
    isSwitching.value = true;
    
    // التغيير محلياً أولاً
    branchStore.setActiveBranch(branchId);
    
    toast.success(`تم التبديل إلى فرع: ${branchStore.activeBranch?.name}`);
    
    // إعادة تحميل الصفحة لضمان إعادة تهيئة جميع المتاجر والبيانات بناءً على الفرع الجديد
    // هذا هو الحل الأكثر أماناً لعزل البيانات بالكامل
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
  } catch (error) {
    toast.error('فشل في تبديل الفرع');
    console.error(error);
  } finally {
    isSwitching.value = false;
  }
};
</script>

<style scoped>
.branch-switcher-wrapper {
  display: flex;
  align-items: center;
}

.branch-btn {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-size: 0.75rem !important;
  transition: all 0.2s ease;
}

.branch-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  line-height: 1.2;
}

.compact-list-item {
  min-height: 32px !important;
  padding: 4px 8px !important;
}

:deep(.v-list-item__prepend) {
  width: 24px !important;
}

.text-xxs {
  font-size: 0.65rem !important;
  line-height: 1;
}

.text-xs {
  font-size: 0.7rem !important;
}

.branch-static-chip {
  height: 32px !important;
  font-size: 0.75rem !important;
}

/* Ensure it works well inside user menu too */
:deep(.branch-switcher-wrapper.mobile-hide) {
  display: none !important;
}

@media (min-width: 600px) {
  :deep(.branch-switcher-wrapper.mobile-hide) {
    display: flex !important;
  }
}
</style>
