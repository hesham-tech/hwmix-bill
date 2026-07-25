import BaseService from '../base.service';

/**
 * خدمة API لإدارة معاملات محافظ كاش هونكس
 */
class HwnixCashWalletTransactionService extends BaseService {
  constructor() {
    super('v1/hwnix-cash/wallet-transactions');
  }
}

export default new HwnixCashWalletTransactionService();
