import apiClient from '@/api/axios.config';

/**
 * خدمة الاتصال بـ API منصة الذكاء الاصطناعي في الفرونت إند
 */
export function fetchAiStats(params = {}) {
  return apiClient.get('/ai/admin/stats', { params });
}

export function fetchAiProviders(params = {}) {
  return apiClient.get('/ai/admin/providers', { params });
}

export function fetchAiAgents(params = {}) {
  return apiClient.get('/ai/admin/agents', { params });
}

export function fetchAiPrompts(params = {}) {
  return apiClient.get('/ai/admin/prompts', { params });
}

export function fetchAiUsageReport(params = {}) {
  return apiClient.get('/ai/admin/usage-report', { params });
}

export function fetchAiModels(params = {}) {
  return apiClient.get('/ai/admin/models', { params });
}

export function updateAiModel(id, data) {
  return apiClient.put(`/ai/admin/models/${id}`, data);
}

export function deleteAiModel(id) {
  return apiClient.delete(`/ai/admin/models/${id}`);
}

export function toggleAiModelActive(id) {
  return apiClient.patch(`/ai/admin/models/${id}/toggle`);
}

export function createAiModel(data) {
  return apiClient.post('/ai/admin/models', data);
}

export function createAiAccount(data) {
  return apiClient.post('/ai/admin/accounts', data);
}

export function fetchAiAccounts(params = {}) {
  return apiClient.get('/ai/admin/accounts', { params });
}

export function updateAiAccount(id, data) {
  return apiClient.put(`/ai/admin/accounts/${id}`, data);
}

export function deleteAiAccount(id) {
  return apiClient.delete(`/ai/admin/accounts/${id}`);
}

export function toggleAiAccountActive(id) {
  return apiClient.patch(`/ai/admin/accounts/${id}/toggle`);
}

// Agents CRUD
export function createAiAgent(data) {
  return apiClient.post('/ai/admin/agents', data);
}

export function updateAiAgent(id, data) {
  return apiClient.put(`/ai/admin/agents/${id}`, data);
}

export function deleteAiAgent(id) {
  return apiClient.delete(`/ai/admin/agents/${id}`);
}

export function toggleAiAgentActive(id) {
  return apiClient.patch(`/ai/admin/agents/${id}/toggle`);
}

// Prompts CRUD
export function createAiPrompt(data) {
  return apiClient.post('/ai/admin/prompts', data);
}

export function updateAiPrompt(id, data) {
  return apiClient.put(`/ai/admin/prompts/${id}`, data);
}

export function deleteAiPrompt(id) {
  return apiClient.delete(`/ai/admin/prompts/${id}`);
}

export function toggleAiPromptActive(id) {
  return apiClient.patch(`/ai/admin/prompts/${id}/toggle`);
}
