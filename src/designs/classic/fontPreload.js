import arabicRegular from '@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2?url';
import arabicBold from '@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2?url';
import latinRegular from '@fontsource/tajawal/files/tajawal-latin-400-normal.woff2?url';
import latinBold from '@fontsource/tajawal/files/tajawal-latin-700-normal.woff2?url';
import interRegular from '@fontsource/inter/files/inter-latin-400-normal.woff2?url';
import interBold from '@fontsource/inter/files/inter-latin-700-normal.woff2?url';

export function preloadFonts() {
  const connection = navigator.connection;
  if (connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType)) return;
  let arabic = true;
  try { arabic = (localStorage.getItem('locale') || 'ar') === 'ar'; } catch {}
  const workspace = location.pathname.startsWith('/app');
  const fonts = [latinRegular, ...(arabic ? [arabicRegular] : [])];
  if (workspace) fonts.push(latinBold, interRegular, interBold, ...(arabic ? [arabicBold] : []));
  for (const href of fonts) {
    if ([...document.querySelectorAll('link[data-design-font]')].some(link => link.href === new URL(href, location.href).href)) continue;
    const link = document.createElement('link');
    Object.assign(link, { rel: 'preload', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous', href });
    link.dataset.designFont = 'classic';
    document.head.append(link);
  }
}
