<!--   شاشة تفاصيل اشتراك الشركة (My Subscription) لمتابعة حدود الموارد المستخدمة وتفعيل/تعطيل التجديد التلقائي للاشتراك تلقائياً -->

<template>
  <div class="my-subscription-page">
    <!-- Header -->
    <div class="page-header mb-6 d-flex align-center justify-between flex-wrap gap-4">
      <div>
        <div class="d-flex align-center gap-2 mb-2">
          <v-btn icon="ri-arrow-right-line" variant="text" @click="router.push({ name: 'settings' })" />
          <h1 class="text-h3 font-weight-bold primary--text">اشتراكي الحالي</h1>
        </div>
        <p class="text-subtitle-1 text-grey-darken-1">مراقبة استهلاك باقة الخدمات وتتبع حدود الاستخدام وإعدادات التجديد</p>
      </div>
      <div>
        <v-btn
          color="secondary"
          prepend-icon="ri-refresh-line"
          variant="outlined"
          class="rounded-pill font-weight-bold"
          :loading="loading"
          @click="loadSubscription"
        >
          تحديث البيانات
        </v-btn>
      </div>
    </div>

    <v-row v-if="loading && !subscriptionData">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="text-body-1 mt-4 text-grey">جاري تحميل تفاصيل الاشتراك...</div>
      </v-col>
    </v-row>

    <template v-else-if="subscriptionData">
      <!-- تنبيه معلق الدفع أو انتهاء الصلاحية -->
      <v-alert
        v-if="subscriptionData.status === 'pending' || subscriptionData.status === 'expired'"
        type="warning"
        variant="flat"
        class="rounded-xl mb-6 font-weight-bold text-white"
        density="comfortable"
        prominent
      >
        <template #prepend>
          <v-icon icon="ri-error-warning-fill" size="28" />
        </template>
        <div class="d-flex align-center justify-between flex-wrap gap-4 w-100">
          <div>
            <div class="text-subtitle-1 font-weight-black">
              {{ subscriptionData.status === 'pending' ? 'بانتظار سداد قيمة الاشتراك' : 'انتهت صلاحية باقة الاشتراك الحالي' }}
            </div>
            <div class="text-caption opacity-90">
              {{
                subscriptionData.status === 'pending'
                  ? 'يرجى استكمال الدفع لتفعيل باقتك والبدء باستخدام النظام دون قيود.'
                  : 'يرجى تجديد الاشتراك أو ترقية الباقة لضمان استمرار تقديم الخدمة.'
              }}
            </div>
          </div>
          <v-btn color="white" class="text-warning font-weight-bold rounded-pill" @click="openUpgradeDialog">
            {{ subscriptionData.status === 'pending' ? 'ادفع الآن لتفعيل الباقة' : 'تجديد / ترقية الباقة' }}
          </v-btn>
        </div>
      </v-alert>

      <v-row>
        <!-- Subscription Summary Card -->
        <v-col cols="12" lg="8">
          <v-card class="rounded-xl border border-opacity-10 shadow-sm overflow-hidden h-100">
            <v-card-text class="pa-6 d-flex flex-column h-100 justify-between">
              <div>
                <div class="d-flex align-center justify-between mb-6 flex-wrap gap-3">
                  <div class="d-flex align-center gap-3">
                    <v-avatar color="warning" size="64" variant="tonal" class="rounded-lg">
                      <v-icon icon="ri-medal-line" size="32" class="text-warning" />
                    </v-avatar>
                    <div>
                      <h2 class="text-h5 font-weight-bold mb-1">{{ subscriptionData.plan_name }}</h2>
                      <div class="d-flex align-center gap-2">
                        <v-chip size="small" :color="getStatusColor(subscriptionData.status)" variant="flat" class="font-weight-bold">
                          {{ getStatusLabel(subscriptionData.status) }}
                        </v-chip>
                        <span v-if="subscriptionData.trial_ends_at" class="text-caption text-grey">
                          ينتهي التجريبي في: {{ subscriptionData.trial_ends_at }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Auto Renew Switch Card inside Summary -->
                  <div class="auto-renew-box pa-4 rounded-xl border border-opacity-10 bg-grey-lighten-4 d-flex align-center gap-4">
                    <div>
                      <div class="font-weight-bold text-body-1">التجديد التلقائي للاشتراك</div>
                      <div class="text-caption text-grey-darken-1">تجديد الخدمة تلقائياً عند انتهاء المدة</div>
                    </div>
                    <v-switch
                      v-model="subscriptionData.auto_renew"
                      color="success"
                      hide-details
                      inset
                      class="mt-0"
                      :loading="savingAutoRenew"
                      @update:model-value="handleToggleAutoRenew"
                    />
                  </div>
                </div>

                <v-divider class="my-6" />

                <v-row class="mb-6">
                  <v-col cols="12" sm="6" md="4">
                    <div class="text-caption text-grey">تاريخ بدء الاشتراك</div>
                    <div class="text-body-1 font-weight-bold mt-1 text-ltr">{{ subscriptionData.starts_at || '-' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <div class="text-caption text-grey">تاريخ انتهاء الاشتراك</div>
                    <div class="text-body-1 font-weight-bold mt-1 text-ltr">{{ subscriptionData.ends_at || 'غير محدد (لا ينتهي)' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <div class="text-caption text-grey">طريقة المحاسبة</div>
                    <div class="text-body-1 font-weight-bold mt-1">تلقائي / دوري</div>
                  </v-col>
                </v-row>
              </div>

              <div class="alert-info pa-4 rounded-lg bg-light-primary border-primary d-flex align-center gap-3">
                <v-icon icon="ri-information-line" color="primary" size="24" />
                <p class="text-body-2 text-primary font-weight-medium mb-0">
                  يرجى التأكد من تشغيل التجديد التلقائي لضمان عدم توقف خدمات الفواتير أو بوابات الدفع الإلكتروني فور انتهاء الدورة الحالية.
                </p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Dynamic Information Side Card -->
        <v-col cols="12" lg="4">
          <v-card class="rounded-xl border border-opacity-10 shadow-sm bg-gradient-warning text-white h-100">
            <v-card-text class="pa-6 d-flex flex-column justify-between h-100">
              <div>
                <div class="d-flex align-center gap-2 mb-4">
                  <v-icon icon="ri-vip-crown-fill" size="28" />
                  <span class="text-h6 font-weight-bold">تطوير وتوسعة الأعمال</span>
                </div>
                <p class="text-body-2 mb-6 opacity-90 leading-relaxed">
                  هل تحتاج إلى حدود موارد أكبر مثل إضافة موظفين جدد، أو إضافة عدد لا نهائي من المنتجات، أو تفعيل المخازن ونظام التقسيط؟
                </p>
                <div class="benefits-list d-flex flex-column gap-3 mb-6">
                  <div class="benefit-item d-flex align-center gap-2">
                    <v-icon icon="ri-checkbox-circle-fill" size="18" />
                    <span class="text-body-2 font-weight-bold">تنشيط بوابات الدفع Stripe/Paymob</span>
                  </div>
                  <div class="benefit-item d-flex align-center gap-2">
                    <v-icon icon="ri-checkbox-circle-fill" size="18" />
                    <span class="text-body-2 font-weight-bold">إضافة مخازن وفروع متعددة</span>
                  </div>
                  <div class="benefit-item d-flex align-center gap-2">
                    <v-icon icon="ri-checkbox-circle-fill" size="18" />
                    <span class="text-body-2 font-weight-bold">إرسال إشعارات وواتساب وتصدير فوري</span>
                  </div>
                </div>
              </div>
              <v-btn color="white" class="text-primary font-weight-bold rounded-pill px-6" elevation="2" @click="openUpgradeDialog">
                ترقية الباقة الآن
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Resource Usage Grid -->
      <h2 class="text-h5 font-weight-bold mt-8 mb-6 primary--text">مصفوفة استهلاك حدود الباقة</h2>
      <v-row>
        <v-col v-for="(limit, key) in subscriptionData.limits" :key="key" cols="12" sm="6" lg="3">
          <v-card class="rounded-xl border border-opacity-10 shadow-sm overflow-hidden h-100">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-between mb-4">
                <v-avatar :color="getResourceColor(key)" variant="tonal" size="44" class="rounded-lg">
                  <v-icon :icon="getResourceIcon(key)" :color="getResourceColor(key)" />
                </v-avatar>
                <div class="text-right">
                  <div class="text-caption text-grey">{{ getResourceLabel(key) }}</div>
                  <div class="text-h5 font-weight-black mt-1">
                    {{ limit.current }} <span class="text-caption text-grey">/ {{ limit.max }}</span>
                  </div>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="mt-4">
                <div class="d-flex justify-between mb-1 text-caption font-weight-bold">
                  <span>نسبة الاستهلاك</span>
                  <span>{{ limit.is_unlimited ? '0' : limit.percent }}%</span>
                </div>
                <v-progress-linear
                  :model-value="limit.is_unlimited ? 0 : limit.percent"
                  :color="getProgressColor(limit.percent, limit.is_unlimited)"
                  height="8"
                  rounded
                  striped
                />
              </div>

              <div class="text-caption text-grey mt-3 d-flex align-center justify-end gap-1">
                <v-icon icon="ri-checkbox-circle-line" size="14" color="success" v-if="limit.is_unlimited || limit.percent < 100" />
                <v-icon icon="ri-error-warning-line" size="14" color="error" v-else />
                <span>{{ getLimitStatusText(limit) }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Upgrade Plan Dialog -->
    <v-dialog v-model="showUpgradeDialog" max-width="950" scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="ri-vip-crown-line" class="me-2" />
          <span class="font-weight-bold">تغيير وترقية باقة الاشتراك</span>
          <v-spacer />
          <v-btn icon="ri-close-line" color="white" variant="text" @click="showUpgradeDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6 bg-grey-lighten-4" style="max-height: 75vh">
          <v-row v-if="loadingPlans">
            <v-col cols="12" class="text-center py-12">
              <v-progress-circular indeterminate color="primary" size="48" />
              <div class="mt-4 text-body-1 text-grey">جاري تحميل الباقات المتاحة...</div>
            </v-col>
          </v-row>

          <v-row v-else class="justify-center">
            <v-col cols="12" class="text-center mb-4">
              <h3 class="text-h6 font-weight-bold text-grey-darken-3">اختر الباقة المناسبة لاحتياجات عملك الحالية</h3>
              <p class="text-body-2 text-grey">تتم الترقية فوراً ويتم تحديث حدود حسابك مباشرة</p>
            </v-col>

            <v-col v-for="plan in plans" :key="plan.id" cols="12" md="6" lg="4" class="d-flex">
              <v-card
                class="rounded-xl border border-opacity-10 shadow-sm d-flex flex-column justify-between w-100 position-relative overflow-hidden transition-all duration-300"
                :class="{ 'featured-plan-card': plan.price > 0, 'current-plan-card': subscriptionData.plan_id === plan.id }"
                elevation="1"
              >
                <!-- Badge for current plan -->
                <div v-if="subscriptionData.plan_id === plan.id" class="current-plan-badge">الباقة الحالية</div>

                <v-card-text class="pa-5 d-flex flex-column h-100">
                  <div class="d-flex align-center gap-3 mb-4">
                    <v-avatar color="primary" variant="tonal" size="44" class="rounded-lg">
                      <v-icon :icon="plan.icon || 'ri-vip-crown-line'" color="primary" />
                    </v-avatar>
                    <div>
                      <h4 class="font-weight-bold text-h6 text-grey-darken-3 mb-0">{{ plan.name }}</h4>
                      <span class="text-caption text-grey">{{ plan.description }}</span>
                    </div>
                  </div>

                  <div class="plan-pricing mb-2">
                    <span class="text-h4 font-weight-black text-primary">{{ plan.price }}</span>
                    <span class="text-caption text-grey ms-1">EGP / {{ plan.duration }} {{ getDurationUnitLabel(plan.duration_unit) }}</span>
                  </div>

                  <div class="mb-4">
                    <v-chip v-if="plan.trial_days > 0" size="small" color="info" variant="tonal" class="font-weight-bold">
                      فترة تجربة مجانية: {{ plan.trial_days }} يوم
                    </v-chip>
                    <v-chip v-else-if="plan.price > 0" size="small" color="warning" variant="tonal" class="font-weight-bold">
                      تفعيل فوري بالدفع (بدون تجربة)
                    </v-chip>
                    <v-chip v-else size="small" color="success" variant="tonal" class="font-weight-bold"> مجانية بالكامل (بدون تجربة) </v-chip>
                  </div>

                  <v-divider class="mb-4" />

                  <!-- Features List -->
                  <div class="plan-features d-flex flex-column gap-2 mb-6">
                    <div class="d-flex align-center gap-2 text-body-2">
                      <v-icon icon="ri-checkbox-circle-fill" color="success" size="16" />
                      <span
                        >المستخدمين: <strong>{{ plan.max_users === -1 || plan.max_users === null ? 'غير محدود' : plan.max_users }}</strong></span
                      >
                    </div>
                    <div class="d-flex align-center gap-2 text-body-2">
                      <v-icon icon="ri-checkbox-circle-fill" color="success" size="16" />
                      <span
                        >المنتجات:
                        <strong>{{ plan.max_products === -1 || plan.max_products === null ? 'غير محدود' : plan.max_products }}</strong></span
                      >
                    </div>
                    <div class="d-flex align-center gap-2 text-body-2">
                      <v-icon icon="ri-checkbox-circle-fill" color="success" size="16" />
                      <span
                        >الفواتير:
                        <strong>{{ plan.max_invoices === -1 || plan.max_invoices === null ? 'غير محدود' : plan.max_invoices }}</strong></span
                      >
                    </div>
                    <div class="d-flex align-center gap-2 text-body-2" :class="{ 'text-grey opacity-60': !getFeatureFlag(plan, 'payment_gateways') }">
                      <v-icon
                        :icon="getFeatureFlag(plan, 'payment_gateways') ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                        :color="getFeatureFlag(plan, 'payment_gateways') ? 'success' : 'grey'"
                        size="16"
                      />
                      <span>بوابات الدفع الإلكتروني</span>
                    </div>
                    <div
                      class="d-flex align-center gap-2 text-body-2"
                      :class="{ 'text-grey opacity-60': !getFeatureFlag(plan, 'installment_system') }"
                    >
                      <v-icon
                        :icon="getFeatureFlag(plan, 'installment_system') ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                        :color="getFeatureFlag(plan, 'installment_system') ? 'success' : 'grey'"
                        size="16"
                      />
                      <span>نظام التقسيط</span>
                    </div>
                    <div class="d-flex align-center gap-2 text-body-2" :class="{ 'text-grey opacity-60': !getFeatureFlag(plan, 'warehouses_multi') }">
                      <v-icon
                        :icon="getFeatureFlag(plan, 'warehouses_multi') ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                        :color="getFeatureFlag(plan, 'warehouses_multi') ? 'success' : 'grey'"
                        size="16"
                      />
                      <span>المخازن المتعددة</span>
                    </div>
                  </div>

                  <v-spacer />

                  <v-btn
                    block
                    :color="
                      subscriptionData.plan_id === plan.id && subscriptionData.status !== 'pending' && subscriptionData.status !== 'expired'
                        ? 'grey'
                        : 'primary'
                    "
                    :disabled="subscriptionData.plan_id === plan.id && subscriptionData.status !== 'pending' && subscriptionData.status !== 'expired'"
                    class="rounded-pill font-weight-bold py-2 mt-4"
                    :loading="loadingUpgrade && selectedUpgradePlanId === plan.id"
                    @click="confirmUpgrade(plan)"
                  >
                    <template v-if="subscriptionData.plan_id === plan.id">
                      <span v-if="subscriptionData.status === 'pending'">إتمام الدفع والتفعيل</span>
                      <span v-else-if="subscriptionData.status === 'expired'">تجديد الاشتراك</span>
                      <span v-else>باقتك الحالية</span>
                    </template>
                    <template v-else> تفعيل هذه الباقة </template>
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Pricing Calculator & Checkout Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="750" scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="ri-shopping-cart-2-line" class="me-2" />
          <span class="font-weight-bold">تجهيز واحتساب قيمة الاشتراك بالباقة</span>
          <v-spacer />
          <v-btn icon="ri-close-line" color="white" variant="text" @click="showConfirmDialog = false" />
        </v-card-title>
        <v-card-text class="pa-4 bg-grey-lighten-5" style="max-height: 80vh">
          <div class="mb-4 text-body-2 text-warning font-weight-bold pa-3 rounded bg-amber-lighten-5 border-warning d-flex align-center gap-2">
            <v-icon icon="ri-alert-line" color="warning" />
            <span>ملاحظة: تفعيل هذه الباقة سيقوم بإلغاء اشتراكك الحالي تلقائياً وتفعيل الباقة الجديدة بالمدد والخصومات المحتسبة.</span>
          </div>
          <PricingCalculatorWidget v-if="planToUpgrade" :plan="planToUpgrade" :submitting="loadingUpgrade" @confirm="handleUpgrade" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';
import PricingCalculatorWidget from '@/modules/settings/components/PricingCalculatorWidget.vue';

const router = useRouter();
const route = useRoute();
const subApi = useApi('/api/saas/my-subscription');
const plansApi = useApi('/api/public/plans');

const subscriptionData = ref(null);
const loading = ref(false);
const savingAutoRenew = ref(false);

const plans = ref([]);
const loadingPlans = ref(false);
const showUpgradeDialog = ref(false);
const showConfirmDialog = ref(false);
const loadingUpgrade = ref(false);
const selectedUpgradePlanId = ref(null);
const planToUpgrade = ref(null);

const getStatusColor = status => {
  if (status === 'active') return 'success';
  if (status === 'trial') return 'info';
  if (status === 'pending') return 'warning';
  if (status === 'canceled') return 'error';
  if (status === 'expired') return 'error';
  return 'grey';
};

const getStatusLabel = status => {
  if (status === 'active') return 'باقة نشطة';
  if (status === 'trial') return 'فترة تجريبية مجانية';
  if (status === 'pending') return 'معلق بانتظار الدفع';
  if (status === 'canceled') return 'ملغي';
  if (status === 'expired') return 'منتهي الصلاحية';
  return status;
};

const getResourceIcon = key => {
  if (key === 'users') return 'ri-group-line';
  if (key === 'products') return 'ri-box-3-line';
  if (key === 'invoices') return 'ri-file-list-3-line';
  if (key === 'warehouses') return 'ri-store-line';
  if (key === 'projects') return 'ri-folder-open-line';
  if (key === 'storage_size') return 'ri-database-2-line';
  if (key === 'whatsapp_messages') return 'ri-whatsapp-line';
  if (key === 'api_calls') return 'ri-code-s-slash-line';
  return 'ri-information-line';
};

const getResourceColor = key => {
  if (key === 'users') return 'primary';
  if (key === 'products') return 'success';
  if (key === 'invoices') return 'info';
  if (key === 'warehouses') return 'warning';
  if (key === 'projects') return 'amber';
  if (key === 'storage_size') return 'teal';
  if (key === 'whatsapp_messages') return 'success';
  if (key === 'api_calls') return 'deep-purple';
  return 'grey';
};

const getResourceLabel = key => {
  if (key === 'users') return 'المستخدمين وفريق العمل';
  if (key === 'products') return 'المنتجات والخدمات';
  if (key === 'invoices') return 'الفواتير الصادرة';
  if (key === 'warehouses') return 'المخازن والمستودعات';
  if (key === 'projects') return 'المشاريع المفتوحة';
  if (key === 'storage_size') return 'مساحة التخزين (ميجابايت)';
  if (key === 'whatsapp_messages') return 'رسائل الواتساب المرسلة';
  if (key === 'api_calls') return 'طلبات API الشهرية';
  return key;
};

const getProgressColor = (percent, isUnlimited) => {
  if (isUnlimited) return 'success';
  if (percent >= 90) return 'error';
  if (percent >= 70) return 'warning';
  return 'success';
};

const getLimitStatusText = limit => {
  if (limit.is_unlimited) return 'موارد غير محدودة';
  if (limit.percent >= 100) return 'لقد تجاوزت الحد الأقصى';
  return `متبقي ${limit.max - limit.current} من الحدود`;
};

const getDurationUnitLabel = unit => {
  if (unit === 'days') return 'يوم';
  if (unit === 'months') return 'شهر';
  if (unit === 'years') return 'سنة';
  return unit;
};

const getFeatureFlag = (plan, key) => {
  let feats = plan.features || {};
  if (typeof feats === 'string') {
    try {
      feats = JSON.parse(feats);
    } catch (e) {
      feats = {};
    }
  }
  return !!feats[key];
};

const loadSubscription = async () => {
  loading.value = true;
  try {
    const response = await subApi.get();
    subscriptionData.value = response.data || null;
  } catch (error) {
    console.error('Failed to load subscription details:', error);
  } finally {
    loading.value = false;
  }
};

const handleToggleAutoRenew = async val => {
  savingAutoRenew.value = true;
  try {
    const response = await subApi.request('patch', 'toggle-auto-renew', { auto_renew: val });
    toast.success(response.message || 'تم تحديث التجديد التلقائي بنجاح');
  } catch (error) {
    // تراجع عن التبديل في حال فشل الطلب
    if (subscriptionData.value) {
      subscriptionData.value.auto_renew = !val;
    }
  } finally {
    savingAutoRenew.value = false;
  }
};

const openUpgradeDialog = () => {
  showUpgradeDialog.value = true;
  loadPlans();
};

const loadPlans = async () => {
  loadingPlans.value = true;
  try {
    const response = await plansApi.get();
    plans.value = response.data || [];
  } catch (error) {
    console.error('Failed to load plans:', error);
  } finally {
    loadingPlans.value = false;
  }
};

const confirmUpgrade = plan => {
  planToUpgrade.value = plan;
  selectedUpgradePlanId.value = plan.id;
  showConfirmDialog.value = true;
};

const handleUpgrade = async checkoutData => {
  const planId = checkoutData?.plan_id || selectedUpgradePlanId.value;
  const months = checkoutData?.months || 1;
  const couponCode = checkoutData?.coupon_code || null;

  if (!planId) return;
  loadingUpgrade.value = true;
  try {
    const redirectUrl = window.location.origin + '/app/my-subscription';
    const response = await subApi.request('post', 'upgrade', {
      plan_id: planId,
      months: months,
      coupon_code: couponCode,
      redirect_url: redirectUrl,
    });

    if (response.data?.requires_payment && response.data?.payment_url) {
      toast.info('جاري توجيهك لبوابة الدفع الإلكتروني لإتمام عملية الاشتراك...');
      setTimeout(() => {
        window.location.href = response.data.payment_url;
      }, 1000);
      return;
    }

    toast.success(response.message || 'تم ترقية وتغيير باقة الاشتراك بنجاح');
    subscriptionData.value = response.data || null;
    showConfirmDialog.value = false;
    showUpgradeDialog.value = false;
  } catch (error) {
    console.error('Upgrade failed:', error);
  } finally {
    loadingUpgrade.value = false;
  }
};

onMounted(async () => {
  await loadSubscription();

  if (route.query.payment_status) {
    if (route.query.payment_status === 'success') {
      toast.success('تمت عملية الدفع بنجاح! وتفعيل اشتراكك بالباقة الجديدة.');
    } else if (route.query.payment_status === 'cancel') {
      toast.warning('تم إلغاء عملية الدفع ولم يتم تغيير الباقة.');
    }
    router.replace({ query: {} });
  } else if (route.query.upgrade_plan_id) {
    const planId = Number(route.query.upgrade_plan_id);
    await loadPlans();
    const foundPlan = plans.value.find(p => p.id === planId);
    if (foundPlan) {
      confirmUpgrade(foundPlan);
    }
    // Clean up the query param
    router.replace({ query: {} });
  }
});
</script>

<script>
export default {
  name: 'MySubscription',
};
</script>

<style scoped>
.my-subscription-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
}

.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-right: 4px solid rgb(var(--v-theme-primary));
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.auto-renew-box {
  background-color: rgba(0, 0, 0, 0.03);
}

.featured-plan-card {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}

.current-plan-card {
  border: 2px dashed #9e9e9e !important;
  background-color: #f5f5f5 !important;
}

.current-plan-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: #4caf50;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 1;
}

.transition-all {
  transition: all 0.3s ease-in-out;
}
</style>
