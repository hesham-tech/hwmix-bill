import DOMPurify from 'dompurify'

export function safeHtml(value) {
  return DOMPurify.sanitize(String(value || ''), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style', 'srcset'],
  })
}
