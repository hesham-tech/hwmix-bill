<template>
  <v-dialog :model-value="modelValue" max-width="700" persistent @update:model-value="$emit('update:modelValue', $event)" @keydown.esc="close">
    <v-card class="search-dialog-card overflow-hidden">
      <!-- Search Input Header -->
      <div class="search-header px-4 pt-3 pb-4 border-b bg-surface">
        <!-- Close Button Row -->
        <div class="d-flex justify-start mb-2">
          <v-btn icon="ri-close-line" color="error" variant="tonal" size="small" @click="close" />
        </div>

        <!-- Search Input Row -->
        <v-text-field
          ref="searchInput"
          v-model="searchQuery"
          variant="solo-filled"
          flat
          placeholder="ابحث عن عميل، فاتورة، أو خطة تقسيط..."
          prepend-inner-icon="ri-search-line"
          hide-details
          class="global-search-input no-drag"
          clearable
          autofocus
          @update:model-value="handleSearch"
          @keydown.enter="handleEnter"
        >
          <template #append-inner>
            <div class="kbd-hint d-none d-sm-flex align-center bg-grey-lighten-4 px-2 py-0.5 rounded border">
              <span class="text-caption font-weight-bold text-grey-darken-1">ESC</span>
            </div>
          </template>
        </v-text-field>
      </div>

      <!-- Results Body -->
      <v-card-text class="pa-0 search-results-container scrollbar-hidden" style="max-height: 500px">
        <!-- Initial / Empty State -->
        <div v-if="!searchQuery" class="pa-10 text-center text-grey">
          <v-icon icon="ri-search-eye-line" size="48" class="mb-3 opacity-20" />
          <div class="text-subtitle-1">ابدأ الكتابة للبحث الشامل...</div>
          <div class="text-caption mt-1">يمكنك البحث بالاسم، رقم الهاتف، أو رقم الفاتورة</div>
        </div>

        <div v-else-if="loading" class="pa-10 text-center">
          <v-progress-circular indeterminate color="primary" />
          <div class="text-caption mt-2">جاري البحث في جميع السجلات...</div>
        </div>

        <div v-else-if="hasNoResults" class="pa-10 text-center text-grey">
          <v-icon icon="ri-find-replace-line" size="48" class="mb-3 opacity-20" />
          <div class="text-subtitle-1">لا توجد نتائج مطابقة لـ "{{ searchQuery }}"</div>
        </div>

        <!-- Groups -->
        <div v-else class="pa-2">
          <!-- Users Section -->
          <div v-if="results?.users?.length" class="result-group">
            <div class="group-title text-caption font-weight-bold text-primary px-3 py-2">العملاء</div>
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="user in results.users"
                :key="user.id"
                class="result-item rounded-lg mb-1"
                @click="navigateTo(`/app/users/${user.id}`)"
              >
                <AppUserBalanceProfile :user="user" mode="horizontal" :clickable="false" />
              </v-list-item>
            </v-list>
          </div>

          <!-- Invoices Section -->
          <div v-if="results?.invoices?.length" class="result-group mt-2">
            <div class="group-title text-caption font-weight-bold text-primary px-3 py-2">الفواتير</div>
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="invoice in results.invoices"
                :key="invoice.id"
                class="result-item rounded-lg mb-1"
                @click="navigateTo(`/app/invoices/${invoice.id}`)"
              >
                <template #prepend>
                  <v-icon icon="ri-file-list-3-line" color="info" class="me-3" />
                </template>
                <v-list-item-title class="font-weight-bold">فاتورة رقم: {{ invoice.invoice_number }}</v-list-item-title>
                <v-list-item-subtitle
                  >العميل: {{ invoice.user?.full_name }} | المبلغ: {{ formatCurrency(invoice.total_amount) }}</v-list-item-subtitle
                >
                <template #append>
                  <v-chip size="x-small" :color="getStatusColor(invoice.status)" variant="tonal" class="rounded-sm">
                    {{ invoice.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <!-- Installment Plans Section -->
          <div v-if="results?.installment_plans?.length" class="result-group mt-2">
            <div class="group-title text-caption font-weight-bold text-primary px-3 py-2">خطط التقسيط</div>
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="plan in results.installment_plans"
                :key="plan.id"
                class="result-item rounded-lg mb-1"
                @click="navigateTo(`/app/installment-plans/${plan.id}`)"
              >
                <template #prepend>
                  <v-icon icon="ri-calendar-todo-line" color="purple" class="me-3" />
                </template>
                <v-list-item-title class="font-weight-bold">{{ plan.customer?.full_name }}</v-list-item-title>
                <v-list-item-subtitle>إجمالي الخطة: {{ formatCurrency(plan.total_amount) }}</v-list-item-subtitle>
                <template #append>
                  <v-chip size="x-small" :color="getStatusColor(plan.status)" variant="tonal" class="rounded-sm">
                    {{ plan.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '@/api';
import { formatCurrency } from '@/utils/formatters';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppUserBalanceProfile from '@/components/common/AppUserBalanceProfile.vue';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const searchQuery = ref('');
const loading = ref(false);
const searchInput = ref(null);
const results = ref({
  users: [],
  invoices: [],
  installment_plans: [],
});

let debounceTimer = null;
let abortController = null;

const hasNoResults = computed(() => {
  const users = results.value?.users || [];
  const invoices = results.value?.invoices || [];
  const plans = results.value?.installment_plans || [];
  return users.length === 0 && invoices.length === 0 && plans.length === 0;
});

const handleSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  if (!searchQuery.value || searchQuery.value.length < 2) {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    results.value = { users: [], invoices: [], installment_plans: [] };
    loading.value = false;
    return;
  }

  loading.value = true;
  debounceTimer = setTimeout(async () => {
    // Abort previous request if it's still pending
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    try {
      const { data } = await apiClient.get('/global-search', {
        params: { query: searchQuery.value },
        signal: abortController.signal,
      });

      results.value = data;
      abortController = null;
    } catch (error) {
      // Silent if request was canceled
      if (error.name === 'AbortError' || error.message === 'canceled' || error.inner?.name === 'AbortError') {
        return;
      }
      console.error('Search error:', error);
      abortController = null;
    } finally {
      // Only stop loading if we don't have a new pending request
      if (!abortController) {
        loading.value = false;
      }
    }
  }, 550);
};

const navigateTo = path => {
  router.push(path);
  close();
};

const close = () => {
  emit('update:modelValue', false);
  searchQuery.value = '';
  results.value = { users: [], invoices: [], installment_plans: [] };
};

const getStatusColor = status => {
  const colors = {
    active: 'success',
    paid: 'success',
    draft: 'grey',
    confirmed: 'info',
    overdue: 'error',
    canceled: 'error',
    partially_paid: 'warning',
  };
  return colors[status] || 'grey';
};

const handleEnter = () => {
  // If there is only one result total, navigate to it
  const users = results.value?.users || [];
  const invoices = results.value?.invoices || [];
  const plans = results.value?.installment_plans || [];
  const allResults = [...users, ...invoices, ...plans];

  if (allResults.length === 1) {
    const item = allResults[0];
    if (users.length) navigateTo(`/app/users/${item.id}`);
    else if (invoices.length) navigateTo(`/app/invoices/${item.id}`);
    else if (plans.length) navigateTo(`/app/installment-plans/${item.id}`);
  }
};

// Autofocus when dialog opens
watch(
  () => props.modelValue,
  val => {
    if (val) {
      setTimeout(() => {
        searchInput.value?.focus();
      }, 100);
    }
  }
);
</script>

<style scoped>
.search-dialog-card {
  border-radius: 12px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.search-header {
  background-color: rgb(var(--v-theme-surface));
}

.global-search-input :deep(.v-field__input) {
  font-size: 1.1rem;
}

.search-results-container {
  overflow-y: auto;
  min-height: 200px;
}

.result-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.result-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.kbd-hint {
  height: 24px;
  line-height: normal;
}

/* Scrollbar Styling */
.scrollbar-hidden::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-hidden::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}
.scrollbar-hidden::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}
</style>
