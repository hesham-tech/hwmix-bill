import BaseService from '../base.service';

/**
 * Company Service
 */
class CompanyService extends BaseService {
  constructor() {
    super('companies');
  }

  getTrash(params) {
    return this.get('trash', params);
  }

  restoreTrash(itemIds) {
    return this.post('restore', { item_ids: itemIds }, { showToast: true });
  }

  forceDeleteTrash(itemIds) {
    return this.post('force-delete', { item_ids: itemIds }, { showToast: true });
  }
}

export default new CompanyService();
