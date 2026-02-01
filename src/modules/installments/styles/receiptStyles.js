export const receiptStyles = `
/* إعدادات الطباعة الأساسية - معزولة لتجنب التأثير على المشروع */
.installment-receipt-print {
  direction: rtl;
  font-family: 'Arial', sans-serif;
  color: #000 !important;
  padding: 10px;
  background: white !important;
  width: 100%;
  font-weight: 950 !important;
}

.installment-receipt-print .receipt-header {
  text-align: center;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.installment-receipt-print .company-logo-container {
  margin-bottom: 3px;
  width: 100% !important;
  text-align: center !important;
  display: flex !important;
  justify-content: center !important;
}

.installment-receipt-print .company-logo {
  max-width: 80px !important;
  max-height: 60px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  display: inline-block !important;
}

.installment-receipt-print .company-name {
  font-size: 14px !important;
  font-weight: 950 !important;
  margin-bottom: 3px !important;
  text-align: center !important;
  width: 100% !important;
}

.installment-receipt-print .receipt-title-box {
  font-size: 14px;
  margin: 3px 0;
  border-bottom: 2px solid #000;
  display: inline-block;
  padding: 2px 15px;
  font-weight: 950;
}

.installment-receipt-print .data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.installment-receipt-print .data-table td {
  padding: 4px 8px;
  border-bottom: 1px solid #333;
  font-weight: 950 !important;
  font-size: 0.85rem;
}

.installment-receipt-print .data-table .label {
  width: 50%;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.installment-receipt-print .data-table .value {
  text-align: left;
}

.installment-receipt-print .hero-row td {
  background-color: #f0f0f0 !important;
  border-bottom: 2px solid #000 !important;
}

.installment-receipt-print .total-amount {
  font-size: 16px;
  font-weight: 950;
}

.installment-receipt-print .section-title {
  font-weight: 950 !important;
  margin: 8px 0 4px 0;
  text-decoration: underline;
  font-size: 0.95rem;
}

.installment-receipt-print .items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.installment-receipt-print .items-table th {
  background: #ccc;
  padding: 8px;
  text-align: right;
  border: 2.5px solid #000;
  font-weight: 950 !important;
}

.installment-receipt-print .items-table td {
  padding: 8px;
  border: 1.5px solid #000;
  font-weight: 950 !important;
}

.installment-receipt-print .signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  margin-bottom: 15px;
}

.installment-receipt-print .signature-box {
  width: 45%;
  text-align: center;
}

.installment-receipt-print .signature-box p {
  font-weight: 950 !important;
  margin-bottom: 25px;
  font-size: 1rem;
}

.installment-receipt-print .sig-line {
  border-top: 2px solid #000;
}

.installment-receipt-print .footer-note {
  text-align: center;
  margin-top: 15px;
}

.installment-receipt-print .footer-note p {
  font-weight: 950 !important;
  font-size: 1rem;
  margin: 2px 0;
}

.installment-receipt-print .print-date {
  font-size: 11px;
  margin-top: 10px;
  color: #333;
}

/* التنسيق للورق العادي A4 / A5 / Standard - معزول تحت الفئة الرئيسية */
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
  /* نطبق التنسيقات فقط على جسم صفحة الطباعة إذا كانت تحتوي على الكلاس الخاص بنا */
  .installment-receipt-print {
    padding: 0 !important;
    border: none !important;
    width: 100% !important;
  }
}
`;
