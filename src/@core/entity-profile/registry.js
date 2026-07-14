// نظام تسجيل المكونات البرمجية ديناميكياً للكيانات المختلفة في النظام لتسهيل عملية التوسع وإعادة الاستخدام
class WidgetRegistry {
  constructor() {
    this.widgets = new Map();
    this.initialized = false;
  }

  /**
   * تسجيل مكون برمجي لكيان محدد يدوياً أو برمجياً
   * @param {string} entityType نوع الكيان (user, customer, etc.)
   * @param {object} widgetConfig إعدادات المكون الفوقية
   */
  register(entityType, widgetConfig) {
    if (!this.widgets.has(entityType)) {
      this.widgets.set(entityType, []);
    }
    
    const existing = this.widgets.get(entityType);
    if (existing.some(w => w.id === widgetConfig.id)) {
      return;
    }

    existing.push(widgetConfig);
  }

  /**
   * الحصول على قائمة المكونات المسجلة لكيان محدد
   * @param {string} entityType نوع الكيان
   * @returns {array} قائمة المكونات
   */
  getWidgets(entityType) {
    return this.widgets.get(entityType) || [];
  }

  /**
   * مسح تلقائي وتسجيل المكونات من جميع الموديلات في النظام (Vite Glob Scan)
   */
  discoverWidgets() {
    if (this.initialized) return;
    this.initialized = true;

    const modulesWidgets = import.meta.glob('../../modules/*/widgets.js', { eager: true });
    
    Object.keys(modulesWidgets).forEach(path => {
      const moduleConfig = modulesWidgets[path].default;
      if (Array.isArray(moduleConfig)) {
        moduleConfig.forEach(widget => {
          const targetEntities = widget.supportedEntities || [];
          targetEntities.forEach(entityType => {
            this.register(entityType, widget);
          });
        });
      }
    });
  }
}

const registry = new WidgetRegistry();
export default registry;
