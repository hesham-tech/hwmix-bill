// سجل مركزي لإدارة وتعريف أدوات وتطبيقات الويب المفتوحة والمجانية

export const TOOL_CATEGORIES = [
  { id: 'all', title: 'جميع الأدوات', icon: 'ri-apps-2-line' },
  { id: 'education', title: 'تعليم وأطفال', icon: 'ri-book-read-line' },
];

export const TOOLS_REGISTRY = [
  {
    id: 'kids-clock-learning',
    title: 'ساعة الأطفال التعليمية التفاعلية',
    description: 'تطبيق ويب تعليمي وتفاعلي ممتع للأطفال لتعلم قراءة الوقت بالساعات الرقمية وساعة العقارب مع قراءة الوقت بالكلمات العربية.',
    icon: 'ri-time-line',
    iconColor: 'indigo-darken-1',
    category: 'education',
    badge: 'تفاعلي وممتع',
    badgeColor: 'indigo',
    route: '/tools/kids-clock-learning',
    tags: ['أطفال', 'ساعة', 'تعليم', 'وقت', 'عقارب', 'رقمية', 'زمن'],
    componentName: 'KidsClockLearning',
  },
  /* 
  الأدوات الإضافية محفوظة ومتاحة للتفعيل عند الحاجة:
  - zakat-calculator (حاسبة زكاة المال والذهب)
  - vat-calculator (حاسبة ضريبة القيمة المضافة)
  - currency-converter (محول العملات السريع)
  - profit-margin-calculator (حاسبة هامش الربح والتسعير)
  - qr-generator (مولد ومصمم رموز QR الذكية)
  */
];
