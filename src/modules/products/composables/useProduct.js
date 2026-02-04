import { computed } from 'vue';
import { useProductStore } from '../store/product.store';
import { useDialog, useConfirm } from '@/composables';

export function useProduct() {
  const store = useProductStore();
  const { isOpen, formData, isEditMode, open, close } = useDialog();
  const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

  // Computed
  const products = computed(() => store.products);
  const loading = computed(() => store.loading);
  const totalItems = computed(() => store.totalItems);

  // Actions
  const loadProducts = async () => {
    await store.fetchProducts();
  };

  const saveProduct = async data => {
    if (isEditMode.value) {
      return await store.updateProduct(formData.value.id, data);
    } else {
      return await store.createProduct(data);
    }
  };

  const handleDelete = product => {
    confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`, async () => {
      await store.deleteProduct(product.id);
    });
  };

  const handleEdit = product => {
    open(product);
  };

  const handleCreate = () => {
    open({});
  };

  return {
    products,
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
      await loadProducts();
    },
    handleCancel,
    loadProducts,
    saveProduct,
    handleDelete,
    handleEdit,
    handleCreate,
  };
}
