import widgetRegistry from './WidgetRegistry';
import dashboardRegistry from './DashboardRegistry';
import { defineAsyncComponent } from 'vue';

// 1. تسجيل الـ Widgets بالتحميل الكسول
const KpiCardWidget = defineAsyncComponent(() => import('@/modules/reports/components/KpiCardWidget.vue'));
const ProductIntelligenceTable = defineAsyncComponent(() => import('@/modules/reports/components/ProductIntelligenceTable.vue'));
const QuickActions = defineAsyncComponent(() => import('@/modules/reports/components/QuickActions.vue'));
const RecentInvoices = defineAsyncComponent(() => import('@/modules/reports/components/RecentInvoices.vue'));
const UpcomingPayments = defineAsyncComponent(() => import('@/modules/reports/components/UpcomingPayments.vue'));
const UpcomingInstallments = defineAsyncComponent(() => import('@/modules/reports/components/UpcomingInstallments.vue'));
const SalesTrendChart = defineAsyncComponent(() => import('@/modules/reports/components/SalesTrendChart.vue'));
const TopProductsChart = defineAsyncComponent(() => import('@/modules/reports/components/TopProductsChart.vue'));
const DashboardTasksWidget = defineAsyncComponent(() => import('@/modules/tasks/components/DashboardTasksWidget.vue'));
const ProfitSummaryWidget = defineAsyncComponent(() => import('@/modules/reports/components/ProfitSummaryWidget.vue'));
const ReportsQuickLinks = defineAsyncComponent(() => import('@/modules/reports/components/ReportsQuickLinks.vue'));

/**
 * دالة لتسجيل وتأسيس المكونات والباقات الافتراضية لـ Dashboard Engine (البنية المسطحة)
 */
export function installDashboardEngine() {
  
  // ==================== [1] تسجيل الكروت الفردية كـ Widgets مستقلة ====================

  const kpis = [
    { id: 'kpi_total_sales', indicator: 'totalSales', title: 'إجمالي المبيعات' },
    { id: 'kpi_monthly_sales', indicator: 'monthlySales', title: 'مبيعات الشهر' },
    { id: 'kpi_pending_payments', indicator: 'pendingPayments', title: 'التحصيلات المعلقة' },
    { id: 'kpi_unpaid_installments', indicator: 'unpaidInstallments', title: 'الأقساط المستحقة' },
    { id: 'kpi_total_customers', indicator: 'totalCustomers', title: 'إجمالي العملاء' },
    { id: 'kpi_today_revenue', indicator: 'todayRevenue', title: 'إيرادات اليوم' },
    { id: 'kpi_today_profit', indicator: 'todayProfit', title: 'صافي أرباح اليوم' },
    { id: 'kpi_today_orders', indicator: 'todayOrders', title: 'عدد عمليات اليوم' }
  ];

  kpis.forEach((kpi) => {
    widgetRegistry.register(kpi.id, KpiCardWidget, {
      id: kpi.id,
      version: '2.0.0',
      title: kpi.title,
      category: 'financial',
      permissions: [],
      defaultSize: { w: 3, h: 2 },
      minimumSize: { w: 2, h: 2 },
      maximumSize: { w: 6, h: 3 },
      refreshPolicy: { strategy: 'polling', intervalSeconds: 300 },
      cachePolicy: { ttlSeconds: 120 },
      priority: 1,
      defaultConfig: { indicator: kpi.indicator },
      // عقد البيانات الموحد للمكون (Data Contract)
      dataContract: {
        contractVersion: '2.0.0',
        dataType: 'KPI',
        indicators: [kpi.indicator],
        supportedParams: ['period'],
        cacheTTL: 120
      }
    });
  });

  // ==================== [2] تسجيل المكونات التشغيلية الكبيرة ====================

  widgetRegistry.register('productIntelligenceTable', ProductIntelligenceTable, {
    id: 'productIntelligenceTable',
    version: '2.0.0',
    title: 'تحليل أداء المنتجات المتقدم',
    category: 'operational',
    permissions: [],
    defaultSize: { w: 12, h: 4 },
    minimumSize: { w: 6, h: 3 },
    maximumSize: { w: 12, h: 6 },
    refreshPolicy: { strategy: 'manual' },
    cachePolicy: { ttlSeconds: 300 },
    priority: 2,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Table',
      indicators: ['productIntelligence'],
      supportedParams: ['period', 'sortBy'],
      cacheTTL: 300
    }
  });

  widgetRegistry.register('salesTrendChart', SalesTrendChart, {
    id: 'salesTrendChart',
    version: '2.0.0',
    title: 'الرسم البياني لاتجاه المبيعات',
    category: 'financial',
    permissions: [],
    defaultSize: { w: 8, h: 4 },
    minimumSize: { w: 4, h: 3 },
    maximumSize: { w: 12, h: 6 },
    refreshPolicy: { strategy: 'manual' },
    cachePolicy: { ttlSeconds: 300 },
    priority: 2,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Chart',
      indicators: ['salesTrend'],
      supportedParams: ['period'],
      cacheTTL: 300
    }
  });

  widgetRegistry.register('topProductsChart', TopProductsChart, {
    id: 'topProductsChart',
    version: '2.0.0',
    title: 'المنتجات الأكثر مبيعاً (رسم بياني)',
    category: 'operational',
    permissions: [],
    defaultSize: { w: 12, h: 4 },
    minimumSize: { w: 4, h: 3 },
    maximumSize: { w: 12, h: 6 },
    refreshPolicy: { strategy: 'manual' },
    cachePolicy: { ttlSeconds: 300 },
    priority: 2,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Chart',
      indicators: ['topProducts'],
      supportedParams: ['period'],
      cacheTTL: 300
    }
  });

  widgetRegistry.register('dashboardTasksWidget', DashboardTasksWidget, {
    id: 'dashboardTasksWidget',
    version: '2.0.0',
    title: 'مهام الفريق المعلقة',
    category: 'productivity',
    permissions: [],
    defaultSize: { w: 4, h: 4 },
    minimumSize: { w: 3, h: 3 },
    maximumSize: { w: 6, h: 6 },
    refreshPolicy: { strategy: 'polling', intervalSeconds: 60 },
    cachePolicy: { ttlSeconds: 30 },
    priority: 3,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'List',
      indicators: ['tasks'],
      supportedParams: [],
      cacheTTL: 60
    }
  });

  widgetRegistry.register('quickActions', QuickActions, {
    id: 'quickActions',
    version: '2.0.0',
    title: 'إجراءات سريعة',
    category: 'personal',
    permissions: [],
    defaultSize: { w: 4, h: 4 },
    minimumSize: { w: 3, h: 3 },
    maximumSize: { w: 6, h: 6 },
    refreshPolicy: { strategy: 'manual' },
    cachePolicy: { ttlSeconds: 3600 },
    priority: 1,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Actions',
      indicators: [],
      supportedParams: [],
      cacheTTL: 3600
    }
  });

  widgetRegistry.register('recentInvoices', RecentInvoices, {
    id: 'recentInvoices',
    version: '2.0.0',
    title: 'أحدث فواتير النظام',
    category: 'workflow',
    permissions: [],
    defaultSize: { w: 8, h: 4 },
    minimumSize: { w: 6, h: 3 },
    maximumSize: { w: 12, h: 6 },
    refreshPolicy: { strategy: 'polling', intervalSeconds: 120 },
    cachePolicy: { ttlSeconds: 60 },
    priority: 2,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Table',
      indicators: ['recentInvoices'],
      supportedParams: [],
      cacheTTL: 120
    }
  });

  widgetRegistry.register('upcomingPayments', UpcomingPayments, {
    id: 'upcomingPayments',
    version: '2.0.0',
    title: 'المدفوعات والتحصيلات القادمة',
    category: 'financial',
    permissions: [],
    defaultSize: { w: 6, h: 4 },
    minimumSize: { w: 4, h: 3 },
    maximumSize: { w: 12, h: 6 },
    refreshPolicy: { strategy: 'polling', intervalSeconds: 300 },
    cachePolicy: { ttlSeconds: 120 },
    priority: 2,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Table',
      indicators: ['upcomingPayments'],
      supportedParams: [],
      cacheTTL: 120
    }
  });

  widgetRegistry.register('upcomingInstallments', UpcomingInstallments, {
    id: 'upcomingInstallments',
    version: '2.0.0',
    title: 'الأقساط المستحقة للتحصيل',
    category: 'workflow',
    permissions: [],
    defaultSize: { w: 6, h: 4 },
    minimumSize: { w: 4, h: 3 },
    maximumSize: { w: 12, h: 6 },
    refreshPolicy: { strategy: 'polling', intervalSeconds: 300 },
    cachePolicy: { ttlSeconds: 120 },
    priority: 2,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Table',
      indicators: ['upcomingInstallments'],
      supportedParams: [],
      cacheTTL: 120
    }
  });

  widgetRegistry.register('profitSummaryWidget', ProfitSummaryWidget, {
    id: 'profitSummaryWidget',
    version: '2.0.0',
    title: 'ملخص أرباح وخسائر الفترة',
    category: 'financial',
    permissions: [],
    defaultSize: { w: 6, h: 4 },
    minimumSize: { w: 4, h: 3 },
    maximumSize: { w: 6, h: 6 },
    refreshPolicy: { strategy: 'manual' },
    cachePolicy: { ttlSeconds: 300 },
    priority: 2,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Summary',
      indicators: ['profitSummary'],
      supportedParams: [],
      cacheTTL: 300
    }
  });

  widgetRegistry.register('reportsQuickLinks', ReportsQuickLinks, {
    id: 'reportsQuickLinks',
    version: '2.0.0',
    title: 'روابط سريعة للتقارير',
    category: 'personal',
    permissions: [],
    defaultSize: { w: 6, h: 4 },
    minimumSize: { w: 4, h: 3 },
    maximumSize: { w: 6, h: 6 },
    refreshPolicy: { strategy: 'manual' },
    cachePolicy: { ttlSeconds: 3600 },
    priority: 3,
    dataContract: {
      contractVersion: '2.0.0',
      dataType: 'Links',
      indicators: ['quickLinks'],
      supportedParams: [],
      cacheTTL: 3600
    }
  });


  // ==================== [3] تسجيل الباقات الافتراضية بصورة مسطحة (v2) ====================

  // 🔸 باقة المالك (Owner Dashboard Package)
  dashboardRegistry.registerPackage('owner', {
    dashboardId: 'admin_dashboard',
    companyId: '',
    version: '2.0.0',
    widgetInstances: [
      // الصف الأول - الكروت المالية الفورية
      { id: 'inst_owner_1', widgetId: 'kpi_today_revenue', x: 0, y: 0, w: 3, h: 2, visible: true, userConfig: { indicator: 'todayRevenue' } },
      { id: 'inst_owner_2', widgetId: 'kpi_today_profit', x: 3, y: 0, w: 3, h: 2, visible: true, userConfig: { indicator: 'todayProfit' } },
      { id: 'inst_owner_3', widgetId: 'kpi_today_orders', x: 6, y: 0, w: 3, h: 2, visible: true, userConfig: { indicator: 'todayOrders' } },
      { id: 'inst_owner_4', widgetId: 'kpi_total_customers', x: 9, y: 0, w: 3, h: 2, visible: true, userConfig: { indicator: 'totalCustomers' } },
      
      // الصف الثاني - الكروت المالية التراكمية
      { id: 'inst_owner_5', widgetId: 'kpi_total_sales', x: 0, y: 2, w: 3, h: 2, visible: true, userConfig: { indicator: 'totalSales' } },
      { id: 'inst_owner_6', widgetId: 'kpi_monthly_sales', x: 3, y: 2, w: 3, h: 2, visible: true, userConfig: { indicator: 'monthlySales' } },
      { id: 'inst_owner_7', widgetId: 'kpi_pending_payments', x: 6, y: 2, w: 3, h: 2, visible: true, userConfig: { indicator: 'pendingPayments' } },
      { id: 'inst_owner_8', widgetId: 'kpi_unpaid_installments', x: 9, y: 2, w: 3, h: 2, visible: true, userConfig: { indicator: 'unpaidInstallments' } },
      
      // الصف الثالث والرابع - الرسوم البيانية والمهام
      { id: 'inst_owner_9', widgetId: 'salesTrendChart', x: 0, y: 4, w: 8, h: 4, visible: true },
      { id: 'inst_owner_10', widgetId: 'dashboardTasksWidget', x: 8, y: 4, w: 4, h: 4, visible: true },
      
      // الصف الخامس - رسم المنتجات الأكثر مبيعاً
      { id: 'inst_owner_11', widgetId: 'topProductsChart', x: 0, y: 8, w: 12, h: 4, visible: true }
    ]
  });

  // 🔸 باقة المحاسب (Accountant Dashboard Package)
  dashboardRegistry.registerPackage('accountant', {
    dashboardId: 'admin_dashboard',
    companyId: '',
    version: '2.0.0',
    widgetInstances: [
      // الصف الأول - الكروت المحاسبية
      { id: 'inst_acc_1', widgetId: 'kpi_monthly_sales', x: 0, y: 0, w: 4, h: 2, visible: true, userConfig: { indicator: 'monthlySales' } },
      { id: 'inst_acc_2', widgetId: 'kpi_pending_payments', x: 4, y: 0, w: 4, h: 2, visible: true, userConfig: { indicator: 'pendingPayments' } },
      { id: 'inst_acc_3', widgetId: 'kpi_unpaid_installments', x: 8, y: 0, w: 4, h: 2, visible: true, userConfig: { indicator: 'unpaidInstallments' } },
      
      // الصف الثاني - فواتير وإجراءات
      { id: 'inst_acc_4', widgetId: 'recentInvoices', x: 0, y: 2, w: 8, h: 4, visible: true },
      { id: 'inst_acc_5', widgetId: 'quickActions', x: 8, y: 2, w: 4, h: 4, visible: true },
      
      // الصف الثالث - المدفوعات والأقساط المستحقة
      { id: 'inst_acc_6', widgetId: 'upcomingPayments', x: 0, y: 6, w: 6, h: 4, visible: true },
      { id: 'inst_acc_7', widgetId: 'upcomingInstallments', x: 6, y: 6, w: 6, h: 4, visible: true }
    ]
  });

  // 🔸 باقة أمين المخزن (Warehouse Dashboard Package)
  dashboardRegistry.registerPackage('warehouse', {
    dashboardId: 'admin_dashboard',
    companyId: '',
    version: '2.0.0',
    widgetInstances: [
      // الصف الأول - الأصناف وتحليل المنتجات
      { id: 'inst_wh_1', widgetId: 'productIntelligenceTable', x: 0, y: 0, w: 12, h: 4, visible: true },
      
      // الصف الثاني - الكروت والرسوم التشغيلية
      { id: 'inst_wh_2', widgetId: 'topProductsChart', x: 0, y: 4, w: 12, h: 4, visible: true },
      { id: 'inst_wh_3', widgetId: 'dashboardTasksWidget', x: 0, y: 8, w: 4, h: 4, visible: true }
    ]
  });

  // 🔸 باقة المبيعات (Sales Dashboard Package)
  dashboardRegistry.registerPackage('sales', {
    dashboardId: 'admin_dashboard',
    companyId: '',
    version: '2.0.0',
    widgetInstances: [
      // الصف الأول - مبيعات وأقساط
      { id: 'inst_sales_1', widgetId: 'quickActions', x: 0, y: 0, w: 4, h: 4, visible: true },
      { id: 'inst_sales_2', widgetId: 'upcomingInstallments', x: 4, y: 0, w: 8, h: 4, visible: true },
      
      // الصف الثاني - إنتاجية
      { id: 'inst_sales_3', widgetId: 'dashboardTasksWidget', x: 0, y: 4, w: 4, h: 4, visible: true }
    ]
  });
}
