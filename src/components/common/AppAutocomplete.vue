<template>
  <v-autocomplete
    v-model="selectedValue"
    :items="mergedItems"
    :item-title="itemTitle"
    :item-value="itemValue"
    :label="label"
    :rules="computedRules"
    :disabled="disabled"
    :loading="loading || internalLoading"
    v-model:search="searchQuery"
    :clearable="clearable"
    :multiple="multiple"
    :chips="chips"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :append-icon="appendIcon"
    :hint="hint"
    :persistent-hint="persistentHint"
    :density="density"
    :variant="variant"
    :no-filter="!!apiEndpoint || noFilter"
    :hide-no-data="hideNoData"
    v-bind="$attrs"
    @update:model-value="handleChange"
  >
    <template v-if="$slots.noData || canCreate" #no-data>
      <v-list-item v-if="searchQuery && canCreate" @click="handleCreate">
        <template #prepend>
          <v-icon color="primary" icon="ri-add-line" />
        </template>
        <v-list-item-title>
          إضافة "<strong>{{ searchQuery }}</strong
          >"
        </v-list-item-title>
        <template #append>
          <v-progress-circular v-if="creating" indeterminate size="20" width="2" color="primary" />
        </template>
      </v-list-item>
      <slot v-else name="no-data" />
    </template>

    <template #item="{ props, item }">
      <slot v-if="$slots.item" name="item" v-bind="{ props, item }" />
      <v-list-item v-else v-bind="props" :title="undefined">
        <template #title>
          <div v-html="highlightText(item.title, searchQuery)"></div>
        </template>
      </v-list-item>
    </template>

    <template v-if="$slots.selection" #selection="slotProps">
      <slot name="selection" v-bind="slotProps" />
    </template>

    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>

    <template v-if="$slots['prepend-inner']" #prepend-inner>
      <slot name="prepend-inner" />
    </template>

    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>

    <template v-if="$slots['append-inner']" #append-inner>
      <slot name="append-inner" />
    </template>

    <template v-if="$slots['prepend-item']" #prepend-item>
      <slot name="prepend-item" />
    </template>

    <template v-if="$slots['append-item']" #append-item>
      <slot name="append-item" />
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import apiClient from '@/api/axios.config';
import { debounce, highlightText } from '@/utils/helpers';

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object],
    default: null,
  },
  items: {
    type: Array,
    default: () => [],
  },
  apiEndpoint: {
    type: String,
    default: null,
  },
  canCreate: {
    type: Boolean,
    default: false,
  },
  createField: {
    type: String,
    default: 'name',
  },
  itemTitle: {
    type: String,
    default: 'name',
  },
  itemValue: {
    type: String,
    default: 'id',
  },
  label: {
    type: String,
    default: '',
  },
  rules: {
    type: Array,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  chips: {
    type: Boolean,
    default: false,
  },
  prependIcon: {
    type: String,
    default: '',
  },
  prependInnerIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  persistentHint: {
    type: Boolean,
    default: false,
  },
  density: {
    type: String,
    default: 'default',
  },
  variant: {
    type: String,
    default: 'outlined',
  },
  minChars: {
    type: Number,
    default: 3,
  },
  highlight: {
    type: Boolean,
    default: true,
  },
  noFilter: {
    type: Boolean,
    default: false,
  },
  hideNoData: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:search', 'created']);

const selectedValue = ref(props.modelValue);
const searchQuery = ref('');
const internalLoading = ref(false);
const creating = ref(false);
const fetchedItems = ref([]);

const mergedItems = computed(() => {
  if (!props.apiEndpoint) return props.items;

  const all = [...(props.items || []), ...(Array.isArray(fetchedItems.value) ? fetchedItems.value : [])];
  const unique = [];
  const map = new Map();
  for (const item of all) {
    if (!map.has(item[props.itemValue])) {
      map.set(item[props.itemValue], true);
      unique.push(item);
    }
  }
  return unique;
});

const computedRules = computed(() => {
  const rules = [...props.rules];

  if (props.required && !rules.some(rule => rule.toString().includes('required'))) {
    rules.unshift(v => {
      if (props.multiple) {
        return (v && v.length > 0) || 'هذا الحقل مطلوب';
      }
      return !!v || 'هذا الحقل مطلوب';
    });
  }

  return rules;
});

const fetchItems = debounce(async query => {
  if (!props.apiEndpoint) return;

  internalLoading.value = true;
  try {
    const response = await apiClient.get(props.apiEndpoint, {
      params: { search: query, per_page: 50 },
    });
    const resData = response.data?.data || response.data || [];
    fetchedItems.value = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
  } catch (error) {
    console.error(`Error fetching from ${props.apiEndpoint}:`, error);
  } finally {
    internalLoading.value = false;
  }
}, 500);

const handleCreate = async () => {
  if (!searchQuery.value || creating.value || !props.apiEndpoint) return;

  creating.value = true;
  try {
    // Extract base endpoint if there's a query param (e.g. for attribute values)
    const baseEndpoint = props.apiEndpoint.split('?')[0];
    const payload = { [props.createField]: searchQuery.value };

    // If it's something like attribute-values?attribute_id=X, we need that ID too
    if (props.apiEndpoint.includes('attribute_id=')) {
      const match = props.apiEndpoint.match(/attribute_id=(\d+)/);
      if (match) payload.attribute_id = match[1];
    }

    const response = await apiClient.post(baseEndpoint, payload);
    const newItem = response.data?.data || response.data;

    if (!newItem) throw new Error('Failed to retrieve new item data');

    const valueToSelect = newItem[props.itemValue];

    // Clear search first to stop filtering
    // searchQuery.value = '';

    // Add to items
    fetchedItems.value.unshift(newItem);

    // Wait for DOM and mergedItems to update
    await nextTick();

    // Set selection
    if (props.multiple) {
      const current = Array.isArray(selectedValue.value) ? selectedValue.value : [];
      selectedValue.value = [...current, valueToSelect];
    } else {
      selectedValue.value = valueToSelect;
    }

    handleChange(selectedValue.value);
    emit('created', newItem);
  } catch (error) {
    console.error('Error creating new item:', error);
    // Error is already handled by axios interceptor toast
  } finally {
    creating.value = false;
  }
};

const handleChange = value => {
  emit('update:modelValue', value);
};

watch(searchQuery, val => {
  if (props.apiEndpoint) {
    // Only search if 3+ characters or empty (to reset/initial)
    if (val && val.length > 0 && val.length < props.minChars) return;
    fetchItems(val);
  }
  emit('update:search', val);
});

watch(
  () => props.apiEndpoint,
  newVal => {
    if (newVal) {
      fetchItems(searchQuery.value);
    } else {
      fetchedItems.value = [];
    }
  }
);

watch(
  () => props.modelValue,
  newVal => {
    selectedValue.value = newVal;
  }
);

onMounted(() => {
  if (props.apiEndpoint) {
    fetchItems('');
  }
});
</script>
