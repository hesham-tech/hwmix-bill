/**
 * Composable قابل للإعادة لإزالة الخلفية من الصور باستخدام AI محلي
 * يعمل 100% في المتصفح بدون API خارجي أو تكلفة
 *
 * الاستخدام:
 *   const { removingBg, removingBgStatus, removeBgError, removeBackground } = useBackgroundRemoval()
 *
 * ثم في أي مكون:
 *   const result = await removeBackground(fileOrUrl)
 *   // result: { file: File, url: string } | null
 */

import { ref } from 'vue';

export function useBackgroundRemoval() {
  // ─── State ──────────────────────────────────────────────────────────────────
  const removingBg       = ref(false);
  const removingBgStatus = ref('');
  const removeBgError    = ref(null);

  // ─── Core Logic ─────────────────────────────────────────────────────────────
  /**
   * يزيل الخلفية من صورة ويعيد الملف الشفاف
   * @param {File|string} input - ملف الصورة أو رابط URL
   * @param {object} options - خيارات اختيارية
   * @param {string} options.model - حجم النموذج: 'small' | 'medium' (default: 'small')
   * @param {number} options.quality - جودة الناتج 0-1 (default: 0.9)
   * @returns {Promise<{file: File, url: string}|null>}
   */
  const removeBackground = async (input, options = {}) => {
    if (!input) return null;

    removingBg.value       = true;
    removeBgError.value    = null;
    removingBgStatus.value = 'جاري تحميل نموذج الذكاء الاصطناعي...';

    try {
      // Lazy import — يُحمَّل مرة واحدة فقط ثم يُكاش
      const { removeBackground: imglyRemoveBg } = await import('@imgly/background-removal');

      removingBgStatus.value = 'جاري تحليل الصورة وإزالة الخلفية...';

      const resultBlob = await imglyRemoveBg(input, {
        publicPath: 'https://static.imgly.com/@imgly/background-removal-data/1.4.3/dist/',
        model:  options.model   ?? 'small',
        output: {
          format:  'image/png',
          quality: options.quality ?? 0.9,
        },
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            removingBgStatus.value = `تحميل النموذج: ${pct}%`;
          }
        },
      });

      // تحويل الـ Blob إلى File بصيغة PNG شفافة
      const outputFile = new File([resultBlob], 'logo-transparent.png', {
        type: 'image/png',
      });

      const outputUrl = URL.createObjectURL(resultBlob);

      removingBgStatus.value = '';
      return { file: outputFile, url: outputUrl };

    } catch (err) {
      console.error('[useBackgroundRemoval] فشل إزالة الخلفية:', err);
      // إظهار سبب الخطأ للمستخدم
      removeBgError.value =
        `حدث خطأ أثناء إزالة الخلفية: ${err.message || err}`;
      return null;

    } finally {
      removingBg.value = false;
    }
  };

  // ─── Reset ───────────────────────────────────────────────────────────────────
  const resetBgState = () => {
    removingBg.value       = false;
    removingBgStatus.value = '';
    removeBgError.value    = null;
  };

  return {
    // State (reactive)
    removingBg,
    removingBgStatus,
    removeBgError,

    // Methods
    removeBackground,
    resetBgState,
  };
}
