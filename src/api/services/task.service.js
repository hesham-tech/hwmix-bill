import BaseService from '../base.service';
import apiClient from '../axios.config';

class TaskService extends BaseService {
  constructor() {
    super('tasks');
  }

  addComment(taskId, content) {
    return apiClient.post(`${this.resource}/${taskId}/comments`, { content });
  }

  uploadAttachment(taskId, formData) {
    return apiClient.post(`${this.resource}/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export default new TaskService();
