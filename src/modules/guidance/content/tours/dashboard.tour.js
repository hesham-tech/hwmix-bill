/**
 * جولة لوحة التحكم الرئيسية (Dashboard Tour Steps)
 * تصدر قائمة بالخطوات الإرشادية لتعريف المستخدم بلوحة التحكم والوظائف الإحصائية السريعة.
 */
export default {
  get steps() {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

    // الخطوات المشتركة (أول 4 خطوات)
    const baseSteps = [
      {
        target: null, // لا يوجد عنصر مستهدف = يظهر في منتصف الشاشة كترحيب
        title: 'مرحباً بك في لوحة التحكم الإحصائية! 👋',
        content: 'هذه جولة سريعة لنساعدك على استكشاف لوحة التحكم الرئيسية وكيفية تتبع وإدارة مبيعاتك وفواتيرك.',
        placement: 'bottom'
      },
      {
        target: '.tour-dashboard-customize',
        title: 'تخصيص الواجهة وحريتك الكاملة',
        content: 'يمكنك استخدام هذا الزر لإعادة ترتيب الأقسام أو إخفاء الإحصائيات التي لا تحتاج إليها بسحبها وإفلاتها.',
        placement: 'bottom'
      },
      {
        target: '.tour-dashboard-refresh',
        title: 'تحديث البيانات الفورية',
        content: 'يمكنك جلب آخر الحركات والفواتير والتحليلات المسجلة في السيرفر فوراً دون الحاجة لتحديث الصفحة بالكامل.',
        placement: 'bottom'
      },
      {
        target: '.tour-nav-search',
        title: 'البحث الشامل والذكي 🔍',
        content: 'البحث الفوري في جميع أركان النظام للوصول السريع إلى العملاء، أو الفواتير، أو خطط التقسيط بواسطة الاسم، أو رقم الهاتف، أو رقم الفاتورة (أو عبر اختصار الكيبورد Ctrl + K).',
        placement: 'bottom'
      }
    ];

    if (isMobile) {
      // للهواتف: خطوة خامسة وأخيرة تشرح محتويات القائمة بالكامل
      return [
        ...baseSteps,
        {
          target: '.user-menu-btn',
          title: 'أدوات الوصول السريع وإعدادات الحساب 📱',
          content: `
            <div class="text-caption text-grey-darken-2 mb-3">
              تم جمع الخيارات والأدوات المهمة داخل هذه القائمة لسهولة الوصول إليها:
            </div>
            <div class="d-flex flex-column ga-2 mt-1" style="text-align: right;">
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-device-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">إدارة الأجهزة</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">تتبع الهواتف والأجهزة المتصلة بحسابك حالياً وإدارتها.</div>
                </div>
              </div>
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-sparkling-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">سجل التحديثات</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">استعراض المميزات الجديدة والتحسينات المضافة مؤخراً للنظام.</div>
                </div>
              </div>
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-settings-3-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">الإعدادات</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">إدارة تفضيلات شركتك وفروعك والتحكم الكامل بالصلاحيات.</div>
                </div>
              </div>
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-printer-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">تنسيق الطباعة</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">تعديل مقاس الفواتير المطبوعة بين المقاس العادي والحراري.</div>
                </div>
              </div>
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-sun-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">الوضع (الثيم)</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">التبديل الفوري والمريح بين المظهر المظلم والمضيء للنظام.</div>
                </div>
              </div>
              <div class="d-flex align-start" style="gap: 8px;">
                <i class="ri-refresh-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">تحديث بيانات النظام</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">تحديث فوري لذاكرة النظام المؤقتة لحل أي مشكلات فنية.</div>
                </div>
              </div>
            </div>
          `.trim(),
          placement: 'bottom'
        }
      ];
    } else {
      // للحواسيب والشاشات الكبيرة: خطوة 5 تشرح زر المساعدة فقط، تليها خطوات تشرح باقي شريط الأدوات العلوي
      return [
        ...baseSteps,
        {
          target: '.contextual-help-trigger',
          title: 'دليل الصفحة المساعد ❓',
          content: 'في أي صفحة كنت، يمكنك الضغط على هذا الزر لفتح دليل إرشادي سريع خاص بالصفحة الحالية دون مغادرتها.',
          placement: 'left'
        },
        {
          target: '.tour-nav-updates',
          title: 'سجل التحديثات والجديد 🚀',
          content: 'لمتابعة أحدث الميزات البرمجية والتحسينات المضافة مؤخراً للنظام فور نزولها.',
          placement: 'bottom'
        },
        {
          target: '.tour-nav-branch',
          title: 'التبديل بين الفروع 🏢',
          content: 'تتيح لك هذه القائمة التنقل الفوري بين كافة فروع شركتك النشطة لتحديث نطاق البيانات المعروضة.',
          placement: 'bottom'
        },
        {
          target: '.tour-nav-print',
          title: 'إعدادات الطباعة السريعة 🖨️',
          content: 'لتغيير مقاس ورق طباعة الفواتير مباشرة للشركة (A4، A5، أو مقاس حراري 80mm/58mm) بنقرة واحدة.',
          placement: 'bottom'
        },
        {
          target: '.tour-nav-tools',
          title: 'أدوات النظام السريعة 🛠️',
          content: 'اختصار ذكي لفتح الأدوات العائمة التفاعلية كالحاسبة، وحساب النسب المئوية، وحاسبة الأقساط من أي مكان.',
          placement: 'bottom'
        },
        {
          target: '.user-menu-btn',
          title: 'إعدادات الحساب والمظهر 👤',
          content: `
            <div class="text-caption text-grey-darken-2 mb-3">
              تضم هذه القائمة الإعدادات الخاصة بحسابك وتفضيلات مظهر النظام:
            </div>
            <div class="d-flex flex-column ga-2 mt-1" style="text-align: right;">
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-user-settings-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">الملف الشخصي</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">تعديل معلوماتك الشخصية وتغيير كلمة المرور وتفضيلات الحساب.</div>
                </div>
              </div>
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-device-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">إدارة الأجهزة</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">تتبع الهواتف والأجهزة المتصلة بحسابك حالياً وإدارتها.</div>
                </div>
              </div>
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-settings-3-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">الإعدادات</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">إدارة تفضيلات شركتك وفروعك والتحكم الكامل بالصلاحيات.</div>
                </div>
              </div>
              <div class="d-flex align-start pb-2 border-b" style="border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important; gap: 8px;">
                <i class="ri-sun-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">الوضع (الثيم)</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">التبديل الفوري والمريح بين المظهر المظلم والمضيء للنظام.</div>
                </div>
              </div>
              <div class="d-flex align-start" style="gap: 8px;">
                <i class="ri-refresh-line text-primary" style="font-size: 1.25rem; line-height: 1;"></i>
                <div>
                  <div class="font-weight-bold text-slate-800" style="font-size: 0.8rem;">تحديث بيانات النظام</div>
                  <div class="text-grey-darken-1" style="font-size: 0.72rem; line-height: 1.3; margin-top: 2px;">تحديث فوري لذاكرة النظام المؤقتة لحل أي مشكلات فنية.</div>
                </div>
              </div>
            </div>
          `.trim(),
          placement: 'bottom'
        }
      ];
    }
  }
};
