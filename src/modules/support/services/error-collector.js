/**
 * Error Collector Utility
 * يقوم بجمع البيانات التقنية تلقائياً عند حدوث خطأ
 */

export const collectErrorInfo = async (error = null, context = {}) => {
  let screenCapture = null;

  // Capture screen only if explicitly requested in context
  if (context.captureScreenshot === true) {
    try {
      const { captureElement } = await import('@/modules/capture/utils/capture');

      if (context.onCaptureStart) {
        context.onCaptureStart();
      }

      // Hide FAB temporarily if it exists
      const fab = document.querySelector('.global-fab-feedback');
      if (fab) fab.style.visibility = 'hidden';

      await new Promise(resolve => setTimeout(resolve, 200));

      const blob = await captureElement(document.body, {
        format: 'blob',
        backgroundColor: '#f8f9fa',
        quality: 0.95,
        pixelRatio: 2,
      });

      const fabElement = document.querySelector('.global-fab-feedback');
      if (fabElement) fabElement.style.visibility = 'visible';

      if (context.onCaptureEnd) {
        context.onCaptureEnd();
      }

      screenCapture = new File([blob], `screenshot_${Date.now()}.jpg`, { type: 'image/jpeg' });
    } catch (e) {
      console.error('[ErrorCollector] Capture failed:', e);
      if (context.onCaptureEnd) context.onCaptureEnd();
    }
  }

  const info = {
    message: error?.message || context.message || 'Manual Feedback/Report',
    stack_trace: error?.stack || null,
    url: window.location.href,
    browser: getBrowserInfo(),
    os: getOSInfo(),
    type: context.type || 'error',
    severity: context.severity || 'medium',
    isConnectivityError: !!context.isConnectivityError,
    autoScreenshot: screenCapture || context.screenshot || null,
    payload: {
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: document.documentElement.lang || 'ar',
      route: window.location.hash || window.location.pathname,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      request: context.request ? sanitizeRequestData(context.request) : null,
      ...context.extraData,
    },
  };

  try {
    const { useUserStore } = await import('@/stores/user');
    const { useBranchStore } = await import('@/stores/branch');
    const userStore = useUserStore();
    const branchStore = useBranchStore();
    
    if (userStore.currentUser) {
      info.payload.user_id = userStore.currentUser.id;
      info.payload.username = userStore.currentUser.username;
      info.payload.company_id = userStore.currentUser.active_company_id;
    }

    if (branchStore.activeBranchId) {
      info.branch_id = branchStore.activeBranchId;
      info.payload.branch_id = branchStore.activeBranchId;
    }
  } catch (e) {
    // Silent fail if store not accessible
  }

  return info;
};

function sanitizeRequestData(requestObj) {
  if (!requestObj || typeof requestObj !== 'object') return requestObj;
  try {
    const clone = JSON.parse(JSON.stringify(requestObj));
    const sensitiveKeys = ['password', 'password_confirmation', 'token', 'authorization', 'secret', 'credit_card', 'pin'];
    
    const redact = obj => {
      for (const key in obj) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          redact(obj[key]);
        }
      }
    };
    redact(clone);
    return clone;
  } catch (e) {
    return '[Unparseable Request Data]';
  }
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return 'IE ' + (tem[1] || '');
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return M.join(' ');
}

function getOSInfo() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os || platform;
}
