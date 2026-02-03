import { ref, onUnmounted } from 'vue';

export function useWorker(workerUrl) {
  const worker = ref(null);
  const loading = ref(false);
  const result = ref(null);
  const error = ref(null);

  function init() {
    if (!worker.value) {
      worker.value = new Worker(workerUrl, { type: 'module' });

      worker.value.onerror = e => {
        error.value = e;
        loading.value = false;
        console.error('Worker error:', e);
      };
    }
  }

  function postMessage(payload) {
    init();
    loading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      const handler = e => {
        worker.value.removeEventListener('message', handler);
        loading.value = false;

        if (e.data.type === 'SUCCESS') {
          result.value = e.data.data;
          resolve(e.data.data);
        } else {
          error.value = e.data.error;
          reject(e.data.error);
        }
      };

      worker.value.addEventListener('message', handler);
      worker.value.postMessage(payload);
    });
  }

  function terminate() {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  }

  onUnmounted(terminate);

  return {
    loading,
    result,
    error,
    postMessage,
    terminate,
  };
}
