import { ref } from "vue";
import apiClient from "@/api/axios.config";

export function usePartnerOperations() {
  const loading = ref(false);
  const operations = ref([]);
  const operationTypes = ref([]);
  const totalItems = ref(0);
  const statement = ref(null);

  const loadTypes = async () => {
    try {
      loading.value = true;
      const response = await apiClient.get("/partner-operations/types");
      if (response.data?.success) {
        operationTypes.value = response.data.data;
      }
    } catch (error) {
      console.error("Error loading partner operation types:", error);
    } finally {
      loading.value = false;
    }
  };

  const loadOperations = async (params = {}) => {
    try {
      loading.value = true;
      const response = await apiClient.get("/partner-operations", { params });
      if (response.data?.success) {
        operations.value = response.data.data;
        totalItems.value = response.data.meta?.total || response.data.data.length;
      }
    } catch (error) {
      console.error("Error loading partner operations:", error);
    } finally {
      loading.value = false;
    }
  };

  const createOperation = async (payload) => {
    try {
      loading.value = true;
      const response = await apiClient.post("/partner-operations", payload);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  const reverseOperation = async (id) => {
    try {
      loading.value = true;
      const response = await apiClient.delete("/partner-operations/" + id);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  const loadStatement = async (partnerId, params = {}) => {
    try {
      loading.value = true;
      const response = await apiClient.get("/partner-operations/partner/" + partnerId + "/statement", { params });
      if (response.data?.success) {
        statement.value = response.data.data;
      }
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    operations,
    operationTypes,
    totalItems,
    statement,
    loadTypes,
    loadOperations,
    createOperation,
    reverseOperation,
    loadStatement
  };
}

