<template>
  <div id="plan-print-area-content" :class="['installment-plan-print', `format-${printFormat}`]">
    <!-- Header -->
    <div class="header-section">
      <div v-if="companyLogo" class="logo-box">
        <img :src="companyLogo" alt="Logo" class="company-logo" />
      </div>
      <div v-else class="company-name">{{ companyName }}</div>
      <div class="document-title">عقد وخطة تقسيط مالي</div>
    </div>

    <!-- Parties Info -->
    <div class="info-grid mb-6">
      <div class="info-column">
        <div class="section-label">بيانات الطرف الأول (الشركة)</div>
        <p><strong>الاسم:</strong> {{ companyName }}</p>
        <p v-if="companyAddress"><strong>العنوان:</strong> {{ companyAddress }}</p>
        <p v-if="companyPhone"><strong>الهاتف:</strong> {{ companyPhone }}</p>
      </div>
      <div class="info-column">
        <div class="section-label">بيانات الطرف الثاني (العميل)</div>
        <p><strong>الاسم:</strong> {{ customerName }}</p>
        <p v-if="customerPhone"><strong>الهاتف:</strong> {{ customerPhone }}</p>
        <p><strong>رقم الفاتورة:</strong> #{{ planData?.invoice?.invoice_number || '---' }}</p>
      </div>
    </div>

    <!-- Contract Details (Fixed Data) -->
    <div class="section-label">تفاصيل التعاقد المالي</div>
    <table class="contract-table mb-6">
      <tbody>
        <tr>
          <td class="label">قيمة المشتريات (الصافي):</td>
          <td class="value">{{ formatCurrency(planData?.net_amount) }}</td>
          <td class="label">نسبة الفائدة السنوية:</td>
          <td class="value">{{ planData?.interest_rate }}%</td>
        </tr>
        <tr>
          <td class="label">إجمالي مبلغ الفائدة:</td>
          <td class="value font-bold text-error">{{ formatCurrency(planData?.interest_amount) }}</td>
          <td class="label">المبلغ الإجمالي بالعقد:</td>
          <td class="value highlight">{{ formatCurrency(planData?.total_amount) }}</td>
        </tr>
        <tr>
          <td class="label">الدفع المقدم (كاش):</td>
          <td class="value text-success font-bold">{{ formatCurrency(planData?.down_payment) }}</td>
          <td class="label">المبلغ المتبقي للتقسيط:</td>
          <td class="value">{{ formatCurrency(parseFloat(planData?.total_amount) - parseFloat(planData?.down_payment)) }}</td>
        </tr>
        <tr>
          <td class="label">عدد الأقساط:</td>
          <td class="value">{{ planData?.number_of_installments }} قسط</td>
          <td class="label">قيمة القسط الثابت:</td>
          <td class="value font-bold text-primary">{{ formatCurrency(planData?.installment_amount) }}</td>
        </tr>
        <tr>
          <td class="label">تاريخ بدء السداد:</td>
          <td class="value">{{ formatDate(planData?.start_date) }}</td>
          <td class="label">دورية السداد:</td>
          <td class="value">{{ getFrequencyLabel(planData?.frequency) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Financial Progress (Variable Data) -->
    <div class="section-label">الموقف المالي الحالي</div>
    <table class="status-table mb-6">
      <tbody>
        <tr class="status-row">
          <td class="label">إجمالي المحصل الفعلي:</td>
          <td class="value text-success font-bold">{{ formatCurrency(planData?.total_pay) }}</td>
          <td class="label">المتبقي المطلوب سداده:</td>
          <td class="value text-error font-bold">{{ formatCurrency(planData?.remaining_amount) }}</td>
          <td class="label">نسبة التقدم:</td>
          <td class="value">{{ Math.ceil(planData?.payment_progress || 0) }}%</td>
        </tr>
      </tbody>
    </table>

    <!-- Installments Schedule -->
    <div class="section-label">جدول الأقساط التفصيلي</div>
    <table class="schedule-table">
      <thead>
        <tr>
          <th>م</th>
          <th>تاريخ الاستحقاق</th>
          <th class="text-left">قيمة القسط</th>
          <th class="text-left">المتبقي</th>
          <th class="text-center">الحالة</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(inst, index) in planData?.installments" :key="inst.id">
          <td class="text-center">{{ index + 1 }}</td>
          <td>{{ formatDate(inst.due_date) }}</td>
          <td class="text-left">{{ formatCurrency(inst.amount) }}</td>
          <td class="text-left">{{ formatCurrency(inst.remaining) }}</td>
          <td class="text-center">
            <span :class="getStatusClass(inst.status)">{{ getStatusLabel(inst.status) }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Signatures -->
    <div class="signature-section mt-12">
      <div class="sig-box">
        <p>توقيع الطرف الأول (الشركة)</p>
        <div class="space-for-sig"></div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <p>توقيع الطرف الثاني (العميل)</p>
        <div class="space-for-sig"></div>
        <div class="sig-line"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-note">
      <p>هذا المستند يعتبر عقداً ملزماً للطرفين ويعبر عن المديونية الفعلية وقت الطباعة.</p>
      <div class="print-meta">طُبع في: {{ new Date().toLocaleString('ar-EG') }} | هوينكس بيل</div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  planData: Object,
  customerName: String,
  customerPhone: String,
  companyName: String,
  companyLogo: String,
  companyAddress: String,
  companyPhone: String,
  printFormat: {
    type: String,
    default: 'a4',
  },
});

const getFrequencyLabel = freq => {
  const map = { monthly: 'شهرياً', weekly: 'أسبوعياً', daily: 'يومياً' };
  return map[freq] || freq;
};

const getStatusLabel = status => {
  const map = { paid: 'مدفوع', pending: 'معلق', partially_paid: 'مدفوع جزئياً', canceled: 'ملغي', overdue: 'متأخر' };
  return map[status] || status;
};

const getStatusClass = status => {
  if (status === 'paid') return 'text-success font-bold';
  if (status === 'overdue') return 'text-error font-bold underline';
  if (status === 'pending') return 'text-grey';
  return '';
};
</script>

<style scoped>
.installment-plan-print {
  direction: rtl;
  font-family: 'Arial', 'Cairo', sans-serif;
  color: #000;
  background: #fff;
  padding: 20px;
  line-height: 1.6;
}

.header-section {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 3px double #000;
  padding-bottom: 15px;
}

.logo-box img {
  max-height: 80px;
  margin-bottom: 5px;
}

.company-name {
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 5px;
}

.document-title {
  font-size: 18px;
  font-weight: 900;
  display: inline-block;
  padding: 5px 30px;
  border: 2px solid #000;
  background: #f0f0f0;
}

.info-grid {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.info-column {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.section-label {
  font-weight: 900;
  background: #000;
  color: #fff;
  padding: 4px 10px;
  margin-bottom: 8px;
  display: block;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

.contract-table td,
.status-table td {
  padding: 6px 10px;
  border: 1px solid #000;
  font-size: 13px;
}

.contract-table .label,
.status-table .label {
  background: #f9f9f9;
  font-weight: bold;
  width: 20%;
}

.contract-table .value,
.status-table .value {
  width: 30%;
}

.highlight {
  background: #eee;
  font-weight: 900;
  font-size: 15px;
}

.status-row td {
  padding: 10px;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid #000;
  padding: 6px;
  font-size: 12px;
}

.schedule-table th {
  background: #eee;
  font-weight: 900;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
}

.sig-box {
  width: 40%;
  text-align: center;
}

.space-for-sig {
  height: 60px;
}

.sig-line {
  border-top: 1px solid #000;
}

.footer-note {
  margin-top: 30px;
  text-align: center;
  border-top: 1px solid #ccc;
  padding-top: 10px;
  font-size: 11px;
}

.print-meta {
  margin-top: 5px;
  color: #666;
}

.mb-6 {
  margin-bottom: 24px;
}
.mt-12 {
  margin-top: 48px;
}
.text-success {
  color: #2e7d32;
}
.text-error {
  color: #d32f2f;
}
.text-primary {
  color: #1976d2;
}
.font-bold {
  font-weight: bold;
}
.font-900 {
  font-weight: 900;
}
.underline {
  text-decoration: underline;
}

/* Thermal Format Adjustments */
.format-thermal {
  width: 80mm;
  padding: 5px;
  font-size: 11px;
}

.format-thermal .info-grid {
  flex-direction: column;
}

.format-thermal .contract-table td,
.format-thermal .status-table td {
  display: block;
  width: 100%;
  border: none;
  border-bottom: 1px dotted #ccc;
}

.format-thermal .contract-table .label {
  background: transparent;
  padding-top: 8px;
}

.format-thermal .signature-section {
  flex-direction: column;
  gap: 30px;
}

.format-thermal .sig-box {
  width: 100%;
}

@media print {
  .installment-plan-print {
    padding: 0 !important;
  }
}
</style>
