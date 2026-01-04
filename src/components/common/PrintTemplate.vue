<template>
  <div class="print-template" :class="{ 'print-mode': isPrinting }">
    <!-- Header -->
    <div class="print-header">
      <div class="company-info">
        <h1>{{ companyName }}</h1>
        <p v-if="companyAddress">{{ companyAddress }}</p>
        <p v-if="companyPhone">هاتف: {{ companyPhone }}</p>
        <p v-if="companyEmail">{{ companyEmail }}</p>
      </div>

      <div class="invoice-info">
        <h2>{{ documentType }}</h2>
        <p><strong>رقم:</strong> {{ documentNumber }}</p>
        <p><strong>التاريخ:</strong> {{ formatDate(documentDate) }}</p>
      </div>
    </div>

    <v-divider class="my-4" />

    <!-- Customer Info -->
    <div v-if="customerInfo" class="customer-section">
      <h3>معلومات العميل</h3>
      <p><strong>الاسم:</strong> {{ customerInfo.name }}</p>
      <p v-if="customerInfo.phone"><strong>الهاتف:</strong> {{ customerInfo.phone }}</p>
      <p v-if="customerInfo.address"><strong>العنوان:</strong> {{ customerInfo.address }}</p>
    </div>

    <v-divider class="my-4" />

    <!-- Content Slot -->
    <div class="print-content">
      <slot />
    </div>

    <!-- Items Table (if provided) -->
    <div v-if="items && items.length" class="items-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>المجموع</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.price) }}</td>
            <td>{{ formatCurrency(item.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div v-if="totals" class="totals-section">
      <div class="totals-row">
        <span>المجموع الفرعي:</span>
        <span>{{ formatCurrency(totals.subtotal) }}</span>
      </div>
      <div v-if="totals.tax" class="totals-row">
        <span>الضريبة:</span>
        <span>{{ formatCurrency(totals.tax) }}</span>
      </div>
      <div v-if="totals.discount" class="totals-row">
        <span>الخصم:</span>
        <span>{{ formatCurrency(totals.discount) }}</span>
      </div>
      <div class="totals-row total">
        <span><strong>الإجمالي:</strong></span>
        <span
          ><strong>{{ formatCurrency(totals.total) }}</strong></span
        >
      </div>
    </div>

    <!-- Notes -->
    <div v-if="notes" class="notes-section">
      <h4>ملاحظات:</h4>
      <p>{{ notes }}</p>
    </div>

    <!-- Footer -->
    <div class="print-footer">
      <slot name="footer">
        <p class="text-center">شكراً لتعاملكم معنا</p>
      </slot>
    </div>

    <!-- Print Button (hidden in print) -->
    <div class="print-actions no-print">
      <v-btn color="primary" prepend-icon="ri-printer-line" @click="print"> طباعة </v-btn>

      <v-btn variant="outlined" prepend-icon="ri-close-line" @click="$emit('close')"> إغلاق </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  documentType: {
    type: String,
    default: 'فاتورة',
  },
  documentNumber: {
    type: String,
    required: true,
  },
  documentDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  companyName: {
    type: String,
    default: 'اسم الشركة',
  },
  companyAddress: {
    type: String,
    default: '',
  },
  companyPhone: {
    type: String,
    default: '',
  },
  companyEmail: {
    type: String,
    default: '',
  },
  customerInfo: {
    type: Object,
    default: null,
  },
  items: {
    type: Array,
    default: () => [],
  },
  totals: {
    type: Object,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close', 'print']);

const isPrinting = ref(false);

const print = () => {
  isPrinting.value = true;

  setTimeout(() => {
    window.print();
    isPrinting.value = false;
    emit('print');
  }, 100);
};
</script>

<style scoped>
.print-template {
  padding: 2rem;
  background: white;
  min-height: 100vh;
}

.print-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.company-info h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.invoice-info {
  text-align: right;
}

.invoice-info h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.customer-section h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.items-table {
  margin: 2rem 0;
}

.items-table table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: right;
}

.items-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.totals-section {
  max-width: 400px;
  margin-left: auto;
  margin-top: 2rem;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.totals-row.total {
  border-top: 2px solid #333;
  border-bottom: 2px solid #333;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.notes-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.print-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.print-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #ddd;
}

/* Print Styles */
@media print {
  .print-template {
    padding: 0;
  }

  .no-print,
  .print-actions {
    display: none !important;
  }

  .print-mode {
    /* Optimize for print */
  }

  .items-table th {
    background-color: #f0f0f0 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
