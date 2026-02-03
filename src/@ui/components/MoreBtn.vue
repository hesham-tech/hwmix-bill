<script setup>
const props = defineProps({
  menuList: {
    type: Array,
    required: false,
  },
  itemProps: {
    type: Boolean,
    required: false,
  },
  iconSize: {
    type: String,
    required: false,
  },
});
</script>

<template>
  <VMenu v-if="props.menuList">
    <template #activator="{ props: menuProps }">
      <IconBtn v-bind="menuProps">
        <VIcon :size="iconSize" icon="ri-more-2-line" />
      </IconBtn>
    </template>
    <VList :items="props.menuList" :item-props="props.itemProps" />
  </VMenu>
  <IconBtn v-else>
    <VIcon :size="iconSize" icon="ri-more-2-line" />
  </IconBtn>
</template>
