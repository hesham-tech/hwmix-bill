<!--   شاشة إدارة قوالب الرسائل والإشعارات للشركة، تدعم عرض القائمة، إنشاء وتعديل وحذف القوالب مع توفير أزرار سريعة لإدراج المتغيرات الديناميكية مثل اسم العميل ورقم الفاتورة. -->
<template>
  <div class="tp-page">
    <!-- ═══════════════════════════════ TOP BAR ═══════════════════════════════ -->
    <div class="tp-topbar">
      <div class="tp-topbar-inner">
        <v-btn icon="ri-arrow-right-line" variant="text" size="small" @click="router.push({ name: 'settings' })" />
        <div class="tp-topbar-icon">
          <v-icon icon="ri-file-text-line" size="18" />
        </div>
        <div>
          <div class="tp-topbar-heading">
            قوالب الرسائل والإشعارات
            <span class="tp-count-pill">{{ templates.length }}</span>
          </div>
          <div class="tp-topbar-sub">إنشاء وتخصيص قوالب الرسائل باستخدام متغيرات ديناميكية</div>
        </div>

        <div class="tp-topbar-spacer" />

        <!-- Filters Strip -->
        <div class="tp-filters">
          <div class="tp-search-wrap">
            <v-icon icon="ri-search-line" size="14" class="tp-search-icon" />
            <input v-model="searchQuery" placeholder="بحث في القوالب..." class="tp-search-input" />
          </div>
          <div class="tp-channel-tabs">
            <button
              v-for="opt in channelOptions"
              :key="opt.value"
              class="tp-ch-tab"
              :class="{ 'tp-ch-tab--active': filterChannel === opt.value }"
              @click="filterChannel = opt.value"
            >
              <v-icon v-if="opt.icon" :icon="opt.icon" size="12" />
              {{ opt.label }}
            </button>
          </div>
          <v-btn color="primary" size="small" rounded="pill" prepend-icon="ri-add-line" class="font-weight-bold tour-templates-add" @click="openNew">
            قالب جديد
          </v-btn>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════ LAYOUT ═══════════════════════════════ -->
    <div class="tp-layout">
      <!-- ──────── LEFT: Templates List ──────── -->
      <aside class="tp-list tour-templates-list">
        <!-- Empty -->
        <div v-if="filteredTemplates.length === 0" class="tp-list-empty">
          <v-icon icon="ri-file-add-line" size="36" />
          <p>لا توجد قوالب تطابق البحث</p>
          <v-btn size="x-small" color="primary" variant="tonal" rounded="pill" @click="openNew"> أضف أول قالب </v-btn>
        </div>

        <!-- Template Cards -->
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="tp-card"
          :class="{
            'tp-card--active': selectedTemplate?.id === tpl.id,
            'tp-card--inactive': !tpl.is_active,
          }"
          @click="selectTemplate(tpl)"
        >
          <!-- Side accent -->
          <div class="tp-card-accent" :class="`tp-card-accent--${tpl.channel}`" />

          <div class="tp-card-body">
            <!-- Title Row -->
            <div class="tp-card-title-row">
              <div class="tp-ch-icon" :class="`tp-ch-icon--${tpl.channel}`">
                <v-icon :icon="getChannelIcon(tpl.channel)" size="13" />
              </div>
              <span class="tp-card-name">
                {{ tpl.name }}
                <v-chip
                  v-if="tpl.is_global"
                  color="purple"
                  size="x-small"
                  variant="flat"
                  class="ms-1 font-weight-bold"
                  style="font-size: 8px !important; height: 16px; min-width: auto; padding: 0 4px"
                  >سيستم</v-chip
                >
              </span>
              <div class="tp-card-badges">
                <span class="tp-active-dot" :class="tpl.is_active ? 'tp-active-dot--on' : 'tp-active-dot--off'" />
              </div>
            </div>

            <!-- Meta Row -->
            <div class="tp-card-meta">
              <span class="tp-meta-ch" :class="`tp-meta-ch--${tpl.channel}`">{{ getChannelLabel(tpl.channel) }}</span>
              <span class="tp-meta-sep">·</span>
              <span class="tp-meta-sub">{{ tpl.subject || (tpl.channel === 'whatsapp' ? 'رسالة واتساب' : 'بدون موضوع') }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="tp-card-actions">
            <v-btn
              icon="ri-delete-bin-5-line"
              variant="text"
              color="error"
              size="x-small"
              density="compact"
              class="tp-del-btn"
              :disabled="tpl.is_global && !userStore.isAdmin"
              @click.stop="confirmDeleteTemplate(tpl)"
            />
          </div>
        </div>
      </aside>

      <!-- ──────── RIGHT: Editor ──────── -->
      <main class="tp-editor">
        <!-- No Selection -->
        <div v-if="!showEditorPanel" class="tp-editor-empty">
          <div class="tp-empty-gfx">
            <div class="tp-empty-gfx-bg" />
            <v-icon icon="ri-file-edit-line" size="38" color="primary" class="tp-empty-gfx-icon" />
          </div>
          <h3 class="tp-empty-title">اختر قالباً للتعديل</h3>
          <p class="tp-empty-desc">انقر على أي قالب من القائمة اليسرى لعرضه وتعديله، أو أنشئ قالباً جديداً الآن.</p>
          <v-btn color="primary" size="small" rounded="pill" prepend-icon="ri-add-line" class="font-weight-bold mt-2" @click="openNew">
            إنشاء قالب جديد
          </v-btn>
        </div>

        <!-- Editor Form -->
        <template v-else>
          <!-- Editor Top Bar -->
          <div class="tp-editor-header">
            <div class="d-flex align-center gap-2">
              <div class="tp-editor-mode-badge" :class="isEdit ? 'tp-mode-edit' : 'tp-mode-new'">
                <v-icon :icon="isEdit ? 'ri-edit-box-line' : 'ri-add-circle-line'" size="14" />
                {{ isEdit ? (isFormDisabled ? 'عرض القالب (للقراءة فقط)' : 'تعديل قالب') : 'قالب جديد' }}
              </div>
              <span v-if="isEdit" class="tp-editor-name">{{ formData.name }}</span>
            </div>
            <div class="d-flex align-center gap-3">
              <div class="tp-active-toggle">
                <span class="tp-active-toggle-label" :class="formData.is_active ? 'tp-active-toggle-label--on' : 'tp-active-toggle-label--off'">
                  {{ formData.is_active ? 'نشط' : 'معطّل' }}
                </span>
                <v-switch v-model="formData.is_active" color="success" hide-details inset density="compact" :disabled="isFormDisabled" />
              </div>
              <v-btn icon="ri-close-line" variant="text" size="small" density="compact" @click="closeEditor" />
            </div>
          </div>

          <!-- Scrollable Form -->
          <div class="tp-form-scroll">
            <v-form ref="formRef" v-model="formValid">
              <!-- Section: Basic Info -->
              <div class="tp-form-section tour-templates-form-info">
                <div class="tp-section-label">
                  <v-icon icon="ri-information-line" size="13" />
                  معلومات القالب
                </div>
                <div class="tp-form-grid">
                  <AppInput
                    v-model="formData.name"
                    label="اسم القالب *"
                    placeholder="مثال: تذكير فاتورة متأخرة"
                    required
                    density="compact"
                    :disabled="isFormDisabled"
                  />
                  <v-select
                    v-model="formData.channel"
                    :disabled="isFormDisabled"
                    :items="formDataChannelOptions"
                    item-title="label"
                    item-value="value"
                    label="قناة الإرسال *"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'قناة الإرسال مطلوبة']"
                    required
                  />
                </div>
                <div v-if="formData.channel !== 'whatsapp'" class="mt-3">
                  <AppInput
                    v-model="formData.subject"
                    label="موضوع البريد الإلكتروني *"
                    placeholder="مثال: تنبيه بخصوص فاتورة رقم {invoice_number}"
                    required
                    density="compact"
                    :disabled="isFormDisabled"
                  />
                </div>
                <div v-if="userStore.isAdmin" class="mt-3">
                  <v-switch
                    v-model="formData.is_global"
                    label="قالب سيستم عام (يظهر لجميع الشركات)"
                    color="purple"
                    hide-details
                    density="comfortable"
                    :disabled="isFormDisabled"
                  />
                </div>
              </div>

              <!-- Section: Message Body -->
              <div class="tp-form-section">
                <div class="tp-section-label">
                  <v-icon icon="ri-chat-3-line" size="13" />
                  محتوى الرسالة
                </div>

                <!-- Variable Toolbar -->
                <div v-if="!isFormDisabled" class="tp-var-toolbar">
                  <div class="tp-var-toolbar-left">
                    <v-icon icon="ri-code-s-slash-line" size="13" color="primary" />
                    <span>متغيرات ديناميكية</span>
                  </div>
                  <div class="tp-filter-pills tour-templates-variable-filter">
                    <button
                      v-for="opt in placeholderFilterOptions"
                      :key="opt.value"
                      type="button"
                      class="tp-filter-pill"
                      :class="{ 'tp-filter-pill--active': placeholderEventFilter === opt.value }"
                      @click="placeholderEventFilter = opt.value"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>

                <!-- Placeholder Chips -->
                <div v-if="!isFormDisabled" class="tp-placeholder-grid tour-templates-variable-chips">
                  <button v-for="ph in filteredPlaceholders" :key="ph.tag" type="button" class="tp-ph-chip" @click="insertPlaceholder(ph.tag)">
                    {{ ph.label }}
                  </button>
                </div>

                <!-- Textarea -->
                <v-textarea
                  ref="bodyInputRef"
                  v-model="formData.body"
                  placeholder="اكتب محتوى الرسالة هنا... انقر على المتغيرات أعلاه لإدراجها في موضع المؤشر."
                  variant="outlined"
                  rows="5"
                  :rules="[v => !!v || 'محتوى الرسالة مطلوب']"
                  required
                  density="compact"
                  class="tp-textarea"
                  :disabled="isFormDisabled"
                />
              </div>
            </v-form>
          </div>

          <!-- Form Footer -->
          <div class="tp-form-footer">
            <v-btn variant="text" size="small" color="grey" @click="closeEditor">إلغاء</v-btn>
            <v-btn
              v-if="!isFormDisabled"
              color="primary"
              size="small"
              rounded="pill"
              prepend-icon="ri-save-3-line"
              class="font-weight-bold px-5 tour-templates-save"
              :loading="saving"
              :disabled="!formValid"
              @click="saveTemplate"
            >
              {{ isEdit ? 'حفظ التعديلات' : 'إنشاء القالب' }}
            </v-btn>
          </div>
        </template>
      </main>
    </div>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="rounded-xl">
        <div class="tp-delete-dialog-header">
          <div class="tp-delete-icon">
            <v-icon icon="ri-delete-bin-5-line" size="22" />
          </div>
          <div>
            <div class="font-weight-bold text-subtitle-1">حذف القالب</div>
            <div class="text-caption text-grey-darken-1">هذا الإجراء لا يمكن التراجع عنه</div>
          </div>
        </div>
        <v-card-text class="pt-0 text-body-2 text-grey-darken-2">
          هل تريد حذف القالب <strong class="text-error">"{{ templateToDelete?.name }}"</strong> نهائياً؟ سيتوقف استخدامه في أي قواعد أتمتة حالية.
        </v-card-text>
        <v-card-actions class="d-flex justify-end gap-2 px-4 pb-4">
          <v-btn variant="text" size="small" color="grey" @click="showDeleteDialog = false">تراجع</v-btn>
          <v-btn color="error" size="small" rounded="pill" :loading="deleting" class="px-4 font-weight-bold" @click="deleteTemplate">
            حذف نهائي
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Loader -->
    <v-overlay :model-value="loading" class="align-center justify-center" persistent>
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { useTour } from '@/modules/guidance/composables/useTour';
import AppInput from '@/components/common/AppInput.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const templatesApi = useApi('/api/notification-templates');
const userStore = useUserStore();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showDeleteDialog = ref(false);
const showEditorPanel = ref(false);

// ربط الجولة الإرشادية بفتح منطقة التحرير تلقائياً لتهيئة عناصر النموذج في الدوم
const { isActive, activeTourKey } = useTour();
watch(
  [isActive, activeTourKey],
  ([active, key]) => {
    if (active && key === 'tour.notification_templates') {
      if (!showEditorPanel.value) {
        openNew();
      }
    }
  },
  { immediate: true }
);

const formValid = ref(false);
const formRef = ref(null);
const bodyInputRef = ref(null);
const isEdit = ref(false);

const searchQuery = ref('');
const filterChannel = ref('all');
const templates = ref([]);
const templateToDelete = ref(null);
const selectedTemplate = ref(null);
const placeholderEventFilter = ref('all');

const formData = ref({ id: null, name: '', channel: 'both', subject: '', body: '', is_active: true, is_global: false });

const isFormDisabled = computed(() => {
  return !!selectedTemplate.value?.is_global && !userStore.isAdmin;
});

const channelOptions = [
  { label: 'الكل', value: 'all', icon: null },
  { label: 'بريد', value: 'email', icon: 'ri-mail-line' },
  { label: 'واتساب', value: 'whatsapp', icon: 'ri-whatsapp-line' },
  { label: 'الاثنان', value: 'both', icon: 'ri-mail-send-line' },
];

const formDataChannelOptions = [
  { label: 'بريد إلكتروني فقط', value: 'email' },
  { label: 'واتساب فقط', value: 'whatsapp' },
  { label: 'البريد والواتساب معاً', value: 'both' },
];

const placeholderFilterOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'الفواتير', value: 'invoice' },
  { label: 'الدفعات', value: 'payment' },
  { label: 'المهام', value: 'task' },
  { label: 'المعاملات', value: 'transaction' },
  { label: 'المنتجات', value: 'product' },
  { label: 'الاشتراكات', value: 'subscription' },
  { label: 'الصناديق', value: 'cashbox' },
  { label: 'الأقساط', value: 'installment' },
];

const allPlaceholders = [
  { label: 'اسم العميل', tag: '{customer_name}', category: 'general' },
  { label: 'رقم هاتف العميل', tag: '{customer_phone}', category: 'general' },
  { label: 'بريد العميل', tag: '{customer_email}', category: 'general' },
  { label: 'رقم الفاتورة', tag: '{invoice_number}', category: 'invoice' },
  { label: 'قيمة الفاتورة', tag: '{invoice_amount}', category: 'invoice' },
  { label: 'المبلغ المتبقي', tag: '{remaining_amount}', category: 'invoice' },
  { label: 'تاريخ الاستحقاق', tag: '{due_date}', category: 'invoice' },
  { label: 'تاريخ الفاتورة', tag: '{invoice_date}', category: 'invoice' },
  { label: 'قيمة الدفعة', tag: '{payment_amount}', category: 'payment' },
  { label: 'تاريخ الدفع', tag: '{payment_date}', category: 'payment' },
  { label: 'عنوان المهمة', tag: '{task_title}', category: 'task' },
  { label: 'حالة المهمة', tag: '{task_status}', category: 'task' },
  { label: 'أولوية المهمة', tag: '{task_priority}', category: 'task' },
  { label: 'نسبة تقدم المهمة', tag: '{task_progress}', category: 'task' },
  { label: 'تاريخ الموعد النهائي', tag: '{task_deadline}', category: 'task' },
  { label: 'وصف المهمة', tag: '{task_description}', category: 'task' },
  { label: 'رقم المعاملة', tag: '{transaction_id}', category: 'transaction' },
  { label: 'نوع المعاملة', tag: '{transaction_type}', category: 'transaction' },
  { label: 'مبلغ المعاملة', tag: '{transaction_amount}', category: 'transaction' },
  { label: 'وصف المعاملة', tag: '{transaction_description}', category: 'transaction' },
  { label: 'تاريخ المعاملة', tag: '{transaction_date}', category: 'transaction' },
  { label: 'اسم المنتج', tag: '{product_name}', category: 'product' },
  { label: 'الرمز التعريفي (SKU)', tag: '{product_sku}', category: 'product' },
  { label: 'سعر المنتج', tag: '{product_price}', category: 'product' },
  { label: 'الكمية في المخزن', tag: '{stock_quantity}', category: 'product' },
  { label: 'قائمة المنتجات منخفضة المخزون', tag: '{low_stock_products}', category: 'product' },
  { label: 'خطة الاشتراك', tag: '{subscription_plan}', category: 'subscription' },
  { label: 'تاريخ انتهاء الاشتراك', tag: '{subscription_end_date}', category: 'subscription' },
  { label: 'الأيام المتبقية لانتهاء الاشتراك', tag: '{remaining_days}', category: 'subscription' },
  { label: 'اسم الصندوق/الخزينة', tag: '{cashbox_name}', category: 'cashbox' },
  { label: 'الرصيد الحالي للخزينة', tag: '{cashbox_balance}', category: 'cashbox' },
  { label: 'اسم خطة التقسيط', tag: '{installment_plan_name}', category: 'installment' },
  { label: 'قيمة القسط الحالي', tag: '{installment_amount}', category: 'installment' },
  { label: 'المبلغ المتبقي من القسط', tag: '{installment_remaining_amount}', category: 'installment' },
  { label: 'رقم القسط الحالي', tag: '{installment_number}', category: 'installment' },
  { label: 'تاريخ استحقاق القسط', tag: '{installment_due_date}', category: 'installment' },
  { label: 'تاريخ سداد القسط', tag: '{installment_paid_at}', category: 'installment' },
  { label: 'حالة القسط', tag: '{installment_status}', category: 'installment' },
  { label: 'رقم الفاتورة المرتبطة بالتقسيط', tag: '{installment_invoice_number}', category: 'installment' },
  { label: 'إجمالي مبلغ خطة التقسيط', tag: '{installment_plan_total}', category: 'installment' },
  { label: 'إجمالي المحصل في خطة التقسيط', tag: '{installment_plan_collected}', category: 'installment' },
  { label: 'المبلغ الإجمالي المتبقي بالخطة', tag: '{remaining_total_amount}', category: 'installment' },
  { label: 'نسبة تقدم سداد الخطة', tag: '{installment_plan_progress}', category: 'installment' },
  { label: 'عدد الأقساط الكلي', tag: '{total_installments}', category: 'installment' },
  { label: 'عدد الأقساط المدفوعة', tag: '{paid_installments}', category: 'installment' },
  { label: 'عدد الأقساط المتبقية', tag: '{remaining_installments}', category: 'installment' },
  { label: 'تاريخ بدء الأقساط', tag: '{installment_start_date}', category: 'installment' },
  { label: 'مبلغ دفعة القسط المسددة', tag: '{installment_payment_amount}', category: 'installment' },
  { label: 'تاريخ سداد دفعة القسط', tag: '{installment_payment_date}', category: 'installment' },
  { label: 'طريقة دفع دفعة القسط', tag: '{installment_payment_method}', category: 'installment' },
  { label: 'رقم مرجع دفعة القسط', tag: '{installment_payment_reference}', category: 'installment' },
];

const filteredPlaceholders = computed(() => {
  if (placeholderEventFilter.value === 'all') return allPlaceholders;
  return allPlaceholders.filter(p => p.category === 'general' || p.category === placeholderEventFilter.value);
});

const filteredTemplates = computed(() =>
  templates.value.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchChannel = filterChannel.value === 'all' || t.channel === filterChannel.value;
    return matchSearch && matchChannel;
  })
);

const getChannelLabel = ch => ({ email: 'بريد إلكتروني', whatsapp: 'واتساب', both: 'بريد + واتساب' })[ch] || ch;
const getChannelIcon = ch => ({ email: 'ri-mail-line', whatsapp: 'ri-whatsapp-line', both: 'ri-mail-send-line' })[ch] || 'ri-question-line';

const loadTemplates = async () => {
  loading.value = true;
  try {
    const response = await templatesApi.get(null, { showLoading: false, showError: false });
    templates.value = response.data || [];
  } catch (e) {
    toast.error('حدث خطأ أثناء تحميل قوالب الرسائل');
  } finally {
    loading.value = false;
  }
};

const selectTemplate = tpl => {
  selectedTemplate.value = tpl;
  openEditDialog(tpl);
};

const openNew = () => {
  selectedTemplate.value = null;
  placeholderEventFilter.value = 'all';
  isEdit.value = false;
  formData.value = { id: null, name: '', channel: 'both', subject: '', body: '', is_active: true, is_global: false };
  showEditorPanel.value = true;
};

const openEditDialog = template => {
  placeholderEventFilter.value = 'all';
  isEdit.value = true;
  formData.value = {
    id: template.id,
    name: template.name || '',
    channel: template.channel || 'both',
    subject: template.subject || '',
    body: template.body || '',
    is_active: !!template.is_active,
    is_global: !!template.is_global,
  };
  showEditorPanel.value = true;
};

const closeEditor = () => {
  showEditorPanel.value = false;
  selectedTemplate.value = null;
};

const insertPlaceholder = placeholder => {
  const textarea = bodyInputRef.value?.$el?.querySelector('textarea');
  if (textarea) {
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = formData.value.body || '';
    formData.value.body = text.substring(0, start) + placeholder + text.substring(end);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 50);
  } else {
    formData.value.body = (formData.value.body || '') + placeholder;
  }
};

const saveTemplate = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) {
    toast.error('يرجى التحقق من المدخلات.');
    return;
  }
  saving.value = true;
  try {
    if (formData.value.channel === 'whatsapp') formData.value.subject = null;
    let response;
    if (isEdit.value) {
      response = await templatesApi.update(formData.value.id, formData.value, { showLoading: false });
    } else {
      response = await templatesApi.create(formData.value, { showLoading: false });
    }
    if (response.data) {
      toast.success(isEdit.value ? 'تم تحديث القالب بنجاح' : 'تم إنشاء القالب بنجاح');
      await loadTemplates();
      if (isEdit.value && response.data) {
        selectedTemplate.value = response.data;
        openEditDialog(response.data);
      } else closeEditor();
    }
  } catch (e) {
    console.error('Save template failed', e);
  } finally {
    saving.value = false;
  }
};

const confirmDeleteTemplate = template => {
  templateToDelete.value = template;
  showDeleteDialog.value = true;
};

const deleteTemplate = async () => {
  if (!templateToDelete.value) return;
  deleting.value = true;
  try {
    const response = await templatesApi.remove(templateToDelete.value.id, { showLoading: false });
    if (response.status) {
      toast.success('تم حذف القالب بنجاح');
      showDeleteDialog.value = false;
      if (selectedTemplate.value?.id === templateToDelete.value.id) closeEditor();
      await loadTemplates();
    } else {
      toast.error(response.message || 'فشل حذف القالب');
    }
  } catch (e) {
    console.error(e);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await loadTemplates();
});
</script>

<style scoped>
/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
.tp-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px);
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 20px 0;
  gap: 12px;
  overflow: hidden;
}

/* ══════════════════════════════════════════════
   TOP BAR
══════════════════════════════════════════════ */
.tp-topbar {
  background: rgba(var(--v-theme-surface), 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  padding: 10px 16px;
  flex-shrink: 0;
}
.tp-topbar-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.tp-topbar-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.18), rgba(var(--v-theme-primary), 0.06));
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}
.tp-topbar-heading {
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tp-count-pill {
  font-size: 10px;
  font-weight: 700;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  border-radius: 20px;
  padding: 1px 8px;
}
.tp-topbar-sub {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 1px;
}
.tp-topbar-spacer {
  flex: 1;
}

/* Filters */
.tp-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tp-search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.09);
  border-radius: 20px;
  padding: 5px 12px;
}
.tp-search-icon {
  color: rgba(var(--v-theme-on-surface), 0.35);
}
.tp-search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
  width: 150px;
}
.tp-search-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.35);
}

.tp-channel-tabs {
  display: flex;
  gap: 3px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 20px;
  padding: 3px;
}
.tp-ch-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 15px;
  border: none;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.55);
  cursor: pointer;
  transition: all 0.15s ease;
}
.tp-ch-tab:hover {
  color: rgb(var(--v-theme-primary));
}
.tp-ch-tab--active {
  background: rgba(var(--v-theme-surface), 1);
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* ══════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════ */
.tp-layout {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow: hidden;
  padding-bottom: 16px;
}

/* ══════════════════════════════════════════════
   LEFT LIST
══════════════════════════════════════════════ */
.tp-list {
  width: 280px;
  flex-shrink: 0;
  background: rgba(var(--v-theme-surface), 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tp-list::-webkit-scrollbar {
  width: 3px;
}
.tp-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 2px;
}

.tp-list-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: rgba(var(--v-theme-on-surface), 0.3);
  text-align: center;
}
.tp-list-empty p {
  font-size: 12px;
  margin: 0;
}

/* Template Card */
.tp-card {
  display: flex;
  align-items: stretch;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  cursor: pointer;
  transition: all 0.18s ease;
  overflow: hidden;
  background: rgba(var(--v-theme-on-surface), 0.01);
  position: relative;
}
.tp-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.03);
  transform: translateX(-2px);
  box-shadow: 3px 0 12px rgba(var(--v-theme-primary), 0.08);
}
.tp-card--active {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  background: rgba(var(--v-theme-primary), 0.06) !important;
  transform: translateX(-3px) !important;
  box-shadow: 4px 0 16px rgba(var(--v-theme-primary), 0.1) !important;
}
.tp-card--inactive {
  opacity: 0.55;
}

.tp-card-accent {
  width: 3px;
  flex-shrink: 0;
  border-radius: 0;
}
.tp-card-accent--email {
  background: rgb(var(--v-theme-info));
}
.tp-card-accent--whatsapp {
  background: #25d366;
}
.tp-card-accent--both {
  background: linear-gradient(to bottom, rgb(var(--v-theme-primary)), rgb(var(--v-theme-info)));
}

.tp-card-body {
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
}
.tp-card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.tp-card-name {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tp-card-badges {
  display: flex;
  align-items: center;
  gap: 4px;
}
.tp-active-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.tp-active-dot--on {
  background: rgb(var(--v-theme-success));
}
.tp-active-dot--off {
  background: rgba(var(--v-theme-on-surface), 0.2);
}

.tp-ch-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tp-ch-icon--email {
  background: rgba(var(--v-theme-info), 0.12);
  color: rgb(var(--v-theme-info));
}
.tp-ch-icon--whatsapp {
  background: rgba(37, 211, 102, 0.12);
  color: #25d366;
}
.tp-ch-icon--both {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.tp-card-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), 0.4);
}
.tp-meta-ch {
  font-weight: 600;
  font-size: 9.5px;
  padding: 1px 5px;
  border-radius: 4px;
}
.tp-meta-ch--email {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
}
.tp-meta-ch--whatsapp {
  background: rgba(37, 211, 102, 0.1);
  color: #25d366;
}
.tp-meta-ch--both {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}
.tp-meta-sep {
  opacity: 0.4;
}
.tp-meta-sub {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.tp-card-actions {
  display: flex;
  align-items: center;
  padding-inline-end: 6px;
  flex-shrink: 0;
}
.tp-del-btn {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.tp-card:hover .tp-del-btn {
  opacity: 1;
}

/* ══════════════════════════════════════════════
   EDITOR
══════════════════════════════════════════════ */
.tp-editor {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: rgba(var(--v-theme-surface), 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow: hidden;
}

/* Empty State */
.tp-editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}
.tp-empty-gfx {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.tp-empty-gfx-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-primary), 0.02) 70%);
  border: 1px dashed rgba(var(--v-theme-primary), 0.2);
  animation: emptyPulse 2.5s ease-in-out infinite;
}
@keyframes emptyPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
}
.tp-empty-gfx-icon {
  position: relative;
}
.tp-empty-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}
.tp-empty-desc {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  max-width: 340px;
  line-height: 1.5;
  margin-bottom: 4px;
}

/* Editor Header */
.tp-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background: rgba(var(--v-theme-primary), 0.02);
  flex-shrink: 0;
}
.tp-editor-mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
.tp-mode-edit {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
  border: 1px solid rgba(var(--v-theme-info), 0.18);
}
.tp-mode-new {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
  border: 1px solid rgba(var(--v-theme-success), 0.18);
}
.tp-editor-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}
.tp-active-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px 2px 4px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 20px;
}
.tp-active-toggle-label {
  font-size: 11px;
  font-weight: 600;
}
.tp-active-toggle-label--on {
  color: rgb(var(--v-theme-success));
}
.tp-active-toggle-label--off {
  color: rgba(var(--v-theme-on-surface), 0.4);
}

/* Form Scroll */
.tp-form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.tp-form-scroll::-webkit-scrollbar {
  width: 4px;
}
.tp-form-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 2px;
}

/* Form Section */
.tp-form-section {
  margin-bottom: 20px;
}
.tp-section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}
.tp-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* Variable Toolbar */
.tp-var-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.tp-var-toolbar-left {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
  white-space: nowrap;
}
.tp-filter-pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.tp-filter-pill {
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgba(var(--v-theme-on-surface), 0.03);
  color: rgba(var(--v-theme-on-surface), 0.5);
  cursor: pointer;
  transition: all 0.14s ease;
}
.tp-filter-pill:hover {
  color: rgb(var(--v-theme-primary));
  border-color: rgba(var(--v-theme-primary), 0.2);
}
.tp-filter-pill--active {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  border-color: rgba(var(--v-theme-primary), 0.25);
}

/* Placeholder Grid */
.tp-placeholder-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 10px 12px;
  background: rgba(var(--v-theme-primary), 0.02);
  border: 1px dashed rgba(var(--v-theme-primary), 0.12);
  border-radius: 10px;
  margin-bottom: 10px;
  max-height: 110px;
  overflow-y: auto;
}
.tp-placeholder-grid::-webkit-scrollbar {
  height: 3px;
  width: 3px;
}
.tp-placeholder-grid::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 2px;
}

.tp-ph-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-theme-primary), 0.14);
  cursor: pointer;
  transition: all 0.14s ease;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
}
.tp-ph-chip:hover {
  background: rgba(var(--v-theme-primary), 0.12);
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.15);
}
.tp-textarea :deep(.v-field__outline) {
  border-radius: 10px !important;
}

/* Form Footer */
.tp-form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background: rgba(var(--v-theme-on-surface), 0.01);
  flex-shrink: 0;
}

/* Delete Dialog */
.tp-delete-dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
}
.tp-delete-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--v-theme-error), 0.1);
  border: 1px solid rgba(var(--v-theme-error), 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-error));
  flex-shrink: 0;
}
</style>
