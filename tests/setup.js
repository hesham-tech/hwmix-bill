// ملف تهيئة بيئة الاختبارات العامة وتوفير محاكاة للمتصفح والـ API
import { config } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';

// تهيئة Pinia ليكون متاحاً لكل الاختبارات بشكل افتراضي
const pinia = createPinia();
setActivePinia(pinia);

config.global.plugins = [pinia];

// محاكاة ResizeObserver المطلوبة بواسطة Vuetify و ApexCharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// محاكاة matchMedia المطلوبة بواسطة بعض المكونات
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {}
  };
};

// محاكاة localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem(key) { return store[key] || null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { store = {}; }
  };
})();
global.localStorage = localStorageMock;

// محاكاة apiClient/axios
vi.mock('@/api/axios.config', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}));

// محاكاة useDisplay لـ Vuetify لمنع أخطاء الـ display injection
vi.mock('vuetify', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDisplay: () => ({
      mobile: { value: false },
      xs: { value: false },
      sm: { value: false },
      md: { value: true },
      lg: { value: false },
      xl: { value: false },
      thresholds: {},
      update: () => {}
    })
  };
});
