// صفحة تفاصيل وعرض الأداة - تعمل كـ Master Shell / Layout عام لجميع الأدوات الحالية والمستقبلية

<template>
  <div class="tool-detail-page" dir="rtl">
    <StoreNavbar />

    <v-main class="bg-grey-lighten-5 min-vh-100 pb-16">
      <v-container style="max-width: 1000px;" class="py-8">
        <!-- Breadcrumb & Top Actions (ثابتة لجميع الأدوات) -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-6">
          <v-breadcrumbs
            :items="breadcrumbItems"
            density="compact"
            class="pa-0"
          >
            <template v-slot:divider>
              <v-icon icon="ri-arrow-left-s-line" size="16"></v-icon>
            </template>
          </v-breadcrumbs>

          <div class="d-flex align-center gap-2">
            <!-- زر المتجر الثابت والملفت للنظر في كل أداة -->
            <v-btn
              to="/store"
              color="error"
              variant="flat"
              prepend-icon="ri-shopping-bag-3-fill"
              rounded="pill"
              size="small"
              class="font-weight-black elevation-1 pulse-store-btn"
            >
              زيارة المتجر 🛍️
            </v-btn>
            <v-btn
              variant="tonal"
              color="primary"
              to="/tools"
              prepend-icon="ri-arrow-right-line"
              rounded="pill"
              size="small"
            >
              كل الأدوات
            </v-btn>
          </div>
        </div>

        <!-- Tool Content Area (ديناميكي يتم حقن الأداة فيه تلقائياً) -->
        <template v-if="currentTool">
          <!-- Render Dynamic Component Asynchronously -->
          <component :is="activeComponent" />

          <!-- Share & Actions (ثابتة لجميع الأدوات) -->
          <div class="d-flex align-center justify-space-between flex-wrap gap-4 mt-8 pt-4 border-t">
            <div class="text-caption text-grey">
              أعجبتك الأداة؟ يمكنك مشاركتها مع أصدقائك وزملائك مباشرة.
            </div>

            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                color="primary"
                rounded="pill"
                size="small"
                prepend-icon="ri-share-line"
                @click="copyPageUrl"
              >
                {{ copied ? 'تم نسخ الرابط!' : 'نسخ رابط الأداة' }}
              </v-btn>
            </div>
          </div>

          <!-- Eye-catching Store Conversion Card (كارت المتجر الثابت أسفل كل أداة) -->
          <v-card class="rounded-2xl border pa-6 my-8 text-white elevation-2 overflow-hidden position-relative" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
            <div class="d-flex flex-column flex-sm-row align-center justify-space-between gap-4">
              <div class="d-flex align-center gap-4 text-center text-sm-start">
                <v-avatar color="error" size="52" rounded="lg" class="elevation-2 flex-shrink-0">
                  <v-icon icon="ri-store-2-fill" color="white" size="28"></v-icon>
                </v-avatar>
                <div>
                  <h4 class="text-h6 font-weight-black mb-1">أعجبتك الأداة؟ تصفح متجر HWNix</h4>
                  <p class="text-body-2 text-grey-lighten-2 mb-0">عروض وتخفيضات خاصة وخدمات تقسيط مرنة متاحة الآن في متجرنا الإلكتروني.</p>
                </div>
              </div>
              <v-btn
                to="/store"
                color="amber-accent-3"
                variant="flat"
                size="large"
                rounded="pill"
                class="font-weight-black text-slate-900 px-6 flex-shrink-0 elevation-2"
                append-icon="ri-arrow-left-line"
              >
                تسوق الآن في المتجر 🛒
              </v-btn>
            </div>
          </v-card>

          <!-- Other Recommended Tools (أدوات مقترحة تلقائية) -->
          <div class="mt-12">
            <h3 class="text-h6 font-weight-bold mb-4">أدوات أخرى قد تهمك</h3>
            <v-row>
              <v-col
                v-for="other in otherTools"
                :key="other.id"
                cols="12"
                sm="6"
                md="4"
              >
                <ToolCard :tool="other" />
              </v-col>
            </v-row>
          </div>
        </template>

        <!-- Tool Not Found -->
        <v-card v-else class="rounded-xl border pa-12 text-center my-8 bg-white" elevation="0">
          <v-avatar color="warning-lighten-5" size="72" class="mb-4">
            <v-icon icon="ri-error-warning-line" size="36" color="warning"></v-icon>
          </v-avatar>
          <h2 class="text-h5 font-weight-bold mb-2">الأداة المطلوبة غير متوفرة</h2>
          <p class="text-body-2 text-grey mb-6">ربما تم تغيير مسار الأداة أو نقلها إلى مركز الأدوات الرئيسي.</p>
          <v-btn color="primary" variant="flat" to="/tools" rounded="pill">
            العودة لمركز الأدوات
          </v-btn>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { computed, ref, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import ToolCard from '@/modules/tools/components/ToolCard.vue'
import { TOOLS_REGISTRY } from '@/modules/tools/data/toolsRegistry'

const route = useRoute()
const copied = ref(false)

// تحميل ديناميكي آلي لجميع ملفات الأدوات داخل مجلد components
const toolComponents = import.meta.glob('@/modules/tools/components/*.vue')

const currentTool = computed(() => {
  const slug = route.params.toolSlug || route.path.replace('/tools/', '')
  return TOOLS_REGISTRY.find(t => t.id === slug || t.route === `/tools/${slug}`)
})

const activeComponent = computed(() => {
  if (!currentTool.value) return null
  const targetFile = `${currentTool.value.componentName}.vue`
  const matchedPath = Object.keys(toolComponents).find(path => path.endsWith(`/${targetFile}`))
  return matchedPath ? defineAsyncComponent(toolComponents[matchedPath]) : null
})

const otherTools = computed(() => {
  if (!currentTool.value) return []
  return TOOLS_REGISTRY.filter(t => t.id !== currentTool.value.id).slice(0, 3)
})

const breadcrumbItems = computed(() => {
  return [
    { title: 'الرئيسية', to: '/' },
    { title: 'مركز الأدوات', to: '/tools' },
    { title: currentTool.value?.title || 'أداة', disabled: true },
  ]
})

const copyPageUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch (e) {
    // Fallback if clipboard API not available
  }
}
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

@keyframes soft-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
  50% {
    transform: scale(1.04);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
  }
}

.pulse-store-btn {
  animation: soft-pulse 2.5s infinite ease-in-out;
}
</style>
