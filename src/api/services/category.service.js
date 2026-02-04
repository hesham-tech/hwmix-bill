import BaseService from '../base.service';

/**
 * Category Service
 * خدمات التصنيفات
 */
class CategoryService extends BaseService {
  constructor() {
    super('categories');
  }
}

export default new CategoryService();
