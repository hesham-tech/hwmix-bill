import BaseService from '../base.service';

/**
 * Attribute Value Service
 * خدمات قيم السمات (أحمر، XL، الخ)
 */
class AttributeValueService extends BaseService {
  constructor() {
    super('attribute-values');
  }
}

export default new AttributeValueService();
