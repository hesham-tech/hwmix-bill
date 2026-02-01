<template>
  <div id="receipt-print-area-content" :class="['payment-receipt-print', `format-${printFormat}`]">
    <!-- Header -->
    <div class="receipt-header">
      <div v-if="companyLogo" class="company-logo-container">
        <img :src="companyLogo" alt="Logo" class="company-logo" />
      </div>
      <div v-else class="company-name text-center">{{ companyName }}</div>

      <div class="receipt-title-box">إيصال استلام نقدية</div>
    </div>

    <!-- Main Info Table -->
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label">اسم العميل:</td>
          <td class="value font-bold">{{ customerName }}</td>
        </tr>
        <tr>
          <td class="label">رقم الإيصال:</td>
          <td class="value">#{{ paymentData?.id }}</td>
        </tr>
        <tr v-if="invoiceNumber">
          <td class="label">بيان الفاتورة:</td>
          <td class="value">فاتورة رقم #{{ invoiceNumber }}</td>
        </tr>
        <tr class="hero-row">
          <td class="label">المبلغ المدفوع:</td>
          <td class="value total-amount">{{ formatCurrency(amountPaid) }}</td>
        </tr>
        <tr>
          <td class="label">تاريخ التحصيل:</td>
          <td class="value">{{ formatDate(paymentData?.payment_date || paymentData?.created_at) }}</td>
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

    <!-- Footer Summary -->
    <div class="receipt-footer">
      <table v-if="remainingBalance !== undefined" class="data-table">
        <tbody>
          <tr>
            <td class="label">المتبقي على الفاتورة:</td>
            <td class="value font-bold">{{ formatCurrency(remainingBalance) }}</td>
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
  invoiceNumber: [String, Number],
  amountPaid: [Number, String],
  remainingBalance: [Number, String],
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
.payment-receipt-print {
  direction: rtl;
  font-family: 'Arial', sans-serif;
  color: #000 !important;
  padding: 10px;
  background: white !important;
  width: 100%;
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
}

.company-name {
  font-size: 14px !important;
  font-weight: 900 !important;
  margin-bottom: 3px !important;
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
  border-bottom: 1px solid #eee;
  font-weight: 700;
  font-size: 0.85rem;
}

.hero-row td {
  background-color: #f9f9f9 !important;
  border-bottom: 2px solid #000 !important;
}

.total-amount {
  font-size: 16px;
  font-weight: 900;
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
  font-weight: 700;
  margin-bottom: 25px;
}

.sig-line {
  border-top: 1px solid #000;
}

.footer-note {
  text-align: center;
  margin-top: 15px;
}

.print-date {
  font-size: 10px;
  color: #666;
}

/* التنسيق للورق العادي A4 / A5 */
.payment-receipt-print.format-a4,
.payment-receipt-print.format-a5 {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px !important;
}
</style>
