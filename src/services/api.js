import axios from 'axios';
import { serialize } from 'object-to-formdata';
import { useUserStore } from '@/stores/user';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import router from '@/router';
import translateErrors from '@/utils/translateErrors';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://bill-api.hwnix.com/api/' : 'http://127.0.0.1:8000/api/',
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
    'If-None-Match': '',
  },
});

const options = {
  allowEmptyArrays: true,
  indices: true,
};

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401 || error?.response?.data?.message === 'Unauthenticated.') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log('Redirecting to login...');
      router.push({ name: 'login', query: { sessionExpired: '1' } });

      // return Promise.reject(error);
    }
    if (error?.response?.status === 403 || error?.response?.data?.message === 'Forbidden' || error?.response?.data?.message === 'Unauthorized') {
      toast.error('ليس لديك صلاحية للوصول إلى هذا المورد.');
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// تم تعديل الدالة لتقبل showToast
const handleSuccess = (response, log, userStore, loading, type, showToast) => {
  const resData = response.data;

  if (log) console.log(`${type}: ✅`, resData);
  if (loading) userStore.loadingApi = false;
  if (showToast && resData.message) toast.success(resData.message);

  // ✅ تجهيز النتيجة بشكل متوافق مع v-data-table-server
  let normalized = {
    data: [],
    total: 0,
    message: resData.message ?? '',
    status: resData.status ?? true,
  };

  if (resData.hasOwnProperty('total')) {
    // حالة الباجينيشن أو per_page=-1
    normalized.data = resData.data ?? [];
    normalized.total = resData.total ?? normalized.data.length;
  } else if (Array.isArray(resData.data)) {
    // حالة إرجاع مصفوفة فقط
    normalized.data = resData.data;
    normalized.total = resData.data.length;
  } else if (resData.data) {
    // حالة Single Resource
    normalized.data = [resData.data];
    normalized.total = 1;
  } else if (Array.isArray(resData)) {
    // حالة API بيرجع Array مباشر
    normalized.data = resData;
    normalized.total = resData.length;
  }

  if (log) console.log(`${type} normalized:`, normalized);

  return normalized;
};

// تم تعديل الدالة لتقبل showToast
const handleError = (error, log, userStore, loading, type, showToast) => {
  if (error?.response?.status === 401) return;
  log ? console.log(`${type}: ❌`, error.response || error) : '';
  loading ? (userStore.loadingApi = false) : '';
  console.log(`${type}: ❌`, error);

  let errorMessage = 'حدث خطأ غير متوقع';

  if (error.response && error.response.data) {
    if (error.response.data.errors.length) {
      console.log('if (error.response.data.errors.length)');
      errorMessage = translateErrors(error.response.data.errors);
    } else if (error.response.data.message) {
      console.log('else if (error.response.data.message)', errorMessage);
      errorMessage = error.response.data.message;
    }
  } else if (error.response.message) {
    console.log('else if error.response.message');
    errorMessage = error.response.message;
  }
  if (showToast) {
    // تحقق من showToast
    toast.error(errorMessage, { autoClose: 7000 });
  }
  throw error;
};

// تم تعديل الدوال لإضافة معامل showToast
export const getAll = async (apiEndpoint, params = null, loading = true, showToast = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  try {
    const response = await apiClient.get(apiEndpoint, { params: params });
    return handleSuccess(response, log, userStore, loading, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, log, userStore, loading, apiEndpoint, showToast);
  }
};

export const getOne = async (apiEndpoint, id, options = {}) => {
  // استخدام التفكيك لتعيين قيم افتراضية للخيارات
  const { full = false, loading = true, showToast = false, log = false } = options;

  const userStore = useUserStore();
  try {
    loading ? (userStore.loadingApi = true) : '';
    const response = await apiClient.get(`${apiEndpoint}/${id}?basic=${basic}`);
    loading ? (userStore.loadingApi = true) : ''; // ملاحظة: هذا السطر مكرر، قد تحتاج لمراجعته
    return handleSuccess(response, log, userStore, loading, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, log, userStore, loading, apiEndpoint, showToast);
  }
};

export const saveItem = async (apiEndpoint, data, id = false, loading = true, showToast = true, log = false) => {
  console.log('saveItem called with:', { apiEndpoint, data, id });
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  // const formData = serialize(data, options);

  try {
    let response;
    // تحقق هل فيه صورة
    const shouldUseFormData = apiEndpoint === 'image';
    console.log('shouldUseFormData', shouldUseFormData);

    // لو فيه صورة، نحول البيانات لـ FormData
    let finalData = shouldUseFormData ? serialize(data) : data;

    // لو تعديل، ضيف _method = put
    if (id) {
      if (shouldUseFormData) {
        finalData.append('_method', 'put');
      } else {
        finalData['_method'] = 'put';
      }

      const apiEndpointIfId = `${apiEndpoint}/${id}`;
      response = await apiClient.post(apiEndpointIfId, finalData);
    } else {
      response = await apiClient.post(apiEndpoint, finalData);
    }
    return handleSuccess(response, log, userStore, loading, `${apiEndpoint} => (${id ? 'Update' : 'Create'})`, showToast);
  } catch (error) {
    return handleError(error, log, userStore, loading, `${apiEndpoint} => (${id ? 'Update' : 'Create'})`, showToast);
  }
};

export const deleteOne = async (apiEndpoint, id, loading = true, showToast = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  try {
    const response = await apiClient.delete(`${apiEndpoint}/${id}`);
    return handleSuccess(response, log, userStore, loading, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, log, userStore, loading, apiEndpoint, showToast);
  }
};

export const updateItem = async (apiEndpoint, data, loading = true, showToast = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  try {
    const response = await apiClient.put(apiEndpoint, data);
    return handleSuccess(response, log, userStore, loading, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, log, userStore, loading, apiEndpoint, showToast);
  }
};

export const deleteAll = async (apiEndpoint, ids, loading = true, showToast = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  try {
    const response = await apiClient.post(apiEndpoint, ids);
    return handleSuccess(response, log, userStore, loading, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, log, userStore, loading, apiEndpoint, showToast);
  }
};

export const register = async (apiEndpoint, data, loading = true, showToast = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  try {
    const response = await apiClient.post(apiEndpoint, data);
    return handleSuccess(response, log, userStore, loading, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, log, userStore, loading, apiEndpoint, showToast);
  }
};

export const login = async (apiEndpoint, data, loading = true, showToast = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  try {
    const response = await apiClient.post(apiEndpoint, data);
    log ? console.log(`login: ✅`, response.data) : '';
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    loading ? (userStore.loadingApi = false) : '';
    userStore.fetchUser();
    if (showToast) {
      // تحقق من showToast
      toast.success(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    loading ? (userStore.loadingApi = false) : '';
    throw error;
  }
};

export const logOut = async (apiEndpoint, loading = true, showToast = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  try {
    const response = await apiClient.post(apiEndpoint);
    log ? console.log(`logOut: ✅`, response.data) : '';
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('products');
    loading ? (userStore.loadingApi = false) : '';
    if (showToast) {
      // تحقق من showToast
      toast.success(response.data.message);
    }
    location.reload();
    return response.data;
  } catch (error) {
    return handleError(error, log, userStore, loading, apiEndpoint, showToast);
  }
};

export const deleteItem = async (resource, id, showToast = true) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  try {
    const response = await apiClient.delete(`${resource}/${id}`);
    return handleSuccess(response, false, userStore, true, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, false, userStore, true, apiEndpoint, showToast);
  }
};

export const archiveItem = async (resource, id, showToast = true) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  try {
    const response = await apiClient.post(`${resource}/${id}/archive`);
    return handleSuccess(response, false, userStore, true, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, false, userStore, true, apiEndpoint, showToast);
  }
};

export const restoreItem = async (resource, id, showToast = true) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  try {
    const response = await apiClient.post(`${resource}/${id}/restore`);
    return handleSuccess(response, false, userStore, true, apiEndpoint, showToast);
  } catch (error) {
    return handleError(error, false, userStore, true, apiEndpoint, showToast);
  }
};
export async function getLocalPermissions(remotePermissions) {
  let permissionGroups = allPermissionsConfig => {
    if (!allPermissionsConfig) return [];

    const groups = [];
    for (const entityKey in allPermissionsConfig) {
      if (allPermissionsConfig.hasOwnProperty(entityKey)) {
        const entityData = allPermissionsConfig[entityKey];
        const groupName =
          entityData.name && entityData.name.label
            ? entityData.name.label
            : entityKey
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

        const permissionsInGroup = [];
        for (const actionKey in entityData) {
          if (entityData.hasOwnProperty(actionKey) && actionKey !== 'name') {
            // console.log(`actionKey permission: ${actionKey}`);

            permissionsInGroup.push({
              label: entityData[actionKey].label, // التسمية المعربة للصلاحية
              value: entityData[actionKey].key, // المفتاح الفعلي للصلاحية (الـ key)
            });
          }
        }
        groups.push({
          name: groupName,
          permissions: permissionsInGroup,
        });
      }
    }
    return groups;
  };

  const permissionsApi = await getAll('permissions', null, false, false, false);
  if (!Array.isArray(remotePermissions)) {
    console.error('Invalid remotePermissions data:', remotePermissions);
    return [];
  }
  console.log('permissionsApi:', permissionsApi);

  let permissionsLocal = permissionGroups(permissionsApi);
  return permissionsLocal
    .map(group => ({
      ...group,
      permissions: group.permissions.filter(permission => remotePermissions.includes(permission.value)),
    }))
    .filter(group => group.permissions.length > 0);
}

function permKey(permissionKey) {
  // تقسيم المفتاح المدخل إلى كيان (entity) وفعل (action)
  const parts = permissionKey.split('.', 2);
  const [entity, action] = parts;
  // التحقق مما إذا كان الكيان والفعل موجودين في كائن الصلاحيات
  if (permissionsApi[entity] && permissionsApi[entity][action] && permissionsApi[entity][action].key) {
    return permissionsApi[entity][action].key;
  }
}

function getPermissionKeys(permissionKeysArray) {
  const resolvedKeys = [];
  for (const key of permissionKeysArray) {
    try {
      const resolved = permKey(key);
      resolvedKeys.push(resolved);
    } catch (error) {
      console.warn(`تحذير: تم تجاهل مفتاح صلاحية غير صالح: ${key}. الخطأ: ${error.message}`);
    }
  }
  return resolvedKeys;
}

function resolvePermissionKeys(input) {
  // دالة مساعدة داخلية لاسترجاع مفتاح صلاحية واحد
  // (مماثلة لـ permKey الأصلية، ولكنها لا تُرمي خطأ هنا للتعامل المرن مع المصفوفات)
  const _getSinglePermissionKey = permissionKey => {
    const parts = permissionKey.split('.', 2);
    if (parts.length !== 2) {
      throw new Error(`Permission key '${permissionKey}' is not in the correct 'entity.action' format.`);
    }
    const [entity, action] = parts;
    if (permissionsApi[entity] && permissionsApi[entity][action] && permissionsApi[entity][action].key) {
      return permissionsApi[entity][action].key;
    }
    throw new Error(`Permission key '${permissionKey}' not found in permissions registry.`);
  };

  // التحقق مما إذا كان المدخل مصفوفة
  if (Array.isArray(input)) {
    const resolvedKeys = [];
    for (const key of input) {
      try {
        const resolved = _getSinglePermissionKey(key);
        resolvedKeys.push(resolved);
      } catch (error) {
        console.warn(`تحذير: تم تجاهل مفتاح صلاحية غير صالح في المصفوفة: ${key}. الخطأ: ${error.message}`);
      }
    }
    return resolvedKeys;
  } else if (typeof input === 'string') {
    // إذا كان المدخل سلسلة نصية واحدة، استخدم الدالة المساعدة مباشرة
    return _getSinglePermissionKey(input);
  } else {
    // إذا كان المدخل ليس سلسلة ولا مصفوفة، ارمِ خطأ
    throw new Error('Invalid input: Expected a string or an array of strings for permission keys.');
  }
}
