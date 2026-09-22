<template>
  <div class="order-confirmation-page" dir="rtl">
    <StoreNavbar />

    <v-main style="background: #f8fafc; min-height: 100vh;">
      <div class="d-flex align-center justify-center" style="min-height: calc(100vh - 72px);">
        <v-container style="max-width: 640px;" class="py-12">

          <!-- Success Animation -->
          <div class="text-center mb-8">
            <div class="success-lottie mb-6">
              <div class="success-circle">
                <div class="success-ripple ripple-1"></div>
                <div class="success-ripple ripple-2"></div>
                <div class="success-icon">
                  <v-icon icon="ri-check-line" size="48" color="white"></v-icon>
                </div>
              </div>
            </div>

            <h1 class="confirmation-title mb-2">تم تأكيد طلبك بنجاح! 🎉</h1>
            <p class="confirmation-sub text-grey-darken-1">شكراً لتسوقك معنا. لقد استلمنا طلبك وسنبدأ التجهيز قريباً</p>
          </div>

          <!-- Order Info Card -->
          <v-card class="order-info-card mb-6" elevation="0">
            <v-card-text class="pa-6">
              <div class="order-number-row d-flex align-center justify-center mb-6">
                <div class="text-center">
                  <div class="text-caption text-grey mb-1">رقم الطلب</div>
                  <div class="order-number-badge">#{{ orderId }}</div>
                </div>
              </div>

              <!-- Timeline / Steps -->
              <div class="order-timeline">
                <div
                  v-for="(step, i) in orderSteps"
                  :key="i"
                  class="timeline-step d-flex align-start gap-3"
                  :class="{ 'step-done': i === 0, 'step-pending': i > 0 }"
                >
                  <div class="timeline-icon flex-shrink-0">
                    <v-icon :icon="step.icon" size="20" :color="i === 0 ? 'white' : 'grey'"></v-icon>
                  </div>
                  <div class="flex-grow-1 pb-4">
                    <div class="text-body-2 font-weight-bold" :class="i === 0 ? 'text-success' : 'text-grey'">
                      {{ step.title }}
                    </div>
                    <div class="text-caption text-grey">{{ step.desc }}</div>
                  </div>
                  <div v-if="i === 0" class="timeline-badge">
                    <v-chip color="success" variant="flat" size="x-small">✓ مكتمل</v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Info Box -->
          <v-alert type="info" variant="tonal" rounded="xl" class="mb-6">
            <template v-slot:text>
              يمكنك متابعة حالة طلبك من صفحة <strong>"طلباتي"</strong> في أي وقت. سنرسل لك إشعاراً عند تحديث حالة الطلب.
            </template>
          </v-alert>

          <!-- Actions -->
          <div class="d-flex flex-column gap-3">
            <v-btn
              color="primary"
              block
              height="52"
              class="rounded-xl font-weight-bold"
              to="/store/orders"
              prepend-icon="ri-file-list-3-line"
              elevation="2"
            >
              تتبع طلبي
            </v-btn>
            <v-btn
              variant="outlined"
              block
              height="48"
              class="rounded-xl font-weight-medium"
              to="/store"
              prepend-icon="ri-store-2-line"
              color="primary"
            >
              العودة للمتجر
            </v-btn>
          </div>

        </v-container>
      </div>
    </v-main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'

const route = useRoute()
const orderId = route.params.id || '---'

const orderSteps = [
  {
    icon: 'ri-check-double-line',
    title: 'تم استلام الطلب',
    desc: 'لقد استلمنا طلبك وهو الآن قيد المراجعة'
  },
  {
    icon: 'ri-box-3-line',
    title: 'تجهيز الطلب',
    desc: 'يقوم البائع بتجهيز وتغليف منتجاتك'
  },
  {
    icon: 'ri-truck-line',
    title: 'في الطريق إليك',
    desc: 'طلبك في يد الشاحن ومتجه نحوك'
  },
  {
    icon: 'ri-home-smile-line',
    title: 'تم التسليم',
    desc: 'وصل طلبك بأمان إلى عنوانك'
  },
]
</script>

<style scoped>
.order-confirmation-page { direction: rtl; }

/* Success Animation */
.success-lottie {
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.success-ripple {
  position: absolute;
  border-radius: 50%;
  animation: ripple 2s ease-out infinite;
}

.ripple-1 {
  inset: -10px;
  background: rgba(16, 185, 129, 0.15);
  animation-delay: 0s;
}

.ripple-2 {
  inset: -20px;
  background: rgba(16, 185, 129, 0.08);
  animation-delay: 0.5s;
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

.success-icon {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
  animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.confirmation-title {
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 900;
  color: #0f172a;
}

.confirmation-sub {
  font-size: 15px;
  line-height: 1.6;
  max-width: 480px;
  margin: 0 auto;
}

/* Order Card */
.order-info-card {
  background: white;
  border-radius: 24px !important;
  border: 1px solid #f1f5f9;
}

.order-number-badge {
  font-size: 28px;
  font-weight: 900;
  color: #1a73e8;
  letter-spacing: 1px;
}

/* Timeline */
.order-timeline {
  position: relative;
}

.timeline-step {
  position: relative;
}

.timeline-step:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 19px;
  top: 36px;
  width: 2px;
  height: calc(100% - 36px);
  background: #e2e8f0;
}

.timeline-step.step-done:not(:last-child)::after {
  background: #10b981;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  position: relative;
  z-index: 1;
}

.step-done .timeline-icon {
  background: #10b981;
}

.step-pending .timeline-icon {
  background: #f1f5f9;
}
</style>
