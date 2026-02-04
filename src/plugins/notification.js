import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export const useNotifications = () => {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('تم تفعيل إشعارات المتصفح بنجاح');
      }
    }
  };

  const notify = (title, options = {}) => {
    // 1. Show Toast
    toast(title, {
      type: options.type || 'info',
      position: 'top-right',
      autoClose: 5000,
      onClick: options.onClick,
    });

    // 2. Show Browser Notification if permitted
    if (Notification.permission === 'granted') {
      const n = new Notification(title, {
        body: options.body || '',
        icon: '/favicon.ico', // Adjust icon path if needed
      });
      n.onclick = options.onClick;
    }
  };

  const setupEchoListeners = user => {
    // WebSockets disabled due to hosting limitations
    return;

    if (!user || !window.Echo) return;

    // Listen on User Channel
    window.Echo.private(`user.${user.id}`).listen('.task.updated', e => {
      notify(e.message || 'تحديث جديد في المهام', {
        body: e.task.title,
        type: 'success',
        onClick: () => {
          window.focus();
          // Redirect or open dialog logic can be added here
        },
      });
    });

    // Listen on Company Channel (Optional, depending on if we want all company task updates)
    window.Echo.private(`company.${user.company_id}`).listen('.task.updated', e => {
      // To avoid duplicate notifications if user is already notified via user channel
      // We could check if e.task is assigned to this user
      console.log('Company task update:', e);
    });
  };

  return {
    requestPermission,
    notify,
    setupEchoListeners,
  };
};
