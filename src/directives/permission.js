/**
 * Permission Directive
 * v-can directive للتحكم في عرض العناصر حسب الصلاحيات
 *
 * Usage:
 * <v-btn v-can="'invoices.create'">إنشاء فاتورة</v-btn>
 * <div v-can="['invoices.view', 'invoices.create']">...</div>
 */

import { useUserStore } from '@/stores/user';

export default {
  mounted(el, binding) {
    const userStore = useUserStore();
    const permission = binding.value;

    if (!userStore.hasPermission(permission)) {
      el._originalDisplay = el.style.display;
      el.style.display = 'none';

      if (binding.modifiers.remove) {
        el._removed = true;
        el.parentNode?.removeChild(el);
      }
    }
  },

  updated(el, binding) {
    const userStore = useUserStore();
    const permission = binding.value;

    if (!userStore.hasPermission(permission)) {
      el.style.display = 'none';

      if (binding.modifiers.remove) {
        el.parentNode?.removeChild(el);
      }
    } else {
      el.style.display = '';
    }
  },
};
