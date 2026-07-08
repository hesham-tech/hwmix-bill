import Toastify from 'vue3-toastify';


export default function setupToastify(app) {
  // تحديد اتجاه الإشعار حسب اللغة
  const lang = document.documentElement.getAttribute('lang') || 'ar';
  const isRtl = lang.startsWith('ar') || lang === 'fa' || lang === 'he';
  app.use(Toastify, {
    autoClose: 3000,
    position: isRtl ? 'top-right' : 'top-left',
    theme: 'colored',
    toastStyle: {
      minHeight: '32px',
      fontSize: '0.95rem',
      padding: '8px 16px',
      borderRadius: '6px',
      maxWidth: '350px',
    },
    bodyStyle: {
      padding: 0,
      margin: 0,
    },
  });
}
