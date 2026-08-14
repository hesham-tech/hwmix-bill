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

  forceDelete(deviceId, slotIndex) {
    return this.delete('delete', { params: { device_id: deviceId, slot_index: slotIndex } });
  }
}

export default new HwnixCashLineService();
