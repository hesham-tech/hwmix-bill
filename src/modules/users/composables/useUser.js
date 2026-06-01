import { ref, computed } from 'vue';
import { useUserStore } from '../store/user.store';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { useDialog, useConfirm } from '@/composables';

export function useUser() {
  const store = useUserStore();
  const globalStore = useGlobalUserStore();

  const { isOpen, formData, isEditMode, open, close } = useDialog();
  const { isOpen: isPermissionOpen, formData: permissionUser, open: openPermissions, close: closePermissions } = useDialog();
  const { isOpen: isDeleteDialogOpen, formData: userToDelete, open: openDeleteDialog, close: closeDeleteDialog } = useDialog();
  const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

  const deleteLoading = ref(false);
  const deleteType = ref('company');

  // Computed
  const users = computed(() => store.users);
  const loading = computed(() => store.loading);
  const totalItems = computed(() => store.totalItems);

  // Actions
  const loadUsers = async (append = false) => {
    await store.fetchUsers({ append });
  };

  const loadMore = async () => {
    if (loading.value || !users.value || users.value.length >= (totalItems.value || 0)) return;
    store.page++;
    await loadUsers(true);
  };

  const loadUser = async id => {
    return await store.fetchUser(id);
  };

  const saveUser = async data => {
    if (isEditMode.value) {
      return await store.updateUser(formData.value.id, data);
    } else {
      return await store.createUser(data);
    }
  };

  const handleDelete = user => {
    if (globalStore.isAdmin) {
      deleteType.value = 'company';
      openDeleteDialog(user);
    } else {
      const name = user.nickname || user.full_name || user.name || 'هذا المستخدم';
      confirm(`هل أنت متأكد من فصل المستخدم "${name}" من هذه الشركة؟`, async () => {
        await store.deleteUser(user.id, 'company');
      });
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete.value?.id) return;
    deleteLoading.value = true;
    try {
      await store.deleteUser(userToDelete.value.id, deleteType.value);
      closeDeleteDialog();
    } catch (e) {
      console.error('Delete user failed:', e);
    } finally {
      deleteLoading.value = false;
    }
  };

  const handleEdit = user => {
    open(user);
  };

  const handleCreate = () => {
    open({});
  };

  const assignRole = async (userId, roleId) => {
    await store.assignRole(userId, roleId);
  };

  const updatePermissions = async (userId, permissions) => {
    await store.updatePermissions(userId, permissions);
  };

  return {
    users,
    loading,
    totalItems,
    formData,
    isEditMode,
    isOpen,
    open,
    close,
    showConfirm,
    confirmMessage,
    handleConfirm: async () => {
      await handleConfirm();
      await loadUsers();
    },
    handleCancel,
    isPermissionOpen,
    permissionUser,
    openPermissions,
    closePermissions,
    isDeleteDialogOpen,
    userToDelete,
    deleteType,
    deleteLoading,
    confirmDelete,
    closeDeleteDialog,
    loadUsers,
    loadMore,
    loadUser,
    saveUser,
    handleDelete,
    handleEdit,
    handleCreate,
    assignRole,
    updatePermissions,
  };
}
