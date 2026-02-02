<template>
  <div id="invoice-print-area-content" :class="['invoice-print', `format-${printFormat}`]">
    <!-- Header -->
    <div class="invoice-header">
      <div v-if="companyLogo" class="company-logo-container">
        <img :src="companyLogo" alt="Logo" class="company-logo" />
      </div>
      <div v-else class="company-name text-center">{{ companyName }}</div>

      <div class="invoice-title-box">فاتورة {{ invoiceTypeName }}</div>
    </div>

    <!-- Main Info Table -->
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label">رقم الفاتورة:</td>
          <td class="value font-bold">#{{ invoiceNumber }}</td>
        </tr>
        <tr>
          <td class="label">اسم العميل:</td>
          <td class="value font-bold">{{ customerName }}</td>
        </tr>
        <tr v-if="customerPhone">
          <td class="label">رقم الهاتف:</td>
          <td class="value">{{ customerPhone }}</td>
        </tr>
        <tr>
          <td class="label">تاريخ الإصدار:</td>
          <td class="value">{{ formatDate(issueDate) }}</td>
        </tr>
        <tr v-if="dueDate">
          <td class="label">تاريخ الاستحقاق:</td>
          <td class="value font-bold">{{ formatDate(dueDate) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Items Breakdown -->
    <div v-if="items.length" class="section-title">أصناف الفاتورة:</div>
    <table v-if="items.length" class="items-table">
      <thead>
        <tr>
          <th>المنتج</th>
          <th class="text-center">الكمية</th>
          <th class="text-left">السعر</th>
          <th class="text-left">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in items" :key="item.id">
          <tr v-if="item">
            <td>{{ item.name }}</td>
            <td class="text-center">{{ item.quantity }}</td>
            <td class="text-left">{{ formatCurrency(item.unit_price) }}</td>
            <td class="text-left">{{ formatCurrency(item.total) }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Financial Summary -->
    <div class="invoice-footer">
      <table class="data-table">
        <tbody>
          <tr>
            <td class="label">المجموع الإجمالي (قبل الخصم):</td>
            <td class="value">{{ formatCurrency(grossAmount) }}</td>
          </tr>
          <tr v-if="totalDiscount > 0">
            <td class="label">الخصم:</td>
            <td class="value text-error">-{{ formatCurrency(totalDiscount) }}</td>
          </tr>
          <tr class="hero-row">
            <td class="label">صافي الفاتورة:</td>
            <td class="value font-bold text-primary">{{ formatCurrency(netAmount) }}</td>
          </tr>
          <tr>
            <td class="label">رصيد العميل قبل:</td>
            <td class="value" :class="parseFloat(previousBalance) < 0 ? 'text-error' : 'text-success'">
              {{ formatCurrency(previousBalance) }}
            </td>
          </tr>
          <tr class="hero-row">
            <td class="label">إجمالي المستحق:</td>
            <td class="value font-bold">{{ formatCurrency(totalRequired) }}</td>
          </tr>
          <tr>
            <td class="label">ما تم تحصيله:</td>
            <td class="value text-success font-bold">{{ formatCurrency(paidAmount) }}</td>
          </tr>
          <tr>
            <td class="label">المبلغ المتبقي:</td>
            <td class="value font-bold" :class="parseFloat(remainingAmount) > 0 ? 'text-error' : 'text-grey'">
              {{ formatCurrency(remainingAmount) }}
            </td>
          </tr>
          <tr class="hero-row">
            <td class="label">رصيد العميل بعد:</td>
            <td class="value font-bold text-primary">{{ formatCurrency(userBalanceAfter || 0) }}</td>
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
        <p>{{ PRINT_CONFIG.STRINGS.THANK_YOU }}</p>
        <p class="print-date">{{ PRINT_CONFIG.STRINGS.PRINTED_AT }}: {{ new Date().toLocaleString('ar-EG') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PRINT_CONFIG } from '@/modules/print/core/printConfig';

const props = defineProps({
  // Invoice basic info
  invoiceNumber: String,
  invoiceTypeName: String,
  issueDate: String,
  dueDate: String,

  // Customer info
  customerName: String,
  customerPhone: String,

  // Financial data
  grossAmount: [Number, String],
  netAmount: [Number, String],
  paidAmount: [Number, String],
  remainingAmount: [Number, String],
  totalDiscount: [Number, String],
  previousBalance: [Number, String],
  totalRequired: [Number, String],
  userBalanceAfter: [Number, String],

  // Items
  items: {
    type: Array,
    default: () => [],
  },

  // Company/Print settings
  companyName: String,

  companyLogo: String,
  printFormat: {
    type: String,
    default: 'thermal',
  },
});
</script>

<style scoped>
/* Styles imported from invoiceStyles.ts via TemplateRegistry */
</style>
