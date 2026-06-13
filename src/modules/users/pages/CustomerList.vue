<template>
  <div class="customers-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm">
            <AppDataTable
              class="tour-customer-table"
              table-key="customers.index"
              v-model:sort-by="sortByVuetify"
              v-model:search="searchText"
              :filters="advancedFilters"
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :headers="headers"
              :items="users || []"
              :total-items="totalItems || 0"
              :loading="loading"
              :table-height="'calc(100vh - 220px)'"
              grid-enabled
              :grid-options="{
                titleKey: 'full_name',
                avatarKey: 'image_url',
                bodyKeys: ['phone', 'balance_display', 'status'],
              }"
              permission-module="users"
              title="العملاء"
              subtitle="إدارة بيانات العملاء والبحث في سجلاتهم"
              icon="ri-team-line"
              empty-state-type="customers"
              :empty-state-show-cta="can(PERMISSIONS.USERS_CREATE)"
              @empty-action="handleCreate"
              @update:filters="applyFilters"
              @update:options="onTableOptionsUpdate"
              @edit="handleEdit"
              @delete="handleDelete"
              @view="item => $router.push(`/app/users/${item.id}`)"
            >
              <template #actions>
                <div class="d-flex align-center gap-3 flex-wrap">
                  <v-checkbox
                    v-if="can(PERMISSIONS.ADMIN_SUPER)"
                    v-model="currentCompanyOnly"
                    label="هذه الشركة فقط"
                    hide-details
                    density="compact"
                    color="primary"
                  />
                  <!-- Switch: Unaffiliated users -->
                  <v-switch
                    v-if="can(PERMISSIONS.ADMIN_SUPER)"
                    v-model="showUnaffiliated"
                    label="بلا شركة"
                    hide-details
                    density="compact"
                    color="warning"
                    inset
                    class="me-1"
                  />
                  <AppButton
                    v-if="can(PERMISSIONS.USERS_CREATE)"
                    color="primary"
                    prepend-icon="ri-user-add-line"
                    size="small"
                    class="rounded-pill shadow-sm tour-customer-add"
                    style="height: 40px"
                    @click="handleCreate"
                  >
                    عميل جديد
                  </AppButton>
                </div>
              </template>

              <!-- Custom Templates -->
              <template #item.full_name="{ item }">
                <AppUserBalanceProfile :user="item" @click="$router.push(`/app/users/${item.id}`)" />
              </template>

              <template #item.phone="{ item }">
                <div dir="ltr" class="text-caption font-weight-medium text-grey-darken-1">{{ item.phone }}</div>
              </template>

              <template #item.balance_display="{ item }">
                <AppBalanceDisplay 
                  :amount="item.balance" 
                  perspective="admin"
                  custom-class="px-2 py-0-5 rounded-pill border border-opacity-25 bg-neutral-lighten-5"
                  style="border-style: solid !important"
                />
              </template>

              <template #item.status="{ item }">
                <v-chip
                  :color="[1, '1', true, 'active'].includes(item.status) ? 'success' : 'error'"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold px-2"
                >
                  {{ [1, '1', true, 'active'].includes(item.status) ? 'نشط' : 'معطل' }}
                </v-chip>
              </template>

              <template #extra-actions="{ item }">
                <!-- Balance Management Actions -->
                <v-list-item
                  v-if="can(PERMISSIONS.BALANCE_DEPOSIT) || can(PERMISSIONS.BALANCE_DEPOSIT_ANY)"
                  prepend-icon="ri-qr-code-line"
                  title="إيداع رصيد"
                  class="text-info"
                  @click="handleBalanceOperation(item, 'deposit')"
                />
                <v-list-item
                  v-if="can(PERMISSIONS.BALANCE_WITHDRAW) || can(PERMISSIONS.BALANCE_WITHDRAW_ANY)"
                  prepend-icon="ri-hand-coin-line"
                  title="سحب رصيد"
                  class="text-error"
                  @click="handleBalanceOperation(item, 'withdraw')"
                />
                <v-list-item
                  v-if="can(PERMISSIONS.BALANCE_TRANSFER) || can(PERMISSIONS.BALANCE_TRANSFER_ANY)"
                  prepend-icon="ri-swap-box-line"
                  title="تحويل رصيد"
                  class="text-warning"
                  @click="handleBalanceOperation(item, 'transfer')"
                />

                <v-divider class="my-1" />

                <!-- Existing Actions -->
                <v-list-item
                  v-if="can(PERMISSIONS.PAYMENTS_CREATE)"
                  prepend-icon="ri-money-dollar-circle-line"
                  title="سداد دفعة"
                  class="text-success"
                  @click="$router.push(`/app/payments/create?user_id=${item.id}`)"
                />
                <v-list-item
                  v-if="can(PERMISSIONS.INSTALLMENT_PLANS_CREATE)"
                  prepend-icon="ri-calendar-todo-line"
                  title="خطة تقسيط"
                  class="text-primary"
                  @click="$router.push(`/app/invoices/create?type=installment_sale&user_id=${item.id}`)"
                />
                <v-list-item
                  v-if="can(PERMISSIONS.USERS_EDIT)"
                  prepend-icon="ri-shield-user-line"
                  title="إدارة الصلاحيات"
                  class="text-purple"
                  @click="openPermissions(item)"
                />
                <v-list-item v-if="can(PERMISSIONS.USERS_EDIT)" prepend-icon="ri-edit-line" title="تعديل البيانات" @click="handleEdit(item)" />
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>

      <!-- User Form Dialog -->
      <AppDialog
        v-model="isOpen"
        :title="isEditMode ? `تعديل بيانات: ${formData.nickname || formData.full_name || ''}` : 'إضافة عميل جديد'"
        :subtitle="isEditMode ? 'تحديث المعلومات الأساسية' : 'إضافة عميل جديد للنظام'"
        :icon="isEditMode ? 'ri-user-edit-line' : 'ri-user-add-line'"
        max-width="800"
        hide-actions
      >
        <UserForm ref="userFormRef" v-model="formData" :is-edit-mode="isEditMode" hide-actions @save="handleSave" @cancel="close" />

        <template #actions>
          <AppButton variant="tonal" color="grey" @click="close">إلغاء</AppButton>
          <AppButton :loading="userFormRef?.loading" color="primary" class="px-8 font-weight-bold rounded-pill shadow-md" @click="handleSubmit">
            <v-icon :icon="userFormRef?.form?.id ? 'ri-user-received-line' : 'ri-save-line'" class="me-2" />
            {{ isEditMode ? 'تحديث البيانات' : userFormRef?.form?.id ? 'ربط العميل' : 'حفظ العميل' }}
          </AppButton>
        </template>
      </AppDialog>

      <div class="px-6 pb-6 mt-4">
        <AppConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
      </div>

      <!-- Delete Confirmation Dialog for Super Admin -->
      <AppDialog
        v-model="isDeleteDialogOpen"
        title="تأكيد حذف العميل"
        subtitle="اختر نوع إجراء الحذف المطلوب تنفيذه"
        icon="ri-delete-bin-line"
        max-width="500"
        hide-actions
      >
        <div class="pa-4">
          <p class="text-body-1 mb-4">
            أنت تقوم بحذف العميل <strong>{{ userToDelete?.nickname || userToDelete?.full_name || userToDelete?.name }}</strong>. يرجى تحديد خيار الحذف:
          </p>
          <v-radio-group v-model="deleteType" column class="mb-4">
            <v-radio value="company" color="primary">
              <template #label>
                <div>
                  <span class="font-weight-bold d-block text-primary">فك الارتباط بالشركة الحالية فقط</span>
                  <span class="text-caption text-grey">سيتم إزالة العميل من هذه الشركة فقط، وسيبقى حسابه كما هو في بقية الشركات.</span>
                </div>
              </template>
            </v-radio>
            <v-radio value="global" color="error" class="mt-4">
              <template #label>
                <div>
                  <span class="font-weight-bold d-block text-error">حذف الحساب نهائياً من النظام</span>
                  <span class="text-caption text-grey">سيتم إزالة الحساب نهائياً وكلياً من قاعدة البيانات وجميع الشركات المرتبطة به.</span>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </div>
        <template #actions>
          <AppButton variant="tonal" color="grey" @click="closeDeleteDialog">إلغاء</AppButton>
          <AppButton :loading="deleteLoading" :color="deleteType === 'global' ? 'error' : 'primary'" class="px-8 font-weight-bold rounded-pill shadow-md" @click="confirmDelete">
            تأكيد الحذف
          </AppButton>
        </template>
      </AppDialog>

      <!-- Permission Management Dialog -->
      <AppDialog v-model="isPermissionOpen" title="إدارة صلاحيات الوصول" variant="purple" max-width="900" hide-actions fluid :fullscreen="isMobile">
        <template #header>
          <div class="d-flex align-center gap-3 w-100 pa-5 text-white">
            <v-avatar color="white" variant="tonal" size="48">
              <v-icon icon="ri-shield-keyhole-line" color="white" />
            </v-avatar>
            <div class="flex-grow-1">
              <span class="text-h6 font-weight-bold d-block">إدارة صلاحيات الوصول</span>
              <span v-if="permissionUser" class="text-caption opacity-80">{{ permissionUser.full_name }} ({{ permissionUser.username }})</span>
            </div>
            <v-btn icon="ri-close-line" variant="text" color="white" @click="closePermissions" />
          </div>
        </template>

        <v-divider class="border-opacity-10" />

        <div class="pa-6 bg-grey-lighten-4 border-b">
          <AppUserBalanceProfile v-if="permissionUser" :user="permissionUser" mode="horizontal" hide-balance :clickable="false" />
        </div>

        <UserPermissionManager v-if="permissionUser" :user="permissionUser" @save="closePermissions" @cancel="closePermissions" />
      </AppDialog>

      <!-- Balance Operations Dialog -->
      <BalanceOperations v-model="isBalanceOpen" :user="balanceUser" :initial-type="balanceType" @success="onBalanceSuccess" />
    </v-container>
  </div>
</template>

<script setup>
/**
 * مكون عرض وإدارة قائمة العملاء.
 * يعرض قائمة العملاء وحالاتهم وأرصدتهم، ويدعم عمليات الإيداع، السحب، التحويل، وإدارة الدفعات.
 */
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { userService } from '@/api';
import { useUser } from '../composables/useUser';
import UserForm from '../components/UserForm.vue';
import UserPermissionManager from '../components/UserPermissionManager.vue';
import BalanceOperations from '@/modules/financials/components/BalanceOperations.vue';
import { AppDataTable, AppButton, AppDialog, AppConfirmDialog, AppUserBalanceProfile, AppBalanceDisplay } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/utils/formatters';
import { useUserStore } from '@/stores/user';

const { can } = usePermissions();
const userStore = useUserStore();
const userFormRef = ref(null);

// Advanced Filters (Simplified for Customers)
const advancedFilters = [
  {
    key: 'status',
    title: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: 'active' },
      { title: 'معطل', value: 'inactive' },
    ],
  },
];

const {
  formData,
  isEditMode,
  isOpen,
  close,
  showConfirm,
  confirmMessage,
  handleConfirm: baseHandleConfirm,
  handleCancel,
  isPermissionOpen,
  permissionUser,
  openPermissions,
  closePermissions,
  isDeleteDialogOpen,
  userToDelete,
  deleteType,
  deleteLoading,
  confirmDelete,
  closeDeleteDialog,
  saveUser,
  handleDelete,
  handleEdit,
  handleCreate: baseHandleCreate,
} = useUser();

const { mobile: isMobile } = useDisplay();

const handleConfirm = async () => {
  await baseHandleConfirm();
  refresh();
};

// Override handleCreate to set default role
const handleCreate = () => {
  baseHandleCreate();
  formData.value.role = 'customer';
  formData.value.roles = ['customer'];
};

// API fetch function
const fetchUsersApi = async params => {
  return await userService.getCustomers(params, { showToast: false });
};

// DataTable Logic
const {
  items: users,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total: totalItems,
  lastPage,
  search: searchText,
  filters,
  sortByVuetify,
  changeSort,
  applyFilters,
  fetchData,
  refresh,
} = useDataTable(fetchUsersApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const onTableOptionsUpdate = options => {
  changeSort(options);
};

// Computed for company visibility filter
const currentCompanyOnly = computed({
  get: () => !filters.value?.global,
  set: val => {
    filters.value.global = !val;
    applyFilters(filters.value);
  },
});

// Switch: show users with no active company (unaffiliated)
const showUnaffiliated = ref(false);
watch(showUnaffiliated, val => {
  filters.value.unaffiliated = val ? 1 : undefined;
  applyFilters(filters.value);
});

const handleSubmit = () => {
  // Ensure role is set before submit
  if (!formData.value.role) {
    formData.value.role = 'customer';
    formData.value.roles = ['customer'];
  }
  userFormRef.value?.handleSubmit();
};

const handleSave = async data => {
  // Ensure role is customer
  if (!data.roles || !data.roles.includes('customer')) {
    data.roles = ['customer'];
    data.role = 'customer';
  }
  const isAddingNew = !isEditMode.value;
  await saveUser(data);

  if (isAddingNew) {
    try {
      const { useGuidanceStore } = await import('@/modules/guidance/store/useGuidanceStore');
      const guidanceStore = useGuidanceStore();
      await guidanceStore.markStepAsCompleted('onboarding.add_customer');
    } catch (e) {
      console.warn('Guidance store sync failed:', e);
    }
  }

  refresh();
  close();
};

const headers = [
  { title: 'العميل', key: 'full_name', sortable: true, mandatory: true },
  { title: 'الاسم الكامل', key: 'name', sortable: true, defaultHide: true },
  { title: 'الكنية / اللقب', key: 'nickname', sortable: true, defaultHide: true },
  { title: 'اسم المستخدم', key: 'username', sortable: true, defaultHide: true },
  { title: 'البريد الإلكتروني', key: 'email', sortable: true, defaultHide: true },
  { title: 'رقم الهاتف', key: 'phone', sortable: false },
  { title: 'المسمى الوظيفي', key: 'position', sortable: true, defaultHide: true },
  { title: 'الرصيد الكلي', key: 'balance_display', sortable: true },
  { title: 'رصيد الفرع النشط', key: 'active_branch_balance', sortable: true, defaultHide: true },
  { title: 'تاريخ الإنشاء', key: 'created_at', sortable: true, defaultHide: true },
  { title: 'تاريخ التحديث', key: 'updated_at', sortable: true, defaultHide: true },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', mandatory: true },
];

// Balance Operations
const isBalanceOpen = ref(false);
const balanceUser = ref(null);
const balanceType = ref('deposit');

const handleBalanceOperation = (user, type) => {
  balanceUser.value = user;
  balanceType.value = type;
  isBalanceOpen.value = true;
};

const onBalanceSuccess = () => {
  refresh();
};
</script>

<style scoped>
.customers-page :deep(.v-container) {
  max-width: 100% !important;
}

.gap-3 {
  gap: 12px;
}
</style>
