import BaseService from '../base.service';

class TaskGroupService extends BaseService {
  constructor() {
    super('task-groups');
  }
}

export default new TaskGroupService();
