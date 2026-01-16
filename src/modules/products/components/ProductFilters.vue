<template>
  <v-row>
    <v-col cols="12" md="3">
      <AppAutocomplete v-model="filters.category_id" label="التصنيف" api-endpoint="categories" item-title="name" item-value="id" clearable />
    </v-col>
    <v-col cols="12" md="3">
      <AppAutocomplete v-model="filters.brand_id" label="العلامة التجارية" api-endpoint="brands" item-title="name" item-value="id" clearable />
    </v-col>
    <v-col cols="12" md="3">
      <AppSwitch v-model="filters.active" label="نشط فقط" inset />
    </v-col>
    <v-col cols="12" md="3">
      <AppSwitch v-model="filters.featured" label="المميزة" inset />
    </v-col>
  </v-row>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useProductStore } from '../store/product.store';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';

const productStore = useProductStore();
const { filters } = storeToRefs(productStore);
</script>
