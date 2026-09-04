<template>
  <div class="hwnix-cash-lines-wrapper">
    <AppDataTable
      table-key="hwnix-cash-lines.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.lines"
      :loading="store.loading || accountStore.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash"
      title="الخطوط والحسابات المالية"
      subtitle="إدارة خطوط الهاتف الفيزيائية والحسابات المالية المرتبطة بمصادر الرسائل"
      icon="ri-sim-card-line"
      @update:page="store.page = $event; store.fetchLines()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchLines()"
      @update:filters="applyFilters"
    >
      <template #actions>
        <div class="d-flex align-center gap-2 flex-wrap">
          <!-- زر إدارة الأجهزة مع badge بعدد الأجهزة المتصلة -->
          <v-badge
            :content="deviceStore.devices?.filter(d => d.is_active || d.status === 'active')?.length || ''"
            color="success"
            floating
            :model-value="(deviceStore.devices?.filter(d => d.is_active || d.status === 'active')?.length || 0) > 0"
          >
            <AppButton
              variant="tonal"
              color="secondary"
              prepend-icon="ri-cellphone-line"
              @click="openDevicesDialog"
            >
              الأجهزة المتصلة
            </AppButton>
          </v-badge>

          <!-- زر إضافة حساب مالي جديد -->
          <AppButton
            variant="tonal"
            color="info"
            prepend-icon="ri-wallet-3-line"
            @click="router.push('/app/hwnix-cash/financial-accounts')"
          >
            إدارة الحسابات والمحافظ
          </AppButton>

          <AppButton
            variant="elevation"
            color="primary"
            prepend-icon="ri-add-circle-line"
            class="font-weight-bold"
            @click="openAddAccountDialog()"
          >
            إضافة حساب مالي جديد
          </AppButton>

          <AppButton
            variant="tonal"
            color="secondary"
            prepend-icon="ri-refresh-line"
            :loading="store.loading"
            @click="store.fetchLines()"
          >
            تحديث
          </AppButton>
        </div>
      </template>

      <!-- رقم الهاتف الشريحة -->
      <template #item.phone_number="{ item }">
        <div class="d-flex flex-column gap-1">
          <div class="d-flex align-center gap-2">
            <v-icon icon="ri-sim-card-line" size="18" class="text-primary" />
            <span class="font-weight-bold font-mono text-body-1">{{ item.phone_number || '—' }}</span>
          </div>
          <div v-if="item.note" class="text-caption text-grey">
            {{ item.note }}
          </div>
        </div>
      </template>

      <!-- الهاتف والمرابطة -->
      <template #item.device="{ item }">
        <div class="d-flex flex-column py-1">
          <div class="d-flex align-center gap-1 font-weight-bold text-body-2">
            <v-icon icon="ri-smartphone-line" size="14" color="primary" />
            <span>{{ item.device_name || item.device?.name || 'غير محدد' }}</span>
          </div>
          <div class="d-flex align-center gap-2 mt-1">
            <v-chip size="x-small" variant="flat" color="primary" class="font-weight-medium">
              {{ item.slot_label || ('شريحة ' + ((item.slot_index ?? 0) + 1)) }}
            </v-chip>
            <span v-if="item.device_brand || item.device_model" class="text-caption text-grey">
              {{ [item.device_brand, item.device_model].filter(Boolean).join(' ') }}
            </span>
          </div>
        </div>
      </template>

      <!-- الحسابات المالية التابعة للخط -->
      <template #item.financial_accounts="{ item }">
        <div class="d-flex flex-column gap-2 py-2">
          <div v-if="!item.financial_accounts || item.financial_accounts.length === 0" class="text-caption text-grey italic">
            لا تقتصر الشريحة على حساب حالياً. انقر "إضافة حساب مالي".
          </div>

          <div
            v-for="acc in item.financial_accounts"
            :key="acc.id"
            class="pa-2 rounded-lg border bg-grey-lighten-5 d-flex flex-column gap-1"
          >
            <!-- عنوان الحساب ومصدر الرسائل -->
            <div class="d-flex align-center justify-space-between gap-2">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-bank-card-line" size="16" color="primary" />
                <span class="font-weight-bold text-body-2">{{ acc.name }}</span>
                <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-bold">
                  {{ acc.sender_identifier }}
                </v-chip>
              </div>

              <!-- أزرار التحكم بالحساب المالي -->
              <div class="d-flex align-center gap-1">
                <v-tooltip text="تسوية الرصيد" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="ri-scales-3-line"
                      size="x-small"
                      variant="tonal"
                      color="info"
                      @click="openReconcileAccountDialog(acc)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="تعديل الحدود" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="ri-edit-line"
                      size="x-small"
                      variant="text"
                      color="primary"
                      @click="openEditAccountDialog(acc)"
                    />
                  </template>
                </v-tooltip>

                <v-tooltip text="حذف الحساب" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="ri-delete-bin-line"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="deleteAccount(acc)"
                    />
                  </template>
                </v-tooltip>
              </div>
            </div>

            <!-- أشرطة التقدم والمستهلكات من الحدود المالية السحب والإيداع اليومي والشهري -->
            <div class="mt-2 pt-2 border-t">
              <div class="d-flex align-center justify-space-between text-caption font-weight-medium">
                <span class="text-grey-darken-1 font-weight-bold">معدلات استهلاك الحدود:</span>
                <v-btn
                  size="x-small"
                  variant="text"
                  color="primary"
                  density="compact"
                  class="px-1 font-weight-bold"
                  @click="expandedLimits[acc.id] = !expandedLimits[acc.id]"
                >
                  {{ expandedLimits[acc.id] ? 'طي الحدود الشهرية' : 'عرض الحدود الشهرية' }}
                  <v-icon :icon="expandedLimits[acc.id] ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" size="14" class="ms-1" />
                </v-btn>
              </div>

              <!-- الحدود اليومية دائمًا -->
              <v-row dense class="mt-1">
                <v-col cols="6">
                  <HwnixCashLimitBar
                    label="سحب يومي"
                    :used="acc.daily_withdraw_used"
                    :limit="acc.daily_withdraw_limit || 60000"
                    :alert-type="acc.daily_withdraw_alert_type || 'percentage'"
                    :alert-value="acc.daily_withdraw_alert_value || 80"
                    icon="ri-cash-line"
                    color="error"
                  />
                </v-col>
                <v-col cols="6">
                  <HwnixCashLimitBar
                    label="إيداع يومي"
                    :used="acc.daily_deposit_used"
                    :limit="acc.daily_deposit_limit || 60000"
                    :alert-type="acc.daily_deposit_alert_type || 'percentage'"
                    :alert-value="acc.daily_deposit_alert_value || 80"
                    icon="ri-add-circle-line"
                    color="success"
                  />
                </v-col>
              </v-row>

              <!-- الحدود الشهرية عند التوسع -->
              <v-row dense class="mt-2" v-if="expandedLimits[acc.id]">
                <v-col cols="6">
                  <HwnixCashLimitBar
                    label="سحب شهري"
                    :used="acc.monthly_withdraw_used"
                    :limit="acc.monthly_withdraw_limit || 200000"
                    :alert-type="acc.monthly_withdraw_alert_type || 'percentage'"
                    :alert-value="acc.monthly_withdraw_alert_value || 80"
                    icon="ri-calendar-event-line"
                    color="warning"
                  />
                </v-col>
                <v-col cols="6">
                  <HwnixCashLimitBar
                    label="إيداع شهري"
                    :used="acc.monthly_deposit_used"
                    :limit="acc.monthly_deposit_limit || 200000"
                    :alert-type="acc.monthly_deposit_alert_type || 'percentage'"
                    :alert-value="acc.monthly_deposit_alert_value || 80"
                    icon="ri-calendar-check-line"
                    color="info"
                  />
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </template>

      <!-- الأرصدة الإجمالية للخط -->
      <template #item.total_balances="{ item }">
        <div class="d-flex flex-column gap-1 py-1">
          <div class="d-flex align-center justify-space-between gap-2">
            <span class="text-caption text-grey">إجمالي الفعلي:</span>
            <span class="font-weight-bold text-success text-body-2">
              {{ formatCurrency(item.total_actual_balance) }} ج.م
            </span>
          </div>
          <div class="d-flex align-center justify-space-between gap-2">
            <span class="text-caption text-grey">إجمالي الحسابي:</span>
            <span class="font-weight-bold text-body-2">
              {{ formatCurrency(item.total_balance) }} ج.م
            </span>
          </div>
        </div>
      </template>

      <!-- الحالة -->
      <template #item.is_active="{ item }">
        <v-chip
          :color="(item.is_active || item.status === 'active') ? 'success' : 'error'"
          size="small"
          variant="tonal"
          class="font-weight-bold"
        >
          {{ (item.is_active || item.status === 'active') ? 'نشط' : 'معطل' }}
        </v-chip>
      </template>

      <!-- الإجراءات -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center gap-1 justify-center">
          <v-tooltip text="إضافة حساب مالي على هذه الشريحة" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-add-line"
                size="small"
                variant="tonal"
                color="primary"
                @click="openAddAccountDialog(item.id)"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="حذف الشريحة وكل ما يتعلق بها نهائياً" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-delete-bin-line"
                size="small"
                variant="text"
                color="error"
                @click="confirmDeleteLineItem(item)"
              />
            </template>
          </v-tooltip>
        </div>
      </template>
    </AppDataTable>

    <!-- Dialog إضافة حساب مالي جديد (Form واحدة بزر حفظ واحد) -->
    <v-dialog v-model="accountFormDialog" max-width="580" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-bank-card-line" color="primary" />
          {{ isEditingAccount ? 'تعديل الحساب المالي' : 'إضافة حساب مالي جديد (Single Form)' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="accountFormRef" @submit.prevent="saveAccount">
            <v-row dense>
              <!-- اختيار الخط -->
              <v-col cols="12" v-if="!isEditingAccount">
                <v-select
                  v-model="accountForm.line_id"
                  :items="store.lines"
                  item-title="phone_number"
                  item-value="id"
                  label="اختر خط الهاتف *"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-sim-card-line"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.phone_number" :subtitle="item.raw.device_name || item.raw.carrier" />
                  </template>
                </v-select>
              </v-col>

              <!-- اسم الحساب -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="accountForm.name"
                  label="اسم الحساب المالي *"
                  placeholder="مثال: فودافون كاش كشك 1"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-bookmark-line"
                />
              </v-col>

              <!-- رقم الحساب اختياري -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="accountForm.account_number"
                  label="رقم الحساب / المحفظة (اختياري)"
                  placeholder="مثال: 01012345678"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-number-1"
                />
              </v-col>

              <!-- اختيار مصدر الرسائل المكتشف (Select Only) -->
              <v-col cols="12">
                <v-select
                  v-model="accountForm.sender_identifier"
                  :items="accountStore.distinctSenders"
                  label="مصدر الرسائل *"
                  placeholder="اختر مصدر الرسائل"
                  required
                  :rules="[v => !!v || 'مصدر الرسائل مطلوب']"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-mail-send-line"
                  no-data-text="لم يتم اكتشاف رسائل سابقة بالنظام"
                />
              </v-col>

              <!-- الحدود المالية وإعدادات التنبيه المخصصة لكل حد -->
              <v-col cols="12">
                <div class="pa-3 rounded-lg border bg-grey-lighten-5 mb-2">
                  <div class="text-caption font-weight-bold text-error mb-2">حد وإعداد تنبيه السحب اليومي:</div>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="accountForm.daily_withdraw_limit"
                        label="حد السحب اليومي (ج.م)"
                        type="number"
                        min="0"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="d-flex align-center gap-1">
                        <v-btn-toggle
                          v-model="accountForm.daily_withdraw_alert_type"
                          mandatory
                          density="compact"
                          color="error"
                          variant="outlined"
                          style="height: 40px;"
                        >
                          <v-btn value="percentage" size="x-small">% نسبة</v-btn>
                          <v-btn value="amount" size="x-small">ج.م مبلغ</v-btn>
                        </v-btn-toggle>
                        <v-text-field
                          v-model="accountForm.daily_withdraw_alert_value"
                          :label="accountForm.daily_withdraw_alert_type === 'percentage' ? 'تنبيه (%)' : 'تنبيه (ج.م)'"
                          type="number"
                          min="1"
                          :max="accountForm.daily_withdraw_alert_type === 'percentage' ? 100 : (accountForm.daily_withdraw_limit || 60000)"
                          :rules="[validateAlertValue(accountForm.daily_withdraw_alert_type, accountForm.daily_withdraw_limit)]"
                          variant="outlined"
                          density="compact"
                          class="flex-grow-1"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <div class="pa-3 rounded-lg border bg-grey-lighten-5 mb-2">
                  <div class="text-caption font-weight-bold text-success mb-2">حد وإعداد تنبيه الإيداع اليومي:</div>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="accountForm.daily_deposit_limit"
                        label="حد الإيداع اليومي (ج.م)"
                        type="number"
                        min="0"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="d-flex align-center gap-1">
                        <v-btn-toggle
                          v-model="accountForm.daily_deposit_alert_type"
                          mandatory
                          density="compact"
                          color="success"
                          variant="outlined"
                          style="height: 40px;"
                        >
                          <v-btn value="percentage" size="x-small">% نسبة</v-btn>
                          <v-btn value="amount" size="x-small">ج.م مبلغ</v-btn>
                        </v-btn-toggle>
                        <v-text-field
                          v-model="accountForm.daily_deposit_alert_value"
                          :label="accountForm.daily_deposit_alert_type === 'percentage' ? 'تنبيه (%)' : 'تنبيه (ج.م)'"
                          type="number"
                          min="1"
                          :max="accountForm.daily_deposit_alert_type === 'percentage' ? 100 : (accountForm.daily_deposit_limit || 60000)"
                          :rules="[validateAlertValue(accountForm.daily_deposit_alert_type, accountForm.daily_deposit_limit)]"
                          variant="outlined"
                          density="compact"
                          class="flex-grow-1"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <div class="pa-3 rounded-lg border bg-grey-lighten-5 mb-2">
                  <div class="text-caption font-weight-bold text-warning mb-2">حد وإعداد تنبيه السحب الشهري:</div>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="accountForm.monthly_withdraw_limit"
                        label="حد السحب الشهري (ج.م)"
                        type="number"
                        min="0"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="d-flex align-center gap-1">
                        <v-btn-toggle
                          v-model="accountForm.monthly_withdraw_alert_type"
                          mandatory
                          density="compact"
                          color="warning"
                          variant="outlined"
                          style="height: 40px;"
                        >
                          <v-btn value="percentage" size="x-small">% نسبة</v-btn>
                          <v-btn value="amount" size="x-small">ج.م مبلغ</v-btn>
                        </v-btn-toggle>
                        <v-text-field
                          v-model="accountForm.monthly_withdraw_alert_value"
                          :label="accountForm.monthly_withdraw_alert_type === 'percentage' ? 'تنبيه (%)' : 'تنبيه (ج.م)'"
                          type="number"
                          min="1"
                          :max="accountForm.monthly_withdraw_alert_type === 'percentage' ? 100 : (accountForm.monthly_withdraw_limit || 200000)"
                          :rules="[validateAlertValue(accountForm.monthly_withdraw_alert_type, accountForm.monthly_withdraw_limit)]"
                          variant="outlined"
                          density="compact"
                          class="flex-grow-1"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <div class="pa-3 rounded-lg border bg-grey-lighten-5">
                  <div class="text-caption font-weight-bold text-info mb-2">حد وإعداد تنبيه الإيداع الشهري:</div>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="accountForm.monthly_deposit_limit"
                        label="حد الإيداع الشهري (ج.م)"
                        type="number"
                        min="0"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="d-flex align-center gap-1">
                        <v-btn-toggle
                          v-model="accountForm.monthly_deposit_alert_type"
                          mandatory
                          density="compact"
                          color="info"
                          variant="outlined"
                          style="height: 40px;"
                        >
                          <v-btn value="percentage" size="x-small">% نسبة</v-btn>
                          <v-btn value="amount" size="x-small">ج.م مبلغ</v-btn>
                        </v-btn-toggle>
                        <v-text-field
                          v-model="accountForm.monthly_deposit_alert_value"
                          :label="accountForm.monthly_deposit_alert_type === 'percentage' ? 'تنبيه (%)' : 'تنبيه (ج.م)'"
                          type="number"
                          min="1"
                          :max="accountForm.monthly_deposit_alert_type === 'percentage' ? 100 : (accountForm.monthly_deposit_limit || 200000)"
                          :rules="[validateAlertValue(accountForm.monthly_deposit_alert_type, accountForm.monthly_deposit_limit)]"
                          variant="outlined"
                          density="compact"
                          class="flex-grow-1"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </v-col>

              <v-col cols="12" class="mt-2">
                <v-btn
                  variant="tonal"
                  color="info"
                  size="small"
                  block
                  prepend-icon="ri-bank-line"
                  @click="applyDefaultCbeLimits"
                >
                  استعادة حدود البنك المركزي المصري (60 ألف يومياً / 200 ألف شهرياً)
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="accountFormDialog = false">إلغاء</AppButton>
          <AppButton
            color="primary"
            :loading="accountStore.loading"
            prepend-icon="ri-save-line"
            @click="saveAccount"
          >
            حفظ الحساب المالي
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Context Menu النقر بزر الفأرة الأيمن للحساب المالي -->
    <v-menu
      v-model="contextMenuShow"
      :target="[contextMenuX, contextMenuY]"
      location="bottom start"
    >
      <v-list density="compact" rounded="lg" class="py-1 min-w-180">
        <v-list-item
          prepend-icon="ri-scales-3-line"
          title="تسوية الرصيد الحسابي"
          :disabled="!selectedAccountForContext?.has_balance_mismatch"
          @click="openReconcileAccountDialog(selectedAccountForContext)"
        />
        <v-list-item
          prepend-icon="ri-edit-line"
          title="تعديل الحساب المالي"
          @click="openEditAccountDialog(selectedAccountForContext)"
        />
        <v-divider />
        <v-list-item
          prepend-icon="ri-delete-bin-line"
          title="حذف الحساب المالي"
          color="error"
          @click="deleteAccount(selectedAccountForContext)"
        />
      </v-list>
    </v-menu>

    <!-- Dialog تسوية الرصيد الحسابي للحساب المالي -->
    <v-dialog v-model="reconcileDialog" max-width="540" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-scales-3-line" color="info" />
          تسوية رصيد الحساب المالي
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-alert
            type="warning"
            variant="tonal"
            rounded="lg"
            class="mb-4 text-body-2"
            icon="ri-alert-line"
          >
            سيتم إنشاء <strong>معاملة تسوية مستقلة</strong> لتعديل الرصيد الحسابي حتى يطابق الرصيد الفعلي. لن يتم حذف أو تعديل أي معاملة مالية سابقة.
          </v-alert>

          <div class="d-flex flex-column gap-3 mb-4 p-4 rounded-lg bg-grey-lighten-4">
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">اسم الحساب:</span>
              <span class="font-weight-bold font-mono">{{ reconcilingAccount?.name }}</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">مصدر الرسائل المقترن:</span>
              <v-chip size="x-small" color="primary" variant="outlined" class="font-weight-bold">
                {{ reconcilingAccount?.sender_identifier || reconcilingAccount?.message_source?.sender_identifier }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">الرصيد الفعلي المستلم (Ground Truth):</span>
              <span class="font-weight-bold text-success text-body-1">
                {{ formatCurrency(reconcilingAccount?.actual_balance) }} ج.م
              </span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-grey-darken-1">الرصيد الحسابي الحالي بالنظام:</span>
              <span class="font-weight-bold text-body-1">
                {{ formatCurrency(reconcilingAccount?.balance) }} ج.م
              </span>
            </div>
            <v-divider />
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 font-weight-medium">فرق التسوية المطلوب:</span>
              <v-chip
                :color="reconcilingAccount?.has_balance_mismatch ? 'warning' : 'success'"
                size="small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ formatCurrency(reconcilingAccount?.balance_difference) }} ج.م
              </v-chip>
            </div>
          </div>

          <!-- حقل سبب التسوية الإجباري مع اقتراحات سريعة -->
          <div class="mt-4">
            <div class="text-caption font-weight-medium mb-1 text-grey-darken-2">
              اقتراحات سريعة لسبب التسوية:
            </div>
            <div class="d-flex flex-wrap gap-1 mb-3">
              <v-chip
                v-for="preset in RECONCILE_REASON_PRESETS"
                :key="preset"
                size="x-small"
                variant="tonal"
                color="info"
                class="cursor-pointer"
                @click="reconcileReason = preset"
              >
                {{ preset }}
              </v-chip>
            </div>

            <v-textarea
              v-model="reconcileReason"
              label="سبب التسوية (إجباري) *"
              placeholder="اكتب سبب إجراء تسوية الرصيد بالتفصيل للمراجعة والتدقيق المحاسبي..."
              variant="outlined"
              rows="2"
              auto-grow
              required
              density="compact"
              prepend-inner-icon="ri-file-text-line"
            />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="reconcileDialog = false">إلغاء</AppButton>
          <AppButton
            color="info"
            :loading="accountStore.loading"
            :disabled="!reconcileReason || !reconcilingAccount?.has_balance_mismatch"
            prepend-icon="ri-check-double-line"
            @click="saveAccountReconciliation"
          >
            تنفيذ التسوية
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تأكيد حذف الشريحة نهائيا -->
    <v-dialog v-model="lineDeleteDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-2 text-error d-flex align-center gap-2">
          <v-icon icon="ri-error-warning-line" color="error" />
          تأكيد حذف الخط نهائياً
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          هل أنت متأكد من رغبتك في حذف الخط <strong>{{ deletingLine?.phone_number || 'هذا الخط' }}</strong> نهائياً؟
          <br><br>
          <strong class="text-error">تحذير خطير:</strong> سيؤدي هذا الإجراء إلى حذف جميع الحسابات المالية التابعة للخط، وجميع الرسائل والمعاملات المرتبطة به. إذا كان الهاتف غير مرتبط بخطوط أخرى فسيتم إزالة ربط الهاتف أيضاً. هذا الإجراء لا يمكن التراجع عنه!
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="lineDeleteDialog = false">إلغاء</AppButton>
          <AppButton color="error" :loading="store.loading" prepend-icon="ri-delete-bin-line" @click="executeLineDelete">
            نعم، احذف نهائياً
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ════════════════════════════════════════════════════════════════ -->
    <!-- Dialog إدارة الأجهزة (مدمج هنا بدلاً من صفحة مستقلة)          -->
    <!-- ════════════════════════════════════════════════════════════════ -->
    <v-dialog v-model="devicesDialog" max-width="960" scrollable>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-4 d-flex align-center gap-2">
          <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
            <v-icon icon="ri-cellphone-line" size="20" />
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">إدارة الأجهزة المتصلة</div>
            <div class="text-caption text-grey">الهواتف والأجهزة المربوطة بنظام كاش هونكس</div>
          </div>
          <v-spacer />
          <v-btn icon="ri-close-line" variant="text" @click="devicesDialog = false" />
        </v-card-title>
        <v-divider />

        <!-- شريط أدوات الأجهزة -->
        <div class="px-6 pt-4 pb-2 d-flex align-center gap-2 flex-wrap">
          <v-text-field
            v-model="deviceSearch"
            placeholder="بحث في الأجهزة..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="ri-search-line"
            clearable
            hide-details
            style="max-width: 280px;"
          />
          <v-spacer />
          <v-chip
            v-if="deviceStore.devices?.length"
            color="success"
            size="small"
            variant="tonal"
            class="font-weight-bold"
          >
            <v-icon icon="ri-checkbox-circle-line" size="14" class="me-1" />
            {{ deviceStore.devices.filter(d => d.is_active || d.status === 'active').length }} متصل
          </v-chip>
          <AppButton
            variant="tonal"
            color="primary"
            prepend-icon="ri-refresh-line"
            size="small"
            :loading="deviceStore.loading"
            @click="deviceStore.fetchDevices()"
          >
            تحديث
          </AppButton>
        </div>

        <v-card-text class="pa-0">
          <v-data-table
            :headers="deviceHeaders"
            :items="filteredDevices"
            :loading="deviceStore.loading"
            hover
            class="elevation-0"
            density="comfortable"
            no-data-text="لا توجد أجهزة مربوطة بعد"
            loading-text="جاري تحميل الأجهزة..."
            items-per-page="10"
          >
            <!-- اسم الجهاز والمعرف -->
            <template #item.device_name="{ item }">
              <div class="d-flex align-center gap-2">
                <v-avatar color="primary" variant="tonal" size="32">
                  <v-icon icon="ri-cellphone-line" size="18" />
                </v-avatar>
                <div class="d-flex flex-column">
                  <span class="font-weight-bold text-body-2">{{ item.device_name || item.model || 'جهاز أندرويد' }}</span>
                  <span class="text-caption text-grey font-mono">{{ item.android_id }}</span>
                </div>
              </div>
            </template>

            <!-- المواصفات والإصدار -->
            <template #item.specs="{ item }">
              <div class="d-flex flex-column">
                <span class="text-caption font-weight-medium">{{ item.brand }} {{ item.model }}</span>
                <span class="text-caption text-grey">أندرويد: {{ item.android_version || '—' }} | تطبيق: v{{ item.app_version || '1.0' }}</span>
              </div>
            </template>

            <!-- آخر اتصال -->
            <template #item.last_seen_at="{ item }">
              <div class="d-flex align-center gap-1 text-caption text-grey-darken-1">
                <v-icon icon="ri-time-line" size="14" />
                <span>{{ item.last_seen_at || '—' }}</span>
              </div>
            </template>

            <!-- الحالة -->
            <template #item.is_active="{ item }">
              <v-chip
                :color="(item.is_active || item.status === 'active') ? 'success' : 'error'"
                size="small"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ (item.is_active || item.status === 'active') ? 'نشط / متصل' : 'معطل / مفصول' }}
              </v-chip>
            </template>

            <!-- الإجراءات -->
            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-center gap-1">
                <v-btn icon="ri-edit-line" size="small" variant="text" color="primary"
                  title="تعديل اسم الجهاز" @click="openDeviceEditDialog(item)" />
                <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error"
                  title="إلغاء ربط الجهاز" @click="confirmDeviceDelete(item)" />
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog تعديل اسم الجهاز -->
    <v-dialog v-model="deviceEditDialog" max-width="480" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-edit-line" color="primary" />
          تعديل بيانات الجهاز
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="deviceEditForm.device_name"
                label="اسم الجهاز التوضيحي"
                placeholder="مثال: هاتف الفرع الرئيسي"
                variant="outlined"
                density="compact"
                prepend-inner-icon="ri-smartphone-line"
              />
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="deviceEditForm.is_active"
                label="حالة تفعيل الجهاز"
                color="success"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="deviceEditDialog = false">إلغاء</AppButton>
          <AppButton color="primary" :loading="deviceStore.loading" prepend-icon="ri-save-line" @click="saveDeviceEdit">
            حفظ التغييرات
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تأكيد إلغاء ربط الجهاز -->
    <v-dialog v-model="deviceDeleteDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-2 text-error d-flex align-center gap-2">
          <v-icon icon="ri-error-warning-line" color="error" />
          تأكيد إلغاء ربط الجهاز
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          هل أنت متأكد من رغبتك في إلغاء ربط الجهاز <strong>{{ deletingDevice?.device_name || deletingDevice?.android_id }}</strong>؟ سيؤدي ذلك لقطع اتصال الهاتف بالنظام.
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 gap-2">
          <v-spacer />
          <AppButton variant="text" @click="deviceDeleteDialog = false">تراجع</AppButton>
          <AppButton color="error" :loading="deviceStore.loading" prepend-icon="ri-delete-bin-line" @click="executeDeviceDelete">
            إلغاء الربط
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
// صفحة الخطوط والحسابات المالية مع دمج إدارة الأجهزة
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHwnixCashLineStore } from '../store/hwnix-cash-line.store';
import { useHwnixCashFinancialAccountStore } from '../store/hwnix-cash-financial-account.store';
import { useHwnixCashDeviceStore } from '../store/hwnix-cash-device.store';
import AppButton from '@/components/common/AppButton.vue';
import HwnixCashLimitBar from '../components/HwnixCashLimitBar.vue';

const router = useRouter();
const store = useHwnixCashLineStore();
const accountStore = useHwnixCashFinancialAccountStore();
const deviceStore = useHwnixCashDeviceStore();

const DEFAULT_CBE_LIMITS = {
  DAILY_DEPOSIT: 60000,
  DAILY_WITHDRAW: 60000,
  MONTHLY_DEPOSIT: 200000,
  MONTHLY_WITHDRAW: 200000,
};

const headers = [
  { title: 'رقم الهاتف (الشريحة)', key: 'phone_number', sortable: true },
  { title: 'الهاتف والمرابطة', key: 'device', sortable: false },
  { title: 'الحسابات المالية التابعة', key: 'financial_accounts', sortable: false },
  { title: 'إجمالي أرصدة الخط', key: 'total_balances', sortable: false },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

const advancedFilters = [
  {
    key: 'is_active',
    label: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: '1' },
      { title: 'معطل', value: '0' },
    ],
  },
];

const accountFormDialog = ref(false);
const isEditingAccount = ref(false);
const editingAccountId = ref(null);

const accountForm = ref({
  line_id: null,
  name: '',
  account_number: '',
  sender_identifier: '',
  daily_deposit_limit: DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
  daily_withdraw_limit: DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
  monthly_deposit_limit: DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
  monthly_withdraw_limit: DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
  daily_deposit_alert_type: 'percentage',
  daily_deposit_alert_value: 80,
  daily_withdraw_alert_type: 'percentage',
  daily_withdraw_alert_value: 80,
  monthly_deposit_alert_type: 'percentage',
  monthly_deposit_alert_value: 80,
  monthly_withdraw_alert_type: 'percentage',
  monthly_withdraw_alert_value: 80,
});

function validateAlertValue(type, limit) {
  return v => {
    if (v === null || v === '' || v === undefined) return true;
    const val = Number(v);
    if (val < 1) return 'القيمة يجب أن تكون 1 على الأقل';
    if (type === 'percentage') {
      if (val > 100) return 'النسبة المئوية يجب أن تكون بين 1% و 100%';
    } else if (type === 'amount') {
      const lim = Number(limit || 0);
      if (lim > 0 && val > lim) return `مبلغ التنبيه لا يمكن أن يتجاوز الحد الكلي (${lim} ج.م)`;
    }
    return true;
  };
}

const reconcileDialog = ref(false);
const reconcilingAccount = ref(null);
const reconcileReason = ref('');

const RECONCILE_REASON_PRESETS = [
  'تسوية بعد مراجعة كشف المحفظة',
  'رصيد افتتاحي',
  'تصحيح فرق بعد الجرد',
  'تعديل بعد مراجعة البنك',
];

const contextMenuShow = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const selectedAccountForContext = ref(null);

function openContextMenu(e, account) {
  if (!account) return;
  selectedAccountForContext.value = account;
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuShow.value = true;
}

const expandedLimits = ref({});

function calcPct(used, limit) {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round(((used || 0) / limit) * 100 * 10) / 10);
}

function getLimitColor(pct) {
  if (pct >= 90) return 'error';
  if (pct >= 70) return 'warning';
  return 'primary';
}

function formatCurrency(v) {
  return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);
}

function openAddAccountDialog(lineId = null) {
  isEditingAccount.value = false;
  editingAccountId.value = null;
  accountForm.value = {
    line_id: lineId || store.lines[0]?.id || null,
    name: '',
    account_number: '',
    sender_identifier: null,
    daily_deposit_limit: DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
    daily_withdraw_limit: DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
    monthly_deposit_limit: DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
    monthly_withdraw_limit: DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
    daily_deposit_alert_type: 'percentage',
    daily_deposit_alert_value: 80,
    daily_withdraw_alert_type: 'percentage',
    daily_withdraw_alert_value: 80,
    monthly_deposit_alert_type: 'percentage',
    monthly_deposit_alert_value: 80,
    monthly_withdraw_alert_type: 'percentage',
    monthly_withdraw_alert_value: 80,
  };
  accountStore.fetchDistinctSenders();
  accountFormDialog.value = true;
}

function openEditAccountDialog(account) {
  if (!account) return;
  isEditingAccount.value = true;
  editingAccountId.value = account.id;
  accountForm.value = {
    name: account.name,
    account_number: account.account_number || '',
    sender_identifier: account.sender_identifier || '',
    daily_deposit_limit: account.daily_deposit_limit || DEFAULT_CBE_LIMITS.DAILY_DEPOSIT,
    daily_withdraw_limit: account.daily_withdraw_limit || DEFAULT_CBE_LIMITS.DAILY_WITHDRAW,
    monthly_deposit_limit: account.monthly_deposit_limit || DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT,
    monthly_withdraw_limit: account.monthly_withdraw_limit || DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW,
    daily_deposit_alert_type: account.daily_deposit_alert_type || 'percentage',
    daily_deposit_alert_value: account.daily_deposit_alert_value || 80,
    daily_withdraw_alert_type: account.daily_withdraw_alert_type || 'percentage',
    daily_withdraw_alert_value: account.daily_withdraw_alert_value || 80,
    monthly_deposit_alert_type: account.monthly_deposit_alert_type || 'percentage',
    monthly_deposit_alert_value: account.monthly_deposit_alert_value || 80,
    monthly_withdraw_alert_type: account.monthly_withdraw_alert_type || 'percentage',
    monthly_withdraw_alert_value: account.monthly_withdraw_alert_value || 80,
  };
  accountStore.fetchDistinctSenders();
  accountFormDialog.value = true;
}

function applyDefaultCbeLimits() {
  accountForm.value.daily_deposit_limit = DEFAULT_CBE_LIMITS.DAILY_DEPOSIT;
  accountForm.value.daily_withdraw_limit = DEFAULT_CBE_LIMITS.DAILY_WITHDRAW;
  accountForm.value.monthly_deposit_limit = DEFAULT_CBE_LIMITS.MONTHLY_DEPOSIT;
  accountForm.value.monthly_withdraw_limit = DEFAULT_CBE_LIMITS.MONTHLY_WITHDRAW;
}

async function saveAccount() {
  if (isEditingAccount.value) {
    await accountStore.updateFinancialAccount(editingAccountId.value, accountForm.value);
  } else {
    await accountStore.createFinancialAccount(accountForm.value);
  }
  accountFormDialog.value = false;
  store.fetchLines();
}

async function deleteAccount(account) {
  if (!account) return;
  if (confirm(`هل أنت تأكد من رغبتك في حذف الحساب المالي "${account.name}"؟`)) {
    await accountStore.deleteFinancialAccount(account.id);
    store.fetchLines();
  }
}

function openReconcileAccountDialog(account) {
  if (!account) return;
  reconcilingAccount.value = account;
  reconcileReason.value = RECONCILE_REASON_PRESETS[0];
  reconcileDialog.value = true;
}

async function saveAccountReconciliation() {
  if (!reconcilingAccount.value || !reconcileReason.value) return;
  await accountStore.reconcileFinancialAccount(reconcilingAccount.value.id, {
    reason: reconcileReason.value,
  });
  reconcileDialog.value = false;
  store.fetchLines();
}

function applyFilters(filters) {
  store.statusFilter = filters.is_active ?? null;
  store.page = 1;
  store.fetchLines();
}

// ─── دوال حذف الخط نهائيا ───────────────────────────────────────────────────
const lineDeleteDialog = ref(false);
const deletingLine = ref(null);

function confirmDeleteLineItem(item) {
  deletingLine.value = item;
  lineDeleteDialog.value = true;
}

async function executeLineDelete() {
  if (!deletingLine.value) return;
  await store.forceDeleteLine(deletingLine.value.id);
  lineDeleteDialog.value = false;
  deletingLine.value = null;
}

// ─── دوال الأجهزة ─────────────────────────────────────────────────────────────
const devicesDialog = ref(false);
const deviceSearch = ref('');
const deviceEditDialog = ref(false);
const deviceDeleteDialog = ref(false);
const editingDevice = ref(null);
const deletingDevice = ref(null);
const deviceEditForm = ref({ device_name: '', is_active: true });

const deviceHeaders = [
  { title: 'الجهاز ومعرفه', key: 'device_name', sortable: true },
  { title: 'المواصفات والإصدار', key: 'specs', sortable: false },
  { title: 'آخر اتصال', key: 'last_seen_at', sortable: true },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
];

const filteredDevices = computed(() => {
  if (!deviceSearch.value) return deviceStore.devices;
  const q = deviceSearch.value.toLowerCase();
  return deviceStore.devices.filter(d =>
    d.device_name?.toLowerCase().includes(q) ||
    d.android_id?.toLowerCase().includes(q) ||
    d.model?.toLowerCase().includes(q)
  );
});

function openDevicesDialog() {
  devicesDialog.value = true;
  deviceStore.fetchDevices();
}

function openDeviceEditDialog(device) {
  editingDevice.value = device;
  deviceEditForm.value = {
    device_name: device.device_name || '',
    is_active: device.is_active ?? (device.status === 'active'),
  };
  deviceEditDialog.value = true;
}

async function saveDeviceEdit() {
  await deviceStore.updateDevice(editingDevice.value.id, deviceEditForm.value);
  deviceEditDialog.value = false;
}

function confirmDeviceDelete(device) {
  deletingDevice.value = device;
  deviceDeleteDialog.value = true;
}

async function executeDeviceDelete() {
  await deviceStore.deleteDevice(deletingDevice.value.id);
  deviceDeleteDialog.value = false;
}

onMounted(() => {
  store.fetchLines();
  accountStore.fetchDistinctSenders();
  deviceStore.fetchDevices();
});
</script>
