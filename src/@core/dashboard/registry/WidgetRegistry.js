/**
 * السجل المركزي لتسجيل وإدارة المكونات التشغيلية والمالية والتحقق من سلامة بياناتها الوصفية
 */
export class WidgetRegistry {
  constructor() {
    this.widgets = new Map();
  }

  /**
   * تسجيل مكون جديد في السجل
   * @param {string} widgetId معرف المكون الفريد
   * @param {object} componentRef مرجع مكون Vue
   * @param {object} metadata البيانات الوصفية والخصائص
   */
  register(widgetId, componentRef, metadata) {
    if (this.widgets.has(widgetId)) {
      console.warn(`تنبيه: المكون ${widgetId} مسجل بالفعل. سيتم استبداله.`);
    }

    this.validateMetadata(widgetId, metadata);

    this.widgets.set(widgetId, {
      component: componentRef,
      metadata: metadata
    });
  }

  /**
   * استرجاع مكون مRegistered
   * @param {string} widgetId معرف المكون
   * @returns {object|null} المكون المرجعي والـ Metadata
   */
  get(widgetId) {
    return this.widgets.get(widgetId) || null;
  }

  /**
   * جلب جميع المكونات المسجلة
   */
  getAll() {
    return Array.from(this.widgets.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
  }

  /**
   * جلب المكونات المسموحة بناءً على الصلاحيات والباقة
   */
  getAvailableWidgets(permissions, packageName) {
    return this.getAll().filter(w => {
      // 1. التحقق من الصلاحيات
      const hasPerm = w.metadata.permissions.every(p => permissions.includes(p));
      if (!hasPerm) return false;

      // 2. التحقق من توافق الباقة
      if (packageName && w.metadata.supportedPackages) {
        return w.metadata.supportedPackages.includes(packageName);
      }

      return true;
    });
  }

  /**
   * التحقق من مطابقة البيانات الوصفية للشروط المعمارية
   */
  validateMetadata(widgetId, metadata) {
    const requiredFields = ['id', 'version', 'category', 'permissions', 'defaultSize', 'minimumSize'];
    requiredFields.forEach(field => {
      if (!metadata[field]) {
        throw new Error(`خطأ معمارية: البيانات الوصفية للمكون ${widgetId} تفتقد للحقل الإلزامي ${field}`);
      }
    });

    const validCategories = [
      'financial', 'operational', 'workflow', 'monitoring', 
      'communication', 'administration', 'security', 'ai', 
      'productivity', 'personal'
    ];
    if (!validCategories.includes(metadata.category)) {
      throw new Error(`خطأ معمارية: تصنيف المكون ${widgetId} غير صالح: ${metadata.category}`);
    }
  }
}

// تصدير نسخة مفردة (Singleton) لتكون مرجعاً موحداً في كامل التطبيق
const widgetRegistryInstance = new WidgetRegistry();
export default widgetRegistryInstance;
