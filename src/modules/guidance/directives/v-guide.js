/**
 * التوجيه المخصص (Directive) لربط أي عنصر DOM بخطوات الجولات الإرشادية والتلميحات.
 * يضيف السمة data-guide لسهولة العثور على العناصر واستهدافها ديناميكياً.
 */
export default {
  mounted(el, binding) {
    if (binding.value) {
      el.setAttribute('data-guide', binding.value);
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.setAttribute('data-guide', binding.value);
    } else {
      el.removeAttribute('data-guide');
    }
  },
  unmounted(el) {
    el.removeAttribute('data-guide');
  },
};
