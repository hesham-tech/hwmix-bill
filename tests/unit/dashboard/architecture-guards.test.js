// اختبارات حماية المعمارية والـ AST والتحقق من التبعيات لضمان عدم التراجع البرمجي
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import widgetRegistry from '@core/dashboard/registry/WidgetRegistry';
import providerRegistry from '@core/dashboard/providers/ProviderRegistry';
import { installDashboardEngine } from '@core/dashboard/registry/install';

// تثبيت الإعدادات للتأكد من امتلاء الـ Registries
installDashboardEngine();

const WIDGETS_DIR = path.resolve(__dirname, '../../../src/modules/reports/components');
const ENGINE_DIR = path.resolve(__dirname, '../../../src/@core/dashboard/components');

describe('Dashboard Architectural Regression Guards', () => {
  
  // 🔸 1. اختبار حظر استخدام axios أو استدعاء الشبكة مباشرة بملفات المكونات
  it('يجب ألا تستورد المكونات axios أو تستدعي API بشكل مباشر خارج البنية المقررة', () => {
    const files = fs.readdirSync(WIDGETS_DIR);
    
    files.forEach(file => {
      if (!file.endsWith('.vue')) return;
      const content = fs.readFileSync(path.join(WIDGETS_DIR, file), 'utf-8');
      
      // التحقق من عدم وجود استيرادات غير مصرح بها لـ axios أو الـ apiClient المباشر
      expect(content).not.toContain("import axios");
      expect(content).not.toContain('from "axios"');
      expect(content).not.toContain("from 'axios'");
      expect(content).not.toContain("apiClient");
      expect(content).not.toContain("axios.config");
      
      // التحقق من عدم استخدام Composables قديمة أو EventBus
      expect(content).not.toContain('EventBus');
      expect(content).not.toContain('useDashboardData');
      expect(content).not.toContain('useAnalytics');
    });
  });

  // 🔸 2. اختبار حظر استخدام axios بالـ Dashboard Engine و الـ Container
  it('يجب ألا يقوم محرك الداشبورد أو الحاويات باستيراد axios أو الاتصال بالـ API مباشرة', () => {
    const engineFiles = fs.readdirSync(ENGINE_DIR);

    engineFiles.forEach(file => {
      if (!file.endsWith('.vue')) return;
      const content = fs.readFileSync(path.join(ENGINE_DIR, file), 'utf-8');

      // حظر axios و apiClient بالكامل
      expect(content).not.toContain("import axios");
      expect(content).not.toContain('from "axios"');
      expect(content).not.toContain("from 'axios'");
      expect(content).not.toContain("apiClient");
      expect(content).not.toContain("axios.config");
    });
  });

  // 🔸 3. اختبار الالتزام بالـ Pinia Store والـ instanceId
  it('يجب أن تلتزم المكونات الذكية باستقبال instanceId وتتبع الـ Store', () => {
    const files = fs.readdirSync(WIDGETS_DIR);
    
    // استثناء المكونات العامة التقديمية أو الهيكلية التي ليست Widgets تفاعلية بحد ذاتها بالداشبورد
    const presentationOnlyComponents = [
      'ReportLayout.vue',
      'CashFlowChart.vue',
      'ProfitComparisonChart.vue',
      'StockValuationChart.vue'
    ];

    files.forEach(file => {
      if (!file.endsWith('.vue')) return;
      if (presentationOnlyComponents.includes(file)) return;
      
      const content = fs.readFileSync(path.join(WIDGETS_DIR, file), 'utf-8');
      
      // التأكد من تعريف الـ props واستخدام الـ instanceId لربط البيانات
      const hasPropsDefinition = content.includes('defineProps') || content.includes('props:');
      if (hasPropsDefinition) {
        expect(content).toContain('instanceId');
      }
    });
  });

  // 🔸 4. اختبار توافق الـ dataContract والـ Providers في الـ install.js
  it('يجب أن يملك كل Data Contract مزود بيانات مطابق ومسجل بالـ Registry', () => {
    const widgets = widgetRegistry.getAll();
    
    Object.keys(widgets).forEach(widgetId => {
      const widget = widgets[widgetId];
      if (!widget.meta || !widget.meta.dataContract) return;
      
      const contract = widget.meta.dataContract;
      // التحقق من توافق الـ dataType مع الـ Providers المتوفرة
      if (contract.indicators && contract.indicators.length > 0) {
        contract.indicators.forEach(indicator => {
          const provider = providerRegistry.getProvider(indicator);
          // تأكيد وجود مزود بيانات مسجل لكل مؤشر أداء مستخدم بالـ contract
          expect(provider).toBeDefined();
        });
      }
    });
  });
});
