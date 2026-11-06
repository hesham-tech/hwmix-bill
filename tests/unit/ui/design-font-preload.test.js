import { describe, it, expect, afterEach, vi } from 'vitest';
import { preloadFonts } from '@/designs/classic/fontPreload';

const hints = () => [...document.querySelectorAll('link[data-design-font]')];
afterEach(() => {
  hints().forEach(link => link.remove());
  localStorage.removeItem('locale');
  history.replaceState({}, '', '/');
  vi.unstubAllGlobals();
});

describe('selected design font hints', () => {
  it('avoids optional preload on slow connections or data saving', () => {
    for (const connection of [{ saveData: true }, { effectiveType: '3g' }, { effectiveType: '2g' }]) {
      vi.stubGlobal('navigator', { connection });
      preloadFonts();
      expect(hints()).toHaveLength(0);
    }
  });

  it('preloads the workspace fonts for the current language without duplicate requests', () => {
    vi.stubGlobal('navigator', { connection: { effectiveType: '4g' } });
    history.replaceState({}, '', '/app/customers');
    localStorage.setItem('locale', 'ar');
    preloadFonts();
    preloadFonts();
    expect(hints()).toHaveLength(6);
    expect(hints().every(link => link.as === 'font' && link.crossOrigin === 'anonymous')).toBe(true);
    hints().forEach(link => link.remove());
    localStorage.setItem('locale', 'en');
    preloadFonts();
    expect(hints()).toHaveLength(4);
    expect(hints().some(link => link.href.includes('arabic'))).toBe(false);
  });
});
