<!--   شاشة إعداد وأتمتة مسارات العمل وجدولة الإشعارات الديناميكية لكل حدث، تتيح للشركات تفعيل القواعد وتحديد قنوات وخطوات التذكير المجدولة بفروق زمنية مخصصة. -->
<template>
  <div class="wf-page">
    <!-- ═══════════════════════════════ TOP BAR ═══════════════════════════════ -->
    <div class="wf-topbar">
      <div class="wf-topbar-inner">
        <v-btn icon="ri-arrow-right-line" variant="text" size="small" @click="router.push({ name: 'settings' })" />
        <div class="wf-topbar-title">
          <div class="wf-topbar-icon">
            <v-icon icon="ri-route-line" size="18" />
          </div>
          <div>
            <div class="wf-topbar-heading">أتمتة وجدولة الإشعارات</div>
            <div class="wf-topbar-sub">تحديد شروط الإرسال لكل حدث وإنشاء خطوات التذكير المتعاقبة</div>
          </div>
        </div>

        <div class="wf-topbar-spacer" />

        <!-- Channel Status Badges -->
        <div class="wf-channel-badges">
          <div class="wf-ch-badge" :class="integrationsStatus.email ? 'wf-ch-badge--on' : 'wf-ch-badge--off'">
            <v-icon icon="ri-mail-line" size="12" />
            <span>البريد</span>
            <span class="wf-ch-dot" />
          </div>
          <div class="wf-ch-badge" :class="integrationsStatus.whatsapp ? 'wf-ch-badge--on' : 'wf-ch-badge--off'">
            <v-icon icon="ri-whatsapp-line" size="12" />
            <span>واتساب</span>
            <span class="wf-ch-dot" />
          </div>
          <v-btn
            v-if="!integrationsStatus.email && !integrationsStatus.whatsapp"
            size="x-small"
            variant="tonal"
            color="warning"
            rounded
            prepend-icon="ri-settings-3-line"
            @click="router.push({ name: 'settings' })"
          >
            ربط القنوات
          </v-btn>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════ LAYOUT ═══════════════════════════════ -->
    <div class="wf-layout">
      <!-- ──────── LEFT SIDEBAR ──────── -->
      <aside class="wf-sidebar tour-workflows-select">
        <div class="wf-sidebar-search">
          <v-icon icon="ri-search-line" size="15" class="wf-search-icon" />
          <input v-model="sidebarSearch" placeholder="بحث في الأحداث..." class="wf-search-input" />
        </div>

        <!-- Group: Immediate -->
        <div class="wf-group">
          <div class="wf-group-header">
            <span class="wf-group-dot wf-group-dot--orange" />
            أحداث فورية
          </div>
          <div
            v-for="ev in filteredImmediateEvents"
            :key="ev.type"
            class="wf-event-row"
            :class="{ 'wf-event-row--active': selectedEventType === ev.type }"
            @click="selectEvent(ev.type)"
          >
            <div class="wf-event-icon wf-event-icon--orange">
              <v-icon :icon="ev.icon" size="14" />
            </div>
            <div class="wf-event-info">
              <div class="wf-event-name">{{ ev.label }}</div>
              <div class="wf-event-desc">{{ ev.description }}</div>
            </div>
            <div class="wf-event-status-wrap">
              <v-chip
                v-if="getWorkflow(ev.type)?.is_global"
                color="purple"
                size="x-small"
                variant="flat"
                class="me-1 font-weight-bold"
                style="font-size: 8px !important; height: 16px; min-width: auto; padding: 0 4px"
                >سيستم</v-chip
              >
              <div
                class="wf-status-badge"
                :class="{
                  'wf-status-badge--active': getWorkflowStatusColor(ev.type) === 'success',
                  'wf-status-badge--warn': getWorkflowStatusColor(ev.type) === 'warning',
                  'wf-status-badge--none': getWorkflowStatusColor(ev.type) === 'grey-lighten-1',
                }"
              >
                {{ getWorkflowStatusLabel(ev.type) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Group: Scheduled -->
        <div class="wf-group">
          <div class="wf-group-header">
            <span class="wf-group-dot wf-group-dot--blue" />
            أحداث مجدولة
          </div>
          <div
            v-for="ev in filteredScheduledEvents"
            :key="ev.type"
            class="wf-event-row"
            :class="{ 'wf-event-row--active': selectedEventType === ev.type }"
            @click="selectEvent(ev.type)"
          >
            <div class="wf-event-icon wf-event-icon--blue">
              <v-icon :icon="ev.icon" size="14" />
            </div>
            <div class="wf-event-info">
              <div class="wf-event-name">{{ ev.label }}</div>
              <div class="wf-event-desc">{{ ev.description }}</div>
            </div>
            <div class="wf-event-status-wrap">
              <v-chip
                v-if="getWorkflow(ev.type)?.is_global"
                color="purple"
                size="x-small"
                variant="flat"
                class="me-1 font-weight-bold"
                style="font-size: 8px !important; height: 16px; min-width: auto; padding: 0 4px"
                >سيستم</v-chip
              >
              <div
                class="wf-status-badge"
                :class="{
                  'wf-status-badge--active': getWorkflowStatusColor(ev.type) === 'success',
                  'wf-status-badge--warn': getWorkflowStatusColor(ev.type) === 'warning',
                  'wf-status-badge--none': getWorkflowStatusColor(ev.type) === 'grey-lighten-1',
                }"
              >
                {{ getWorkflowStatusLabel(ev.type) }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ──────── RIGHT PANEL ──────── -->
      <main class="wf-panel">
        <!-- EMPTY STATE -->
        <div v-if="!selectedEventType" class="wf-empty">
          <div class="wf-empty-graphic">
            <div class="wf-empty-rings">
              <div class="wf-ring wf-ring--1" />
              <div class="wf-ring wf-ring--2" />
              <div class="wf-ring wf-ring--3" />
            </div>
            <div class="wf-empty-inner-icon">
              <v-icon icon="ri-route-line" size="30" />
            </div>
          </div>
          <h3 class="wf-empty-title">اختر حدثاً لبدء التهيئة</h3>
          <p class="wf-empty-desc">اختر من القائمة اليسرى أي حدث لتعيين قواعد الإرسال والتذكير التلقائي</p>
          <div class="wf-empty-hints">
            <div class="wf-hint-chip wf-hint-chip--orange">
              <v-icon icon="ri-flashlight-line" size="13" />
              <span>الأحداث الفورية: تُرسل مباشرة عند وقوع الحدث</span>
            </div>
            <div class="wf-hint-chip wf-hint-chip--blue">
              <v-icon icon="ri-time-line" size="13" />
              <span>الأحداث المجدولة: تُفحص يومياً بناءً على التواريخ</span>
            </div>
          </div>
        </div>

        <!-- EDITOR -->
        <template v-else>
          <!-- Editor Header Bar -->
          <div class="wf-editor-header">
            <div
              class="wf-editor-event-pill"
              :class="isScheduledEvent(selectedEventType) ? 'wf-editor-event-pill--blue' : 'wf-editor-event-pill--orange'"
            >
              <v-icon :icon="activeEventDetails?.icon" size="16" />
              <span>{{ activeEventDetails?.label }}</span>
              <div class="wf-event-type-tag">{{ isScheduledEvent(selectedEventType) ? 'مجدول' : 'فوري' }}</div>
            </div>

            <div class="wf-editor-actions">
              <!-- Run Now -->
              <v-btn
                v-if="isScheduledEvent(selectedEventType)"
                size="small"
                variant="tonal"
                color="warning"
                prepend-icon="ri-play-circle-line"
                class="rounded-pill font-weight-bold tour-workflows-run-now"
                :disabled="!hasSavedWorkflow || !editorData.is_active || (!integrationsStatus.email && !integrationsStatus.whatsapp)"
                :loading="runningNow"
                @click="runWorkflowNow"
              >
                فحص يدوي
              </v-btn>

              <!-- Toggle + Label -->
              <div class="wf-toggle-wrap">
                <span class="wf-toggle-label">{{ editorData.is_active ? 'مُفعّل' : 'معطّل' }}</span>
                <v-switch
                  v-model="editorData.is_active"
                  color="success"
                  hide-details
                  inset
                  density="compact"
                  class="tour-workflows-toggle"
                  :disabled="isFormDisabled || (!integrationsStatus.email && !integrationsStatus.whatsapp)"
                />
              </div>

              <!-- Global Toggle -->
              <div v-if="userStore.isAdmin" class="wf-toggle-wrap ms-2">
                <span class="wf-toggle-label text-purple font-weight-bold">سيستم عام</span>
                <v-switch
                  v-model="editorData.is_global"
                  color="purple"
                  hide-details
                  inset
                  density="compact"
                  :disabled="isFormDisabled || (!integrationsStatus.email && !integrationsStatus.whatsapp)"
                />
              </div>

              <!-- Save -->
              <v-btn
                v-if="!isFormDisabled"
                color="primary"
                size="small"
                rounded="pill"
                prepend-icon="ri-save-3-line"
                class="font-weight-bold wf-save-btn tour-workflows-save"
                :loading="saving"
                :disabled="!integrationsStatus.email && !integrationsStatus.whatsapp"
                @click="saveWorkflow"
              >
                حفظ التغييرات
              </v-btn>
            </div>
          </div>

          <!-- Alert Bar -->
          <div v-if="!integrationsStatus.email && !integrationsStatus.whatsapp" class="wf-alert wf-alert--warn">
            <v-icon icon="ri-alert-line" size="15" />
            <span>لا توجد قنوات اتصال مفعلة.</span>
            <router-link :to="{ name: 'settings' }" class="wf-alert-link">إعداد القنوات الآن ←</router-link>
          </div>
          <div v-else-if="(!integrationsStatus.email || !integrationsStatus.whatsapp) && editorData.is_active" class="wf-alert wf-alert--info">
            <v-icon icon="ri-information-line" size="15" />
            <span>
              الإرسال على القنوات المتاحة فقط.
              <span v-if="!integrationsStatus.email" class="wf-alert-err">البريد غير متاح.</span>
              <span v-if="!integrationsStatus.whatsapp" class="wf-alert-err">واتساب غير متاح.</span>
            </span>
          </div>

          <!-- Help Text -->
          <div class="wf-help-bar">
            <v-icon icon="ri-lightbulb-line" size="14" color="primary" class="mt-px" />
            <span>{{ activeEventDetails?.helpText }}</span>
          </div>

          <!-- ─── PIPELINE SECTION ─── -->
          <div class="wf-pipeline-wrap">
            <div class="wf-pipeline-title-row">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-git-branch-line" size="16" color="primary" />
                <span class="wf-pipeline-title">خطوات الإرسال المتتابعة</span>
                <div class="wf-count-badge">{{ editorData.steps.length }}</div>
              </div>
              <v-btn
                v-if="!isFormDisabled"
                size="x-small"
                color="primary"
                variant="tonal"
                rounded="pill"
                prepend-icon="ri-add-line"
                class="font-weight-bold tour-workflows-step-add"
                :disabled="!integrationsStatus.email && !integrationsStatus.whatsapp"
                @click="addNewStep"
              >
                إضافة خطوة
              </v-btn>
            </div>

            <!-- Empty Steps -->
            <div v-if="editorData.steps.length === 0" class="wf-steps-empty">
              <v-icon icon="ri-list-check-3" size="32" />
              <p>لا توجد خطوات إرسال. اضغط "إضافة خطوة" لتبدأ في بناء pipeline الإشعارات.</p>
            </div>

            <!-- Pipeline Steps -->
            <div v-else class="wf-pipeline">
              <template v-for="(step, index) in editorData.steps" :key="index">
                <!-- Step Card -->
                <div class="wf-step" :class="[{ 'wf-step--off': !step.is_active }, index === 0 ? 'tour-workflows-step-card' : '']">
                  <!-- Step Number -->
                  <div class="wf-step-num">
                    <span>{{ index + 1 }}</span>
                  </div>

                  <!-- Step Body -->
                  <div class="wf-step-body">
                    <!-- Delay Row -->
                    <div class="wf-step-delay-row">
                      <div v-if="isImmediateEvent(selectedEventType)" class="wf-instant-tag">
                        <v-icon icon="ri-flashlight-fill" size="12" />
                        <span>إرسال فوري عند وقوع الحدث</span>
                      </div>
                      <template v-else>
                        <div class="wf-delay-input-wrap">
                          <input
                            v-model.number="step.userDelayDays"
                            type="number"
                            min="1"
                            class="wf-delay-input"
                            :disabled="isFormDisabled"
                            @input="updateStepDelay(step)"
                          />
                          <span class="wf-delay-unit">يوم</span>
                        </div>
                        <div class="wf-delay-helper">
                          {{ getDelayHelperText(selectedEventType, step.userDelayDays) }}
                        </div>
                      </template>
                    </div>

                    <!-- Fields Row -->
                    <div class="wf-step-fields">
                      <div class="wf-step-field">
                        <label class="wf-field-label">قناة الإرسال <span class="wf-required">*</span></label>
                        <div class="wf-channel-checks">
                          <label
                            v-for="opt in stepChannelOptions"
                            :key="opt.value"
                            class="wf-ch-check"
                            :class="{ 'wf-ch-check--active': step.channel?.includes(opt.value) }"
                          >
                            <input
                              type="checkbox"
                              :value="opt.value"
                              :checked="step.channel?.includes(opt.value)"
                              :disabled="isFormDisabled"
                              @change="toggleStepChannel(step, opt.value)"
                              class="wf-ch-input"
                            />
                            <v-icon :icon="opt.icon" size="13" />
                            <span>{{ opt.label }}</span>
                          </label>
                        </div>
                      </div>
                      <div class="wf-step-field wf-step-field--lg">
                        <label class="wf-field-label">قالب الرسالة <span class="wf-required">*</span></label>
                        <v-select
                          v-model="step.template_id"
                          :items="templates"
                          item-title="name"
                          item-value="id"
                          variant="outlined"
                          density="compact"
                          :rules="[v => !!v || 'القالب مطلوب']"
                          hide-details
                          class="wf-select"
                          :disabled="isFormDisabled"
                        />
                      </div>
                      <div class="wf-step-controls">
                        <label class="wf-field-label">نشط</label>
                        <v-switch v-model="step.is_active" color="success" hide-details inset density="compact" :disabled="isFormDisabled" />
                        <v-btn
                          v-if="!isFormDisabled"
                          icon="ri-delete-bin-5-line"
                          variant="text"
                          color="error"
                          size="small"
                          density="compact"
                          class="mt-1"
                          @click="removeStep(index)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Connector Arrow -->
                <div v-if="index < editorData.steps.length - 1" class="wf-connector">
                  <div class="wf-connector-line" />
                  <v-icon icon="ri-arrow-down-line" size="14" class="wf-connector-arrow" />
                </div>
              </template>
            </div>
          </div>
        </template>
      </main>
    </div>

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
import { toast } from 'vue3-toastify';

const router = useRouter();
const workflowsApi = useApi('/api/notification-workflows');
const templatesApi = useApi('/api/notification-templates');
const userStore = useUserStore();

const loading = ref(false);
const saving = ref(false);
const runningNow = ref(false);
const sidebarSearch = ref('');

const templates = ref([]);
const workflows = ref([]);
const selectedEventType = ref(null);
const integrationsStatus = ref({ email: false, whatsapp: false });

const editorData = ref({ id: null, event_type: '', is_active: true, is_global: false, steps: [] });

const getWorkflow = type => {
  return workflows.value.find(w => w.event_type === type);
};

const isFormDisabled = computed(() => {
  const wf = getWorkflow(selectedEventType.value);
  return !!wf?.is_global && !userStore.isAdmin;
});

// ربط الجولة الإرشادية بتفعيل حدث تلقائياً لمنع خلو الدوم من عناصر التعديل
const { isActive, activeTourKey } = useTour();
watch(
  [isActive, activeTourKey],
  ([active, key]) => {
    if (active && key === 'tour.notification_workflows') {
      if (!selectedEventType.value && eventsList.length > 0 && !loading.value) {
        selectEvent(eventsList[0].type);
      }
    }
  },
  { immediate: true }
);

// القنوات المتاحة بناءً على ما هو مفعل في الشركة
const stepChannelOptions = computed(() => {
  const opts = [];
  if (integrationsStatus.value.email) opts.push({ label: 'بريد إلكتروني', value: 'email', icon: 'ri-mail-line' });
  if (integrationsStatus.value.whatsapp) opts.push({ label: 'واتساب', value: 'whatsapp', icon: 'ri-whatsapp-line' });
  return opts;
});

// تبديل اختيار/إلغاء قناة في الخطوة
const toggleStepChannel = (step, value) => {
  if (!Array.isArray(step.channel)) step.channel = [];
  const idx = step.channel.indexOf(value);
  if (idx === -1) {
    step.channel.push(value);
  } else {
    step.channel.splice(idx, 1);
  }
};

const eventsList = [
  {
    type: 'invoice.created',
    label: 'فاتورة مبيعات جديدة',
    description: 'فوري عند تأكيد وحفظ الفاتورة',
    icon: 'ri-file-add-line',
    helpText: 'يتم تشغيل هذا الحدث بمجرد حفظ فاتورة مبيعات جديدة بالكامل في النظام.',
  },
  {
    type: 'invoice.due_soon',
    label: 'فاتورة تقترب من الاستحقاق',
    description: 'مجدول يومي قبل تاريخ الاستحقاق',
    icon: 'ri-time-line',
    helpText: 'يقوم النظام يومياً بفحص الفواتير غير المدفوعة التي يقترب موعد استحقاقها.',
  },
  {
    type: 'invoice.overdue',
    label: 'فاتورة متأخرة السداد',
    description: 'مجدول يومي بعد تاريخ الاستحقاق',
    icon: 'ri-error-warning-line',
    helpText: 'يقوم النظام يومياً بفحص الفواتير المتأخرة لتنبيه العميل وطلب سداد المستحقات.',
  },
  {
    type: 'payment.received',
    label: 'سند قبض / دفعة مستلمة',
    description: 'فوري عند تسجيل دفع للفاتورة',
    icon: 'ri-checkbox-circle-line',
    helpText: 'يتم تشغيل هذا الحدث بمجرد سداد الفاتورة أو دفع جزء منها.',
  },
  {
    type: 'installment.due_soon',
    label: 'قسط يستحق قريباً',
    description: 'مجدول يومي قبل موعد قسط الدفع',
    icon: 'ri-calendar-event-line',
    helpText: 'تذكير للعملاء باقتراب موعد استحقاق قسط الدفع المستقبلي.',
  },
  {
    type: 'stock.low',
    label: 'انخفاض المخزون للحد الأدنى',
    description: 'مجدول يومي لمدير المستودع',
    icon: 'ri-archive-line',
    helpText: 'تنبيه دوري بالمنتجات التي وصلت لكمياتها للأمان المنخفض.',
  },
  {
    type: 'subscription.expiring',
    label: 'اشتراك يوشك على الانتهاء',
    description: 'مجدول يومي قبل انتهاء الخطة',
    icon: 'ri-vip-crown-line',
    helpText: 'تنبيه العملاء باقتراب انتهاء صلاحية اشتراك باقتهم.',
  },
  {
    type: 'subscription.expired',
    label: 'اشتراك منتهي الصلاحية',
    description: 'فوري عند تحول حالة الاشتراك لمنتهٍ',
    icon: 'ri-spam-3-line',
    helpText: 'يتم تشغيله فوراً عند إيقاف اشتراك العميل بسبب انتهاء الباقة.',
  },
  {
    type: 'customer.birthday',
    label: 'يوم ميلاد العميل (تهنئة)',
    description: 'مجدول يومي في تاريخ ميلاد العميل',
    icon: 'ri-cake-2-line',
    helpText: 'تهنئة العميل التلقائية في تاريخ ميلاده لزيادة الولاء.',
  },
  {
    type: 'transaction.created',
    label: 'معاملة مالية جديدة',
    description: 'فوري عند تسجيل معاملة بالخزائن',
    icon: 'ri-exchange-funds-line',
    helpText: 'يتم تشغيل هذا الحدث بمجرد تسجيل عملية مالية جديدة في الخزائن.',
  },
  {
    type: 'task.updated',
    label: 'تحديث حالة مهمة عمل',
    description: 'فوري عند تعديل مهمة عمل',
    icon: 'ri-task-line',
    helpText: 'يتم تشغيل هذا الحدث عند تحديث حالة مهمة العمل أو تقدمها.',
  },
  {
    type: 'task.created',
    label: 'إنشاء مهمة عمل جديدة',
    description: 'فوري عند إسناد مهمة لموظف',
    icon: 'ri-chat-new-line',
    helpText: 'يتم تشغيل هذا الحدث عند إضافة مهمة عمل جديدة وإسنادها للموظف.',
  },
  {
    type: 'product.created',
    label: 'إضافة منتج جديد للمخازن',
    description: 'فوري عند إضافة منتج بالنظام',
    icon: 'ri-add-box-line',
    helpText: 'يتم تشغيل هذا الحدث فور تسجيل منتج جديد في المخازن.',
  },
  {
    type: 'product.stock_updated',
    label: 'تحديث كمية منتج بالمخازن',
    description: 'فوري عند تعديل كميات المخزون',
    icon: 'ri-refresh-line',
    helpText: 'يتم تشغيل هذا الحدث فور تعديل كمية المخزون لمنتج ما.',
  },
  {
    type: 'invoice.returned',
    label: 'مرتجع فاتورة مبيعات',
    description: 'فوري عند إصدار فاتورة مرتجع',
    icon: 'ri-refund-2-line',
    helpText: 'يتم تشغيل هذا الحدث بمجرد تسجيل فاتورة مرتجع مبيعات.',
  },
  {
    type: 'cashbox.created',
    label: 'إنشاء صندوق / خزينة جديدة',
    description: 'فوري عند إضافة خزينة أموال',
    icon: 'ri-bank-card-line',
    helpText: 'يتم تشغيل هذا الحدث فور إضافة صندوق أو خزينة مالية جديدة.',
  },
];

const immediateTypes = [
  'invoice.created',
  'payment.received',
  'subscription.expired',
  'transaction.created',
  'task.updated',
  'task.created',
  'product.created',
  'product.stock_updated',
  'invoice.returned',
  'cashbox.created',
];

const filteredImmediateEvents = computed(() => {
  const q = sidebarSearch.value.toLowerCase();
  return eventsList.filter(e => immediateTypes.includes(e.type) && (!q || e.label.includes(q) || e.description.includes(q)));
});
const filteredScheduledEvents = computed(() => {
  const q = sidebarSearch.value.toLowerCase();
  return eventsList.filter(e => !immediateTypes.includes(e.type) && (!q || e.label.includes(q) || e.description.includes(q)));
});
const activeEventDetails = computed(() => eventsList.find(e => e.type === selectedEventType.value));
const hasSavedWorkflow = computed(() => !!editorData.value.id);
const isImmediateEvent = type => immediateTypes.includes(type);
const isScheduledEvent = type => !isImmediateEvent(type);

const getWorkflowStatusLabel = type => {
  const wf = workflows.value.find(w => w.event_type === type);
  if (!wf) return 'غير مهيأ';
  return wf.is_active ? 'نشط' : 'معطّل';
};
const getWorkflowStatusColor = type => {
  const wf = workflows.value.find(w => w.event_type === type);
  if (!wf) return 'grey-lighten-1';
  return wf.is_active ? 'success' : 'warning';
};
const getDelayLabel = type =>
  ['invoice.due_soon', 'installment.due_soon', 'subscription.expiring'].includes(type)
    ? 'الإرسال قبل الموعد بـ (أيام) *'
    : 'الإرسال بعد الموعد بـ (أيام) *';
const getDelayHelperText = (type, userDays) => {
  const days = userDays || 0;
  return ['invoice.due_soon', 'installment.due_soon', 'subscription.expiring'].includes(type)
    ? `سيُرسل قبل تاريخ الاستحقاق بـ ${days} أيام`
    : `سيُرسل بعد تاريخ الاستحقاق بـ ${days} أيام`;
};
const updateStepDelay = step => {
  const isNegative = ['invoice.due_soon', 'installment.due_soon', 'subscription.expiring'].includes(selectedEventType.value);
  const val = Math.abs(parseInt(step.userDelayDays) || 0);
  step.delay_days = isNegative ? -val : val;
};

const loadData = async () => {
  loading.value = true;
  try {
    const [templatesRes, workflowsRes, statusRes] = await Promise.all([
      templatesApi.get(null, { showLoading: false, showError: false }),
      workflowsApi.get(null, { showLoading: false, showError: false }),
      workflowsApi.request('GET', 'integrations-status', null, { showLoading: false, showError: false }),
    ]);
    templates.value = templatesRes.data || [];
    workflows.value = workflowsRes.data || [];
    integrationsStatus.value = statusRes?.data || { email: false, whatsapp: false };

    if (selectedEventType.value) {
      selectEvent(selectedEventType.value);
    } else if (isActive.value && activeTourKey.value === 'tour.notification_workflows' && eventsList.length > 0) {
      selectEvent(eventsList[0].type);
    }
  } catch (e) {
    toast.error('حدث خطأ أثناء تحميل البيانات.');
  } finally {
    loading.value = false;
  }
};

const selectEvent = type => {
  selectedEventType.value = type;
  const existingWf = workflows.value.find(w => w.event_type === type);
  if (existingWf) {
    editorData.value = {
      id: existingWf.id,
      event_type: existingWf.event_type,
      is_active: !!existingWf.is_active,
      is_global: !!existingWf.is_global,
      steps: (existingWf.steps || []).map(s => {
        // دعم القيم القديمة (both/email/whatsapp كـ string) والجديدة (array)
        let ch = s.channel;
        if (!Array.isArray(ch)) {
          ch = ch === 'both' ? ['email', 'whatsapp'] : ch ? [ch] : [];
        }
        return {
          id: s.id,
          step_number: s.step_number,
          delay_days: s.delay_days,
          userDelayDays: Math.abs(s.delay_days),
          channel: ch,
          template_id: s.template_id,
          is_active: !!s.is_active,
        };
      }),
    };
  } else {
    editorData.value = { id: null, event_type: type, is_active: false, is_global: false, steps: [] };
    addNewStep();
  }
};

const addNewStep = () => {
  const isImmediate = isImmediateEvent(selectedEventType.value);
  const defaultDelay = isImmediate ? 0 : 3;
  // القناة الافتراضية: جميع القنوات المتاحة
  const defaultChannels = [];
  if (integrationsStatus.value.email) defaultChannels.push('email');
  if (integrationsStatus.value.whatsapp) defaultChannels.push('whatsapp');
  const newStep = {
    id: null,
    step_number: editorData.value.steps.length + 1,
    delay_days: defaultDelay,
    userDelayDays: defaultDelay,
    channel: defaultChannels,
    template_id: templates.value.length > 0 ? templates.value[0].id : null,
    is_active: true,
  };
  if (['invoice.due_soon', 'installment.due_soon', 'subscription.expiring'].includes(selectedEventType.value)) newStep.delay_days = -defaultDelay;
  editorData.value.steps.push(newStep);
};

const removeStep = index => {
  editorData.value.steps.splice(index, 1);
  editorData.value.steps.forEach((step, idx) => {
    step.step_number = idx + 1;
  });
};

const saveWorkflow = async () => {
  const invalidStep = editorData.value.steps.find(s => !s.template_id);
  if (invalidStep) {
    toast.error('يرجى تحديد قالب رسالة لجميع الخطوات.');
    return;
  }
  const emptyChannel = editorData.value.steps.find(s => !s.channel || s.channel.length === 0);
  if (emptyChannel) {
    toast.error('يرجى تحديد قناة إرسال لجميع الخطوات.');
    return;
  }
  saving.value = true;
  try {
    const isNeg = t => ['invoice.due_soon', 'installment.due_soon', 'subscription.expiring'].includes(t);
    const stepsPayload = editorData.value.steps.map((s, idx) => ({
      id: s.id,
      step_number: idx + 1,
      delay_days: isImmediateEvent(editorData.value.event_type)
        ? 0
        : isNeg(editorData.value.event_type)
          ? -Math.abs(parseInt(s.userDelayDays) || 0)
          : Math.abs(parseInt(s.userDelayDays) || 0),
      channel: Array.isArray(s.channel) ? s.channel : [s.channel].filter(Boolean),
      template_id: s.template_id,
      is_active: s.is_active,
    }));
    const payload = {
      event_type: editorData.value.event_type,
      is_active: editorData.value.is_active,
      is_global: !!editorData.value.is_global,
      steps: stepsPayload,
    };
    let response;
    if (editorData.value.id) {
      response = await workflowsApi.update(editorData.value.id, payload, { showLoading: false });
    } else {
      response = await workflowsApi.create(payload, { showLoading: false });
    }
    if (response.data) {
      toast.success('تم حفظ قاعدة الأتمتة بنجاح.');
      await loadData();
    }
  } catch (e) {
    console.error('Save workflow failed', e);
  } finally {
    saving.value = false;
  }
};

const runWorkflowNow = async () => {
  if (!editorData.value.id) return;
  runningNow.value = true;
  try {
    const response = await workflowsApi.request('POST', `${editorData.value.id}/run`, null, { showLoading: false });
    if (response.status) toast.success(response.message || 'تم تشغيل الفحص اليدوي بنجاح.');
  } catch (e) {
    console.error('Run workflow now failed', e);
  } finally {
    runningNow.value = false;
  }
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
/* ══════════════════════════════════════════════
   PAGE WRAPPER
══════════════════════════════════════════════ */
.wf-page {
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
.wf-topbar {
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgba(var(--v-theme-surface), 1);
  padding: 10px 16px;
  flex-shrink: 0;
}
.wf-topbar-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wf-topbar-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wf-topbar-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.18), rgba(var(--v-theme-primary), 0.06));
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
}
.wf-topbar-heading {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.wf-topbar-sub {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 1px;
}
.wf-topbar-spacer {
  flex: 1;
}

/* Channel Badges */
.wf-channel-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wf-ch-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
}
.wf-ch-badge--on {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
  border-color: rgba(var(--v-theme-success), 0.2);
}
.wf-ch-badge--off {
  background: rgba(var(--v-theme-error), 0.07);
  color: rgba(var(--v-theme-on-surface), 0.4);
  border-color: rgba(var(--v-theme-on-surface), 0.08);
  text-decoration: line-through;
}
.wf-ch-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.wf-ch-badge--on .wf-ch-dot {
  background: rgb(var(--v-theme-success));
}
.wf-ch-badge--off .wf-ch-dot {
  background: rgba(var(--v-theme-on-surface), 0.2);
}

/* ══════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════ */
.wf-layout {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow: hidden;
  padding-bottom: 16px;
}

/* ══════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════ */
.wf-sidebar {
  width: 270px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(var(--v-theme-surface), 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow: hidden;
}

/* Search */
.wf-sidebar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.wf-search-icon {
  color: rgba(var(--v-theme-on-surface), 0.35);
  flex-shrink: 0;
}
.wf-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
}
.wf-search-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.35);
}

/* Groups */
.wf-group {
  padding: 8px 8px 2px;
  overflow-y: auto;
}
.wf-group:last-child {
  flex: 1;
  overflow-y: auto;
}
.wf-group::-webkit-scrollbar {
  width: 3px;
}
.wf-group::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 2px;
}

.wf-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.4);
  padding: 4px 4px 6px;
}
.wf-group-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.wf-group-dot--orange {
  background: #f97316;
}
.wf-group-dot--blue {
  background: rgb(var(--v-theme-info));
}

/* Event Row */
.wf-event-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  margin-bottom: 2px;
}
.wf-event-row:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.1);
}
.wf-event-row--active {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0.06)) !important;
  border-color: rgba(var(--v-theme-primary), 0.22) !important;
}

.wf-event-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.wf-event-icon--orange {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}
.wf-event-icon--blue {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
}
.wf-event-row--active .wf-event-icon--orange {
  background: #f97316;
  color: #fff;
}
.wf-event-row--active .wf-event-icon--blue {
  background: rgb(var(--v-theme-info));
  color: #fff;
}

.wf-event-info {
  flex: 1;
  min-width: 0;
}
.wf-event-name {
  font-size: 11.5px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.wf-event-desc {
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-event-status-wrap {
  flex-shrink: 0;
}
.wf-status-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}
.wf-status-badge--active {
  background: rgba(var(--v-theme-success), 0.12);
  color: rgb(var(--v-theme-success));
}
.wf-status-badge--warn {
  background: rgba(var(--v-theme-warning), 0.12);
  color: rgb(var(--v-theme-warning));
}
.wf-status-badge--none {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.35);
}

/* ══════════════════════════════════════════════
   MAIN PANEL
══════════════════════════════════════════════ */
.wf-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(var(--v-theme-surface), 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  overflow: hidden;
  min-width: 0;
}

/* ══════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════ */
.wf-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}
.wf-empty-graphic {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.wf-empty-rings {
  position: absolute;
  inset: 0;
}
.wf-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  animation: ringPulse 3s ease-in-out infinite;
}
.wf-ring--1 {
  inset: 0;
  animation-delay: 0s;
}
.wf-ring--2 {
  inset: 10px;
  animation-delay: 0.5s;
  border-color: rgba(var(--v-theme-primary), 0.1);
}
.wf-ring--3 {
  inset: 20px;
  animation-delay: 1s;
  border-color: rgba(var(--v-theme-primary), 0.08);
}
@keyframes ringPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.04);
    opacity: 0.6;
  }
}
.wf-empty-inner-icon {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0.05));
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
}
.wf-empty-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  color: rgb(var(--v-theme-on-surface));
}
.wf-empty-desc {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  max-width: 360px;
  line-height: 1.5;
  margin-bottom: 24px;
}
.wf-empty-hints {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wf-hint-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 500;
}
.wf-hint-chip--orange {
  background: rgba(249, 115, 22, 0.08);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.15);
}
.wf-hint-chip--blue {
  background: rgba(var(--v-theme-info), 0.08);
  color: rgb(var(--v-theme-info));
  border: 1px solid rgba(var(--v-theme-info), 0.15);
}

/* ══════════════════════════════════════════════
   EDITOR HEADER
══════════════════════════════════════════════ */
.wf-editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background: rgba(var(--v-theme-primary), 0.02);
  flex-shrink: 0;
}
.wf-editor-event-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}
.wf-editor-event-pill--orange {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.2);
}
.wf-editor-event-pill--blue {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
  border: 1px solid rgba(var(--v-theme-info), 0.2);
}
.wf-event-type-tag {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  letter-spacing: 0.3px;
  color: inherit;
}
.wf-editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-inline-start: auto;
}
.wf-toggle-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px 2px 6px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 20px;
}
.wf-toggle-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.wf-save-btn {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.8)) !important;
}

/* ══════════════════════════════════════════════
   ALERTS
══════════════════════════════════════════════ */
.wf-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-bottom: 1px solid transparent;
  flex-shrink: 0;
}
.wf-alert--warn {
  background: rgba(var(--v-theme-warning), 0.07);
  color: rgb(var(--v-theme-warning));
  border-color: rgba(var(--v-theme-warning), 0.12);
}
.wf-alert--info {
  background: rgba(var(--v-theme-info), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.7);
  border-color: rgba(var(--v-theme-info), 0.1);
}
.wf-alert-link {
  font-weight: 700;
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
  margin-inline-start: 4px;
}
.wf-alert-err {
  color: rgb(var(--v-theme-error));
  font-weight: 600;
  margin-inline-start: 4px;
}

/* ══════════════════════════════════════════════
   HELP BAR
══════════════════════════════════════════════ */
.wf-help-bar {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(var(--v-theme-primary), 0.02);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.55);
  line-height: 1.5;
  flex-shrink: 0;
}

/* ══════════════════════════════════════════════
   PIPELINE SECTION
══════════════════════════════════════════════ */
.wf-pipeline-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 20px;
  display: flex;
  flex-direction: column;
}
.wf-pipeline-wrap::-webkit-scrollbar {
  width: 4px;
}
.wf-pipeline-wrap::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 2px;
}

.wf-pipeline-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.08);
}
.wf-pipeline-title {
  font-size: 13px;
  font-weight: 700;
}
.wf-count-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty Steps */
.wf-steps-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 24px;
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  color: rgba(var(--v-theme-on-surface), 0.35);
  gap: 8px;
}
.wf-steps-empty p {
  font-size: 12px;
  margin: 0;
  max-width: 300px;
  line-height: 1.5;
}

/* Pipeline */
.wf-pipeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Step Card */
.wf-step {
  display: flex;
  align-items: stretch;
  gap: 12px;
  background: rgba(var(--v-theme-on-surface), 0.015);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  padding: 14px 14px 12px;
  transition: all 0.2s ease;
  position: relative;
}
.wf-step:hover {
  border-color: rgba(var(--v-theme-primary), 0.22);
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.06);
  background: rgba(var(--v-theme-primary), 0.018);
}
.wf-step--off {
  opacity: 0.5;
}

.wf-step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.75));
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
  margin-top: 2px;
}

.wf-step-body {
  flex: 1;
  min-width: 0;
}

/* Delay Row */
.wf-step-delay-row {
  margin-bottom: 10px;
}
.wf-instant-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #f97316;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
}
.wf-delay-input-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 8px;
  overflow: hidden;
  height: 34px;
}
.wf-delay-input {
  width: 55px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  color: rgb(var(--v-theme-primary));
  padding: 0 8px;
}
.wf-delay-unit {
  font-size: 11px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
  background: rgba(var(--v-theme-on-surface), 0.04);
  padding: 0 10px;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}
.wf-delay-helper {
  font-size: 10.5px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-top: 4px;
}

/* Step Fields */
.wf-step-fields {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.wf-step-field {
  flex: 1;
  min-width: 0;
}
.wf-step-field--lg {
  flex: 1.6;
}

/* ── Multi-Channel Checkboxes ── */
.wf-channel-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}
.wf-ch-check {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-on-surface), 0.02);
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
  transition: all 0.15s ease;
  user-select: none;
}
.wf-ch-check:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}
.wf-ch-check--active {
  background: rgba(var(--v-theme-primary), 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.35) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
.wf-ch-input {
  display: none;
}
.wf-step-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding-bottom: 2px;
}
.wf-field-label {
  font-size: 10.5px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.55);
  display: block;
  margin-bottom: 4px;
}
.wf-required {
  color: rgb(var(--v-theme-error));
}
.wf-select :deep(.v-field__outline) {
  border-radius: 8px !important;
}

/* Connector */
.wf-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 4px 0;
  position: relative;
}
.wf-connector-line {
  width: 1px;
  height: 14px;
  background: linear-gradient(to bottom, rgba(var(--v-theme-primary), 0.25), rgba(var(--v-theme-primary), 0.08));
}
.wf-connector-arrow {
  color: rgba(var(--v-theme-primary), 0.4);
}
</style>
