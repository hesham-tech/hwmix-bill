import BaseService from '../base.service';

/**
 * Brand Service
 * خدمات الماركات
 */
class BrandService extends BaseService {
  constructor() {
    super('brands');
  }
}

export default new BrandService();
