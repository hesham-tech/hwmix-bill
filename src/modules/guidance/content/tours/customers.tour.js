/**
 * جولة صفحة العملاء (Customers Tour Steps)
 */
export default {
  steps: [
    {
      target: null,
      title: 'إدارة العملاء 👥',
      content: 'من هذه الشاشة يمكنك إدارة قاعدة عملائك، وتتبع أرصدتهم المالية، وإضافة عملاء جدد بكل سهولة.',
      placement: 'bottom'
    },
    {
      target: '.tour-customer-add',
      title: 'إضافة عميل جديد ➕',
      content: 'اضغط هنا لإنشاء ملف عميل جديد وإدخال بياناته الأساسية وتحديد رصيده الافتتاحي والحد الائتماني له.',
      placement: 'left'
    },
    {
      target: '.tour-customer-table .search-input-mini',
      title: 'البحث عن عميل 🔍',
      content: 'يمكنك البحث السريع عن أي عميل بواسطة اسمه، رقم هاتفه، أو بريده الإلكتروني للوصول السريع لملفه المالي.',
      placement: 'bottom'
    },
    {
      target: '.tour-customer-table .v-btn[prepend-icon="ri-filter-3-line"], .tour-customer-table .v-btn[prepend-icon="ri-filter-off-line"]',
      title: 'تصفية العملاء 🌪️',
      content: 'استخدم الفلاتر المتقدمة لاستعراض العملاء بناءً على حالتهم أو نوع العميل (فرد/شركة).',
      placement: 'bottom'
    },
    {
      target: '.tour-customer-table',
      title: 'جدول العملاء والأرصدة',
      content: 'هنا يظهر جميع عملائك مع أرصدتهم الحالية. يمكنك النقر على أي صف لفتح ملف العميل ومراجعة كشف حسابه بالكامل.',
      placement: 'top'
    }
  ]
};
