import BaseService from '../base.service';

/**
 * Expense Category Service
 * إدارة تصنيفات المصاريف
 */
class ExpenseCategoryService extends BaseService {
  constructor() {
    super('expense-categories');
  }
}

export default new ExpenseCategoryService();
