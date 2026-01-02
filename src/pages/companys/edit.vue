<script setup>
import { getOne, saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { toast } from 'vue3-toastify';
import ImagePickerDialog from '@/components/images/ImagePickerDialog.vue';

const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userId = ref(route.params.id);
const userStore = useUserStore();

// حالة الصورة المختارة
const selectedImage = ref(null);
const selectedImageIds = ref([]);
const imagePreview = ref(null);

const showImageDialog = ref(false);

const company = ref({});

onMounted(() => {
  if (route.params.id) {
    loading.value = true;
    getOne('company', userId.value)
      .then(res => {
        company.value = res.data;
        // قم بتعيين صورة المعاينة إلى الشعار الموجود في البيانات
        if (res.data.logo) {
          imagePreview.value = res.data.logo;
        }
      })
      .finally(e => {
        loading.value = false;
      });
  }
});

// هذا هو الحدث المعدل
const onImagesSelected = image => {
  // `image` هو الآن كائن الصورة بالكامل وليس المعرف فقط
  if (image) {
    selectedImage.value = image;
    selectedImageIds.value = image.id;
    imagePreview.value = image.url; // نستخدم رابط الصورة الجديدة للمعاين
  } else {
    // في حالة عدم اختيار أي صورة
    selectedImage.value = null;
    selectedImageIds.value = null;
    // يمكنك هنا إبقاء الشعار القديم أو مسحه
    // imagePreview.value = null;
  }
};

function sendData() {
  const payload = { ...company.value };

  // إذا تم اختيار صورة جديدة، قم بإرسال معرفها
  if (selectedImageIds.value) {
    payload.images_ids = [selectedImageIds.value];
  }

  // حذف خاصية `logo` من الـ payload لتجنب الإرسال
  delete payload.logo;

  saveItem('company', payload, route.params.id)
    .then(res => {
      userStore.fetchUser();
      toast.success('تم حفظ الشركة بنجاح');
      router.go(-1);
    })
    .catch(error => {
      console.error('Error saving company:', error);
      toast.error('حدث خطأ أثناء حفظ الشركة');
    });
}

function saveCompany() {
  if (!company.value.name) {
    toast.error('اسم الشركة مطلوب');
    return;
  }
  sendData(); // استدعاء دالة الإرسال الرئيسية
}

function deleteCompany(id) {
  deleteOne('company', id)
    .then(() => {
      toast.success('تم حذف الشركة بنجاح');
    })
    .catch(() => toast.error('حدث خطأ أثناء حذف الشركة'));
}
</script>

<template>
  <v-card>
    <VRow>
      <VCol cols="12">
        <VCard elevation="0" :loading="loading" :title="route.params.id ? 'تعديل الشركة' : 'اضافة شركة'" class="ma-4">
          <VDivider />
          <VCardText>
            <VForm class="mt-6">
              <VRow>
                <VCol sm="6" md="4" cols="12">
                  <VTextField v-model="company.name" label=" اسم الشركة " />
                </VCol>

                <VCol sm="6" md="4" cols="12">
                  <VTextField v-model="company.field" label=" التخصص  " />
                </VCol>

                <VCol cols="12" sm="6" md="4">
                  <VTextField required v-model="company.email" label="الايميل" placeholder="johndoe@gmail.com" type="email" />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VTextField v-model="company.phone" label=" رقم الهاتف " placeholder="0123456789" />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VTextField v-model="company.description" label=" وصف  " placeholder="نبذه عن الشركة ومجالها" />
                </VCol>
                <VCol cols="12" sm="6" md="4">
                  <VTextField v-model="company.address" label=" العنوان  " placeholder="عنوان الشركة" />
                </VCol>

                <VCol cols="12" sm="6" md="4">
                  <div v-if="imagePreview">
                    <v-img :src="imagePreview" class="mb-2" aspect-ratio="1" cover></v-img>
                  </div>
                  <v-col cols="12">
                    <ImagePickerDialog v-model="showImageDialog" @close="onImagesSelected" button-text="تغيير الشعار" />
                  </v-col>
                </VCol>

                <VCol cols="12" class="d-flex flex-wrap gap-4">
                  <VBtn @click="sendData"> حفظ </VBtn>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </v-card>
</template>

<style scoped>
.image-preview {
  max-width: 100%;
  max-height: 300px;
  margin-top: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
