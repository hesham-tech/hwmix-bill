import apiClient from '../axios.config';

const transactionService = {
  getAll(params = {}) {
    return apiClient.get('/transactions', { params });
  },

  getById(id) {
    return apiClient.get(`/transactions/${id}`);
  },

  deposit(data) {
    return apiClient.post('/transactions/deposit', data);
  },

  withdraw(data) {
    return apiClient.post('/transactions/withdraw', data);
  },

  transfer(data) {
    return apiClient.post('/transactions/transfer', data);
  },

  reverse(id, data = {}) {
    return apiClient.post(`/transactions/${id}/reverse`, data);
  },
};

export default transactionService;
