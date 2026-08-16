import BaseService from '../base.service';

/**
 * خدمة API لإدارة خطوط كاش هونكس
 */
class HwnixCashLineService extends BaseService {
  constructor() {
    super('v1/hwnix-cash/lines');
  }

  reconcile(id, data) {
    return this.post(`${id}/reconcile`, data);
  }

  forceDelete(id) {
    return this.delete(id);
  }
}

export default new HwnixCashLineService();
