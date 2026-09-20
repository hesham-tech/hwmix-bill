<template>
  <div class="d-flex align-center gap-2 seller-badge" @click.stop="goToVendor">
    <v-avatar size="24" class="border" :color="!company.logo ? 'grey-lighten-4' : undefined">
      <v-img v-if="company.logo" :src="company.logo" alt="Seller Logo" />
      <v-icon v-else icon="ri-store-2-line" size="14" color="grey-darken-1" />
    </v-avatar>
    <span class="text-caption font-weight-medium seller-name">{{ company.name }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  company: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToVendor = () => {
  if (props.company.id) {
    router.push(`/store/vendor/${props.company.id}`)
  }
}
</script>

<style scoped>
.seller-badge {
  cursor: pointer;
  transition: opacity 0.2s;
}
.seller-badge:hover {
  opacity: 0.8;
}
.seller-name {
  color: var(--v-theme-primary);
}
</style>
