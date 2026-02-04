// d:\Dev\projects\hwnix-bill\src\directives\draggable.js

export default {
  mounted(el, binding) {
    const options = binding.value || {};
    if (binding.value === false || binding.value === null) return;

    const handleSelector = options.handle || '.drag-handle';
    const handle = el.querySelector(handleSelector) || el;
    const storageKey = options.id ? `tool_pos_${options.id}` : null;

    let startX, startY, initialX, initialY;

    const onMouseDown = e => {
      // Don't drag if clicking on a button, input, or specifically marked no-drag
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('.no-drag')) return;

      const rect = el.getBoundingClientRect();
      const currentWidth = rect.width;
      const currentHeight = rect.height;

      startX = e.clientX;
      startY = e.clientY;

      initialX = rect.left;
      initialY = rect.top;

      // Lock dimensions to prevent collapsing
      el.style.width = `${currentWidth}px`;
      el.style.height = `${currentHeight}px`;
      el.style.position = 'fixed';
      el.style.margin = '0';
      el.style.left = `${initialX}px`;
      el.style.top = `${initialY}px`;
      el.style.zIndex = '9999';
      el.style.transform = 'none';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      // Prevent text selection during drag
      document.body.style.userSelect = 'none';

      el.dispatchEvent(new CustomEvent('drag-start'));
    };

    const onMouseMove = e => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = initialX + dx;
      const newY = initialY + dy;

      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;

      el._currentPos = { x: newX, y: newY };
    };

    const onMouseUp = () => {
      if (storageKey && el._currentPos) {
        localStorage.setItem(storageKey, JSON.stringify(el._currentPos));
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';

      el.dispatchEvent(new CustomEvent('drag-end', { detail: el._currentPos }));
    };

    handle.addEventListener('mousedown', onMouseDown);
    handle.style.cursor = 'move';

    // Touch support
    const onTouchStart = e => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('.no-drag')) return;

      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      const currentWidth = rect.width;
      const currentHeight = rect.height;

      startX = touch.clientX;
      startY = touch.clientY;
      initialX = rect.left;
      initialY = rect.top;

      el.style.width = `${currentWidth}px`;
      el.style.height = `${currentHeight}px`;
      el.style.position = 'fixed';
      el.style.margin = '0';
      el.style.left = `${initialX}px`;
      el.style.top = `${initialY}px`;
      el.style.zIndex = '9999';
      el.style.transform = 'none';

      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
      el.dispatchEvent(new CustomEvent('drag-start'));
    };

    const onTouchMove = e => {
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const newX = initialX + dx;
      const newY = initialY + dy;

      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;

      el._currentPos = { x: newX, y: newY };
      e.preventDefault(); // Prevent scrolling while dragging
    };

    const onTouchEnd = () => {
      if (storageKey && el._currentPos) {
        localStorage.setItem(storageKey, JSON.stringify(el._currentPos));
      }
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      el.dispatchEvent(new CustomEvent('drag-end', { detail: el._currentPos }));
    };

    handle.addEventListener('touchstart', onTouchStart, { passive: true });

    // Initial position if provided
    if (options.position) {
      el.style.position = 'fixed';
      el.style.left = `${options.position.x}px`;
      el.style.top = `${options.position.y}px`;
      el.style.margin = '0';
      el.style.transform = 'none';
    }
  },
};
