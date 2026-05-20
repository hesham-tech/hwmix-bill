<!-- تعليق عربي: مكون التنبيه المنبثق لعرض التحديثات والميزات الجديدة وتوضيح طريقة استخدامها وفائدتها للمستخدمين -->
<template>
  <v-dialog v-model="visible" max-width="600" scrollable transition="dialog-bottom-transition">
    <v-card class="system-updates-card rounded-xl overflow-hidden elevation-24 border-0">
      <!-- Card Header with beautiful gradient & icon -->
      <div class="header-gradient pa-6 text-center text-white relative">
        <v-avatar color="rgba(255, 255, 255, 0.2)" size="64" class="mb-3 ripple-avatar">
          <v-icon icon="ri-sparkling-fill" color="white" size="32" />
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-1">
          {{ showAllVersions ? 'سجل تحديثات النظام' : 'تحديثات جديدة في النظام!' }}
        </h2>
        <div class="text-subtitle-2 opacity-80" v-if="!showAllVersions">
          {{ latestChangelog?.title }} — {{ latestChangelog?.date }}
        </div>
      </div>

      <!-- Scrollable updates list -->
      <v-card-text class="pa-6 updates-content scrollable-area">
        <!-- Mode: Show All History -->
        <div v-if="showAllVersions">
          <div v-for="(release, rIdx) in changelogsList" :key="release.version" class="release-group mb-8">
            <div class="d-flex align-center justify-space-between mb-4 border-b pb-2">
              <span class="text-h6 font-weight-bold text-primary">{{ release.title }}</span>
              <v-chip color="primary" variant="flat" size="small" class="font-weight-bold">
                {{ release.version }} ({{ release.date }})
              </v-chip>
            </div>
            
            <div v-for="(feature, idx) in release.features" :key="idx" class="feature-item mb-5">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-4 d-flex align-center mb-1">
                <v-icon icon="ri-arrow-left-s-fill" color="primary" class="me-1" size="18" />
                {{ feature.title }}
              </h3>
              <p class="text-body-2 text-grey-darken-3 ps-5 mb-2 leading-relaxed">{{ feature.description }}</p>
              <div class="access-steps ps-5 text-caption text-primary font-weight-medium">
                <v-icon icon="ri-navigation-line" size="12" class="me-1" />
                طريق الوصول: <span class="text-grey-darken-2">{{ feature.how_to_use }}</span>
              </div>
            </div>
            <v-divider v-if="rIdx < changelogsList.length - 1" class="my-6" />
          </div>
        </div>

        <!-- Mode: Show Only Latest (Auto-popup) -->
        <div v-else>
          <div class="welcome-text mb-6 text-body-1 text-grey-darken-2 text-center">
            إليك دليل سريع للميزات الجديدة والتحسينات المضافة في هذا الإصدار وطريقة الوصول إليها:
          </div>

          <div v-for="(feature, idx) in latestChangelog?.features" :key="idx" class="feature-item mb-6">
            <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-4 d-flex align-center mb-1">
              <v-icon icon="ri-arrow-left-s-fill" color="primary" class="me-1" size="18" />
              {{ feature.title }}
            </h3>
            <p class="text-body-2 text-grey-darken-3 ps-5 mb-2 leading-relaxed">{{ feature.description }}</p>
            <div class="access-steps ps-5 text-caption text-primary font-weight-medium">
              <v-icon icon="ri-navigation-line" size="12" class="me-1" />
              طريق الوصول: <span class="text-grey-darken-2">{{ feature.how_to_use }}</span>
            </div>
            <v-divider v-if="idx < latestChangelog.features.length - 1" class="my-5 opacity-40" />
          </div>
        </div>
      </v-card-text>

      <v-divider class="opacity-10" />

      <!-- Footer Actions -->
      <v-card-actions class="pa-5 bg-grey-lighten-5 d-flex gap-3">
        <!-- If showing history: just close button -->
        <v-btn
          v-if="showAllVersions"
          variant="flat"
          color="primary"
          class="flex-grow-1 font-weight-bold rounded-lg"
          height="48"
          @click="visible = false"
        >
          إغلاق السجل
        </v-btn>

        <!-- If showing auto-popup: Acknowledge and Close Later buttons -->
        <template v-else>
          <v-btn
            variant="tonal"
            color="grey-darken-1"
            class="flex-grow-1 font-weight-bold rounded-lg"
            height="48"
            @click="closeLater"
          >
            لاحقاً
          </v-btn>

          <v-btn
            variant="flat"
            color="primary"
            class="flex-grow-1 font-weight-bold elevation-2 rounded-lg shadow-md"
            height="48"
            :loading="saving"
            @click="acknowledgeUpdate"
          >
            علمت بذلك، موافق
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import userService from '@/api/services/user.service';
import changelogs from '@/config/changelogs.json';

const authStore = useAuthStore();
const visible = ref(false);
const saving = ref(false);
const showAllVersions = ref(false);

const latestChangelog = computed(() => changelogs[0] || null);
const changelogsList = computed(() => changelogs);

onMounted(() => {
  // Check if we should show the dialog
  setTimeout(() => {
    checkShowCondition();
  }, 2000); // 2 seconds delay to allow system state stabilization
});

const checkShowCondition = () => {
  if (!authStore.isAuthenticated || !authStore.user) {
    return;
  }
  
  const latest = latestChangelog.value;
  if (!latest) return;
  
  const userSettings = authStore.user.settings || {};
  const acknowledged = userSettings.acknowledged_updates || [];
  
  if (!acknowledged.includes(latest.version)) {
    showAllVersions.value = false;
    visible.value = true;
  }
};

const closeLater = () => {
  visible.value = false;
};

const show = (forceAll = false) => {
  showAllVersions.value = forceAll;
  visible.value = true;
};

const acknowledgeUpdate = async () => {
  if (!authStore.user) return;
  
  saving.value = true;
  try {
    const currentSettings = authStore.user.settings || {};
    const acknowledged = [...(currentSettings.acknowledged_updates || [])];
    
    // Add current version if not already present
    const latestVersion = latestChangelog.value?.version;
    if (latestVersion && !acknowledged.includes(latestVersion)) {
      acknowledged.push(latestVersion);
    }
    
    const updatedSettings = {
      ...currentSettings,
      acknowledged_updates: acknowledged
    };
    
    const response = await userService.update(authStore.user.id, {
      settings: updatedSettings
    });
    
    if (response.success) {
      // Update local auth store state
      authStore.user.settings = updatedSettings;
      
      // Persist user data back into local/session storage
      const remember = !!localStorage.getItem('token');
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(authStore.user));
      
      visible.value = false;
    }
  } catch (error) {
    console.error('Failed to acknowledge system update:', error);
  } finally {
    saving.value = false;
  }
};

defineExpose({ show });
</script>

<style scoped>
.system-updates-card {
  background-color: white !important;
}

.header-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  position: relative;
  overflow: hidden;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.ripple-avatar {
  border: 2px solid rgba(255, 255, 255, 0.4);
  animation: pulse-avatar 2s infinite;
}

@keyframes pulse-avatar {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.scrollable-area {
  max-height: 420px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.scrollable-area::-webkit-scrollbar {
  width: 6px;
}

.scrollable-area::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.leading-relaxed {
  line-height: 1.625;
}

.gap-3 {
  gap: 12px;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
}
</style>
