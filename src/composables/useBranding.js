//   موجه لإدارة وجلب الهوية البصرية للشركة (الاسم والشعار والتواصل) لمشاركتها مع الصفحات العامة والخاصة.
import { ref, computed } from 'vue';
import apiClient from '@/api/axios.config';

const publicCompany = ref(JSON.parse(localStorage.getItem('public_company_branding') || 'null'));
const loading = ref(false);

export function useBranding() {
  const fetchBranding = async (force = false) => {
    if (publicCompany.value && !force) return;
    loading.value = true;
    try {
      const response = await apiClient.get('public/company');
      if (response.data && response.data.status) {
        publicCompany.value = response.data.data;
        localStorage.setItem('public_company_branding', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Failed to fetch public company branding:', error);
    } finally {
      loading.value = false;
    }
  };

  const logoUrl = computed(() => {
    return publicCompany.value?.logo || '';
  });

  const companyName = computed(() => {
    return publicCompany.value?.name || 'HWNiX';
  });

  const tagline = computed(() => {
    return 'الثقة في كل اختيار';
  });

  return {
    publicCompany,
    loading,
    fetchBranding,
    logoUrl,
    companyName,
    tagline,
  };
}
