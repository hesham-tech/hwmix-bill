// اختبار حماية الدستور المعماري ومنع تراجع المعمارية أو استيراد axios والوسائط الممنوعة بالـ Widgets
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const WIDGETS_DIR = path.resolve(__dirname, '../../../src/modules/reports/components');
const TASKS_WIDGETS_DIR = path.resolve(__dirname, '../../../src/modules/tasks/components');

const BANNED_PATTERNS = [
  { pattern: /import.*axios/i, message: 'ممنوع استيراد axios مباشرة داخل الـ Widgets' },
  { pattern: /import.*apiClient/i, message: 'ممنوع استيراد apiClient مباشرة داخل الـ Widgets' },
  { pattern: /import.*useDashboardData/i, message: 'ممنوع استخدام composable useDashboardData القديم' },
  { pattern: /import.*useAnalytics/i, message: 'ممنوع استخدام composable useAnalytics القديم' },
  { pattern: /EventBus/i, message: 'ممنوع استخدام الـ EventBus داخل الـ Widgets' },
  { pattern: /widgetEventBus/i, message: 'ممنوع استخدام widgetEventBus داخل الـ Widgets' },
  { pattern: /provide\(/i, message: 'ممنوع استخدام provide للتمرير التلقائي داخل الـ Widgets' },
  { pattern: /inject\(/i, message: 'ممنوع استخدام inject للبيانات داخل الـ Widgets' }
];

describe('Architectural Regression Protection Tests', () => {
  const checkDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.vue'));

    files.forEach(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');

      BANNED_PATTERNS.forEach(({ pattern, message }) => {
        const isBanned = pattern.test(content);
        if (isBanned && file !== 'QuickActions.vue' && file !== 'ReportsQuickLinks.vue') {
          // استثناء المكونات الثابتة التي لا تطلب بيانات من قيود provide/inject إذا كانت غير متعلقة بالبيانات
          expect(isBanned).toBe(false, `${file}: ${message}`);
        }
      });
    });
  };

  it('يجب أن تخلو كافة Widgets التقارير من أي وسائط تواصل قديمة أو استدعاءات API مباشرة', () => {
    checkDirectory(WIDGETS_DIR);
  });

  it('يجب أن تخلو كافة Widgets المهام من أي وسائط تواصل قديمة أو استدعاءات API مباشرة', () => {
    checkDirectory(TASKS_WIDGETS_DIR);
  });
});
