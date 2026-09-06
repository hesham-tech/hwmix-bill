<template>
  <div class="pa-6">
    <div class="text-subtitle-1 mb-4 text-grey-darken-1">
      يرجى تحديد الشركات التي يمكن للمستخدم الوصول لمساحة العمل الخاصة بها وإدارتها.
    </div>

    <v-form @submit.prevent="saveCompanies">
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="selectedCompanies"
            :items="allCompanies"
            item-title="name"
            item-value="id"
            label="الشركات المسموح بها"
            multiple
            chips
            closable-chips
            variant="outlined"
            prepend-inner-icon="ri-building-line"
            :loading="loading"
            hint="صلاحية وصول لمساحة عمل الشركة"
            persistent-hint
          >
            <template #selection="{ item, index }">
              <v-chip v-if="index < 5" closable @click:close="removeCompany(item.value)" color="primary" variant="flat">
                {{ item.title }}
              </v-chip>
              <span v-if="index === 5" class="text-caption ms-2">(+{{ selectedCompanies.length - 5 }} شركات أخرى)</span>
            </template>
          </v-select>
        </v-col>
      </v-row>

      <div class="d-flex justify-end gap-3 mt-6 pt-4 border-t">
        <AppButton variant="tonal" color="grey" @click="$emit('cancel')">إلغاء</AppButton>
        <AppButton type="submit" color="info" class="px-8 font-weight-bold rounded-pill" :loading="saving">
          <v-icon icon="ri-save-line" class="me-2" />
          حفظ الصلاحيات
        </AppButton>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { AppButton } from '@/components';
import { companyService, userService } from '@/api';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['save', 'cancel']);

const selectedCompanies = ref([]);
const allCompanies = ref([]);
const loading = ref(false);
const saving = ref(false);

const fetchCompanies = async () => {
  try {
    loading.value = true;
    const response = await companyService.getAll({ limit: 1000 });
    allCompanies.value = response.data?.data || [];
    
    // Set initial selected companies based on user's current companies
    selectedCompanies.value = (props.user?.companies || []).map(c => c.id);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
  } finally {
    loading.value = false;
  }
};

const removeCompany = (id) => {
  selectedCompanies.value = selectedCompanies.value.filter(cId => cId !== id);
};

const saveCompanies = async () => {
  try {
    saving.value = true;
    await userService.updateCompanyAccess(
      props.user.id, 
      { company_ids: selectedCompanies.value },
      { showToast: true }
    );
    emit('save');
  } catch (error) {
    console.error('Failed to save company access:', error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchCompanies();
});
</script>
