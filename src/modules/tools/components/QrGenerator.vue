<template>
  <div class="qr-generator">
    <v-card class="rounded-xl border pa-6 mb-6" elevation="0">
      <div class="d-flex align-center gap-3 mb-6">
        <v-avatar color="amber-lighten-5" rounded="lg" size="48">
          <v-icon icon="ri-qr-code-line" color="amber-darken-2" size="26" />
        </v-avatar>
        <div>
          <h2 class="text-h6 font-weight-bold">مولد ومصمم رموز QR الذكية</h2>
          <p class="text-caption text-grey">أنشئ رموز QR مخصصة للروابط والنصوص والواتساب مع إمكانية التنزيل الفوري</p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <v-row>
        <v-col cols="12" md="7">
          <v-textarea
            v-model="qrText"
            label="النص أو الرابط (URL)"
            variant="outlined"
            density="comfortable"
            rows="4"
            placeholder="أدخل الرابط أو النص هنا..."
            counter
          ></v-textarea>

          <div class="d-flex align-center gap-4 mt-2">
            <div class="flex-1">
              <div class="text-caption text-grey mb-1">حجم الرمز: {{ qrSize }}px</div>
              <v-slider
                v-model="qrSize"
                :min="120"
                :max="320"
                :step="10"
                color="primary"
                hide-details
              ></v-slider>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="5" class="d-flex flex-column align-center justify-center">
          <v-card color="grey-lighten-5" class="rounded-xl pa-6 border d-flex flex-column align-center justify-center w-100" elevation="0">
            <div ref="qrContainer" class="bg-white pa-4 rounded-lg elevation-1 mb-4">
              <qrcode-vue
                :value="qrText || 'https://hwnix.com'"
                :size="qrSize"
                level="H"
                render-as="canvas"
              />
            </div>

            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="ri-download-2-line"
              rounded="pill"
              class="font-weight-bold"
              @click="downloadQr"
            >
              تنزيل صورة الرمز (PNG)
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'

const qrText = ref('https://hwnix.com')
const qrSize = ref(180)
const qrContainer = ref(null)

const downloadQr = () => {
  if (!qrContainer.value) return
  const canvas = qrContainer.value.querySelector('canvas')
  if (!canvas) return

  const image = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = 'hwnix-qrcode.png'
  link.href = image
  link.click()
}
</script>
