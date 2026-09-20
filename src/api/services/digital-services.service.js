import BaseService from '../base.service';

class DigitalServicesService extends BaseService {
  constructor() {
    super('v1/digital-services');
  }

  getProviders() {
    return this.http.get('/providers');
  }

  createProvider(data) {
    return this.http.post('/providers', data);
  }

  createTransaction(data) {
    return this.http.post('/transactions', data);
  }

  reverseTransaction(id, data) {
    return this.http.post(`/transactions/${id}/reverse`, data);
  }
}

export default new DigitalServicesService();
