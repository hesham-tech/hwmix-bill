/**
 * جولة صفحة المنتجات والمخازن (Products Tour Steps)
 */
export default {
  steps: [
    {
      target: null,
      title: 'إدارة المنتجات 📦',
      content: 'من هذه الشاشة يمكنك استعراض وإضافة كافة الأصناف والمنتجات الخاصة بشركتك، وتتبع كمياتها في المخازن المختلفة.',
      placement: 'bottom'
    },
    {
      target: '.tour-product-add',
      title: 'إضافة منتج جديد ➕',
      content: 'اضغط هنا لإضافة منتج جديد، حيث يمكنك تحديد اسمه، الباركود، وحدة القياس، وأسعار البيع والشراء بكل دقة.',
      placement: 'left'
    },
    {
      target: '.tour-product-table .search-input-mini',
      title: 'البحث السريع 🔍',
      content: 'استخدم هذا الحقل للبحث الفوري عن أي منتج بواسطة اسمه أو رقم الباركود الخاص به للوصول إليه في ثوانٍ.',
      placement: 'bottom'
    },
    {
      target: '.tour-product-table .v-btn[prepend-icon="ri-filter-3-line"], .tour-product-table .v-btn[prepend-icon="ri-filter-off-line"]',
      title: 'تصفية المنتجات 🌪️',
      content: 'تتيح لك الفلاتر المتقدمة عرض المنتجات حسب الفئة، أو العلامة التجارية، أو حتى المنتجات التي توشك على النفاذ من المخزون.',
      placement: 'bottom'
    },
    {
      target: '.tour-product-table',
      title: 'جدول المنتجات والتفاصيل',
      content: 'يعرض الجدول بيانات المنتجات بشكل منظم. يمكنك النقر على أي منتج لتعديل بياناته أو تحديث الكميات المتوفرة منه.',
      placement: 'top'
    },
    {
      target: '.tour-app-table-customize',
      title: 'تخصيص أعمدة الجدول ⚙️',
      content: 'بنقرة واحدة، يمكنك إخفاء الأعمدة التي لا تحتاجها، أو إعادة ترتيبها لتناسب رؤيتك واحتياجك اليومي للمعلومات.',
      placement: 'bottom'
    }
  ]
};
