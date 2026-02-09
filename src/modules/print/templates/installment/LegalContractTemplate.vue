<template>
  <div id="legal-contract-area" :class="['legal-contract-print', 'format-a4']">
    <!-- Watermark -->
    <div v-if="companyLogo" class="watermark-container">
      <img :src="companyLogo" class="watermark-logo" />
    </div>

    <div class="contract-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-main">
          <img v-if="companyLogo" :src="companyLogo" class="company-logo" />
          <div class="company-info-text">
            <div class="company-name">{{ companyName }}</div>
            <div class="document-title">عقد بيع بالتقسيط</div>
          </div>
        </div>
        <div class="contract-meta">رقم العقد: #{{ planData?.id }} | التاريخ: {{ formatDate(new Date()) }}</div>
      </div>

      <!-- Parties -->
      <div class="contract-intro">
        إقرار من الطرفين بأهليتهما القانونية المعتبرة شرعاً ونظاماً للتعاقد، فقد اتفقا على ما يلي:
        <br />
        <strong>الطرف الأول (البائع):</strong> {{ companyName }} ومقره {{ companyAddress || '---' }} هاتف: {{ companyPhone || '---' }}
        <br />
        <strong>الطرف الثاني (المشتري):</strong> السيد/ {{ customerName }} هاتف: {{ customerPhone || '---' }}
      </div>

      <!-- Section: Subject -->
      <div class="section-label">البند الأول: موضوع العقد</div>
      <div class="clause-item">
        باع وأسقط وتنازل الطرف الأول (البائع) بموجب هذا العقد وبكافة الضمانات القانونية إلى الطرف الثاني (المشتري) القابل بذلك، وهي المنتجات الموضحة
        أدناه والتابعة للفاتورة رقم ({{ planData?.invoice?.invoice_number || '---' }}):
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>البيان (المنتج)</th>
            <th class="text-center" width="80">الكمية</th>
            <th class="text-left" width="120">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in planData?.invoice_items || []" :key="item.id">
            <td>{{ item.name }}</td>
            <td class="text-center">{{ item.quantity }}</td>
            <td class="text-left font-bold">{{ formatCurrency(item.total) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Section: Financials -->
      <div class="section-label">البند الثاني: الثمن وطريقة السداد</div>
      <div class="clause-item">
        تم هذا البيع برضاء وقبول الطرفين بثمن إجمالي قدره ({{ formatCurrency(planData?.total_amount) }}). وقد سدد المشتري مبلغا وقدره ({{
          formatCurrency(planData?.down_payment)
        }}) كدفعة مقدمة "كاش"، والمبلغ المتبقي وقدره ({{ formatCurrency(parseFloat(planData?.total_amount) - parseFloat(planData?.down_payment)) }})
        يتم سداده على ({{ planData?.number_of_installments }}) قسطاً دورياً يُدفع **{{ getFrequencyLabel(planData?.frequency) }}** بواقع ({{
          formatCurrency(planData?.installment_amount)
        }}) لكل قسط.
      </div>

      <!-- Section: Legal Clauses -->
      <div class="section-label">البند الثالث: الشروط والأحكام القانونية</div>
      <div class="clause-item">
        <span class="clause-number">١-</span> يقر الطرف الثاني (المشتري) عياناً استلامه للمنتجات المذكورة بالحالة التي تم الاتفاق عليها، وأنها خالية
        من أي عيوب ظاهرة.
      </div>
      <div class="clause-item">
        <span class="clause-number">٢-</span> يلتزم الطرف الثاني بسداد الأقساط في مواعدها المحددة في جدول السداد المرفق دون تأخير أو تسويف.
      </div>
      <div class="clause-item">
        <span class="clause-number">٣-</span> في حالة تخلف الطرف الثاني عن سداد قسطين متتاليين، تصبح باقي الأقساط مستحقة الأداء فوراً، وللطرف الأول
        الحق في اتخاذ الإجراءات القانونية اللازمة.
      </div>
      <div class="clause-item">
        <span class="clause-number">٤-</span> تظل المنتجات المبيعة في حوزة المشتري كأمانة ولا يحق له التصرف فيها بالبيع أو الرهن إلا بعد سداد كامل
        الثمن.
      </div>
      <div class="clause-item">
        <span class="clause-number">٥-</span> في حال حدوث نزاع - لا قدر الله - تختص المحاكم الواقعة في مقر الطرف الأول بالنظر فيه.
      </div>

      <!-- Signatures -->
      <div class="signature-section">
        <div class="sig-box">
          <p><strong>توقيع الطرف الأول (البائع)</strong></p>
          <div class="sig-line"></div>
          <p class="text-xs">{{ companyName }}</p>
        </div>
        <div class="sig-box">
          <p><strong>توقيع الطرف الثاني (المشتري)</strong></p>
          <div class="sig-line"></div>
          <div class="thumb-box">بصمة الإبهام</div>
          <p class="text-xs">{{ customerName }}</p>
        </div>
      </div>

      <div class="footer-meta">تم تحرير هذا العقد من نسختين، بيد كل طرف نسخة للعمل بموجبها. | طُبع بواسطة هوينكس بيل</div>
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
</script>

<style scoped>
/* التنسيقات تُدار عبر legalContract.print.css */
</style>
