<template>
  <v-menu v-if="branchStore.hasBranches" location="bottom end" transition="scale-transition">
    <template #activator="{ props }">
      <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...props, ...tooltipProps }"
            variant="tonal"
            color="primary"
            class="rounded-lg me-2 px-3"
            height="38"
            :loading="isSwitching"
          >
            <v-icon start icon="ri-git-branch-line" size="18" />
            <span class="d-none d-md-inline text-caption font-weight-bold">
              {{ branchStore.activeBranch?.name || 'اختر الفرع' }}
            </span>
            <v-icon end icon="ri-arrow-down-s-line" size="14" />
          </v-btn>
        </template>
        تبديل الفرع النشط
      </v-tooltip>
    </template>

    <v-list density="compact" min-width="200" class="pa-2">
      <div class="text-caption text-grey px-2 mb-2">الفروع المتاحة</div>
      
      <v-list-item
        v-for="branch in branchStore.branches"
        :key="branch.id"
        :value="branch.id"
        :active="branchStore.activeBranchId === branch.id"
        active-color="primary"
        rounded="lg"
        class="mb-1"
        @click="handleBranchSwitch(branch.id)"
      >
        <template #prepend>
          <v-icon 
            :icon="branchStore.activeBranchId === branch.id ? 'ri-checkbox-circle-fill' : 'ri-building-line'" 
            size="20"
            :color="branchStore.activeBranchId === branch.id ? 'primary' : 'grey'"
          />
        </template>
        
        <v-list-item-title class="text-body-2 font-weight-medium">
          {{ branch.name }}
        </v-list-item-title>
        
        <template #append v-if="branch.is_default">
          <v-chip size="x-small" color="info" variant="flat" class="text-xxs">الافتراضي</v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { ref } from 'vue';
import { useBranchStore } from '@/stores/branch';
import { toast } from 'vue3-toastify';

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
.text-xxs {
  font-size: 0.65rem !important;
}
</style>
