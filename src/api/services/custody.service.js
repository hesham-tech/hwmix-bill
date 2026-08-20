import apiClient from '../axios.config';

class CustodyService {
  async getAll(params) {
    try {
      const response = await apiClient.get('/v1/custodies', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await apiClient.get(`/v1/custodies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async issue(data) {
    try {
      const response = await apiClient.post('/v1/custodies', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async refund(id, data) {
    try {
      const response = await apiClient.post(`/v1/custodies/${id}/refund`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async reverse(id) {
    try {
      const response = await apiClient.post(`/v1/custodies/${id}/reverse`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new CustodyService();
