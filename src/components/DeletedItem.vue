<template>
  <div class="text-center">
    <v-dialog @contextmenu.prevent v-model="appState.dialogDelete" max-width="400" persistent>
      <v-card style="color: #ff4d4f; border-color: #ff4d4f" append-icon="ri-delete-bin-line" title="هل تريد بالفعل حذف">
        <v-list class="pa-0">
          <v-list-item v-for="(item, i) in dataDelete.items" :key="i" :title="i + 1 + ' . ' + item[dataDelete.key]"> </v-list-item>
        </v-list>
        <template v-slot:actions>
          <v-btn prepend-icon="ri-delete-bin-line" class="mx-10" @click="deleted()" style="color: #ff4d4f; border-color: #ff4d4f"> حذف </v-btn>
          <v-spacer></v-spacer>
          <v-btn prepend-icon="ri-close-line" class="mx-10" @click="appState.dialogDelete = false" style="color: #007bff; border-color: #007bff">
            لا
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { deleteAll } from '@/services/api';
import { useappState } from '@/stores/appState';
import { defineEmits, defineProps } from 'vue';
const appState = useappState();
const props = defineProps({
  dataDelete: {
    type: Object,
    required: true,
  },
  api: {
    required: true,
  },
});

const emit = defineEmits(['update-items']);
function deleted() {
  const itemIds = props.dataDelete.items.map(item => item.id);

  deleteAll(props.api, { item_ids: itemIds }).then(() => {
    emit('update-items', itemIds);
  });
  appState.dialogDelete = false;
}
</script>

<style scoped lang="scss">
.v-list {
  border: 1px #c6b5d3 solid;
  border-radius: 4px;
  user-select: none;
  .v-list-item {
    border-bottom: 1px #c6b5d3 solid;
    &:hover {
      background-color: #d6c1e0;
    }
  }
}
</style>
