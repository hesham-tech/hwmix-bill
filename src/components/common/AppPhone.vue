<template>
  <div v-if="phone" class="app-phone d-flex align-center gap-1">
    <!-- Unified Copy Section -->
    <v-tooltip text="نسخ الرقم" location="top" :disabled="hideText">
      <template #activator="{ props: tooltipProps }">
        <div
          v-bind="tooltipProps"
          class="phone-copy-container d-flex align-center px-2 py-1 rounded border border-grey-lighten-2 cursor-pointer transition-all hover-primary ms-n1"
          @click.stop="handleCopy"
        >
          <v-icon icon="ri-file-copy-line" size="14" color="grey-darken-2" class="me-2" />
          <span v-if="!hideText" class="text-caption font-weight-bold phone-number-text text-grey-darken-3">
            {{ phone }}
          </span>
        </div>
      </template>
    </v-tooltip>

    <div class="d-flex align-center">
      <v-tooltip text="واتساب" location="top">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="ri-whatsapp-line"
            variant="text"
            size="x-small"
            color="success"
            class="action-btn"
            :href="`https://wa.me/${phone.replace(/[^0-9]/g, '')}`"
            target="_blank"
            @click.stop
          />
        </template>
      </v-tooltip>

      <v-tooltip text="اتصال" location="top">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="ri-phone-line"
            variant="text"
            size="x-small"
            color="primary"
            class="action-btn"
            :href="`tel:${phone}`"
            @click.stop
          />
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
  phone: { type: String, default: '' },
  hideText: { type: Boolean, default: false },
  countryCode: { type: String, default: '+2' },
});

const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

const handleCopy = async () => {
  if (!props.phone) return;
  const success = await copyToClipboard(props.phone);
  if (success) {
    toast.success('تم نسخ الرقم إلى الحافظة');
  }
};
</script>

<style scoped>
.app-phone {
  display: inline-flex;
}
.phone-copy-container {
  transition: all 0.2s ease;
  background-color: rgba(var(--v-theme-grey), 0.05);
}
.phone-copy-container:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}
.hover-primary:hover .phone-number-text {
  color: rgb(var(--v-theme-primary));
}
.phone-number-text {
  transition: color 0.1s;
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
</style>
