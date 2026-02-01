import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

const isPrinting = ref(false);
const printData = ref(null);
const printType = ref('thermal'); // 'thermal', 'a4', 'a5', 'sticker'

export function usePrinter() {
  const userStore = useUserStore();

  const print = (data, type = null) => {
    // Determine type: explicitly passed > company default > thermal
    const companySettings = userStore.currentUser?.company?.print_settings;
    const finalType = type || companySettings?.print_format || 'thermal';

    printData.value = data;
    printType.value = finalType;
    isPrinting.value = true;
    console.log('[usePrinter] Print triggered:', finalType);
  };

  const closePrinter = () => {
    isPrinting.value = false;
    printData.value = null;
  };

  return {
    isPrinting,
    printData,
    printType,
    print,
    closePrinter,
  };
}
