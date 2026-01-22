<template>
  <AppDialog
    :model-value="modelValue"
    title="تبديل المتجر / الشركة"
    icon="ri-exchange-funds-line"
    max-width="700"
    :hide-actions="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="pa-0 dialog-content">
      <!-- Search Header -->
      <!-- <div class="pa-4 bg-grey-lighten-4 border-bottom">
        <v-text-field
          v-model="search"
          placeholder="ابحث عن شركة أو متجر..."
          prepend-inner-icon="ri-search-line"
          variant="solo"
          density="comfortable"
          flat
          hide-details
          rounded="lg"
          class="search-field"
        />
      </div> -->

      <div class="pa-4 pt-2 overflow-y-auto" style="max-height: 500px">
        <div class="text-subtitle-2 mb-3 text-grey-darken-1 px-1">الشركات التي يمكنك ادارتها:</div>

        <v-row dense>
          <v-col v-for="company in filteredCompanies" :key="company.id" cols="12">
            <v-card
              :active="company.id === userStore.currentUser?.company_id"
              class="company-card mb-2"
              variant="outlined"
              @click="handleSwitch(company)"
              :disabled="loadingId === company.id"
              :class="{ 'active-card': company.id === userStore.currentUser?.company_id }"
            >
              <div class="d-flex pa-3 align-start">
                <!-- Company Logo -->
                <v-avatar :size="mobile ? 48 : 64" rounded="lg" color="grey-lighten-4" :class="[mobile ? 'me-2' : 'me-4', 'border-thin']">
                  <v-img v-if="company.logo" :src="company.logo" contain />
                  <v-icon v-else icon="ri-building-line" color="primary" :size="mobile ? 24 : 32" />
                </v-avatar>

                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <h3 class="text-h6 font-weight-bold company-name">
                      {{ company.name }}
                    </h3>
                    <v-chip
                      v-if="company.id === userStore.currentUser?.company_id"
                      size="x-small"
                      color="success"
                      class="text-caption font-weight-bold"
                      variant="flat"
                    >
                      النشطة حالياً
                    </v-chip>
                  </div>

                  <div class="d-flex flex-wrap gap-2 mb-2 align-center">
                    <span v-if="company.field" class="text-caption text-grey-darken-1 d-flex align-center">
                      <v-icon icon="ri-apps-2-line" start size="14" class="me-1" />
                      {{ company.field }}
                    </span>
                    <span v-if="company.owner_name" class="text-caption text-grey-darken-1 d-flex align-center">
                      <v-icon icon="ri-user-star-line" start size="14" class="me-1" />
                      {{ company.owner_name }}
                    </span>
                  </div>

                  <div v-if="company.description" class="text-caption text-grey mb-2 line-clamp-1">
                    {{ company.description }}
                  </div>

                  <!-- <div class="d-flex align-center text-caption text-grey-darken-1 gap-3">
                    <span v-if="company.address" class="d-flex align-center">
                      <v-icon icon="ri-map-pin-line" size="14" class="me-1" />
                      {{ company.address }}
                    </span>
                    <span v-if="company.phone" class="d-flex align-center">
                      <v-icon icon="ri-phone-line" size="14" class="me-1" />
                      {{ company.phone }}
                    </span>
                  </div> -->
                </div>

                <div class="ms-2 align-self-center">
                  <v-progress-circular v-if="loadingId === company.id" indeterminate size="24" width="3" color="primary" />
                  <v-btn v-else icon="ri-arrow-left-line" variant="text" color="primary" size="small" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <div v-if="filteredCompanies.length === 0" class="text-center py-10">
          <v-icon icon="ri-building-2-line" size="64" color="grey-lighten-2" class="mb-3" />
          <div class="text-h6 text-grey">لا توجد شركات تطابق بحثك</div>
        </div>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useDisplay } from 'vuetify';
import AppDialog from '@/components/common/AppDialog.vue';
import { toast } from 'vue3-toastify';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const userStore = useUserStore();
const { mobile } = useDisplay();
const loadingId = ref(null);
const search = ref('');

const filteredCompanies = computed(() => {
  if (!userStore.companies) return [];
  const q = search.value.toLowerCase();
  return userStore.companies.filter(
    c =>
      c.name?.toLowerCase().includes(q) ||
      c.field?.toLowerCase().includes(q) ||
      c.owner_name?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
  );
});

const handleSwitch = async company => {
  if (company.id === userStore.currentUser?.company_id) {
    emit('update:modelValue', false);
    return;
  }

  try {
    loadingId.value = company.id;
    await userStore.switchCompany(company.id);
    toast.success(`تم الانتقال إلى ${company.name} بنجاح`);
    emit('update:modelValue', false);
  } catch (error) {
    toast.error('فشل في تبديل الشركة، يرجى المحاولة مرة أخرى');
  } finally {
    loadingId.value = null;
  }
};
</script>

<style scoped>
.dialog-content {
  overflow: hidden;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.company-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px !important;
}

.company-card:hover:not(.active-card) {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.02);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
}

.active-card {
  border-color: rgb(var(--v-theme-success)) !important;
  background-color: rgba(var(--v-theme-success), 0.04) !important;
}

.company-name {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.1rem !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

.search-field :deep(.v-field) {
  background: white !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12) !important;
}
</style>
