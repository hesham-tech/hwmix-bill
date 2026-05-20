import BaseService from '../base.service';

/**
 * كلاس خدمة متغيرات المنتجات - للتعامل مع العمليات البرمجية لمتغيرات المنتجات (CRUD)
 */
class ProductVariantService extends BaseService {
  constructor() {
    super('product-variants');
  }
}

export default new ProductVariantService();
