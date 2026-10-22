<template>
  <div class="tools-hub-page" dir="rtl">
    <StoreNavbar />

    <!-- Announcement Bar for the Store -->
    <div class="store-top-announcement py-2 px-4 border-b text-white" style="background: linear-gradient(90deg, #1e1b4b, #312e81, #4338ca);">
      <v-container class="py-1 d-flex align-center justify-space-between flex-wrap gap-2" style="max-width: 1200px;">
        <div class="d-flex align-center gap-2">
          <span class="text-body-1">🛍️</span>
          <span class="text-body-2 font-weight-bold">
            تسوق أحدث المنتجات والعروض الحصرية في متجر HWNix — مع خيارات تقسيط ميسرة!
          </span>
        </div>
        <v-btn
          to="/store"
          color="amber-accent-3"
          variant="flat"
          size="small"
          rounded="pill"
          class="font-weight-black text-slate-900 px-4 elevation-1"
          append-icon="ri-arrow-left-line"
        >
          زيارة المتجر الآن
        </v-btn>
      </v-container>
    </div>

    <v-main class="bg-grey-lighten-5 min-vh-100 pb-16">
      <!-- Hero Section -->
      <section class="tools-hero py-12 py-md-16 bg-white border-b">
        <v-container style="max-width: 1100px;">
          <div class="text-center">
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="font-weight-bold mb-4 px-4"
              prepend-icon="ri-sparkling-fill"
            >
              أدوات وتطبيقات مجانية 100%
            </v-chip>

            <h1 class="text-h3 font-weight-black text-slate-900 mb-4 line-height-tight">
              مركز الأدوات وتطبيقات الويب
            </h1>

            <p class="text-body-1 text-grey-darken-1 mb-6 mx-auto leading-relaxed" style="max-width: 650px;">
              حاسبات مالية ذكية، تطبيقات تعليمية تفاعلية، محولات فورية، وأدوات مصممة لمساعدتك بسرعة وبدون الحاجة لإنشاء حساب أو تسجيل دخول.
            </p>

            <!-- Search Field -->
            <div class="mx-auto" style="max-width: 600px;">
              <v-text-field
                v-model="searchQuery"
                placeholder="ابحث عن أداة أو حاسبة (مثل: ساعة أطفال، زكاة، ضريبة، عملات...)"
                variant="outlined"
                density="comfortable"
                rounded="pill"
                bg-color="grey-lighten-4"
                prepend-inner-icon="ri-search-line"
                clearable
                hide-details
                class="elevation-1 border-0"
              ></v-text-field>
            </div>

            <!-- Hero Store Promo Card -->
            <v-card
              to="/store"
              class="rounded-2xl border pa-4 mt-6 mx-auto hover-lift cursor-pointer text-decoration-none"
              style="max-width: 650px; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-color: #fed7aa !important;"
              elevation="0"
            >
              <div class="d-flex align-center justify-space-between flex-wrap gap-4">
                <div class="d-flex align-center gap-3 text-start">
                  <v-avatar color="warning" size="46" rounded="lg" class="elevation-2">
                    <v-icon icon="ri-shopping-cart-2-fill" color="white" size="24"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="d-flex align-center gap-2">
                      <h4 class="text-subtitle-1 font-weight-black text-slate-900 mb-0">متجر HWNix الإلكتروني</h4>
                      <v-chip color="error" size="x-small" variant="flat" class="font-weight-bold">عروض حصرية</v-chip>
                    </div>
                    <p class="text-caption text-grey-darken-2 mb-0">اكتشف تشكيلاتنا الواسعة مع ضمان وجودة عالية وتقسيط مالي مريح</p>
                  </div>
                </div>
                <v-btn
                  to="/store"
                  color="warning-darken-1"
                  variant="flat"
                  rounded="pill"
                  size="small"
                  class="font-weight-black text-white px-5 flex-shrink-0"
                  append-icon="ri-arrow-left-line"
                >
                  تصفح المتجر 🛒
                </v-btn>
              </div>
            </v-card>
          </div>
        </v-container>
      </section>

      <!-- Category Filter Tabs -->
      <section class="py-6 border-b bg-white">
        <v-container style="max-width: 1200px;">
          <div class="d-flex align-center justify-center flex-wrap gap-2">
            <v-chip
              v-for="cat in TOOL_CATEGORIES"
              :key="cat.id"
              :color="selectedCategory === cat.id ? 'primary' : 'default'"
              :variant="selectedCategory === cat.id ? 'flat' : 'outlined'"
              filter
              size="large"
              class="font-weight-bold px-4 cursor-pointer"
              @click="selectedCategory = cat.id"
            >
              <v-icon :icon="cat.icon" class="me-2" size="18"></v-icon>
              {{ cat.title }}
            </v-chip>
          </div>
        </v-container>
      </section>

      <!-- Tools Grid -->
      <section class="py-10">
        <v-container style="max-width: 1200px;">
          <!-- Counts & Stats Header -->
          <div class="d-flex align-center justify-space-between mb-6">
            <div class="text-body-2 font-weight-bold text-slate-700">
              المتاح حالياً: <span class="text-primary">{{ filteredTools.length }}</span> أداة وتطبيق
            </div>
          </div>

          <!-- Grid -->
          <v-row v-if="filteredTools.length > 0">
            <v-col
              v-for="tool in filteredTools"
              :key="tool.id"
              cols="12"
              sm="6"
              md="4"
            >
              <ToolCard :tool="tool" />
            </v-col>
          </v-row>

          <!-- Empty State -->
          <v-card v-else class="rounded-xl border pa-12 text-center my-8 bg-white" elevation="0">
            <v-avatar color="grey-lighten-4" size="72" class="mb-4">
              <v-icon icon="ri-search-eye-line" size="36" color="grey"></v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">لم نعثر على نتائج مطابقة لـ "{{ searchQuery }}"</h3>
            <p class="text-caption text-grey mb-4">جرب البحث بكلمات أخرى أو تصفح جميع التصنيفات</p>
            <v-btn color="primary" variant="tonal" rounded="pill" @click="resetFilters">
              إعادة تعيين الفلاتر
            </v-btn>
          </v-card>
        </v-container>
      </section>

      <!-- Store Spotlight Section -->
      <section class="py-12 bg-white border-y">
        <v-container style="max-width: 1100px;">
          <v-card class="rounded-2xl border-0 pa-8 pa-md-10 text-white elevation-3 overflow-hidden position-relative" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);">
            <v-row align="center">
              <v-col cols="12" md="8">
                <v-chip color="amber-accent-3" variant="flat" size="small" class="font-weight-black mb-3 text-slate-900">
                  🛒 تسوق الآن مع HWNix
                </v-chip>
                <h2 class="text-h4 font-weight-black mb-3">هل تبحث عن أفضل الأجهزة والمنتجات؟</h2>
                <p class="text-body-1 text-grey-lighten-2 mb-4 leading-relaxed">
                  تفضل بزيارة متجرنا واكتشف آلاف المنتجات بأسعار منافسة مع خيارات دفع متعددة وتقسيط مباشر ومريح بدون فوائد معقدة.
                </p>
                <div class="d-flex align-center gap-6 flex-wrap">
                  <div class="d-flex align-center gap-2">
                    <v-icon icon="ri-truck-line" color="amber-accent-3"></v-icon>
                    <span class="text-caption text-grey-lighten-1">توصيل سريع لباب منزلك</span>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-icon icon="ri-shield-check-line" color="amber-accent-3"></v-icon>
                    <span class="text-caption text-grey-lighten-1">ضمان استرجاع وجودة</span>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-icon icon="ri-bank-card-line" color="amber-accent-3"></v-icon>
                    <span class="text-caption text-grey-lighten-1">تقسيط مالي ميسر</span>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-center text-md-end">
                <v-btn
                  to="/store"
                  color="amber-accent-3"
                  size="x-large"
                  rounded="pill"
                  class="font-weight-black text-slate-900 px-8 elevation-3"
                  append-icon="ri-shopping-cart-2-fill"
                >
                  الانتقال إلى المتجر
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-container>
      </section>

      <!-- Trust Badges Section -->
      <section class="py-12 bg-grey-lighten-5">
        <v-container style="max-width: 1100px;">
          <v-row>
            <v-col cols="12" sm="4" class="text-center">
              <v-avatar color="primary-lighten-5" size="56" class="mb-3">
                <v-icon icon="ri-shield-check-line" color="primary" size="28"></v-icon>
              </v-avatar>
              <h4 class="text-subtitle-1 font-weight-bold mb-1">خصوصية وأمان 100%</h4>
              <p class="text-caption text-grey">جميع الحسابات والبيانات تتم محلياً في متصفحك ولا يتم حفظ أي أرقام في خوادمنا.</p>
            </v-col>

            <v-col cols="12" sm="4" class="text-center">
              <v-avatar color="success-lighten-5" size="56" class="mb-3">
                <v-icon icon="ri-speed-line" color="success" size="28"></v-icon>
              </v-avatar>
              <h4 class="text-subtitle-1 font-weight-bold mb-1">سرعة وسهولة فورية</h4>
              <p class="text-caption text-grey">لا حاجة لإنشاء حساب أو إدخال بطاقات، افتح الأداة واستخدمها مباشرة.</p>
            </v-col>

            <v-col cols="12" sm="4" class="text-center">
              <v-avatar color="warning-lighten-5" size="56" class="mb-3">
                <v-icon icon="ri-loop-right-line" color="warning-darken-2" size="28"></v-icon>
              </v-avatar>
              <h4 class="text-subtitle-1 font-weight-bold mb-1">تحديثات دورية</h4>
              <p class="text-caption text-grey">نضيف أدوات جديدة باستمرار لتغطية كافة احتياجاتك المالية والتعليمية.</p>
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
import { TOOLS_REGISTRY, TOOL_CATEGORIES } from '@/modules/tools/data/toolsRegistry'

const searchQuery = ref('')
const selectedCategory = ref('all')

const filteredTools = computed(() => {
  return TOOLS_REGISTRY.filter(tool => {
    const matchesCategory = selectedCategory.value === 'all' || tool.category === selectedCategory.value

    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return matchesCategory

    const inTitle = tool.title.toLowerCase().includes(q)
    const inDesc = tool.description.toLowerCase().includes(q)
    const inTags = tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(q))

    return matchesCategory && (inTitle || inDesc || inTags)
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
}
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.line-height-tight {
  line-height: 1.25;
}

.leading-relaxed {
  line-height: 1.6;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -5px rgba(249, 115, 22, 0.2) !important;
}
</style>
