/**
 * جولة صفحة الفواتير (Invoices Page Tour Steps)
 * تصدر قائمة بالخطوات الإرشادية لتعريف المستخدم بكيفية إدارة والبحث في الفواتير الصادرة والواردة.
 */
export default {
  steps: [
    {
      target: null,
      title: 'إدارة الفواتير 📄',
      content: 'هنا يمكنك متابعة فواتيرك الصادرة والواردة، ومعرفة المبالغ المدفوعة والمتبقية وحالة سداد كل فاتورة.',
      placement: 'bottom'
    },
    {
      target: '.invoice-list-wrapper button:has(.ri-add-line), .invoice-list-wrapper button',
      title: 'إصدار فاتورة جديدة',
      content: 'اضغط هنا لفتح معالج إنشاء الفواتير الذكي، لإصدار فاتورة مبيعات، مشتريات، أو خطة تقسيط لعملائك.',
      placement: 'left'
    },
    {
      target: '.invoice-list-wrapper .v-table, .invoice-list-wrapper',
      title: 'جدول البيانات التفاعلي',
      content: 'يعرض هذا الجدول ملخصاً لكل فاتورة: العميل، الصافي المطلوب، والمدفوع. يمكنك الضغط على رقم الفاتورة لاستعراض تفاصيلها كاملة وطباعتها.',
      placement: 'top'
    },
    {
      target: '.invoice-list-wrapper .v-text-field',
      title: 'البحث السريع والتصفية',
      content: 'ابحث برقم الفاتورة أو اسم العميل مباشرة، أو استخدم الفلاتر المتقدمة لتصفية الفواتير بحسب حالتها (مسودة، مؤكدة) أو تاريخ الإصدار.',
      placement: 'bottom'
    }
  ]
};
