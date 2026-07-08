/**
 * مدير الإشعارات المركزي لإدارة وتوجيه كافة تنبيهات النظام المالية والعملياتية والتحقق، وتوفير طوابير المعالجة وتصفية المكرر.
 */

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

class NotificationManager {
  constructor() {
    this.queue = [];
    this.history = [];
    this.activeNotifications = new Map(); // key -> timestamp
    this.maxHistorySize = 100;
    this.debounceTime = 2000; // منع تكرار الرسائل المتطابقة خلال ثانيتين
  }

  /**
   * إرسال إشعار مهيكل عبر طبقة الفيساد
   */
  notify(options = {}) {
    const id = options.id || crypto.randomUUID();
    const timestamp = Date.now();
    const message = options.message || '';
    
    const notification = {
      id,
      type: options.type || 'info',
      code: options.code || 'GENERIC_INFO',
      message,
      severity: options.severity || 'low',
      domain: options.domain || 'system',
      source: options.source || 'local',
      timestamp,
      duration: options.duration !== undefined ? options.duration : 3000,
      deduplicate: options.deduplicate !== undefined ? options.deduplicate : true,
      parameters: options.parameters || {},
      status: 'active'
    };

    // حظر التنبيهات المكررة برمجياً لجميع الأنواع
    if (notification.deduplicate && message) {
      const dupKey = `${notification.code}_${message}`;
      const lastSeen = this.activeNotifications.get(dupKey);
      if (lastSeen && (timestamp - lastSeen < this.debounceTime)) {
        return null;
      }
      this.activeNotifications.set(dupKey, timestamp);
      
      setTimeout(() => {
        if (this.activeNotifications.get(dupKey) === timestamp) {
          this.activeNotifications.delete(dupKey);
        }
      }, this.debounceTime);
    }

    // الاحتفاظ بآخر 100 إشعار في سجل الذاكرة
    this.history.unshift({ ...notification });
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }

    // إعدادات العرض الخاصة بـ Toastify Adapter
    const toastOptions = {
      toastId: id,
      autoClose: notification.duration,
      type: notification.type,
      position: 'top-right',
      theme: 'colored',
    };

    // الأخطاء الحرجة، العالية، أو الإشعارات المالية لا تغلق تلقائياً
    if (
      notification.severity === 'critical' || 
      notification.severity === 'high' || 
      notification.domain === 'financial'
    ) {
      toastOptions.autoClose = false;
      toastOptions.closeButton = true;
      toastOptions.closeOnClick = false;
      toastOptions.dragToClose = false;
    }

    if (message) {
      toast(message, toastOptions);
    }

    return id;
  }

  success(message, options = {}) {
    return this.notify({
      ...options,
      type: 'success',
      message,
      code: options.code || 'SUCCESS',
      severity: options.severity || 'low'
    });
  }

  error(message, options = {}) {
    return this.notify({
      ...options,
      type: 'error',
      message,
      code: options.code || 'ERROR',
      severity: options.severity || 'medium'
    });
  }

  warning(message, options = {}) {
    return this.notify({
      ...options,
      type: 'warning',
      message,
      code: options.code || 'WARNING',
      severity: options.severity || 'medium'
    });
  }

  info(message, options = {}) {
    return this.notify({
      ...options,
      type: 'info',
      message,
      code: options.code || 'INFO',
      severity: options.severity || 'low'
    });
  }

  loading(message, options = {}) {
    const id = options.id || crypto.randomUUID();
    return this.notify({
      ...options,
      id,
      type: 'default',
      message,
      code: options.code || 'LOADING',
      severity: options.severity || 'low',
      duration: false,
      deduplicate: false
    });
  }

  async promise(promise, config = {}, options = {}) {
    const toastId = options.id || crypto.randomUUID();
    this.loading(config.loading || 'جاري المعالجة...', { id: toastId, ...options });

    try {
      const result = await promise;
      toast.update(toastId, {
        render: config.success || 'تمت العملية بنجاح',
        type: 'success',
        autoClose: 3000,
      });
      this.updateHistoryStatus(toastId, 'success', config.success || 'تمت العملية بنجاح');
      return result;
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || config.error || 'فشلت العملية';
      toast.update(toastId, {
        render: errMsg,
        type: 'error',
        autoClose: 5000,
      });
      this.updateHistoryStatus(toastId, 'error', errMsg);
      throw err;
    }
  }

  updateHistoryStatus(id, type, message) {
    const found = this.history.find(item => item.id === id);
    if (found) {
      found.type = type;
      found.message = message;
      found.status = 'dismissed';
    }
  }

  dismiss(id) {
    toast.dismiss(id);
    const found = this.history.find(item => item.id === id);
    if (found) {
      found.status = 'dismissed';
    }
  }

  clear() {
    toast.clearAll();
    this.history.forEach(item => {
      item.status = 'dismissed';
    });
  }

  getHistory() {
    return this.history;
  }
}

const notificationManager = new NotificationManager();
export default notificationManager;
export { notificationManager };
