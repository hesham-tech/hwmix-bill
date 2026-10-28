import { labelTemplateService } from './labelTemplate.service';

export function createAssetLoader() {
  const cache = new Map();
  return async (value, element) => {
    const key = element.mediaId ? `media:${element.mediaId}` : String(value);
    if (!cache.has(key))
      cache.set(
        key,
        (async () => {
          let blob;
          if (element.mediaId) blob = await labelTemplateService.asset(element.mediaId);
          else {
            const url = new URL(String(value), location.origin);
            if (!['https:', 'http:'].includes(url.protocol)) throw new Error('مصدر صورة غير صالح.');
            const response = await fetch(url.href, { credentials: url.origin === location.origin ? 'same-origin' : 'omit' });
            if (!response.ok) throw new Error('تعذر تحميل صورة المنتج أو الشركة.');
            blob = await response.blob();
          }
          if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(blob.type))
            throw new Error('الصورة غير مدعومة؛ استخدم PNG أو JPEG أو WebP.');
          const url = URL.createObjectURL(blob);
          try {
            const image = new Image();
            image.src = url;
            await image.decode();
            return image;
          } finally {
            URL.revokeObjectURL(url);
          }
        })()
      );
    try {
      return await cache.get(key);
    } catch (error) {
      cache.delete(key);
      throw error;
    }
  };
}
