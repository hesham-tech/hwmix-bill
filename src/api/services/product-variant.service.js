import BaseService from '../base.service';

/**
 * كلاس خدمة متغيرات المنتجات - للتعامل مع العمليات البرمجية لمتغيرات المنتجات (CRUD)
 */
class ProductVariantService extends BaseService {
  constructor() {
    super('product-variants');
  }

  /**
   * Delete multiple variants
   */
  async deleteMultiple(ids, options = {}) {
    return this.post('delete', { ids }, options);
  }
}

export default new ProductVariantService();
