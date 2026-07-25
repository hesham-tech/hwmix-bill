import BaseService from '../base.service';

/**
 * خدمة API لإدارة أجهزة كاش هونكس
 */
class HwnixCashDeviceService extends BaseService {
  constructor() {
    super('v1/hwnix-cash/devices');
  }
}

export default new HwnixCashDeviceService();
