<template>
  <div class="tools-hub-page" dir="rtl">
    <StoreNavbar />

    <v-main class="bg-slate-50 min-vh-100 pb-16">
      <!-- Clean Minimal Header -->
      <section class="tools-header py-8 bg-white border-b">
        <v-container style="max-width: 1000px;">
          <div class="text-center">
            <h1 class="text-h4 font-weight-bold text-slate-800 mb-2">
              مركز الأدوات
            </h1>

            <!-- إخفاء مؤقت لحقل البحث (يمكن تفعيله لاحقاً عند زيادة عدد الأدوات)
            <div class="mx-auto mt-4" style="max-width: 550px;">
              <v-text-field
                v-model="searchQuery"
                placeholder="ابحث عن أداة..."
                variant="outlined"
                density="comfortable"
                rounded="pill"
                bg-color="grey-lighten-4"
                prepend-inner-icon="ri-search-line"
                clearable
                hide-details
                class="elevation-0 border"
              ></v-text-field>
            </div>
            -->
          </div>
        </v-container>
      </section>

      <!-- Tools Grid (Clean & Centered) -->
      <section class="py-10">
        <v-container style="max-width: 1000px;">
          <v-row justify="center">
            <v-col
              v-for="tool in filteredTools"
              :key="tool.id"
              cols="12"
              sm="8"
              md="6"
              lg="5"
            >
              <ToolCard :tool="tool" />
            </v-col>
          </v-row>

          <!-- Empty State (Fallback) -->
          <v-card v-if="filteredTools.length === 0" class="rounded-xl border pa-12 text-center my-8 bg-white" elevation="0">
            <v-avatar color="grey-lighten-4" size="64" class="mb-4">
              <v-icon icon="ri-tools-line" size="32" color="grey"></v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">لا توجد أدوات متاحة حالياً</h3>
            <p class="text-caption text-grey">سيتم إضافة أدوات جديدة قريباً</p>
          </v-card>
        </v-container>
      </section>

      <!-- Clean Minimal Trust Badges -->
      <section class="py-8 mt-6">
        <v-container style="max-width: 900px;">
          <v-row justify="center">
            <v-col cols="12" sm="4" class="text-center">
              <div class="d-flex align-center justify-center gap-2 mb-1">
                <v-icon icon="ri-shield-check-line" color="primary" size="20"></v-icon>
                <span class="text-body-2 font-weight-bold text-slate-700">خصوصية وأمان 100%</span>
              </div>
              <p class="text-caption text-grey">تتم الحسابات محلياً بدون تسجيل بيانات</p>
            </v-col>

            <v-col cols="12" sm="4" class="text-center">
              <div class="d-flex align-center justify-center gap-2 mb-1">
                <v-icon icon="ri-flashlight-line" color="amber-darken-2" size="20"></v-icon>
                <span class="text-body-2 font-weight-bold text-slate-700">استخدام فوري مجاني</span>
              </div>
              <p class="text-caption text-grey">بدون اشتراك أو تسجيل دخول</p>
            </v-col>

            <v-col cols="12" sm="4" class="text-center">
              <div class="d-flex align-center justify-center gap-2 mb-1">
                <v-icon icon="ri-sparkling-line" color="success" size="20"></v-icon>
                <span class="text-body-2 font-weight-bold text-slate-700">تطبيقات ويب ذكية</span>
              </div>
              <p class="text-caption text-grey">مصممة ومبسطة للجميع</p>
            </v-col>
          </v-row>
        </v-container>
      </section>
    </v-main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import ToolCard from '@/modules/tools/components/ToolCard.vue'
import { TOOLS_REGISTRY } from '@/modules/tools/data/toolsRegistry'

const searchQuery = ref('')

const filteredTools = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return TOOLS_REGISTRY

  return TOOLS_REGISTRY.filter(tool => {
    const inTitle = tool.title.toLowerCase().includes(q)
    const inDesc = tool.description.toLowerCase().includes(q)
    const inTags = tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(q))
    return inTitle || inDesc || inTags
  })
})
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.bg-slate-50 {
  background-color: #f8fafc !important;
}

.text-slate-800 {
  color: #1e293b !important;
}

.text-slate-700 {
  color: #334155 !important;
}
</style>
