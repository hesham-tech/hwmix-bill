export function readJson(storage, key, fallback = null) {
  try { return JSON.parse(storage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}

export function storePayload(response) {
  return response?.data?.data ?? response?.data ?? null
}

export function storePage(response) {
  const payload = storePayload(response)
  if (Array.isArray(payload)) return { items: payload, meta: {} }
  return { items: Array.isArray(payload?.data) ? payload.data : [], meta: payload?.meta || {} }
}

export function saveOrderAccess(order, token) {
  if (token) sessionStorage.setItem(`hwnix_order_access:${order.order_number}`, token)
  sessionStorage.setItem('hwnix_last_checkout', JSON.stringify({ order_number: order.order_number }))
}

export function orderHeaders(orderNumber) {
  const token = sessionStorage.getItem(`hwnix_order_access:${orderNumber}`)
  return token ? { 'X-Order-Token': token } : {}
}

export function checkoutAttempt() {
  let key = sessionStorage.getItem('hwnix_checkout_key')
  if (!key) { key = crypto.randomUUID(); sessionStorage.setItem('hwnix_checkout_key', key) }
  return key
}

export function finishCheckoutAttempt() { sessionStorage.removeItem('hwnix_checkout_key') }

export function safeStoreRedirect(value, fallback = '/store') {
  return typeof value === 'string' && value.startsWith('/store') && !value.startsWith('//')
    && !/[\\\r\n]/.test(value) ? value : fallback
}

export function paymentRedirect(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('رابط الدفع المستلم غير صالح.')
  window.location.assign(url.href)
}

export function formatStoreMoney(value, currency = 'EGP') {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value || 0))
}
