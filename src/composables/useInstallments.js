import { ref, computed, watch } from 'vue';
import { formatCurrency } from '@/utils/formatters';
import { useUserStore } from '@/stores/user';

export function useInstallments(initialData = {}) {
  const userStore = useUserStore();
  const defaultRate = userStore.currentCompany?.settings?.installment_interest_rate ?? 30;

  const totalAmount = ref(initialData.totalAmount || 0);
  const frequency = ref(initialData.frequency || 'monthly');

  const plan = ref({
    down_payment: initialData.plan?.down_payment || 0,
    number_of_installments: initialData.plan?.number_of_installments || 12,
    interest_rate: initialData.plan?.interest_rate ?? defaultRate,
    installment_amount: 0,
    round_step: initialData.plan?.round_step || 5,
    start_date: initialData.plan?.start_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    ...initialData.plan,
  });

  const schedule = ref([]);

  const remainingBeforeInterest = computed(() => {
    return Math.max(0, totalAmount.value - (plan.value.down_payment || 0));
  });

  const interestAmount = computed(() => {
    const annualRate = plan.value.interest_rate || 0;
    const months = plan.value.number_of_installments || 0;
    const factualRate = (annualRate / 12) * months;
    return remainingBeforeInterest.value * (factualRate / 100);
  });

  const totalWithInterest = computed(() => {
    return remainingBeforeInterest.value + interestAmount.value;
  });

  const frequencyText = computed(() => {
    const map = {
      monthly: 'شهر',
      weekly: 'أسبوع',
      biweekly: 'أسبوعين',
      quarterly: 'شهور (ربع سنوي)',
    };
    return map[frequency.value] || 'فترة';
  });

  const calculatePlan = () => {
    const roundStep = plan.value.round_step || 1;
    const remaining = totalWithInterest.value;
    const count = plan.value.number_of_installments;

    if (count > 0 && remaining > 0) {
      const avgInst = remaining / count;
      plan.value.installment_amount = Math.ceil(avgInst / roundStep) * roundStep;
    } else {
      plan.value.installment_amount = 0;
    }

    generateSchedule();
  };

  const generateSchedule = () => {
    const items = [];
    if (plan.value.number_of_installments <= 0) {
      schedule.value = [];
      return;
    }

    let remaining = totalWithInterest.value;
    const stdInst = plan.value.installment_amount;
    const count = plan.value.number_of_installments;
    let currentDate = new Date(plan.value.start_date);

    for (let i = 1; i <= count; i++) {
      if (remaining <= 0) break;
      const amount = stdInst > remaining || i === count ? remaining : stdInst;

      items.push({
        number: i,
        date: new Date(currentDate),
        amount: amount,
      });

      remaining = Math.max(0, remaining - amount);

      if (frequency.value === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
      else if (frequency.value === 'weekly') currentDate.setDate(currentDate.getDate() + 7);
      else if (frequency.value === 'biweekly') currentDate.setDate(currentDate.getDate() + 14);
      else if (frequency.value === 'quarterly') currentDate.setMonth(currentDate.getMonth() + 3);
    }

    schedule.value = items;
  };

  const scheduleSummary = computed(() => {
    if (schedule.value.length === 0) return 'أدخل البيانات للحساب';
    const count = plan.value.number_of_installments || 12;
    const firstAmount = plan.value.installment_amount;

    // Calculate last amount manually for summary if schedule is pending or to be precise
    const totalRemaining = totalWithInterest.value;
    const countMinusOne = count - 1;
    const lastAmount = totalRemaining - countMinusOne * firstAmount;

    if (lastAmount === firstAmount || count <= 1) {
      return `${count} ${frequencyText.value} بقيمة ${formatCurrency(firstAmount)}`;
    } else {
      return `${count - 1} ${frequencyText.value} بقيمة ${formatCurrency(firstAmount)} <br/> وقسط أخير بقيمة ${formatCurrency(lastAmount)}`;
    }
  });

  // Watch for changes and recalculate if needed (optional, can be called manually)
  // watch([totalAmount, frequency, plan], () => calculatePlan(), { deep: true });

  return {
    totalAmount,
    frequency,
    plan,
    schedule,
    remainingBeforeInterest,
    interestAmount,
    totalWithInterest,
    frequencyText,
    scheduleSummary,
    calculatePlan,
    generateSchedule,
  };
}
