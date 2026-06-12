<!--   شاشة إدارة باقات الساس (SaaS Plans) للسوبر أدمن لإنشاء وتعديل الباقات والتحكم بمرونة في الميزات والحدود العددية للمستأجرين ومتابعة اشتراكات الشركات وتغيير باقاتهم -->

<template>
  <div class="saas-plans-page">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center gap-2 mb-2">
        <v-btn icon="ri-arrow-right-line" variant="text" @click="router.push({ name: 'settings' })" />
        <h1 class="text-h3 font-weight-bold primary--text">إدارة باقات SaaS</h1>
      </div>
      <p class="text-subtitle-1 text-grey-darken-1">
        تحديد الميزات وتعيين قيود الموارد وتشكيل الباقات مع متابعة اشتراكات المستأجرين وتحديثها للسوبر أدمن
      </p>
    </div>

    <!-- Navigation Tabs -->
    <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="border-b mb-6 tour-saas-tabs">
      <v-tab :value="0">
        <v-icon icon="ri-vip-crown-line" class="me-2" />
        الباقات والأسعار
      </v-tab>
      <v-tab :value="1" @click="loadCompanies">
        <v-icon icon="ri-building-line" class="me-2" />
        اشتراكات الشركات
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Tab 1: Plans and Prices -->
      <v-window-item :value="0">
        <AppDataTable
          :headers="headers"
          :items="plans"
          :loading="loading"
          :local="true"
          title="قائمة الباقات والأسعار"
          subtitle="تحديد الميزات وتعيين قيود الموارد وتشكيل باقات النظام"
          icon="ri-vip-crown-line"
          table-key="saas_plans.index"
          class="premium-card"
        >
          <template #actions v-if="can(PERMISSIONS.PLANS_CREATE) || can(PERMISSIONS.ADMIN_SUPER)">
            <v-btn color="primary" prepend-icon="ri-add-line" class="rounded-lg font-weight-bold" @click="handleCreate"> إضافة باقة جديدة </v-btn>
          </template>

          <template #item.name="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar color="primary" variant="tonal" size="36" class="me-3">
                <v-icon :icon="item.icon || 'ri-vip-crown-line'" size="18" />
              </v-avatar>
              <div>
                <div class="font-weight-bold text-body-1">{{ item.name }}</div>
                <div class="text-caption text-grey">{{ item.code }}</div>
              </div>
            </div>
          </template>

          <template #item.price="{ item }">
            <span class="font-weight-bold text-primary">{{ item.price }} {{ item.currency }}</span>
          </template>

          <template #item.duration="{ item }">
            <span>{{ item.duration }} / {{ getDurationUnitLabel(item.duration_unit) }}</span>
          </template>

          <template #item.trial_days="{ item }">
            <v-chip size="small" color="info" variant="tonal"> {{ item.trial_days }} يوم تجربة </v-chip>
          </template>

          <template #item.active_companies_count="{ item }">
            <v-chip size="small" color="primary" variant="flat" class="font-weight-bold"> {{ item.active_companies_count ?? 0 }} شركة </v-chip>
          </template>

          <template #item.active_users_count="{ item }">
            <v-chip size="small" color="secondary" variant="flat" class="font-weight-bold"> {{ item.active_users_count ?? 0 }} مستخدم </v-chip>
          </template>

          <template #item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
              {{ item.is_active ? 'نشط' : 'معطل' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1 justify-end">
              <v-btn
                v-if="can(PERMISSIONS.PLANS_UPDATE_ALL) || can(PERMISSIONS.ADMIN_SUPER)"
                icon="ri-edit-line"
                size="small"
                variant="text"
                color="primary"
                @click="handleEdit(item)"
              />
              <v-btn
                v-if="can(PERMISSIONS.PLANS_DELETE_ALL) || can(PERMISSIONS.ADMIN_SUPER)"
                icon="ri-delete-bin-line"
                size="small"
                variant="text"
                color="error"
                @click="handleDelete(item)"
              />
            </div>
          </template>

          <template #empty-actions v-if="can(PERMISSIONS.PLANS_CREATE) || can(PERMISSIONS.ADMIN_SUPER)">
            <v-btn color="primary" variant="outlined" @click="handleCreate">إضافة باقة</v-btn>
          </template>
        </AppDataTable>
      </v-window-item>

      <!-- Tab 2: Companies Subscriptions -->
      <v-window-item :value="1">
        <AppDataTable
          :headers="companyHeaders"
          :items="companies"
          :loading="loadingCompanies"
          :local="true"
          title="اشتراكات المستأجرين والشركات"
          subtitle="متابعة اشتراكات المستأجرين والشركات واستهلاك موارد الساس"
          icon="ri-building-line"
          table-key="saas_subscriptions.index"
          class="premium-card"
        >
          <template #actions>
            <v-text-field
              v-model="searchCompany"
              prepend-inner-icon="ri-search-line"
              label="البحث عن شركة..."
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 300px; min-width: 200px"
              @update:model-value="loadCompanies"
              clearable
            />
          </template>

          <template #item.company_name="{ item }">
            <div class="py-2">
              <div class="font-weight-bold text-body-1">{{ item.company_name }}</div>
              <div class="text-caption text-grey">معرف الشركة: {{ item.company_id }}</div>
            </div>
          </template>

          <template #item.owner="{ item }">
            <div class="py-2">
              <div class="font-weight-medium">{{ item.owner_name }}</div>
              <div class="text-caption text-grey">{{ item.owner_phone || item.company_phone }}</div>
            </div>
          </template>

          <template #item.plan_name="{ item }">
            <v-chip size="small" :color="item.is_master ? 'amber-darken-3' : 'primary'" variant="tonal" class="font-weight-bold">
              {{ item.is_master ? 'باقة الإدارة (الشركة الأم)' : item.plan_name }}
            </v-chip>
          </template>

          <template #item.subscription_status="{ item }">
            <v-chip
              :color="getSubscriptionStatusColor(item.subscription_status)"
              size="small"
              variant="flat"
              class="font-weight-bold text-capitalize"
            >
              {{ getSubscriptionStatusLabel(item.subscription_status) }}
            </v-chip>
          </template>

          <template #item.usage="{ item }">
            <div class="d-flex flex-wrap gap-2 py-2">
              <span class="border rounded-pill px-3 py-1 text-caption bg-grey-lighten-4 d-inline-flex align-center gap-1">
                <v-icon icon="ri-user-line" size="12" />
                <strong>{{ item.usage.users }}</strong> مستخدم
              </span>
              <span class="border rounded-pill px-3 py-1 text-caption bg-grey-lighten-4 d-inline-flex align-center gap-1">
                <v-icon icon="ri-box-3-line" size="12" />
                <strong>{{ item.usage.products }}</strong> منتج
              </span>
              <span class="border rounded-pill px-3 py-1 text-caption bg-grey-lighten-4 d-inline-flex align-center gap-1">
                <v-icon icon="ri-bill-line" size="12" />
                <strong>{{ item.usage.invoices }}</strong> فاتورة
              </span>
              <span class="border rounded-pill px-3 py-1 text-caption bg-grey-lighten-4 d-inline-flex align-center gap-1">
                <v-icon icon="ri-store-line" size="12" />
                <strong>{{ item.usage.warehouses }}</strong> مخزن
              </span>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1 justify-end py-2">
              <v-btn
                v-if="!item.is_master && (can(PERMISSIONS.SUBSCRIPTIONS_UPDATE_ALL) || can(PERMISSIONS.ADMIN_SUPER))"
                color="primary"
                variant="outlined"
                size="small"
                class="rounded-pill font-weight-bold tour-change-plan-btn"
                prepend-icon="ri-exchange-line"
                @click="handleOpenChangePlan(item)"
              >
                تغيير الباقة
              </v-btn>
              <span v-else class="text-caption text-grey me-2 font-weight-bold">الشركة الأم</span>
            </div>
          </template>
        </AppDataTable>
      </v-window-item>
    </v-window>

    <!-- Dialog Edit/Add Plan -->
    <v-dialog v-model="showDialog" max-width="850" persistent scrollable>
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="ri-vip-crown-line" class="me-2" />
          <span class="font-weight-bold">{{ isEdit ? 'تعديل الباقة' : 'باقة جديدة' }}</span>
          <v-spacer />
          <v-btn icon="ri-close-line" color="white" variant="text" @click="showDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6" style="max-height: 70vh">
          <v-form ref="formRef" v-model="formValid">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-primary">المعلومات الأساسية</h3>
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="اسم الباقة *"
                  placeholder="مثال: الباقة الاحترافية"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.code"
                  label="كود الباقة الفريد *"
                  placeholder="مثال: premium"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  :disabled="isEdit"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.price"
                  label="سعر الباقة *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  suffix="EGP"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.duration"
                  label="المدة *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.duration_unit"
                  label="وحدة المدة *"
                  :items="[
                    { title: 'أيام', value: 'days' },
                    { title: 'شهور', value: 'months' },
                    { title: 'سنوات', value: 'years' },
                  ]"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-switch v-model="formData.enable_trial" color="primary" label="تفعيل فترة تجربة مجانية للباقة" inset hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.trial_days"
                  label="أيام التجربة المجانية (Trial Days) *"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :disabled="!formData.enable_trial"
                  :rules="[formData.enable_trial ? rules.required : null]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.icon"
                  label="أيقونة الباقة (Icon Class)"
                  placeholder="مثال: ri-vip-crown-line"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="وصف الباقة"
                  placeholder="اكتب وصفاً موجزاً للميزات المعروضة للمستخدم"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                />
              </v-col>
              <v-col cols="12">
                <v-switch v-model="formData.is_active" color="success" label="تنشيط الباقة لعرضها بالموقع والاشتراكات" inset />
              </v-col>
            </v-row>

            <v-divider class="mb-6" />

            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-primary">الميزات والصلاحيات (تفعيل / تعطيل)</h3>
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.payment_gateways"
                  color="primary"
                  label="تفعيل بوابات الدفع الإلكتروني (Stripe/Paymob)"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.export_import"
                  color="primary"
                  label="تفعيل استيراد وتصدير المنتجات بالخلفية"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="featuresData.mail_settings"
                  color="primary"
                  label="إلى حد ما إعدادات خادم البريد المخصص للشركة"
                  inset
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="featuresData.warehouses_multi" color="primary" label="تنشيط المخازن المتعددة" inset density="compact" />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="featuresData.installment_system" color="primary" label="تنشيط نظام التقسيط وإدارة الخطط" inset density="compact" />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="featuresData.activity_logs" color="primary" label="إتاحة الوصول لسجل الأنشطة والعمليات" inset density="compact" />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="featuresData.reports_advanced" color="primary" label="تنشيط التقارير المالية المتقدمة" inset density="compact" />
              </v-col>
            </v-row>

            <v-divider class="mb-6" />

            <h3 class="text-subtitle-1 font-weight-bold mb-4 text-primary">الحدود والقيود العددية (Numeric Limits)</h3>
            <p class="text-caption text-grey mb-4">* ملاحظة: اكتب القيمة (-1) أو اترك الحقل فارغاً لجعل الحد غير محدود</p>
            <v-row>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_users"
                  label="الحد الأقصى للمستخدمين"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_products"
                  label="الحد الأقصى للمنتجات"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_invoices"
                  label="الحد الأقصى للفواتير"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="featuresData.max_warehouses"
                  label="الحد الأقصى للمخازن"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_projects"
                  label="الحد الأقصى للمشاريع"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="formData.max_storage_mb"
                  label="الحد الأقصى للمساحة (ميجابايت)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="featuresData.max_whatsapp_messages"
                  label="الحد الأقصى لرسائل الواتساب"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
              <v-col cols="12" md="6" lg="3">
                <v-text-field
                  v-model="featuresData.max_api_calls"
                  label="الحد الأقصى لطلبات API"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  placeholder="غير محدود"
                />
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <div class="d-flex align-center justify-between mb-4 flex-wrap gap-2">
              <h3 class="text-subtitle-1 font-weight-bold mb-0 text-primary">شرائح أسعار الاشتراكات والخصومات (Pricing Tiers)</h3>
              <v-btn
                color="secondary"
                variant="outlined"
                size="small"
                prepend-icon="ri-add-line"
                class="rounded-pill font-weight-bold"
                @click="addPricingTier"
              >
                إضافة شريحة سعريّة
              </v-btn>
            </div>
            <p class="text-caption text-grey mb-4">حدد السعر المخفض لكل شهر بناءً على عدد أشهر حجز الباقة (Tiered Pricing).</p>

            <v-row v-if="formData.pricing_tiers && formData.pricing_tiers.length > 0" class="mb-6">
              <v-col cols="12">
                <v-row v-for="(tier, index) in formData.pricing_tiers" :key="index" class="align-center mb-2 dense">
                  <v-col cols="12" sm="3">
                    <v-text-field
                      v-model="tier.min_months"
                      label="الحد الأدنى للأشهر *"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                      min="1"
                    />
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      v-model="tier.max_months"
                      label="الحد الأقصى للأشهر"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                      placeholder="ما لا نهاية"
                    />
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      v-model="tier.price_per_month"
                      label="السعر لكل شهر *"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                      suffix="EGP"
                    />
                  </v-col>
                  <v-col cols="12" sm="2">
                    <v-text-field
                      v-model="tier.discount_percent"
                      label="الخصم %"
                      type="number"
                      variant="outlined"
                      density="compact"
                      hide-details
                      suffix="%"
                    />
                  </v-col>
                  <v-col cols="12" sm="1" class="text-center">
                    <v-btn icon="ri-delete-bin-line" color="error" variant="text" size="small" @click="removePricingTier(index)" />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <div v-else class="text-center py-4 bg-grey-lighten-4 rounded-lg mb-6 text-grey text-body-2 border border-dashed">
              لم يتم تحديد أي شرائح أسعار مخصصة لهذه الباقة حالياً. سيتم استخدام السعر الأساسي لكافة المدد.
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer />
          <v-btn variant="text" class="rounded-pill font-weight-bold" @click="showDialog = false">إلغاء</v-btn>
          <v-btn color="primary" class="rounded-pill px-6 font-weight-bold" :loading="saving" @click="handleSave">حفظ الباقة</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Change Company Plan -->
    <v-dialog v-model="showChangePlanDialog" max-width="500" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="ri-exchange-line" class="me-2" />
          <span class="font-weight-bold">تغيير باقة الشركة</span>
          <v-spacer />
          <v-btn icon="ri-close-line" color="white" variant="text" @click="showChangePlanDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-6">
            <div class="text-subtitle-1 text-grey mb-1">الشركة المستهدفة:</div>
            <div class="text-h6 font-weight-bold text-primary">{{ selectedCompany?.company_name }}</div>
            <div class="text-body-2 text-grey-darken-1 mt-1">
              المالك: {{ selectedCompany?.owner_name }} ({{ selectedCompany?.company_phone || selectedCompany?.owner_phone }})
            </div>
            <div class="text-body-2 font-weight-bold mt-2">
              الباقة الحالية: <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">{{ selectedCompany?.plan_name }}</v-chip>
              <span class="ms-2">({{ getSubscriptionStatusLabel(selectedCompany?.subscription_status) }})</span>
            </div>
          </div>

          <v-select
            v-model="selectedPlanId"
            label="اختر الباقة الجديدة *"
            :items="plans"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            placeholder="اختر الباقة لتغيير اشتراك الشركة إليها"
            class="mt-2"
          >
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`${item.raw.price} EGP / ${item.raw.duration} ${getDurationUnitLabel(item.raw.duration_unit)}`"
              />
            </template>
          </v-select>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer />
          <v-btn variant="text" class="rounded-pill font-weight-bold" @click="showChangePlanDialog = false">إلغاء</v-btn>
          <v-btn color="primary" class="rounded-pill px-6 font-weight-bold" :loading="changingPlan" @click="confirmChangePlan"
            >تغيير الباقة وتحديث الاشتراك</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">تأكيد الحذف</v-card-title>
        <v-card-text>
          هل أنت متأكد من حذف الباقة "<strong>{{ selectedItem?.name }}</strong
          >"؟
          <div class="text-caption text-error mt-2">لا يمكن الحذف إذا كانت الباقة مرتبطة باشتراك نشط حالي لبعض الشركات.</div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">إلغاء</v-btn>
          <v-btn color="error" class="rounded-pill font-weight-bold px-4" :loading="deleting" @click="confirmDelete">حذف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import AppDataTable from '@/components/common/AppDataTable.vue';

const router = useRouter();
const { can, canAny } = usePermissions();
const api = useApi('/api/plans');
const companiesApi = useApi('/api/saas/companies-subscriptions');
const changePlanApi = useApi('/api/saas/companies-subscriptions/change-plan');

const activeTab = ref(0);
const plans = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formValid = ref(false);
const formRef = ref(null);

// بيانات اشتراكات الشركات
const companies = ref([]);
const loadingCompanies = ref(false);
const showChangePlanDialog = ref(false);
const selectedCompany = ref(null);
const selectedPlanId = ref(null);
const changingPlan = ref(false);
const searchCompany = ref('');

const formData = ref({
  name: '',
  code: '',
  description: '',
  price: 0,
  currency: 'EGP',
  duration: 1,
  duration_unit: 'months',
  trial_days: 0,
  enable_trial: false,
  is_active: true,
  max_users: null,
  max_products: null,
  max_invoices: null,
  max_projects: null,
  max_storage_mb: null,
  icon: 'ri-vip-crown-line',
  pricing_tiers: [],
});

const featuresData = ref({
  payment_gateways: false,
  export_import: false,
  mail_settings: false,
  warehouses_multi: false,
  installment_system: false,
  activity_logs: false,
  reports_advanced: false,
  max_warehouses: null,
  max_whatsapp_messages: null,
  max_api_calls: null,
});

const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'اسم الباقة والكود', key: 'name', sortable: true },
  { title: 'السعر', key: 'price', sortable: true },
  { title: 'المدة', key: 'duration', sortable: true },
  { title: 'فترة التجربة', key: 'trial_days', sortable: true },
  { title: 'الشركات المشتركة', key: 'active_companies_count', sortable: true, align: 'center' },
  { title: 'المستخدمون المشتركون', key: 'active_users_count', sortable: true, align: 'center' },
  { title: 'حالة الباقة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const companyHeaders = [
  { title: 'اسم الشركة والمعرف', key: 'company_name', sortable: true },
  { title: 'المالك والتواصل', key: 'owner', sortable: false },
  { title: 'الباقة الحالية', key: 'plan_name', sortable: true },
  { title: 'حالة الاشتراك', key: 'subscription_status', sortable: true },
  { title: 'استهلاك الموارد', key: 'usage', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
};

const getDurationUnitLabel = unit => {
  if (unit === 'days') return 'يوم';
  if (unit === 'months') return 'شهر';
  if (unit === 'years') return 'سنة';
  return unit;
};

const getSubscriptionStatusColor = status => {
  if (status === 'active') return 'success';
  if (status === 'trial') return 'info';
  if (status === 'canceled') return 'warning';
  if (status === 'expired') return 'error';
  return 'grey';
};

const getSubscriptionStatusLabel = status => {
  if (status === 'active') return 'نشط';
  if (status === 'trial') return 'تجريبي';
  if (status === 'canceled') return 'ملغي';
  if (status === 'expired') return 'منتهي';
  return 'غير نشط';
};

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get();
    plans.value = response.data || [];
  } catch (error) {
    console.error('Failed to load plans:', error);
  } finally {
    loading.value = false;
  }
};

const loadCompanies = async () => {
  loadingCompanies.value = true;
  try {
    const response = await companiesApi.get({ search: searchCompany.value });
    companies.value = response.data || [];
  } catch (error) {
    console.error('Failed to load companies:', error);
  } finally {
    loadingCompanies.value = false;
  }
};

const addPricingTier = () => {
  if (!formData.value.pricing_tiers) {
    formData.value.pricing_tiers = [];
  }
  formData.value.pricing_tiers.push({
    min_months: 3,
    max_months: null,
    price_per_month: 0,
    discount_percent: 0,
  });
};

const removePricingTier = index => {
  formData.value.pricing_tiers.splice(index, 1);
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = {
    name: '',
    code: '',
    description: '',
    price: 0,
    currency: 'EGP',
    duration: 1,
    duration_unit: 'months',
    trial_days: 0,
    enable_trial: false,
    is_active: true,
    max_users: null,
    max_products: null,
    max_invoices: null,
    max_projects: null,
    max_storage_mb: null,
    icon: 'ri-vip-crown-line',
    pricing_tiers: [],
  };
  featuresData.value = {
    payment_gateways: false,
    export_import: false,
    mail_settings: false,
    warehouses_multi: false,
    installment_system: false,
    activity_logs: false,
    reports_advanced: false,
    max_warehouses: null,
    max_whatsapp_messages: null,
    max_api_calls: null,
  };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = {
    name: item.name,
    code: item.code,
    description: item.description || '',
    price: item.price,
    currency: item.currency || 'EGP',
    duration: item.duration,
    duration_unit: item.duration_unit || 'months',
    trial_days: item.trial_days || 0,
    enable_trial: (item.trial_days || 0) > 0,
    is_active: !!item.is_active,
    max_users: item.max_users === -1 ? null : item.max_users,
    max_products: item.max_products === -1 ? null : item.max_products,
    max_invoices: item.max_invoices === -1 ? null : item.max_invoices,
    max_projects: item.max_projects === -1 ? null : item.max_projects,
    max_storage_mb: item.max_storage_mb === -1 ? null : item.max_storage_mb,
    icon: item.icon || 'ri-vip-crown-line',
    pricing_tiers: item.pricing_tiers || [],
  };

  let feats = item.features || {};
  if (typeof feats === 'string') {
    try {
      feats = JSON.parse(feats);
    } catch (e) {
      feats = {};
    }
  }

  featuresData.value = {
    payment_gateways: !!feats.payment_gateways,
    export_import: !!feats.export_import,
    mail_settings: !!feats.mail_settings,
    warehouses_multi: !!feats.warehouses_multi,
    installment_system: !!feats.installment_system,
    activity_logs: !!feats.activity_logs,
    reports_advanced: !!feats.reports_advanced,
    max_warehouses: feats.max_warehouses === -1 || !feats.max_warehouses ? null : feats.max_warehouses,
    max_whatsapp_messages: feats.max_whatsapp_messages === -1 || !feats.max_whatsapp_messages ? null : feats.max_whatsapp_messages,
    max_api_calls: feats.max_api_calls === -1 || !feats.max_api_calls ? null : feats.max_api_calls,
  };

  showDialog.value = true;
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  if (formRef.value) {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  saving.value = true;

  const finalFeatures = {
    payment_gateways: !!featuresData.value.payment_gateways,
    export_import: !!featuresData.value.export_import,
    mail_settings: !!featuresData.value.mail_settings,
    warehouses_multi: !!featuresData.value.warehouses_multi,
    installment_system: !!featuresData.value.installment_system,
    activity_logs: !!featuresData.value.activity_logs,
    reports_advanced: !!featuresData.value.reports_advanced,
    max_users: formData.value.max_users !== null && formData.value.max_users !== '' ? Number(formData.value.max_users) : -1,
    max_products: formData.value.max_products !== null && formData.value.max_products !== '' ? Number(formData.value.max_products) : -1,
    max_invoices: formData.value.max_invoices !== null && formData.value.max_invoices !== '' ? Number(formData.value.max_invoices) : -1,
    max_projects: formData.value.max_projects !== null && formData.value.max_projects !== '' ? Number(formData.value.max_projects) : -1,
    max_storage_mb: formData.value.max_storage_mb !== null && formData.value.max_storage_mb !== '' ? Number(formData.value.max_storage_mb) : -1,
    max_warehouses:
      featuresData.value.max_warehouses !== null && featuresData.value.max_warehouses !== '' ? Number(featuresData.value.max_warehouses) : -1,
    max_whatsapp_messages:
      featuresData.value.max_whatsapp_messages !== null && featuresData.value.max_whatsapp_messages !== ''
        ? Number(featuresData.value.max_whatsapp_messages)
        : -1,
    max_api_calls:
      featuresData.value.max_api_calls !== null && featuresData.value.max_api_calls !== '' ? Number(featuresData.value.max_api_calls) : -1,
  };

  const cleanTiers = (formData.value.pricing_tiers || []).map(t => ({
    min_months: Number(t.min_months),
    max_months: t.max_months !== null && t.max_months !== '' ? Number(t.max_months) : null,
    price_per_month: Number(t.price_per_month),
    discount_percent: t.discount_percent !== null && t.discount_percent !== '' ? Number(t.discount_percent) : 0,
  }));

  const payload = {
    ...formData.value,
    trial_days: formData.value.enable_trial ? Number(formData.value.trial_days) : 0,
    features: finalFeatures,
    max_users: formData.value.max_users !== null && formData.value.max_users !== '' ? Number(formData.value.max_users) : -1,
    max_products: formData.value.max_products !== null && formData.value.max_products !== '' ? Number(formData.value.max_products) : -1,
    max_invoices: formData.value.max_invoices !== null && formData.value.max_invoices !== '' ? Number(formData.value.max_invoices) : -1,
    max_projects: formData.value.max_projects !== null && formData.value.max_projects !== '' ? Number(formData.value.max_projects) : -1,
    max_storage_mb: formData.value.max_storage_mb !== null && formData.value.max_storage_mb !== '' ? Number(formData.value.max_storage_mb) : -1,
    pricing_tiers: cleanTiers,
  };

  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, payload, { successMessage: 'تم تحديث الباقة بنجاح' });
    } else {
      await api.create(payload, { successMessage: 'تم إضافة الباقة بنجاح' });
    }
    showDialog.value = false;
    loadData();
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await api.remove(selectedItem.value.id, { successMessage: 'تم حذف الباقة بنجاح' });
    showDeleteDialog.value = false;
    loadData();
  } catch (error) {
    console.error('Delete failed:', error);
  } finally {
    deleting.value = false;
  }
};

// عمليات تغيير باقة شركة
const handleOpenChangePlan = company => {
  selectedCompany.value = company;
  selectedPlanId.value = company.plan_id;
  showChangePlanDialog.value = true;
};

const confirmChangePlan = async () => {
  if (!selectedPlanId.value) return;
  changingPlan.value = true;
  try {
    await changePlanApi.create(
      {
        company_id: selectedCompany.value.company_id,
        plan_id: selectedPlanId.value,
      },
      { successMessage: 'تم تغيير باقة الشركة بنجاح' }
    );
    showChangePlanDialog.value = false;
    loadCompanies();
    loadData(); // لتحديث إحصائيات الأعداد المشتركة
  } catch (error) {
    console.error('Failed to change company plan:', error);
  } finally {
    changingPlan.value = false;
  }
};

// مراقبة التبويب النشط لضمان تحميل البيانات تلقائياً وبشكل موثوق
watch(activeTab, newVal => {
  if (newVal === 1) {
    loadCompanies();
  } else {
    loadData();
  }
});

onMounted(() => {
  if (activeTab.value === 1) {
    loadCompanies();
  } else {
    loadData();
  }
});
</script>

<style scoped>
.saas-plans-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
}

.plans-table {
  border: none;
}

.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
