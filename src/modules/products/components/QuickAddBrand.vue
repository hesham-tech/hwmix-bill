<template>
  <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.display.smAndDown" transition="dialog-bottom-transition">
    <template v-slot:activator="{ props: activatorProps }">
      <slot name="activator" :props="activatorProps">
        <v-btn icon="ri-add-line" size="small" variant="text" color="primary" v-bind="activatorProps" />
      </slot>
    </template>

    <v-card rounded="md" class="pa-4">
      <v-card-title class="d-flex align-center gap-2">
        <v-avatar color="primary-lighten-5" rounded="md" size="40">
          <v-icon icon="ri-verified-badge-line" color="primary" />
        </v-avatar>
        <span class="font-weight-bold">إضافة علامة تجارية جديدة</span>
      </v-card-title>

      <v-card-text class="mt-4">
        <v-form ref="form" v-model="isValid">
          <v-text-field
            v-model="name"
            label="اسم العلامة التجارية (AR)"
            placeholder="مثال: سامسونج"
            variant="solo-filled"
            flat
            rounded="md"
            :rules="[required]"
            autofocus
          />
          <v-text-field
            v-model="nameEn"
            label="اسم العلامة التجارية (EN)"
            placeholder="Samsung"
            variant="solo-filled"
            flat
            rounded="md"
            class="mt-2 text-left"
            dir="ltr"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="dialog = false" :disabled="loading">إلغاء</v-btn>
        <v-btn color="primary" variant="flat" rounded="md" class="px-6 font-weight-bold" :loading="loading" @click="save"> حفظ البراند </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { required } from '@/utils/validators';
import brandService from '@/api/services/brand.service';

const emit = defineEmits(['saved']);

const dialog = ref(false);
const loading = ref(false);
const isValid = ref(false);
const form = ref(null);

const name = ref('');
const nameEn = ref('');

const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const payload = {
      name: name.value,
      name_en: nameEn.value,
      active: 1,
    };

    // API Expects 'company_id' but backend should handle it via Auth/Middleware in multi-tenant
    const response = await brandService.create(payload, { showToast: true });
    if (response.status) {
      emit('saved', response.data[0]);
      dialog.value = false;
      name.value = '';
      nameEn.value = '';
    }
  } finally {
    loading.value = false;
  }
};
</script>
