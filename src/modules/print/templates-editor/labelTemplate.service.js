import api from '@/api/axios.config';

export const labelTemplateService = {
  list: async (publishedOnly = false, includeArchived = false) =>
    (await api.get('label-templates', { params: { published_only: publishedOnly ? 1 : 0, include_archived: includeArchived ? 1 : 0 } })).data,
  fields: async () => (await api.get('label-templates/fields')).data,
  products: async params => (await api.get('label-templates/products', { params })).data.data,
  get: async id => (await api.get(`label-templates/${id}`)).data.data,
  create: async payload => (await api.post('label-templates', payload)).data.data,
  save: async (id, payload) => (await api.put(`label-templates/${id}`, payload)).data.data,
  publish: async (id, lockVersion) => (await api.post(`label-templates/${id}/publish`, { lock_version: lockVersion })).data.data,
  duplicate: async (id, payload = {}) => (await api.post(`label-templates/${id}/duplicate`, payload)).data.data,
  metadata: async (id, payload) => (await api.patch(`label-templates/${id}/metadata`, payload)).data.data,
  restore: async (id, revisionId, lockVersion) =>
    (await api.post(`label-templates/${id}/restore`, { revision_id: revisionId, lock_version: lockVersion })).data.data,
  setDefault: async id => (await api.patch(`label-templates/${id}/default`)).data.data,
  archive: async (id, lockVersion, replacementId) =>
    api.delete(`label-templates/${id}`, { data: { lock_version: lockVersion, replacement_id: replacementId } }),
  prepare: async payload => (await api.post('label-print-data', payload)).data.data,
  preview: async payload => (await api.post('label-template-preview-data', payload)).data.data,
  upload: async file => {
    const form = new FormData();
    form.append('file', file);
    return (await api.post('label-templates/assets', form)).data.data;
  },
  asset: async id => (await api.get(`label-templates/assets/${id}`, { responseType: 'blob' })).data,
};

export const labelError = error =>
  error?.response?.data?.message || Object.values(error?.response?.data?.errors || {}).flat()[0] || error?.message || 'تعذر إكمال العملية.';
