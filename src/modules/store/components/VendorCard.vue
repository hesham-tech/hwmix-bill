<template>
  <v-card class="vendor-card text-center pa-4 h-100" elevation="2" rounded="lg" hover @click="goToVendor">
    <v-avatar size="80" class="mb-3 mx-auto elevation-1 border">
      <v-img :src="vendor.logo || defaultLogo" alt="Vendor Logo"></v-img>
    </v-avatar>
    <h3 class="text-h6 font-weight-bold mb-1">{{ vendor.name }}</h3>
    <p class="text-caption text-grey text-truncate mb-3">{{ vendor.description || 'لا يوجد وصف متاح' }}</p>
    <v-btn color="primary" variant="outlined" rounded="pill" size="small">
      عرض المنتجات
    </v-btn>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  vendor: {
    type: Object,
    required: true
  }
})

const defaultLogo = 'https://placehold.co/150x150?text=Logo'
const router = useRouter()

const goToVendor = () => {
  if (props.vendor.id) {
    router.push(`/store/vendor/${props.vendor.id}`)
  }
}
</script>

<style scoped>
.vendor-card {
  transition: transform 0.2s;
}
.vendor-card:hover {
  transform: translateY(-4px);
}
</style>
