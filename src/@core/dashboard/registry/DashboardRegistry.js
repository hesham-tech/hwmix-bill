/**
 * السجل المركزي لوصف لوحات التحكم المتاحة والباقات الجاهزة الموزعة بالأدوار
 */
export class DashboardRegistry {
  constructor() {
    this.dashboards = new Map();
    this.packages = new Map();
  }

  /**
   * تسجيل تخطيط لوحة تحكم
   * @param {string} id معرف اللوحة
   * @param {object} config التخطيط التأسيسي للوحة
   */
  registerDashboard(id, config) {
    this.dashboards.set(id, config);
  }

  /**
   * تسجيل باقة لوحة جاهزة
   * @param {string} packageName اسم الباقة
   * @param {object} dashboardConfig التخطيط المرتبط بالباقة
   */
  registerPackage(packageName, dashboardConfig) {
    this.packages.set(packageName, dashboardConfig);
  }

  /**
   * استرجاع اللوحة
   */
  getDashboard(id) {
    return this.dashboards.get(id) || null;
  }

  /**
   * استرجاع الباقة الافتراضية للشركة
   */
  getPackage(packageName) {
    return this.packages.get(packageName) || null;
  }

  /**
   * تحديد الباقة التلقائية بناءً على أدوار وصلاحيات المستخدم النشطة
   * @param {object} userStore متجر المستخدم الحالي
   * @returns {string} اسم الباقة الافتراضية المناسبة
   */
  resolvePackageForUser(userStore) {
    if (!userStore || !userStore.currentUser) return 'owner';
    
    const user = userStore.currentUser;
    
    // 1. الملاك والمدراء الفائقون
    if (user.is_owner || userStore.isAdmin || userStore.isCompanyAdmin || userStore.hasRole?.('owner') || userStore.hasRole?.('admin')) {
      return 'owner';
    }
    
    // 2. المحاسبون والمدققون الماليون
    if (
      userStore.hasPermission?.('manage_accounting') || 
      userStore.hasPermission?.('financial_auditor') || 
      userStore.hasRole?.('accountant') ||
      user.capabilities?.includes('manage_accounting')
    ) {
      return 'accountant';
    }

    // 3. أمناء المستودعات
    if (
      userStore.hasPermission?.('manage_inventory') || 
      userStore.hasPermission?.('warehouse_keeper') || 
      userStore.hasRole?.('warehouse') ||
      user.capabilities?.includes('manage_inventory')
    ) {
      return 'warehouse';
    }

    // 4. مندوبو المبيعات والتحصيل
    if (
      userStore.hasPermission?.('collect_installments') || 
      userStore.hasPermission?.('sales_representative') || 
      userStore.hasRole?.('sales') ||
      user.capabilities?.includes('collect_installments')
    ) {
      return 'sales';
    }

    // fallback افتراضي آمن لتجنب الشاشات الفارغة
    return 'owner';
  }

}

// تصدير نسخة مفردة (Singleton) كمرجع موحد
const dashboardRegistryInstance = new DashboardRegistry();
export default dashboardRegistryInstance;
