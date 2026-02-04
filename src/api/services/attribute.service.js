import BaseService from '../base.service';

/**
 * Attribute Service
 * خدمات السمات (اللون، المقاس، الخ)
 */
class AttributeService extends BaseService {
  constructor() {
    super('attributes');
  }

  /**
   * Toggle attribute status
   */
  async toggle(id) {
    return this.apiClient.patch(`${this.resource}/${id}/toggle`);
  }
}

export default new AttributeService();
