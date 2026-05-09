import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useBranchStore = defineStore('branch', () => {
  // State
  const activeBranchId = ref(localStorage.getItem('active_branch_id') ? parseInt(localStorage.getItem('active_branch_id')) : null);
  const branches = ref(JSON.parse(localStorage.getItem('available_branches') || '[]'));

  // Getters
  const activeBranch = computed(() => {
    if (!activeBranchId.value || !branches.value.length) return null;
    return branches.value.find(b => b.id === activeBranchId.value) || branches.value[0];
  });

  const hasBranches = computed(() => branches.value.length > 0);

  // Actions
  function setBranches(newBranches) {
    branches.value = newBranches || [];
    localStorage.setItem('available_branches', JSON.stringify(branches.value));
    
    // Set default branch if none selected
    if (!activeBranchId.value && branches.value.length > 0) {
      const defaultBranch = branches.value.find(b => b.is_default) || branches.value[0];
      setActiveBranch(defaultBranch.id);
    }
  }

  function setActiveBranch(branchId) {
    activeBranchId.value = branchId;
    localStorage.setItem('active_branch_id', branchId);
  }

  function clearBranches() {
    branches.value = [];
    activeBranchId.value = null;
    localStorage.removeItem('available_branches');
    localStorage.removeItem('active_branch_id');
  }

  return {
    activeBranchId,
    activeBranch,
    branches,
    hasBranches,
    setBranches,
    setActiveBranch,
    clearBranches,
  };
});
