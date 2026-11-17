import apiClient from '@/api/axios.config';

// Build a relative API path from the job ID. Never attach credentials to a supplied URL.
export async function downloadProductExport(jobId) {
  if (!/^\d+$/.test(String(jobId)) || Number(jobId) <= 0) throw new Error('Invalid export job');
  const response = await apiClient.get(`export-import/download/${jobId}`, {
    responseType: 'blob',
    handleErrorsLocally: true,
  });
  if (!(response.data instanceof Blob) || response.data.size === 0) throw new Error('Empty export');

  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `products_export_${jobId}.csv`;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Give mobile browsers time to consume the Blob before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
