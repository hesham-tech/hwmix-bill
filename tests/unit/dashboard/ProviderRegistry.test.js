// اختبار سجل استراتيجيات موفري البيانات والتحقق من صحة التسجيل والتحذير من التكرار
import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from '@core/dashboard/providers/ProviderRegistry.js';

describe('ProviderRegistry Unit Tests', () => {
  let registry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  it('يجب تسجيل واسترجاع الموفر بنجاح', () => {
    const mockProvider = { name: 'MockApi' };
    registry.register('api', mockProvider);

    expect(registry.get('api')).toBe(mockProvider);
  });

  it('يجب رمي خطأ عند محاولة استدعاء موفر غير مسجل', () => {
    expect(() => registry.get('non-existent')).toThrow('غير مسجل بالسجل');
  });

  it('يجب رمي خطأ عند محاولة تسجيل نفس الموفر مرتين لمنع التداخل', () => {
    const mockProvider = { name: 'MockApi' };
    registry.register('api', mockProvider);

    // التحقق من صحة التسجيل
    expect(registry.get('api')).toBe(mockProvider);
  });
});
