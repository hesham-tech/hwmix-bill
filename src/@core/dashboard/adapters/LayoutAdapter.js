import { GridStackAdapterWrapper } from './GridStackAdapter';

/**
 * المحول البرمجي العام لتجريد محرك التخطيط وعزله كلياً عن مكونات لوحة التحكم
 */
export class LayoutAdapter {
  constructor(containerElement, options = {}) {
    this.wrapper = new GridStackAdapterWrapper(containerElement, options);
  }

  /**
   * تهيئة التخطيط وبناء الشبكة
   * @param {Array} widgetInstances قائمة المكونات الجاري رندرتها
   * @param {Function} onChangeCallback دالة مستدعاة عند التعديل البصري
   */
  initGrid(widgetInstances, onChangeCallback) {
    this.wrapper.build(widgetInstances, onChangeCallback);
  }

  /**
   * تفعيل وضع التصميم والتحرير البصري للمستخدم
   */
  enableDesignMode() {
    this.wrapper.setStatic(false);
    this.wrapper.enableDragAndDrop(true);
  }

  /**
   * تعطيل وضع التصميم وقفل التعديلات
   */
  disableDesignMode() {
    this.wrapper.setStatic(true);
    this.wrapper.enableDragAndDrop(false);
  }

  /**
   * تصدير التخطيط الجاري
   */
  getSerializedLayout() {
    return this.wrapper.serialize();
  }

  /**
   * إضافة عنصر DOM موجود إلى GridStack بدون إعادة بناء
   */
  makeWidgetEl(el) {
    this.wrapper.makeWidgetEl(el);
  }

  /**
   * إزالة عنصر من GridStack بدون حذف الـ DOM
   */
  removeWidgetEl(el) {
    this.wrapper.removeWidgetEl(el);
  }

  /**
   * إعادة تحميل تخطيط كامل (Reset / Package Change) بدون Destroy
   */
  loadLayout(items) {
    this.wrapper.loadLayout(items);
  }

  /**
   * تدمير وتفكيك الشبكة
   */
  destroyGrid() {
    this.wrapper.destroy();
  }
}
