import BaseService from '../base.service';

class DigitalServicesService extends BaseService {
  constructor() {
    super('v1/digital-services');
  }

  getProviders() {
    return this.get('providers');
  }

  getServiceProviders(params = {}) {
    return this.get('service-providers', params);
  }

  getServiceDefinitions(params = {}) {
    return this.get('service-definitions', params);
  }

  createProvider(data) {
    return this.post('providers', data);
  }

  createTransaction(data) {
    return this.post('transactions', data);
  }

  reverseTransaction(id, data) {
    return this.post(`transactions/${id}/reverse`, data);
  }
}

export default new DigitalServicesService();
