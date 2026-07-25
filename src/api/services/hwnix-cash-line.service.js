import BaseService from '../base.service';

/**
 * خدمة API لإدارة خطوط كاش هونكس
 */
class HwnixCashLineService extends BaseService {
  constructor() {
    super('v1/hwnix-cash/lines');
  }
}

export default new HwnixCashLineService();
