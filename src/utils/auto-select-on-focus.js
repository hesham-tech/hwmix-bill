export default function setupAutoSelectOnFocus() {
  function handleFocus(event) {
    const el = event.target;

    // Check if it's an input or textarea
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      // Exclude types that don't support text selection or where it would be jarring
      const skipTypes = ['checkbox', 'radio', 'file', 'range', 'color', 'submit', 'button', 'reset'];
      if (skipTypes.includes(el.type) || el.hasAttribute('data-no-auto-select')) {
        return;
      }

      // Use a slightly longer delay (50ms) to ensure focus is fully established
      // and to avoid immediate conflict with mouse-up events that might clear selection
      setTimeout(() => {
        if (document.activeElement === el) {
          try {
            el.select();
          } catch (e) {
            // Some input types might throw error on select() if they don't support it
          }
        }
      }, 50);
    }
  }

  // focusin bubbles, unlike focus
  document.addEventListener('focusin', handleFocus);

  return () => {
    document.removeEventListener('focusin', handleFocus);
  };
}
