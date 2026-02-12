<template>
  <div id="receipt-print-area-content" :class="['installment-receipt-print', `format-${printFormat}`]">
    <!-- Header -->
    <div class="receipt-header">
      <div v-if="companyLogo" class="company-logo-container">
        <img :src="companyLogo" alt="Logo" class="company-logo" />
      </div>
      <div v-else class="company-name text-center">{{ companyName }}</div>

      <div class="receipt-title-box">إيصال تحصيل أقساط</div>
    </div>

    <!-- Main Info Table -->
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label">اسم العميل:</td>
          <td class="value font-bold">{{ customerName }}</td>
        </tr>
        <tr>
          <td class="label">رقم العملية:</td>
          <td class="value">#{{ paymentData?.id || '---' }}</td>
        </tr>
        <tr class="hero-row">
          <td class="label">المبلغ المحصل:</td>
          <td class="value total-amount">{{ formatCurrency(amountPaid) }}</td>
        </tr>
        <tr>
          <td class="label">تاريخ التحصيل:</td>
          <td class="value">{{ formatDate(paymentData?.payment_date || paymentData?.created_at) }}</td>
        </tr>
        <tr>
          <td class="label">تاريخ الاستحقاق:</td>
          <td class="value font-bold">{{ paidInstallments?.[0]?.due_date ? formatDate(paidInstallments[0].due_date) : '---' }}</td>
        </tr>
        <tr>
          <td class="label">طريقة الدفع:</td>
          <td class="value">{{ paymentMethodName }}</td>
        </tr>
        <tr v-if="paymentData?.reference_number">
          <td class="label">رقم المرجع:</td>
          <td class="value">{{ paymentData?.reference_number }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Installments Breakdown -->
    <div v-if="paidInstallments.length" class="section-title">الأقساط المسددة:</div>
    <table v-if="paidInstallments.length" class="items-table">
      <thead>
        <tr>
          <th>رقم القسط</th>
          <th class="text-left">المبلغ</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="inst in paidInstallments || []" :key="inst?.id || Math.random()">
          <tr v-if="inst">
            <td>قسط رقم #{{ inst.installment_number }}</td>
            <td class="text-left">{{ formatCurrency(inst.amount) }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Footer Summary -->
    <div class="receipt-footer">
      <table class="data-table">
        <tbody>
          <tr>
            <td class="label">المتبقي من الخطة:</td>
            <td class="value font-bold">{{ formatCurrency(remainingAmount) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="signature-section">
        <div class="signature-box">
          <p>توقيع المستلم</p>
          <div class="sig-line"></div>
        </div>
        <div class="signature-box">
          <p>توقيع العميل</p>
          <div class="sig-line"></div>
        </div>
      </div>

      <div class="footer-note">
        <p>شكراً لتعاملكم معنا</p>
        <p class="print-date">طبع بتاريخ: {{ new Date().toLocaleString('ar-EG') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  paymentData: Object,
  customerName: String,
  amountPaid: [Number, String],
  paidInstallments: Array,
  remainingAmount: [Number, String],
  paymentMethodName: String,
  companyName: String,
  companyLogo: String,
  printFormat: {
    type: String,
    default: 'thermal',
  },
});
</script>

<style scoped>
/* إعدادات الطباعة الأساسية - معزولة ومُحكمة */
.installment-receipt-print {
  direction: rtl;
  font-family: 'Arial', sans-serif;
  color: #000 !important;
  padding: 10px;
  background: white !important;
  width: 100%;
  font-weight: 900 !important;
}

.receipt-header {
  text-align: center;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.company-logo-container {
  margin-bottom: 3px;
  width: 100% !important;
  text-align: center !important;
  display: flex !important;
  justify-content: center !important;
}

.company-logo {
  max-width: 80px !important;
  max-height: 60px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  display: inline-block !important;
}

.company-name {
  font-size: 14px !important;
  font-weight: 900 !important;
  margin-bottom: 3px !important;
  text-align: center !important;
  width: 100% !important;
}

.receipt-title-box {
  font-size: 14px;
  margin: 3px 0;
  border-bottom: 2px solid #000;
  display: inline-block;
  padding: 2px 15px;
  font-weight: 900;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.data-table td {
  padding: 4px 8px;
  border-bottom: 1px solid #333;
  font-weight: 900 !important;
  font-size: 0.85rem;
}

.data-table .label {
  width: 50%;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table .value {
  text-align: left;
}

.hero-row td {
  background-color: #f0f0f0 !important;
  border-bottom: 2px solid #000 !important;
}

.total-amount {
  font-size: 16px;
  font-weight: 900;
}

.section-title {
  font-weight: 900 !important;
  margin: 8px 0 4px 0;
  text-decoration: underline;
  font-size: 0.95rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.items-table th {
  background: #ccc;
  padding: 8px;
  text-align: right;
  border: 2.5px solid #000;
  font-weight: 900 !important;
}

.items-table td {
  padding: 8px;
  border: 1.5px solid #000;
  font-weight: 900 !important;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  margin-bottom: 15px;
}

.signature-box {
  width: 45%;
  text-align: center;
}

.signature-box p {
  font-weight: 900 !important;
  margin-bottom: 25px;
  font-size: 1rem;
}

.sig-line {
  border-top: 2px solid #000;
}

.footer-note {
  text-align: center;
  margin-top: 15px;
}

.footer-note p {
  font-weight: 900 !important;
  font-size: 1rem;
  margin: 2px 0;
}

.print-date {
  font-size: 11px;
  margin-top: 10px;
  color: #333;
}

/* التنسيق للورق العادي A4 / A5 / Standard */
.installment-receipt-print.format-a4,
.installment-receipt-print.format-a5,
.installment-receipt-print.format-standard {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #eee;
  padding: 40px !important;
  min-height: 297mm;
}

.installment-receipt-print.format-a4 .company-logo,
.installment-receipt-print.format-a5 .company-logo,
.installment-receipt-print.format-standard .company-logo {
  max-width: 200px !important;
  max-height: 100px !important;
}

.installment-receipt-print.format-a4 .company-name,
.installment-receipt-print.format-a5 .company-name,
.installment-receipt-print.format-standard .company-name {
  font-size: 28px !important;
}

.installment-receipt-print.format-a4 .receipt-title-box,
.installment-receipt-print.format-a5 .receipt-title-box,
.installment-receipt-print.format-standard .receipt-title-box {
  font-size: 24px;
  padding: 5px 40px;
}

.installment-receipt-print.format-a4 .data-table td,
.installment-receipt-print.format-a5 .data-table td,
.installment-receipt-print.format-standard .data-table td {
  padding: 12px 15px;
  font-size: 1.2rem;
}

.installment-receipt-print.format-a4 .total-amount,
.installment-receipt-print.format-a5 .total-amount,
.installment-receipt-print.format-standard .total-amount {
  font-size: 30px;
}

@media print {
  .installment-receipt-print {
    padding: 0 !important;
    border: none !important;
    width: 100% !important;
  }
}
</style>
