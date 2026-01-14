import BaseService from '../base.service';

/**
 * Company Service
 */
class CompanyService extends BaseService {
  constructor() {
    super('companies');
  }
}

export default new CompanyService();
