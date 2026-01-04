import { computed } from 'vue';
import { useUserStore } from '../store/user.store';
import { useDialog, useConfirm } from '@/composables';

export function useUser() {
  const store = useUserStore();
  const { isOpen, formData, isEditMode, open, close } = useDialog();
  const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

  // Computed
  const users = computed(() => store.users);
  const loading = computed(() => store.loading);
  const totalItems = computed(() => store.totalItems);

  // Actions
  const loadUsers = async () => {
    await store.fetchUsers();
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
    confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`, async () => {
      await store.deleteUser(user.id);
    });
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
    loadUsers,
    loadUser,
    saveUser,
    handleDelete,
    handleEdit,
    handleCreate,
    assignRole,
    updatePermissions,
  };
}
