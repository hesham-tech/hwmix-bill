<template>
  <div v-if="phone" class="app-phone d-flex align-center">
    <span class="text-body-2 font-weight-medium me-1 cursor-pointer phone-number-text" @click.stop="handleCopy">
      {{ phone }}
    </span>

    <div class="d-flex align-center no-wrap ms-1">
      <!-- Copy Icon -->
      <v-tooltip text="نسخ الرقم" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="ri-file-copy-line"
            variant="text"
            size="x-small"
            color="grey-darken-1"
            class="action-btn"
            @click.stop="handleCopy"
          />
        </template>
      </v-tooltip>

      <!-- WhatsApp Icon -->
      <v-tooltip text="مراسلة عبر واتساب" location="top">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="ri-whatsapp-line" variant="text" size="x-small" color="success" class="action-btn" @click.stop="openWhatsApp" />
        </template>
      </v-tooltip>

      <!-- Call Icon (Mobile Only) -->
      <v-tooltip v-if="isMobile" text="اتصال" location="top">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="ri-phone-fill" variant="text" size="x-small" color="primary" class="action-btn" @click.stop="makeCall" />
        </template>
      </v-tooltip>
    </div>
  </div>
  <span v-else class="text-caption text-grey italic"> لا يوجد رقم </span>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { copyToClipboard } from '@/utils/helpers';
import { toast } from 'vue3-toastify';

const props = defineProps({
  phone: {
    type: String,
    default: '',
  },
});

const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

const handleCopy = async () => {
  const success = await copyToClipboard(props.phone);
  if (success) {
    toast.success('تم نسخ الرقم إلى الحافظة');
  }
};

const openWhatsApp = () => {
  // Remove non-numeric characters for the link
  const cleanPhone = props.phone.replace(/\D/g, '');
  // WhatsApp wa.me link
  window.open(`https://wa.me/${cleanPhone}`, '_blank');
};

const makeCall = () => {
  window.location.href = `tel:${props.phone}`;
};
</script>

<style scoped>
.app-phone {
  display: inline-flex;
}
.phone-number-text {
  transition: color 0.2s;
}
.phone-number-text:hover {
  color: var(--v-theme-primary);
  text-decoration: underline;
}
.action-btn {
  width: 24px !important;
  height: 24px !important;
  min-width: unset !important;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.action-btn:hover {
  opacity: 1;
}
.no-wrap {
  flex-wrap: nowrap;
}
</style>
