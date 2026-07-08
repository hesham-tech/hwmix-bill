<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <AppPageHeader :sticky-top="isDialog ? 0 : 79" sticky>
      <template #prepend>
        <div class="d-flex align-center gap-2">
          <AppButton icon="ri-arrow-right-line" variant="tonal" color="primary" size="x-small" density="compact" @click="emit('cancel')" />
          <AppAvatar
            :img-url="primaryImageUrl"
            :name="productData.name || 'P'"
            size="32"
            rounded="md"
            type="product"
            border
          />
        </div>
      </template>

      <template #title>
        <div class="d-flex flex-column gap-0">
          <div class="d-flex align-center gap-2 flex-wrap">
            <span class="text-subtitle-2 font-weight-bold">{{ isEdit ? 'تعديل المنتج' : 'إضافة منتج' }}</span>
            <span v-if="productData.name" class="text-xxs text-grey-darken-1 line-clamp-1">{{ productData.name }}</span>
            <v-chip v-if="isEdit" :color="productData.active ? 'success' : 'error'" size="x-small" variant="flat" class="px-1" density="compact">
              {{ productData.active ? 'نشط' : 'مؤرشف' }}
            </v-chip>
          </div>
          <!-- Progress Indicator -->
          <div class="d-none d-md-flex align-center gap-3 mt-1">
            <div
              v-for="(step, idx) in formProgressSteps"
              :key="idx"
              class="progress-step d-flex align-center gap-1"
              :class="{ 'progress-step--done': step.done, 'progress-step--active': step.active }"
            >
              <div class="step-dot" :class="step.done ? 'bg-success' : step.active ? 'bg-primary' : 'bg-grey-lighten-2'">
                <v-icon v-if="step.done" icon="ri-check-line" size="8" color="white" />
                <span v-else class="step-num">{{ idx + 1 }}</span>
              </div>
              <span class="step-label text-xxs" :class="step.done ? 'text-success' : step.active ? 'text-primary font-weight-bold' : 'text-grey'">{{ step.label }}</span>
              <v-icon v-if="idx < formProgressSteps.length - 1" icon="ri-arrow-left-s-line" size="12" color="grey-lighten-1" />
            </div>
          </div>
        </div>
      </template>

      <template #append>
        <div class="d-flex gap-2 align-center">
          <!-- Form Completion Badge -->
          <v-chip
            size="small"
            :color="formCompletionPercent === 100 ? 'success' : 'warning'"
            variant="tonal"
            density="compact"
            class="d-none d-sm-flex"
          >
            <v-icon :icon="formCompletionPercent === 100 ? 'ri-check-double-line' : 'ri-loader-4-line'" size="12" class="me-1" />
            {{ formCompletionPercent }}% مكتمل
          </v-chip>
          <AppButton variant="text" color="grey-darken-1" size="small" density="compact" @click="emit('cancel')"> إلغاء </AppButton>
          <AppButton color="primary" type="submit" :loading="loading" :disabled="!isValid || missingConversionsError" size="small" density="compact" class="px-4" prepend-icon="ri-save-3-line">
            حفظ
          </AppButton>
        </div>
      </template>
    </AppPageHeader>

    <v-row class="pa-2" no-gutters>
      <!-- =================== RIGHT PANEL (35%): Product Metadata =================== -->
      <v-col cols="12" lg="4" class="pe-lg-2">

        <!-- Information Card -->
        <v-card border flat class="mb-2 overflow-visible">
          <div class="pa-2 bg-grey-lighten-5 rounded-t-lg border-b d-flex flex-column gap-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2">
                <v-avatar color="blue-lighten-5" size="22" class="rounded-md">
                  <v-icon icon="ri-information-line" color="blue-darken-1" size="12" />
                </v-avatar>
                <div>
                  <div class="text-xxs font-weight-bold">المعلومات الأساسية</div>
                  <div class="text-xxs text-grey">الاسم، التصنيف، النوع، والوصف</div>
                </div>
              </div>
              <v-chip v-if="productData.name" size="x-small" color="success" variant="flat" density="compact" prepend-icon="ri-check-line" class="px-1">
                مكتمل
              </v-chip>
            </div>

            <!-- Product Type Cards -->
            <div>
              <div class="text-xxs text-grey mb-1">نوع المنتج:</div>
              <v-item-group v-model="productData.product_type" mandatory class="d-flex flex-wrap gap-2 w-100" @update:model-value="handleTypeChange">
                <v-item v-for="type in productTypes" :key="type.value" :value="type.value">
                  <template #default="{ isSelected, toggle }">
                    <div
                      class="product-type-card rounded-md pa-2 d-flex align-center gap-2 cursor-pointer flex-grow-1"
                      :class="isSelected ? 'product-type-card--active' : 'product-type-card--inactive'"
                      @click="toggle"
                    >
                      <v-icon :icon="type.icon" size="14" :color="isSelected ? 'primary' : 'grey'" />
                      <div class="flex-grow-1">
                        <div class="text-xxs font-weight-bold" :class="isSelected ? 'text-primary' : 'text-grey-darken-1'">{{ type.label }}</div>
                      </div>
                      <v-icon v-if="isSelected" icon="ri-checkbox-circle-fill" size="13" color="primary" />
                    </div>
                  </template>
                </v-item>
              </v-item-group>
            </div>
          </div>
          <v-card-text class="pa-2">
            <v-row dense>
              <v-col cols="12">
                <AppAutocomplete
                  v-model="productData.name"
                  label="اسم المنتج *"
                  help-text="الاسم التجاري للمنتج كما يظهر للعملاء في الفواتير والمتجر."
                  placeholder="ادخل اسم المنتج (مثال: طقم بيجامة قطن)"
                  required
                  variant="outlined"
                  api-endpoint="products"
                  item-title="name"
                  item-value="name"
                  :clearable="false"
                  no-filter
                  hide-no-data
                  @select="handleNameSelect"
                  @update:search="productData.name = $event"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item.raw.category?.name || 'بدون تصنيف'">
                      <template #prepend>
                        <AppAvatar :img-url="item.raw.primary_image_url" :name="item.raw.name" size="32" class="me-2" />
                      </template>
                    </v-list-item>
                  </template>
                </AppAutocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <AppAutocomplete
                  v-model="productData.category_id"
                  :items="productData.category ? [productData.category] : []"
                  label="التصنيف"
                  help-text="يساعد التصنيف في ترتيب المنتجات وتقسيم تقارير المبيعات بدقة."
                  api-endpoint="categories"
                  item-title="full_path"
                  item-value="id"
                  can-create
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="undefined">
                      <template #title>
                        <div class="d-flex align-center flex-wrap gap-1">
                          <span class="font-weight-bold text-body-2">{{ item.raw.name }}</span>
                          <v-chip v-if="!item.raw.company_id" size="x-small" color="info" variant="flat" class="px-1" style="height: 16px; font-size: 9px">عالمي</v-chip>
                        </div>
                      </template>
                      <template #subtitle>
                        <div class="d-flex align-center gap-1 text-caption">
                          <v-icon icon="ri-node-tree" size="12" class="text-primary" />
                          <span v-if="item.raw.parent_path">{{ item.raw.parent_path }}</span>
                          <span v-else>قسم رئيسي</span>
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </AppAutocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <AppAutocomplete
                  v-model="productData.brand_id"
                  :items="productData.brand ? [productData.brand] : []"
                  label="العلامة التجارية"
                  help-text="الماركة أو الشركة المصنعة للمنتج."
                  api-endpoint="brands"
                  item-title="name"
                  item-value="id"
                  can-create
                />
              </v-col>
              <v-col cols="12">
                <AppTextarea
                  v-model="productData.desc"
                  :label="productData.is_active_in_store ? 'وصف موجز *' : 'وصف موجز'"
                  :required="productData.is_active_in_store"
                  placeholder="اكتب وصفاً مختصراً للمنتج..."
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Digital Product Details -->
        <v-expand-transition>
          <v-card v-if="productData.product_type === 'digital'" border flat class="mb-2">
            <div class="pa-2 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center gap-2">
              <v-avatar color="blue-lighten-5" size="22" class="rounded-md">
                <v-icon icon="ri-download-cloud-2-line" color="blue-darken-1" size="12" />
              </v-avatar>
              <div class="text-xxs font-weight-bold">تفاصيل المنتج الرقمي</div>
            </div>
            <v-card-text class="pa-2">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-switch v-model="productData.is_downloadable" label="قابل للتنزيل المباشر" color="primary" inset hide-details />
                </v-col>
                <v-col cols="12" md="6" v-if="productData.is_downloadable">
                  <AppInput v-model="productData.download_url" label="رابط التنزيل" placeholder="https://..." prepend-inner-icon="ri-link" />
                </v-col>
                <v-col cols="12" md="6" v-if="productData.is_downloadable">
                  <AppInput v-model.number="productData.download_limit" label="حد مرات التنزيل" type="number" placeholder="غير محدود" />
                </v-col>
                <v-col cols="12" md="6">
                  <AppInput v-model.number="productData.validity_days" label="مدة الصلاحية (بالأيام)" type="number" placeholder="مثال: 365" />
                </v-col>
                <v-col cols="12">
                  <v-combobox v-model="productData.license_keys" multiple chips closable-chips placeholder="اضغط Enter بعد كل مفتاح" variant="outlined" hint="مفاتيح الترخيص" persistent-hint />
                </v-col>
                <v-col cols="12">
                  <AppTextarea v-model="productData.delivery_instructions" label="تعليمات التسليم" placeholder="تظهر للمشتري بعد الدفع" rows="2" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Measurement Units Card -->
        <v-card border flat class="mb-2">
          <div class="pa-2 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <v-avatar color="orange-lighten-5" size="22" class="rounded-md">
                <v-icon icon="ri-scales-3-line" color="orange-darken-2" size="12" />
              </v-avatar>
              <div>
                <div class="text-xxs font-weight-bold">وحدات القياس</div>
                <div class="text-xxs text-grey">مجموعة القياس ووحدات الشراء والبيع</div>
              </div>
            </div>
            <v-chip v-if="productData.base_unit_id && !missingConversionsError" size="x-small" color="success" variant="flat" density="compact" prepend-icon="ri-check-line" class="px-1">مكتمل</v-chip>
            <v-chip v-else-if="missingConversionsError" size="x-small" color="error" variant="flat" density="compact" prepend-icon="ri-error-warning-line" class="px-1">يحتاج مراجعة</v-chip>
          </div>
          <v-card-text class="pa-2">
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="selectedGroup"
                  :items="unitGroups"
                  item-title="name"
                  item-value="id"
                  required
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  @update:model-value="handleGroupChange"
                >
                  <template #label>
                    <div class="d-flex align-center gap-1">
                      <span>مجموعة وحدات القياس *</span>
                      <AppFieldHelp text="تُحدد نوع الوحدات المسموح بالاختيار منها لمنع تعارض الوحدات غير المتوافقة (مثل الوزن مع الطول)." />
                    </div>
                  </template>
                  <template #prepend-inner>
                    <v-icon icon="ri-stack-line" size="16" color="grey" />
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" class="d-flex align-center">
                <v-switch v-model="productData.allow_decimal_quantities" color="primary" inset density="compact" hide-details>
                  <template #label>
                    <div class="d-flex align-center gap-1">
                      <span class="text-body-2">السماح بكميات عشرية (كسور)</span>
                      <AppFieldHelp text="تفعيل هذا الخيار يسمح ببيع وجرد المنتجات بكسور الوحدات (مثل 1.5 كيلوجرام)." />
                    </div>
                  </template>
                </v-switch>
              </v-col>

              <v-col cols="12" md="4">
                <v-select v-model="productData.base_unit_id" :items="filteredUnits" item-title="name" item-value="id" required variant="outlined" density="compact" hide-details="auto" :disabled="!selectedGroup" :placeholder="!selectedGroup ? 'اختر مجموعة أولاً' : ''">
                  <template #label>
                    <div class="d-flex align-center gap-1">
                      <span>الوحدة الأساسية *</span>
                      <AppFieldHelp text="الوحدة التي يتم تقييم وجرد المخازن بها في قاعدة البيانات. يُنصح دائماً باختيار أصغر وحدة قياس." />
                    </div>
                  </template>
                  <template #prepend-inner><v-icon icon="ri-focus-3-line" size="16" color="grey" /></template>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="productData.purchase_unit_id" :items="filteredUnits" item-title="name" item-value="id" variant="outlined" density="compact" hide-details="auto" :disabled="!selectedGroup" :placeholder="!selectedGroup ? 'اختر مجموعة أولاً' : ''">
                  <template #label>
                    <div class="d-flex align-center gap-1">
                      <span>وحدة الشراء</span>
                      <AppFieldHelp text="الوحدة الافتراضية في فواتير المشتريات." />
                    </div>
                  </template>
                  <template #prepend-inner><v-icon icon="ri-shopping-cart-2-line" size="16" color="grey" /></template>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="productData.display_unit_id" :items="filteredUnits" item-title="name" item-value="id" variant="outlined" density="compact" hide-details="auto" :disabled="!selectedGroup" :placeholder="!selectedGroup ? 'اختر مجموعة أولاً' : ''">
                  <template #label>
                    <div class="d-flex align-center gap-1">
                      <span>وحدة البيع</span>
                      <AppFieldHelp text="الوحدة الافتراضية في فواتير المبيعات ونقاط البيع." />
                    </div>
                  </template>
                  <template #prepend-inner><v-icon icon="ri-price-tag-line" size="16" color="grey" /></template>
                </v-select>
              </v-col>

              <v-col cols="12" md="6" v-if="productData.allow_decimal_quantities">
                <v-select v-model.number="productData.quantity_precision" :items="[1, 2, 3, 4]" variant="outlined" density="compact" hide-details="auto">
                  <template #label>
                    <div class="d-flex align-center gap-1">
                      <span>عدد الخانات العشرية</span>
                      <AppFieldHelp text="دقة التقريب للكسور في الفواتير والجرد." />
                    </div>
                  </template>
                  <template #prepend-inner><v-icon icon="ri-calculator-line" size="16" color="grey" /></template>
                </v-select>
              </v-col>
            </v-row>

            <!-- UOM Alerts -->
            <v-expand-transition>
              <div class="mt-2">
                <v-alert v-if="missingConversionsError" type="error" variant="tonal" density="compact" icon="ri-error-warning-fill" class="text-caption font-weight-bold mb-2">
                  خطأ: لا توجد قاعدة تحويل بين ({{ missingConversionsList }}) والوحدة الأساسية. يجب إضافتها من إعدادات وحدات القياس.
                </v-alert>
                <v-alert v-if="hasSmallerUnitWarning && !missingConversionsError" type="warning" variant="tonal" density="compact" icon="ri-alert-fill" class="text-caption mb-2">
                  <div class="font-weight-bold mb-1">تنبيه: {{ smallerUnitsList }} أصغر من الوحدة الأساسية ({{ getUnitName(productData.base_unit_id) }}).</div>
                  <div class="mb-1"><strong>الصحيح:</strong> الوحدة الأساسية يجب أن تكون أصغر وحدة قياس (مثال: سنتيمتر لا متر).</div>
                  <div><strong>لماذا؟</strong> لتجنب الكسور العشرية في المخزون وضمان دقة الجرد.</div>
                </v-alert>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>

        <!-- Settings Card -->
        <v-card border flat class="mb-2">
          <div class="pa-2 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center gap-2">
            <v-avatar color="grey-lighten-3" size="22" class="rounded-md">
              <v-icon icon="ri-settings-4-line" color="grey-darken-1" size="12" />
            </v-avatar>
            <div class="text-xxs font-weight-bold">حالة العرض والخيارات</div>
          </div>
          <v-card-text class="pa-1">
            <div class="d-flex flex-column">
              <div class="d-flex align-center justify-space-between px-2 py-1 hover-bg rounded">
                <div>
                  <div class="text-body-2 font-weight-bold">متاح للبيع <AppFieldHelp text="تفعيل أو تعطيل بيع هذا المنتج بشكل كامل." /></div>
                  <div class="text-caption text-grey">تفعيل أو تعطيل ظهور المنتج</div>
                </div>
                <v-switch v-model="productData.active" color="primary" hide-details inset density="compact" />
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between px-2 py-1 hover-bg rounded">
                <div>
                  <div class="text-body-2 font-weight-bold">منتج مميز <AppFieldHelp text="المنتجات المميزة تظهر في أقسام خاصة لزيادة مبيعاتها." /></div>
                  <div class="text-caption text-grey">عرض في الصفحة الرئيسية</div>
                </div>
                <v-switch v-model="productData.featured" color="primary" hide-details inset density="compact" />
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between px-2 py-1 hover-bg rounded">
                <div>
                  <div class="text-body-2 font-weight-bold">قابل للإرجاع <AppFieldHelp text="حدد ما إذا كان مسموحاً إرجاع هذا المنتج واسترداد مبلغه." /></div>
                  <div class="text-caption text-grey">السماح بإرجاع المنتج</div>
                </div>
                <v-switch v-model="productData.returnable" color="primary" hide-details inset density="compact" />
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between px-2 py-1 hover-bg rounded">
                <div>
                  <div class="text-body-2 font-weight-bold">يظهر في المتجر <AppFieldHelp text="يتمكن العملاء من رؤيته وطلبه عبر متجرك الإلكتروني." /></div>
                  <div class="text-caption text-grey">عرض المنتج في المتجر الإلكتروني</div>
                </div>
                <v-switch v-model="productData.is_active_in_store" color="primary" hide-details inset density="compact" />
              </div>
              <v-divider />
              <div class="d-flex align-center justify-space-between px-2 py-1 hover-bg rounded">
                <div>
                  <div class="text-body-2 font-weight-bold">يظهر في المبيعات / POS <AppFieldHelp text="يتحكم في إمكانية ظهور هذا المنتج للبائعين في نقطة البيع السريعة." /></div>
                  <div class="text-caption text-grey">عرض في فواتير البيع ونقاط البيع</div>
                </div>
                <v-switch v-model="productData.is_active_in_sales" color="primary" hide-details inset density="compact" />
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Media Card -->
        <v-card border flat class="pb-2">
          <div class="pa-2 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center gap-2">
            <v-avatar color="teal-lighten-5" size="22" class="rounded-md">
              <v-icon icon="ri-image-line" color="teal-darken-1" size="12" />
            </v-avatar>
            <div>
              <div class="text-xxs font-weight-bold">
                صور المنتج
                <span v-if="productData.is_active_in_store" class="text-error">*</span>
              </div>
              <div class="text-xxs text-grey">الصورة الرئيسية وصور المعرض</div>
            </div>
          </div>
          <v-card-text class="pa-2">
            <ProductMediaManager v-model="productData.images" v-model:primaryImageId="productData.primary_image_id" class="mt-1" />
            <div v-if="productData.is_active_in_store && (!productData.images || productData.images.length === 0)" class="text-caption text-error px-2 mt-1 font-weight-bold">
              يجب إضافة صورة واحدة على الأقل عند التفعيل للمتجر.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- =================== LEFT PANEL (65%): Variant Manager =================== -->
      <v-col cols="12" lg="8" class="ps-lg-2">
        <VariantManager
          :key="currentProductId || 'new'"
          v-model="productData.variants"
          :product-type="productData.product_type"
          :units="units"
          :selected-group="selectedGroup"
          :base-unit-id="productData.base_unit_id"
        />
      </v-col>
    </v-row>

    <!-- Duplicate Detection Dialog -->
    <AppDialog
      v-model="showDuplicateDialog"
      title="هذا المنتج موجود بالفعل!"
      icon="ri-error-warning-line"
      confirm-text="تعديل المنتج الموجود"
      cancel-text="تجاهل الاستمرار في الإضافة"
      confirm-color="warning"
      max-width="500"
      @confirm="confirmSwitchToEdit"
      @cancel="cancelNameSelection"
    >
      <div class="pa-4 text-center">
        <v-avatar color="warning-lighten-5" size="64" class="mb-4">
          <v-icon icon="ri-file-search-line" color="warning" size="32" />
        </v-avatar>
        <div class="text-h6 font-weight-bold mb-2">هل تريد تعديل "{{ existingProduct?.name }}"؟</div>
        <p class="text-body-2 text-grey-darken-1">تم العثور على المنتج "{{ existingProduct?.name }}" مسجل مسبقاً بهذا الاسم. هل ترغب في تعديله؟</p>
        <v-chip v-if="existingProduct?.category" size="small" color="primary" variant="tonal" class="mt-2">
          {{ existingProduct.category.name }}
        </v-chip>
      </div>
    </AppDialog>
  </v-form>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../store/product.store';
import { storeToRefs } from 'pinia';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppFieldHelp from '@/components/common/AppFieldHelp.vue';
import VariantManager from './VariantManager.vue';
import ProductMediaManager from './ProductMediaManager.vue';
import { useUserStore } from '@/stores/user';
import notificationManager from '@/services/notificationManager';

import apiClient from '@/api/axios.config';

const props = defineProps({
  productId: {
    type: [String, Number],
    default: null,
  },
  isDialog: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['success', 'cancel']);

const router = useRouter();
const productStore = useProductStore();
const userStore = useUserStore();
const { saveProduct, fetchProduct, fetchUnits } = productStore;
const { units } = storeToRefs(productStore);

const currentProductId = ref(props.productId);

const isEdit = computed(() => !!currentProductId.value);
const loading = ref(false);
const isValid = ref(false);
const form = ref(null);

// حالات إدارة مجموعات وحدات القياس وقواعد التحويل
const selectedGroup = ref(null);
const unitGroups = ref([]);
const conversions = ref([]);
const loadingGroups = ref(false);

// Duplicate detection state
const showDuplicateDialog = ref(false);
const existingProduct = ref(null);



// --- State Initialization ---
const getInitialProductData = () => ({
  name: '',
  product_type: 'physical',
  require_stock: true,
  is_downloadable: false,
  download_url: '',
  download_limit: null,
  license_keys: [],
  validity_days: null,
  delivery_instructions: '',
  category_id: null,
  category: null,
  brand_id: null,
  brand: null,
  desc: '',
  active: true,
  featured: false,
  returnable: true,
  is_active_in_store: false,
  is_active_in_sales: true,
  images: [],
  primary_image_id: null,
  variants: [],
  base_unit_id: null,
  purchase_unit_id: null,
  display_unit_id: null,
  allow_decimal_quantities: false,
  quantity_precision: 0,
});

const productData = ref(getInitialProductData());

// Ensure we always have at least one variant when creating a product
if (!props.productId) {
  productData.value.variants = [
    {
      purchase_price: 0,
      wholesale_price: 0,
      retail_price: 0,
      profit_margin: 0,
      sku: '',
      barcode: '',
      stocks: [{ warehouse_id: null, quantity: null, unit_id: null }],
      attributes: [{ attribute_id: null, attribute_value_id: null }],
      images: [],
      primary_image_id: null,
    },
  ];
}

// Watch for base unit changes to auto-configure precision
watch(
  () => productData.value.base_unit_id,
  newVal => {
    if (newVal) {
      const selectedUnit = units.value.find(u => u.id === newVal);
      if (selectedUnit) {
        if (selectedUnit.decimal_places > 0) {
          productData.value.allow_decimal_quantities = true;
          productData.value.quantity_precision = selectedUnit.decimal_places;
        } else {
          productData.value.allow_decimal_quantities = false;
          productData.value.quantity_precision = 0;
        }
      }
    }
  }
);

// Watch base unit id to auto-deduce selected group
watch(
  [() => productData.value.base_unit_id, () => units.value],
  ([newVal, valUnits]) => {
    if (newVal && valUnits && valUnits.length > 0) {
      const selectedUnit = valUnits.find(u => u.id === newVal);
      if (selectedUnit && !selectedGroup.value) {
        selectedGroup.value = selectedUnit.unit_group_id;
      }
    }
  },
  { immediate: true }
);

const handleGroupChange = () => {
  productData.value.base_unit_id = null;
  productData.value.purchase_unit_id = null;
  productData.value.display_unit_id = null;
  
  // تفريغ سيلكت وحدة الجرد في كافة فروع المتغيرات لضمان إعادة الاختيار للمجموعة الجديدة
  if (productData.value.variants) {
    productData.value.variants.forEach(v => {
      if (v.stocks) {
        v.stocks.forEach(s => {
          s.unit_id = null;
        });
      }
    });
  }
};

const filteredUnits = computed(() => {
  if (!selectedGroup.value) return [];
  return units.value.filter(u => u.unit_group_id === selectedGroup.value);
});

// مؤشرات التقدم في تعبئة النموذج
const formProgressSteps = computed(() => {
  const hasBasicInfo = !!(productData.value.name);
  const hasUOM = !!(productData.value.base_unit_id) && !missingConversionsError.value;
  const hasVariants = productData.value.variants?.length > 0 && productData.value.variants[0]?.retail_price > 0;
  const hasSettings = true; // الإعدادات دائماً بها قيم افتراضية

  return [
    { label: 'المعلومات', done: hasBasicInfo, active: !hasBasicInfo },
    { label: 'وحدات القياس', done: hasUOM, active: hasBasicInfo && !hasUOM },
    { label: 'المتغيرات', done: hasVariants, active: hasBasicInfo && hasUOM && !hasVariants },
    { label: 'الإعدادات', done: hasSettings && hasVariants, active: hasBasicInfo && hasUOM && hasVariants },
  ];
});

// نسبة اكتمال النموذج
const formCompletionPercent = computed(() => {
  const steps = formProgressSteps.value;
  const done = steps.filter(s => s.done).length;
  return Math.round((done / steps.length) * 100);
});

// فحص وجود أي وحدة شراء أو عرض/بيع أصغر من الوحدة الأساسية
const hasSmallerUnitWarning = computed(() => {
  const base = productData.value.base_unit_id;
  if (!base) return false;
  
  const purchase = productData.value.purchase_unit_id;
  const display = productData.value.display_unit_id;
  
  return isUnitSmallerThanBase(purchase) || isUnitSmallerThanBase(display);
});

// جلب أسماء الوحدات التي تم تحديدها بأصغر من الوحدة الأساسية
const smallerUnitsList = computed(() => {
  const list = [];
  const purchase = productData.value.purchase_unit_id;
  const display = productData.value.display_unit_id;
  
  if (isUnitSmallerThanBase(purchase)) list.push(`وحدة الشراء (${getUnitName(purchase)})`);
  if (isUnitSmallerThanBase(display)) list.push(`وحدة البيع (${getUnitName(display)})`);
  
  return list.join(' و ');
});

// فحص تعطل قواعد التحويل للوحدات المحددة مقارنة بالوحدة الأساسية
const missingConversionsError = computed(() => {
  const base = productData.value.base_unit_id;
  if (!base) return false;
  
  const purchase = productData.value.purchase_unit_id;
  const display = productData.value.display_unit_id;
  
  if (purchase && !hasConversionRule(purchase, base)) return true;
  if (display && !hasConversionRule(display, base)) return true;
  
  let missingInVariants = false;
  if (productData.value.variants) {
    productData.value.variants.forEach(v => {
      if (v.stocks) {
        v.stocks.forEach(s => {
          if (s.unit_id && !hasConversionRule(s.unit_id, base)) {
            missingInVariants = true;
          }
        });
      }
    });
  }
  
  return missingInVariants;
});

// جلب أسماء الوحدات التي تفتقد لقواعد تحويل للوحدة الأساسية
const missingConversionsList = computed(() => {
  const list = new Set();
  const base = productData.value.base_unit_id;
  if (!base) return '';
  
  const purchase = productData.value.purchase_unit_id;
  const display = productData.value.display_unit_id;
  
  if (purchase && !hasConversionRule(purchase, base)) list.add(getUnitName(purchase));
  if (display && !hasConversionRule(display, base)) list.add(getUnitName(display));
  
  if (productData.value.variants) {
    productData.value.variants.forEach(v => {
      if (v.stocks) {
        v.stocks.forEach(s => {
          if (s.unit_id && !hasConversionRule(s.unit_id, base)) {
            list.add(getUnitName(s.unit_id));
          }
        });
      }
    });
  }
  
  return Array.from(list).join('، ');
});

const getConversionFactor = (fromUnitId, toUnitId) => {
  if (!fromUnitId || !toUnitId || fromUnitId === toUnitId) return 1;
  const direct = conversions.value.find(c => c.from_unit_id === fromUnitId && c.to_unit_id === toUnitId);
  if (direct) return Number(direct.factor);
  const reverse = conversions.value.find(c => c.from_unit_id === toUnitId && c.to_unit_id === fromUnitId);
  if (reverse && Number(reverse.factor) !== 0) return 1 / Number(reverse.factor);
  return 1;
};

// فحص وجود قاعدة تحويل معرفة بين وحدتين قياس
const hasConversionRule = (fromUnitId, toUnitId) => {
  if (!fromUnitId || !toUnitId || fromUnitId === toUnitId) return true;
  const direct = conversions.value.some(c => c.from_unit_id === fromUnitId && c.to_unit_id === toUnitId);
  const reverse = conversions.value.some(c => c.from_unit_id === toUnitId && c.to_unit_id === fromUnitId);
  return direct || reverse;
};

// تحديد ما إذا كانت الوحدة أصغر في الحجم الفيزيائي من الوحدة الأساسية
const isUnitSmallerThanBase = (unitId) => {
  if (!unitId || !productData.value.base_unit_id || unitId === productData.value.base_unit_id) return false;
  const factor = getConversionFactor(unitId, productData.value.base_unit_id);
  return factor < 1;
};

// جلب اسم وحدة القياس بناءً على معرفها
const getUnitName = (unitId) => {
  const unit = units.value.find(u => u.id === unitId);
  return unit ? unit.name : '';
};

const fetchUnitGroups = async () => {
  loadingGroups.value = true;
  try {
    const response = await apiClient.get('unit-groups');
    if (response.data && response.data.status) {
      unitGroups.value = response.data.data;
    } else if (Array.isArray(response.data)) {
      unitGroups.value = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      unitGroups.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch unit groups:', error);
  } finally {
    loadingGroups.value = false;
  }
};

const fetchConversions = async () => {
  try {
    const response = await apiClient.get('unit-conversions');
    if (response.data && response.data.status) {
      conversions.value = response.data.data;
    } else if (Array.isArray(response.data)) {
      conversions.value = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      conversions.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch unit conversions:', error);
  }
};

// Sync internal ID if prop changes (for robustness)
watch(
  () => props.productId,
  newId => {
    currentProductId.value = newId;
  },
  { immediate: true }
);

// Ensure there is always at least one variant when creating/editing
watch(
  () => productData.value.variants,
  newVariants => {
    if (!newVariants || newVariants.length === 0) {
      const defaultWarehouseId = productStore.defaultWarehouseId || null;
      productData.value.variants = [
        {
          purchase_price: 0,
          wholesale_price: 0,
          retail_price: 0,
          profit_margin: 0,
          sku: '',
          barcode: '',
          stocks: [{ warehouse_id: defaultWarehouseId, quantity: null }],
          attributes: [{ attribute_id: null, attribute_value_id: null }],
          images: [],
          primary_image_id: null,
        },
      ];
    }
  },
  { deep: true }
);

const productTypes = computed(() => {
  const isDigitalEnabled = userStore.currentCompany?.settings?.enable_digital_products;
  const list = [
    { label: 'منتج مادي (مخزني)', value: 'physical', icon: 'ri-archive-line', description: 'منتجات ملموسة تتطلب شحن وإدارة مخزون' },
  ];
  if (isDigitalEnabled || productData.value?.product_type === 'digital') {
    list.push({
      label: 'منتج رقمي (غير مخزني)',
      value: 'digital',
      icon: 'ri-file-download-line',
      description: 'منتجات غير ملموسة يتم تسليمها عبر البريد أو رابط',
    });
  }
  return list;
});

const handleNameSelect = val => {
  // Only trigger if we are not already editing
  if (val && typeof val === 'object' && !isEdit.value) {
    existingProduct.value = val;
    showDuplicateDialog.value = true;
    productData.value.name = val.name;
  }
};

const confirmSwitchToEdit = () => {
  if (existingProduct.value) {
    // Navigate and let ProductFormPage remount this component
    router.replace({
      name: 'product-edit',
      params: { id: existingProduct.value.id },
    });
  }
  showDuplicateDialog.value = false;
};

const cancelNameSelection = () => {
  productData.value.name = '';
  existingProduct.value = null;
  showDuplicateDialog.value = false;
};

const loadProductData = async id => {
  if (!id) return;
  loading.value = true;
  try {
    const data = await fetchProduct(id);
    if (data) {
      // Create a fresh object to ensure no state leakage
      const mappedData = {
        ...getInitialProductData(), // Start with clean defaults
        ...data,
        category_id: data.category?.id || data.category_id,
        brand_id: data.brand?.id || data.brand_id,
        images: data.images || [],
        primary_image_id: data.images?.find(img => img.is_primary)?.id || null,
        variants:
          (data.variants && data.variants.length > 0)
            ? data.variants.map(v => {
                // Deduplicate stocks by warehouse_id
                const stockMap = new Map();

                (v.stocks || []).forEach(s => {
                  const wid = s.warehouse?.id || s.warehouse_id;
                  if (!wid) return;

                  const existing = stockMap.get(wid);
                  // Priority: 1. Has ID, 2. Has quantity > 0, 3. Priority to first found
                  if (!existing || (!existing.id && s.id) || (existing.quantity === 0 && s.quantity > 0)) {
                    stockMap.set(wid, {
                      ...s,
                      warehouse_id: wid,
                    });
                  }
                });

                return {
                  ...v,
                  purchase_price: v.purchase_price || 0,
                  images: v.images || [],
                  primary_image_id: v.images?.find(img => img.is_primary)?.id || null,
                  stocks: Array.from(stockMap.values()).map(s => ({
                    ...s,
                    quantity: s.quantity !== null && s.quantity !== undefined ? parseFloat(s.quantity) : null,
                    unit_id: s.unit_id || data.base_unit_id,
                  })),
                };
              })
              : [
                {
                  purchase_price: 0,
                  wholesale_price: 0,
                  retail_price: 0,
                  profit_margin: 0,
                  sku: '',
                  barcode: '',
                  stocks: [{ warehouse_id: productStore.defaultWarehouseId || null, quantity: null }],
                  attributes: [{ attribute_id: null, attribute_value_id: null }],
                  images: [],
                  primary_image_id: null,
                },
              ],
      };

      // Force set the value
      productData.value = mappedData;
    }
  } catch (error) {
    console.error('Failed to load product data:', error);
  } finally {
    loading.value = false;
  }
};

// ... existing logic ...

const primaryImageUrl = computed(() => {
  if (productData.value.images?.length > 0) {
    const primary = productData.value.images.find(img => img.id === productData.value.primary_image_id || img.is_primary);
    return primary ? primary.url : productData.value.images[0].url;
  }
  return null;
});

// This part is now handled by getInitialProductData and loadProductData

const handleTypeChange = type => {
  // Logic to handle defaults when switching types
  if (type === 'digital' || type === 'service' || type === 'subscription') {
    productData.value.require_stock = false;
  } else {
    productData.value.require_stock = true;
  }
};

const resetForm = () => {
  const currentType = productData.value.product_type || 'physical';
  const defaultWarehouseId = productStore.defaultWarehouseId || null;

  productData.value = {
    ...getInitialProductData(),
    product_type: currentType,
    require_stock: currentType === 'physical',
  };

  productData.value.variants = [
    {
      purchase_price: 0,
      wholesale_price: 0,
      retail_price: 0,
      profit_margin: 0,
      sku: '',
      barcode: '',
      stocks: [{ warehouse_id: defaultWarehouseId, quantity: null }],
      attributes: [{ attribute_id: null, attribute_value_id: null }],
      images: [],
      primary_image_id: null,
    },
  ];

  if (form.value) {
    form.value.resetValidation();
  }
};

const handleSubmit = async () => {
  if (!isValid.value) return;

  if (missingConversionsError.value) {
    notificationManager.error(`لا يمكن الحفظ: الوحدات المحددة (${missingConversionsList.value}) تفتقد لقواعد تحويل للوحدة الأساسية.`);
    return;
  }

  if (productData.value.is_active_in_store) {
    if (!productData.value.images || productData.value.images.length === 0) {
      notificationManager.error('يجب إضافة صورة واحدة على الأقل لعرض المنتج في المتجر.');
      return;
    }
  }

  loading.value = true;
  try {
    const payload = {
      ...productData.value,
      image_ids: productData.value.images?.map(img => img.id) || [],
      primary_image_id: productData.value.primary_image_id,
      variants: productData.value.variants.map(v => ({
        ...v,
        image_ids: v.images?.map(img => img.id) || [],
        primary_image_id: v.primary_image_id,
        stocks: v.stocks.map(s => {
          const factor = getConversionFactor(s.unit_id, productData.value.base_unit_id);
          return {
            ...s,
            quantity: s.quantity !== null && s.quantity !== undefined && s.quantity !== ''
              ? Number(s.quantity) * factor
              : null,
          };
        }),
      })),
    };

    const response = await saveProduct(payload, currentProductId.value);
    if (response.status) {
      emit('success', response.data);
      if (!isEdit.value) {
        resetForm();
      }
    }
  } finally {
    loading.value = false;
  }
};

// Keyboard shortcuts handler
const handleKeyboardShortcuts = e => {
  // Ctrl+S or Cmd+S -> Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (isValid.value && !loading.value) {
      handleSubmit();
    }
  }
  // Escape -> Cancel
  else if (e.key === 'Escape') {
    e.preventDefault();
    emit('cancel');
  }
};

onMounted(async () => {
  // Add keyboard shortcuts
  window.addEventListener('keydown', handleKeyboardShortcuts);

  // جلب وحدات القياس من Store (مع caching)
  await fetchUnits();
  await fetchUnitGroups();
  await fetchConversions();

  // تعيين الوحدة الافتراضية (قطعة) للمنتجات الجديدة
  if (!props.productId) {
    const defaultUnit = units.value.find(u => u.code === 'pcs');
    if (defaultUnit) {
      if (!productData.value.base_unit_id) productData.value.base_unit_id = defaultUnit.id;
      if (!productData.value.purchase_unit_id) productData.value.purchase_unit_id = defaultUnit.id;
      if (!productData.value.display_unit_id) productData.value.display_unit_id = defaultUnit.id;
      selectedGroup.value = defaultUnit.unit_group_id;
    }
  }

  if (isEdit.value) {
    await loadProductData(currentProductId.value);
  } else {
    // Initialization for NEW product
    try {
      const warehouseId = await productStore.fetchDefaultWarehouse();

      // Critical: Re-check isEdit after async await to avoid race condition
      if (isEdit.value) return;

      // Update warehouse ID in the existing initial variants if they don't have one
      if (warehouseId && productData.value.variants.length > 0) {
        productData.value.variants.forEach(v => {
          if (v.stocks && v.stocks.length > 0) {
            v.stocks.forEach(s => {
              if (s.warehouse_id === null || s.warehouse_id === undefined) {
                s.warehouse_id = warehouseId;
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch default warehouse:', error);
    }
  }
});

onUnmounted(() => {
  // Clean up keyboard shortcuts
  window.removeEventListener('keydown', handleKeyboardShortcuts);
});
</script>

<style scoped>
.text-xxs {
  font-size: 10px !important;
}

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }

.hover-bg:hover {
  background-color: var(--v-theme-surface-variant);
}

.min-height-28 {
  min-height: 28px !important;
}

.cursor-pointer { cursor: pointer; }

/* ===== Progress Stepper ===== */
.progress-step {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.step-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.step-num {
  font-size: 8px;
  color: rgba(0,0,0,0.4);
  font-weight: bold;
}

.step-label {
  font-size: 10px;
  white-space: nowrap;
  transition: all 0.2s;
}

/* ===== Product Type Cards ===== */
.product-type-card {
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  background: white;
  transition: all 0.2s ease;
  min-height: 48px;
  cursor: pointer;
  user-select: none;
}

.product-type-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  background: rgba(var(--v-theme-primary), 0.02);
}

.product-type-card--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.05) !important;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.15);
}

.product-type-card--inactive {
  border-color: rgba(0, 0, 0, 0.08);
}

/* ===== Vuetify Overrides ===== */
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

:deep(.v-expansion-panel-title) {
  min-height: 28px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

/* RTL Breadcrumbs */
:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.5;
}

.w-100 { width: 100% !important; }
</style>
