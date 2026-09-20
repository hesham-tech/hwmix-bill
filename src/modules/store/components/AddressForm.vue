<template>
  <v-form ref="form" @submit.prevent="submit" v-model="isValid">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.first_name"
          label="الاسم الأول"
          :rules="[v => !!v || 'مطلوب']"
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.last_name"
          label="اسم العائلة"
          :rules="[v => !!v || 'مطلوب']"
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.phone"
          label="رقم الهاتف"
          :rules="[v => !!v || 'مطلوب']"
          variant="outlined"
          density="comfortable"
          dir="ltr"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="address.city"
          label="المدينة"
          :rules="[v => !!v || 'مطلوب']"
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="address.address_line_1"
          label="العنوان التفصيلي (الشارع، الحي، المبنى)"
          :rules="[v => !!v || 'مطلوب']"
          variant="outlined"
          density="comfortable"
          rows="2"
        ></v-textarea>
      </v-col>
      <v-col cols="12" class="pt-0">
        <v-checkbox
          v-model="address.is_default"
          label="تعيين كعنوان افتراضي"
          color="primary"
          density="comfortable"
          hide-details
        ></v-checkbox>
      </v-col>
    </v-row>

    <div class="d-flex justify-end gap-2 mt-4">
      <v-btn variant="text" @click="$emit('cancel')">إلغاء</v-btn>
      <v-btn
        color="primary"
        type="submit"
        :loading="loading"
        :disabled="!isValid"
      >
        حفظ العنوان
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref(null)
const isValid = ref(false)

const address = ref({
  first_name: '',
  last_name: '',
  phone: '',
  city: '',
  address_line_1: '',
  is_default: false
})

watch(() => props.initialData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    address.value = { ...address.value, ...newVal }
  }
}, { immediate: true })

const submit = async () => {
  const { valid } = await form.value.validate()
  if (valid) {
    emit('submit', address.value)
  }
}
</script>
