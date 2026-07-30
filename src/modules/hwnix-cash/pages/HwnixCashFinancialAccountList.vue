<template>
  <div class="hwnix-cash-financial-accounts-wrapper">
    <!-- تنبيه أعلى الصفحة للحسابات التي تجاوزت حدود التنبيه -->
    <v-alert
      v-if="accountStore.limitAlerts.length > 0"
      color="warning"
      variant="tonal"
      icon="ri-error-warning-line"
      rounded="xl"
      class="mb-4 font-weight-medium"
      closable
    >
      <div class="d-flex align-center justify-space-between flex-wrap gap-2">
        <div>
          <strong>تنبيه حدود الاستهلاك:</strong>
          يوجد عدد <strong>{{ accountStore.limitAlerts.length }}</strong> حسابات مالية بلغت أو تجاوزت عتبة التنبيه المحددة!
        </div>
      </div>
    </v-alert>

    <AppDataTable
      table-key="hwnix-cash-financial-accounts.index"
      :headers="headers"
      :items="accountStore.financialAccounts"
      :loading="accountStore.loading"
      :grid-enabled="true"
      :show-view-toggle="true"
      title="الحسابات المالية والمحافظ الإلكترونية"
      subtitle="إدارة كافة المحافظ (فودافون كاش، انستاباي، بنك مصر)، الأرصدة الفعلية والحسابية، والتنبيهات المخصصة"
      icon="ri-wallet-3-line"
      @view="openEditAccountDialog"
      @delete="deleteAccount"
    >
      <!-- الإجراءات الرأسية -->
      <template #actions>
        <AppButton
          variant="tonal"
          color="primary"
          prepend-icon="ri-refresh-line"
          :loading="accountStore.loading"
          @click="loadData"
        >
          تحديث البيانات
        </AppButton>
        <AppButton
          prepend-icon="ri-add-line"
          color="primary"
          @click="openAddAccountDialog()"
        >
          إضافة حساب مالي جديد
        </AppButton>
      </template>

      <!-- اسم الحساب ومصدر الرسائل المكتشف -->
      <template #item.name="{ item }">
        <div class="d-flex align-center gap-2 py-1">
          <v-avatar size="36" color="primary" variant="tonal" rounded="lg">
            <v-icon icon="ri-bank-card-line" size="20" color="primary" />
          </v-avatar>
          <div class="d-flex flex-column">
            <div class="d-flex align-center gap-1 font-weight-bold text-body-1">
              <span>{{ item.name }}</span>
              <v-chip size="x-small" variant="flat" color="primary" class="font-weight-bold ms-1">
                {{ item.sender_identifier }}
              </v-chip>
            </div>
            <span v-if="item.account_number" class="text-caption text-grey font-mono">
              رقم الحساب: {{ item.account_number }}
            </span>
          </div>
        </div>
      </template>

      <!-- الخط المرتبط بالشريحة والهاتف -->
      <template #item.line="{ item }">
        <div class="d-flex flex-column py-1">
          <div v-if="item.line_phone_number" class="d-flex align-center gap-1 font-weight-bold font-mono text-body-2 text-primary">
            <v-icon icon="ri-sim-card-line" size="14" color="primary" />
            <span>{{ item.line_phone_number }}</span>
          </div>
          <span v-if="item.line_carrier" class="text-caption text-grey">المزود: {{ item.line_carrier }}</span>
          <span v-if="!item.line_phone_number" class="text-caption text-grey italic">غير مرتبط بشريحة</span>
        </div>
      </template>

      <!-- الأرصدة الحسابية والفعالية وشارة فرق التسوية -->
      <template #item.balances="{ item }">
        <div class="d-flex flex-column gap-1 py-1">
          <div class="d-flex align-center justify-space-between gap-3 text-caption">
            <span>الفعلي (SMS): <strong class="text-success text-body-2 font-mono">{{ formatCurrency(item.actual_balance) }} ج.م</strong></span>
            <span>الحسابي: <strong class="text-body-2 font-mono">{{ formatCurrency(item.balance) }} ج.م</strong></span>
          </div>
          <div>
            <v-chip
              :color="item.has_balance_mismatch ? 'warning' : 'success'"
              size="x-small"
              variant="flat"
              class="font-weight-bold cursor-pointer"
              @click="openReconcileAccountDialog(item)"
            >
              {{ item.has_balance_mismatch ? `فارق تسوية: ${formatCurrency(item.balance_difference)} ج.م (اضغط للتسوية)` : 'مطابق بالكامل (0.00 ج.م)' }}
            </v-chip>
          </div>
        </div>
      </template>

      <!-- أشرطة ومعدلات استهلاك الحدود الأربعة -->
      <template #item.limits="{ item }">
        <div class="py-2" style="min-width: 240px;">
          <v-row dense>
            <v-col cols="12" sm="6">
              <HwnixCashLimitBar
                label="سحب يومي"
                :used="item.daily_withdraw_used"
                :limit="item.daily_withdraw_limit || 60000"
                :alert-type="item.daily_withdraw_alert_type || 'percentage'"
                :alert-value="item.daily_withdraw_alert_value || 80"
                icon="ri-cash-line"
                color="error"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <HwnixCashLimitBar
                label="إيداع يومي"
                :used="item.daily_deposit_used"
                :limit="item.daily_deposit_limit || 60000"
                :alert-type="item.daily_deposit_alert_type || 'percentage'"
                :alert-value="item.daily_deposit_alert_value || 80"
                icon="ri-add-circle-line"
                color="success"
              />
            </v-col>
          </v-row>
        </div>
      </template>

      <!-- حالة حد التنبيه المخصص -->
      <template #item.alerts_status="{ item }">
        <div>
          <v-chip
            v-if="item.has_any_alert_triggered"
            color="warning"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            <v-icon icon="ri-error-warning-line" size="14" class="me-1" />
            بلغ حد التنبيه ({{ item.triggered_alerts?.length || 1 }})
          </v-chip>
          <v-chip
            v-else
            color="success"
            size="small"
            variant="tonal"
            class="font-weight-bold"
          >
            <v-icon icon="ri-checkbox-circle-line" size="14" class="me-1" />
            طبيعي
          </v-chip>
        </div>
      </template>

      <!-- الإجراءات -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center gap-1 justify-center">
          <v-tooltip text="تسوية الرصيد الحسابي" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-scales-3-line"
                size="small"
                variant="tonal"
                color="info"
                @click="openReconcileAccountDialog(item)"
              />
            </template>
          </v-tooltip>

          <v-tooltip text="تعديل الحدود والتنبيهات" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-edit-line"
                size="small"
                variant="text"
                color="primary"
                @click="openEditAccountDialog(item)"
              />
            </template>
          </v-tooltip>

          <v-tooltip text="حذف الحساب المالي" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ri-delete-bin-line"
                size="small"
                variant="text"
                color="error"
                @click="deleteAccount(item)"
              />
            </template>
          </v-tooltip>
        </div>
      </template>

      <!-- تصميم شبكة الكروت (Grid View Mode Slot) -->
      <template #grid-item="{ item }">
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-card rounded="xl" border elevation="0" class="pa-4 d-flex flex-column h-100 position-relative">
            <!-- Header Card -->
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center gap-2">
                <v-avatar size="40" color="primary" variant="tonal" rounded="lg">
                  <v-icon icon="ri-bank-card-line" size="22" color="primary" />
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-1">{{ item.name }}</div>
                  <v-chip size="x-small" variant="flat" color="primary" class="font-weight-bold mt-1">
                    {{ item.sender_identifier }}
                  </v-chip>
                </div>
              </div>
              <v-chip
                :color="item.has_any_alert_triggered ? 'warning' : 'success'"
                size="x-small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ item.has_any_alert_triggered ? '⚠️ تنبيه' : '🟢 طبيعي' }}
              </v-chip>
            </div>

            <v-divider class="mb-3" />

            <!-- الأرصدة -->
            <div class="pa-3 rounded-lg border bg-grey-lighten-5 mb-3">
              <div class="d-flex align-center justify-space-between text-caption mb-1">
                <span class="text-grey">الفعلي (SMS):</span>
                <strong class="text-success text-body-2 font-mono">{{ formatCurrency(item.actual_balance) }} ج.م</strong>
              </div>
              <div class="d-flex align-center justify-space-between text-caption mb-2">
                <span class="text-grey">الحسابي:</span>
                <strong class="text-body-2 font-mono">{{ formatCurrency(item.balance) }} ج.م</strong>
              </div>
              <v-chip
                :color="item.has_balance_mismatch ? 'warning' : 'success'"
                size="x-small"
                variant="flat"
                class="w-100 justify-center font-weight-bold cursor-pointer"
                @click="openReconcileAccountDialog(item)"
              >
                {{ item.has_balance_mismatch ? `فارق تسوية: ${formatCurrency(item.balance_difference)} ج.م` : 'مطابق بالكامل' }}
              </v-chip>
            </div>

            <!-- أشرطة تقدم الحدود -->
            <div class="d-flex flex-column gap-2 mb-3 flex-grow-1">
              <HwnixCashLimitBar
                label="سحب يومي"
                :used="item.daily_withdraw_used"
                :limit="item.daily_withdraw_limit || 60000"
                :alert-type="item.daily_withdraw_alert_type || 'percentage'"
                :alert-value="item.daily_withdraw_alert_value || 80"
                icon="ri-cash-line"
                color="error"
              />
              <HwnixCashLimitBar
                label="إيداع يومي"
                :used="item.daily_deposit_used"
                :limit="item.daily_deposit_limit || 60000"
                :alert-type="item.daily_deposit_alert_type || 'percentage'"
                :alert-value="item.daily_deposit_alert_value || 80"
                icon="ri-add-circle-line"
                color="success"
              />
              <HwnixCashLimitBar
                label="سحب شهري"
                :used="item.monthly_withdraw_used"
                :limit="item.monthly_withdraw_limit || 200000"
                :alert-type="item.monthly_withdraw_alert_type || 'percentage'"
                :alert-value="item.monthly_withdraw_alert_value || 80"
                icon="ri-calendar-event-line"
                color="warning"
              />
              <HwnixCashLimitBar
                label="إيداع شهري"
                :used="item.monthly_deposit_used"
                :limit="item.monthly_deposit_limit || 200000"
                :alert-type="item.monthly_deposit_alert_type || 'percentage'"
                :alert-value="item.monthly_deposit_alert_value || 80"
                icon="ri-calendar-check-line"
                color="info"
              />
            </div>

            <!-- الأزرار والإجراءات -->
            <div class="d-flex align-center gap-2 pt-2 border-t mt-auto">
              <AppButton
                size="small"
                variant="tonal"
                color="info"
                prepend-icon="ri-scales-3-line"
                class="flex-grow-1"
                @click="openReconcileAccountDialog(item)"
              >
                تسوية
              </AppButton>
              <AppButton
                size="small"
                variant="outlined"
                color="primary"
                icon="ri-edit-line"
                @click="openEditAccountDialog(item)"
              />
              <AppButton
                size="small"
                variant="text"
                color="error"
                icon="ri-delete-bin-line"
                @click="deleteAccount(item)"
              />
            </div>
          </v-card>
        </v-col>
      </template>
    </AppDataTable>

    <!-- Dialog إضافة / تعديل حساب مالي -->
    <v-dialog v-model="accountFormDialog" max-width="650" persistent scrollable>
      <v-card rounded="xl">
        <v-card-title class="text-h6 pa-6 pb-4 d-flex align-center gap-2">
          <v-icon icon="ri-bank-card-line" color="primary" />
          {{ isEditingAccount ? 'تعديل بيانات الحساب والحدود والتنبيهات' : 'إضافة حساب مالي ومحفظة جديدة' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-form ref="accountFormRef" @submit.prevent="saveAccount">
            <v-row dense>
              <!-- اختيار الخط -->
              <v-col cols="12" v-if="!isEditingAccount">
                <v-select
                  v-model="accountForm.line_id"
                  :items="lineStore.lines"
                  item-title="phone_number"
                  item-value="id"
                  label="اختر خط الهاتف والشريحة *"
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
                  placeholder="مثال: فودافون كاش الفرع الرئيسي"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-bookmark-line"
                />
              </v-col>

              <!-- رقم الحساب -->
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

              <!-- مصدر الرسائل -->
              <v-col cols="12" v-if="!isEditingAccount">
                <v-select
                  v-model="accountForm.sender_identifier"
                  :items="accountStore.distinctSenders"
                  label="مصدر الرسائل (اختر من الرسائل المكتشفة بالنظام) *"
                  required
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="ri-mail-send-line"
                  no-data-text="لم يتم اكتشاف رسائل سابقة بالنظام"
                />
              </v-col>

              <!-- إعدادات الحدود الأربعة والتنبيهات المخصصة -->
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
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <AppButton variant="tonal" color="info" size="small" @click="applyDefaultCbeLimits">
            حدود البنك المركزي
          </AppButton>
          <v-spacer />
          <AppButton variant="text" @click="accountFormDialog = false">إلغاء</AppButton>
          <AppButton color="primary" :loading="accountStore.loading" @click="saveAccount">
            {{ isEditingAccount ? 'حفظ التعديلات' : 'حفظ الحساب المالي' }}
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog تسوية الرصيد الحسابي -->
    <v-dialog v-model="reconcileDialog" max-width="500">
      <v-card rounded="xl" v-if="reconcilingAccount">
        <v-card-title class="text-h6 pa-6 pb-2 d-flex align-center gap-2">
          <v-icon icon="ri-scales-3-line" color="info" />
          تسوية رصيد {{ reconcilingAccount.name }}
        </v-card-title>
        <v-card-text class="px-6 pb-4">
          <v-alert color="info" variant="tonal" rounded="lg" class="mb-4 text-caption">
            تأكيد تعديل الرصيد الحسابي ليتطابق مع الرصيد الفعلي (SMS). سيتم تسجيل حركة تسوية محاسبية موثقة.
          </v-alert>
          <div class="pa-3 rounded-lg border bg-grey-lighten-5 mb-4">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span>الرصيد الفعلي (Ground Truth):</span>
              <strong class="text-success font-mono">{{ formatCurrency(reconcilingAccount.actual_balance) }} ج.م</strong>
            </div>
            <div class="d-flex justify-space-between text-caption mb-1">
              <span>الرصيد الحسابي الحالي:</span>
              <strong class="font-mono">{{ formatCurrency(reconcilingAccount.balance) }} ج.م</strong>
            </div>
            <div class="d-flex justify-space-between text-caption font-weight-bold border-t pt-1 mt-1 text-warning">
              <span>قيمة الفارق المحاسبي:</span>
              <span class="font-mono">{{ formatCurrency(reconcilingAccount.balance_difference) }} ج.م</span>
            </div>
          </div>
          <v-textarea
            v-model="reconcileReason"
            label="سبب التسوية (إجباري) *"
            rows="2"
            variant="outlined"
            density="compact"
            placeholder="مثال: تسوية بعد مراجعة كشف الحساب البنكي"
            required
          />
        </v-card-text>
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <AppButton variant="text" @click="reconcileDialog = false">إلغاء</AppButton>
          <AppButton
            color="info"
            :loading="accountStore.loading"
            :disabled="!reconcileReason || Math.abs(reconcilingAccount.balance_difference) < 0.01"
            @click="saveAccountReconciliation"
          >
            تأكيد التسوية
          </AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useHwnixCashFinancialAccountStore } from '../store/hwnix-cash-financial-account.store';
import { useHwnixCashLineStore } from '../store/hwnix-cash-line.store';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import HwnixCashLimitBar from '../components/HwnixCashLimitBar.vue';

const accountStore = useHwnixCashFinancialAccountStore();
const lineStore = useHwnixCashLineStore();

const DEFAULT_CBE_LIMITS = {
  DAILY_DEPOSIT: 60000,
  DAILY_WITHDRAW: 60000,
  MONTHLY_DEPOSIT: 200000,
  MONTHLY_WITHDRAW: 200000,
};

const headers = [
  { title: 'اسم الحساب المالي والمصدر', key: 'name', sortable: true },
  { title: 'الشريحة والخط المرتبط', key: 'line', sortable: false },
  { title: 'الأرصدة والتسويات', key: 'balances', sortable: false },
  { title: 'الحدود ومعدل الاستهلاك', key: 'limits', sortable: false },
  { title: 'حالة التنبيه', key: 'alerts_status', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
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

const reconcileDialog = ref(false);
const reconcilingAccount = ref(null);
const reconcileReason = ref('');

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

function formatCurrency(v) {
  return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0);
}

function openAddAccountDialog() {
  isEditingAccount.value = false;
  editingAccountId.value = null;
  accountForm.value = {
    line_id: lineStore.lines[0]?.id || null,
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
  loadData();
}

async function deleteAccount(account) {
  if (!account) return;
  if (confirm(`هل أنت متاكد من رغبتك في حذف الحساب المالي "${account.name}"؟`)) {
    await accountStore.deleteFinancialAccount(account.id);
    loadData();
  }
}

function openReconcileAccountDialog(account) {
  if (!account) return;
  reconcilingAccount.value = account;
  reconcileReason.value = 'تسوية بعد مراجعة كشف المحفظة';
  reconcileDialog.value = true;
}

async function saveAccountReconciliation() {
  if (!reconcilingAccount.value || !reconcileReason.value) return;
  await accountStore.reconcileFinancialAccount(reconcilingAccount.value.id, {
    reason: reconcileReason.value,
  });
  reconcileDialog.value = false;
  loadData();
}

function loadData() {
  accountStore.fetchFinancialAccounts();
  accountStore.fetchLimitAlerts();
  lineStore.fetchLines();
}

onMounted(() => {
  loadData();
});
</script>
