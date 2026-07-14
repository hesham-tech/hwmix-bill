import { provide, inject } from 'vue';

// مفتاح حقن سياق تفاصيل الكيانات لضمان فرادته وأمانه في شجرة المكونات
export const EntityProfileKey = Symbol('EntityProfileKey');

// ناقل أحداث مصغر ومرن لتسهيل التخاطب والمزامنة بين الـ Widgets المختلفة دون تكرار للبيانات
class SimpleEventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => cb(data));
  }
}

/**
 * توفير سياق تفاصيل الكيان للمكونات الأبناء
 * @param {object} options خيارات السياق (entityId, entityType, entityData, refreshFn)
 */
export function provideEntityProfile(options) {
  const bus = new SimpleEventEmitter();
  const context = {
    entityId: options.entityId,
    entityType: options.entityType,
    entityData: options.entityData, // Ref أو Computed للحفاظ على التفاعلية
    bus,
    refresh: options.refresh,
  };
  provide(EntityProfileKey, context);
  return context;
}

/**
 * استدعاء واستخدام سياق الكيان الحالي داخل أي Widget ابن
 * @returns {object} سياق الكيان الحالي والـ Event Bus المشترك
 */
export function useEntityProfile() {
  const context = inject(EntityProfileKey, null);
  if (!context) {
    console.warn('useEntityProfile must be used within an EntityProfileContainer parent component');
  }
  return context;
}
