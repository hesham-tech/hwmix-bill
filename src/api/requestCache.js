function stable(value) {
  if (value instanceof Date) return value.toISOString();
  if (value instanceof URLSearchParams) return [...value.entries()];
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}

// Cache only reference labels, never balances, stock, users or transactions.
const referenceResources = new Set(['invoice-types', 'brands', 'units', 'unit-groups']);

export function createRequestCache(transport, { ttl = 60000, now = Date.now } = {}) {
  const pending = new Map();
  const cached = new Map();
  let generation = 0;
  const clear = () => { generation++; pending.clear(); cached.clear(); };
  const adapter = async config => {
    if ((config.method || 'get').toLowerCase() !== 'get') {
      clear();
      try { return await transport(config); } finally { clear(); }
    }
    // Independent cancellation must never cancel another caller's request.
    if (config.signal || config.cancelToken || config.responseType && config.responseType !== 'json') return transport(config);
    const headers = config.headers?.toJSON?.() || config.headers || {};
    const normalizedHeaders = Object.fromEntries(Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]));
    const key = JSON.stringify([config.baseURL, config.url, stable(config.params), stable(normalizedHeaders)]);
    const resource = config.url?.replace(/^\//, '').split('?')[0];
    const isReference = referenceResources.has(resource);
    const snapshot = cached.get(key);
    if (snapshot && snapshot.until <= now()) cached.delete(key);
    if (snapshot && snapshot.until > now()) return { ...snapshot.response, config: { ...config, referenceCacheHit: true }, data: structuredClone(snapshot.response.data) };
    if (!pending.has(key)) {
      const started = generation;
      const request = Promise.resolve().then(() => transport(config)).then(response => {
        if (isReference && generation === started && response.status === 200) {
          if (cached.size >= 100) cached.delete(cached.keys().next().value);
          cached.set(key, { until: now() + ttl, response: { ...response, data: structuredClone(response.data) } });
        }
        return response;
      }).finally(() => { if (pending.get(key) === request) pending.delete(key); });
      pending.set(key, request);
    }
    const response = await pending.get(key);
    return { ...response, config, data: structuredClone(response.data) };
  };
  return { adapter, clear };
}
