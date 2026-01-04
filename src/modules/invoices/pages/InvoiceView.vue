<template>
  <div class="invoice-view-page">
    <Can View permission="invoices.view" show-message>
      <div class="page-header mb-6 d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold">فاتورة #{{ invoice?.invoice_number }}</h1>
          <p class="text-body-1 text-grey">{{ invoice?.type === 'sales' ? 'فاتورة بيع' : 'فاتورة شراء' }}</p>
        </div>
        
        <div class="d-flex gap-2">
          <CanView permission="invoices.update">
            <v-btn
              color="primary"
              prepend-icon="ri-edit-line"
              @click="handleEdit"
            >
              تعديل
            </v-btn>
          </CanView>
          
          <v-btn
            variant="outlined"
            prepend-icon="ri-printer-line"
            @click="handlePrint"
          >
            طباعة
          </v-btn>
          
          <v-btn
            variant="outlined"
            prepend-icon="ri-download-line"
            @click="handleDownloadPDF"
          >
            PDF
          </v-btn>
        </div>
      </div>

      <v-row>
        <!-- Invoice Details Card -->
        <v-col cols="12" md="8">
          <AppCard title="تفاصيل الفاتورة" icon="ri-file-list-line">
            <v-row class="pa-4">
              <v-col cols="12" md="6">
                <div class="detail-item">
                  <span class="text-grey">رقم الفاتورة:</span>
                  <span class="font-weight-bold">{{ invoice?.invoice_number }}</span>
                </div>
                <div class="detail-item">
                  <span class="text-grey">العميل:</span>
                  <span class="font-weight-bold">{{ invoice?.customer_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="text-grey">التاريخ:</span>
                  <span>{{ formatDate(invoice?.date) }}</span>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="detail-item">
                  <span class="text-grey">الحالة:</span>
                  <v-chip :color="getStatusColor(invoice?.status)" size="small">
                    {{ getStatusLabel(invoice?.status) }}
                  </v-chip>
                </div>
                <div class="detail-item">
                  <span class="text-grey">المبلغ الإجمالي:</span>
                  <span class="text-h6 text-success">{{ formatCurrency(invoice?.total) }}</span>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Items Table -->
            <div class="items-section pa-4">
              <h3 class="text-h6 mb-4">الأصناف</h3>
              <v-table>
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
                  <tr v-for="(item, index) in invoice?.items" :key="item.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.product_name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.price) }}</td>
                    <td>{{ formatCurrency(item.total) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <!-- Totals -->
            <div class="totals-section pa-4">
              <div class="total-row">
                <span>المجموع الفرعي:</span>
                <span>{{ formatCurrency(calculateSubtotal()) }}</span>
              </div>
              <div class="total-row">
                <span>الضريبة:</span>
                <span>{{ formatCurrency(invoice?.tax || 0) }}</span>
              </div>
              <div class="total-row">
                <span>الخصم:</span>
                <span>{{ formatCurrency(invoice?.discount || 0) }}</span>
              </div>
              <div class="total-row total">
                <span class="text-h6">الإجمالي:</span>
                <span class="text-h5 text-success">{{ formatCurrency(invoice?.total) }}</span>
              </div>
            </div>
          </AppCard>
        </v-col>

        <!-- Status & Actions -->
        <v-col cols="12" md="4">
          <AppCard title="الإجراءات" icon="ri-settings-line">
            <v-list>
              <CanView permission="invoices.update">
                <v-list-item prepend-icon="ri-mail-send-line" title="إرسال بالبريد" @click="handleEmail" />
                <v-list-item prepend-icon="ri-whatsapp-line" title="إرسال واتساب" @click="handleWhatsApp" />
              </CanView>
              <v-divider />
              <CanView permission="invoices.delete">
                <v-list-item
                  prepend-icon="ri-delete-bin-line"
                  title="حذف الفاتورة"
                  class="text-error"
                  @click="handleDelete"
                />
              </CanView>
            </v-list>
          </AppCard>

          <!-- Notes -->
          <AppCard v-if="invoice?.notes" title="ملاحظات" icon="ri-file-text-line" class="mt-4">
            <p class="pa-4">{{ invoice.notes }}</p>
          </AppCard>
        </v-col>
      </v-row>
    </CanView>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppCard } from '@/components'
import CanView from '@/components/common/CanView.vue'
import { invoiceService } from '@/api'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const invoice = ref(null)

const calculateSubtotal = () => {
  return invoice.value?.items?.reduce((sum, item) => sum + item.total, 0) || 0
}

const getStatusColor = (status) => {
  const colors = { paid: 'success', pending: 'warning', cancelled: 'error' }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = { paid: 'مدفوعة', pending: 'معلقة', cancelled: 'ملغاة' }
  return labels[status] || status
}

const handleEdit = () => {
  router.push(`/invoices/${route.params.id}/edit`)
}

const handlePrint = () => {
  window.print()
}

const handleDownloadPDF = async () => {
  try {
    await invoiceService.downloadPDF(route.params.id)
    toast.success('تم تحميل الفاتورة')
  } catch (error) {
    toast.error('فشل تحميل الفاتورة')
  }
}

const handleEmail = async () => {
  try {
    await invoiceService.sendEmail(route.params.id)
    toast.success('تم إرسال الفاتورة بالبريد')
  } catch (error) {
    toast.error('فشل إرسال الفاتورة')
  }
}

const handleWhatsApp = () => {
  const message = `فاتورة رقم: ${invoice.value.invoice_number}\nالمبلغ: ${formatCurrency(invoice.value.total)}`
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

const handleDelete = async () => {
  if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
    try {
      await invoiceService.delete(route.params.id)
      toast.success('تم حذف الفاتورة')
      router.push('/invoices')
    } catch (error) {
      toast.error('فشل حذف الفاتورة')
    }
  }
}

onMounted(async () => {
  try {
    const response = await invoiceService.getOne(route.params.id)
    invoice.value = response.data[0]
  } catch (error) {
    toast.error('فشل تحميل الفاتورة')
    router.push('/invoices')
  }
})
</script>

<style scoped>
.invoice-view-page {
  padding: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.total-row.total {
  border-top: 2px solid #ddd;
  margin-top: 8px;
  padding-top: 16px;
}
</style>
