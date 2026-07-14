import registry from './registry';
import { can } from '@utils/helpers/permissions';

// محلل ديناميكي لتحديد وتصفية الـ widgets المسموح بعرضها بناءً على صلاحيات وعلاقات وقدرات الكيان
class WidgetResolver {
  /**
   * تصفية قائمة الـ widgets لكيان محدد بناءً على السياق الحالي
   * @param {string} entityType نوع الكيان (user, product, etc.)
   * @param {object} entityData بيانات الكيان الحالية (مع العلاقات والقدرات)
   * @returns {array} قائمة الـ widgets بعد الفلترة والترتيب
   */
  resolve(entityType, entityData) {
    if (!entityData) return [];

    const allWidgets = registry.getWidgets(entityType);

    // 1. تصفية بناءً على الشروط الأمنية والتشغيلية (Guards)
    const filteredWidgets = allWidgets.filter(widget => {
      // التحقق من العلاقات (Relation Types)
      if (widget.relations && widget.relations.length > 0) {
        const entityRelations = entityData.relation_types || [];
        const hasRelation = widget.relations.some(rel => entityRelations.includes(rel));
        if (!hasRelation) return false;
      }

      // التحقق من القدرات (Capabilities)
      if (widget.capabilities && widget.capabilities.length > 0) {
        const entityCapabilities = entityData.capabilities || [];
        const hasCapability = widget.capabilities.some(cap => entityCapabilities.includes(cap));
        if (!hasCapability) return false;
      }

      // التحقق من الصلاحيات (Permissions)
      if (widget.permissions && widget.permissions.length > 0) {
        const hasPermission = widget.permissions.some(perm => can(perm));
        if (!hasPermission) return false;
      }

      // التحقق الديناميكي المخصص (Custom Guard Callback)
      if (typeof widget.shouldRender === 'function') {
        if (!widget.shouldRender(entityData)) {
          return false;
        }
      }

      return true;
    });

    // 2. ترتيب المكونات بناءً على الـ Order والـ Priority
    return filteredWidgets.sort((a, b) => {
      const orderA = a.order ?? 99;
      const orderB = b.order ?? 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityB - priorityA; // الأولوية الأعلى أولاً
    });
  }
}

const resolver = new WidgetResolver();
export default resolver;
