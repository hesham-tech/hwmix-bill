/**
 * Error Collector Utility
 * يقوم بجمع البيانات التقنية تلقائياً عند حدوث خطأ
 */

export const collectErrorInfo = async (error, context = {}) => {
  const info = {
    message: error?.message || 'Unknown Error',
    stack_trace: error?.stack || null,
    url: window.location.href,
    browser: getBrowserInfo(),
    os: getOSInfo(),
    type: context.type || 'error',
    severity: context.severity || 'medium',
    payload: {
      timestamp: new Date().toISOString(),
      route: window.location.hash || window.location.pathname,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      ...context.extraData,
    },
  };

  // Try to get Pinia state if available (be careful with sensitive data)
  try {
    const { useUserStore } = await import('@/stores/user');
    const userStore = useUserStore();
    if (userStore.currentUser) {
      info.payload.user_id = userStore.currentUser.id;
      info.payload.username = userStore.currentUser.username;
    }
  } catch (e) {
    // Silent fail if store not accessible
  }

  return info;
};

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
