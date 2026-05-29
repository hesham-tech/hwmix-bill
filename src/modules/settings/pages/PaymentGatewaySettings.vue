<!-- تعليق عربي: صفحة إعدادات بوابات الدفع الإلكتروني المخصصة للشركة لتهيئة Stripe و Paymob وتفعيلها تلقائياً عند تغيير الخيارات -->

<template>
  <div class="payment-gateway-settings-page">
    <!-- Header -->
    <div class="page-header mb-8">
      <div class="d-flex align-center gap-2 mb-2">
        <v-btn icon="ri-arrow-right-line" variant="text" @click="router.push({ name: 'settings' })" />
        <h1 class="text-h3 font-weight-bold primary--text">بوابات الدفع الإلكتروني</h1>
      </div>
      <p class="text-subtitle-1 text-grey-darken-1">تهيئة وإعداد بوابات الدفع Stripe و Paymob لتوفير الدفع الإلكتروني الآمن لعملائك</p>
    </div>

    <v-row>
      <!-- Stripe Gateway Card -->
      <v-col cols="12" md="6">
        <AppCard title="بوابة الدفع Stripe" icon="ri-stripe-fill" icon-color="primary" class="mb-6 h-100 d-flex flex-column">
          <template v-slot:append>
            <div class="d-flex align-center gap-4">
              <v-switch
                v-model="stripeGateway.is_active"
                label="تفعيل البوابة"
                color="success"
                hide-details
                density="compact"
                @update:model-value="handleToggleGatewayActive(stripeGateway)"
              />
              <v-switch
                v-model="stripeGateway.is_test_mode"
                label="وضع التجربة (Test Mode)"
                color="warning"
                hide-details
                density="compact"
                @update:model-value="handleToggleGatewayTestMode(stripeGateway)"
              />
            </div>
          </template>

          <v-card-text class="flex-grow-1 px-0 py-4">
            <v-row dense>
              <v-col cols="12">
                <AppInput
                  v-model="stripeGateway.config.publishable_key"
                  label="Publishable Key"
                  placeholder="pk_test_..."
                  dir="ltr"
                >
                  <template v-slot:append-inner v-if="isGatewayFieldChanged('stripe', 'publishable_key')">
                    <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSaveGateway(stripeGateway)" />
                    <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertGatewayField('stripe', 'publishable_key')" />
                  </template>
                </AppInput>
              </v-col>

              <v-col cols="12">
                <AppInput
                  v-model="stripeGateway.config.secret_key"
                  label="Secret Key"
                  :type="showStripeSecret ? 'text' : 'password'"
                  placeholder="sk_test_..."
                  dir="ltr"
                >
                  <template v-slot:append-inner>
                    <v-btn icon variant="text" size="x-small" density="comfortable" class="me-1" @click.stop="showStripeSecret = !showStripeSecret">
                      <v-icon :icon="showStripeSecret ? 'ri-eye-off-line' : 'ri-eye-line'" />
                    </v-btn>
                    <template v-if="isGatewayFieldChanged('stripe', 'secret_key')">
                      <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSaveGateway(stripeGateway)" />
                      <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertGatewayField('stripe', 'secret_key')" />
                    </template>
                  </template>
                </AppInput>
              </v-col>

              <v-col cols="12">
                <AppInput
                  v-model="stripeGateway.config.webhook_secret"
                  label="Webhook Secret (الرموز السرية للويب-هوك)"
                  :type="showStripeWebhook ? 'text' : 'password'"
                  placeholder="whsec_..."
                  dir="ltr"
                >
                  <template v-slot:append-inner>
                    <v-btn icon variant="text" size="x-small" density="comfortable" class="me-1" @click.stop="showStripeWebhook = !showStripeWebhook">
                      <v-icon :icon="showStripeWebhook ? 'ri-eye-off-line' : 'ri-eye-line'" />
                    </v-btn>
                    <template v-if="isGatewayFieldChanged('stripe', 'webhook_secret')">
                      <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSaveGateway(stripeGateway)" />
                      <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertGatewayField('stripe', 'webhook_secret')" />
                    </template>
                  </template>
                </AppInput>
              </v-col>
            </v-row>
          </v-card-text>

          <template v-slot:actions>
            <v-spacer />
            <v-btn color="success" :loading="saving" prepend-icon="ri-save-line" class="px-6 rounded-pill font-weight-bold" @click="handleSaveGateway(stripeGateway)">
              حفظ
            </v-btn>
          </template>
        </AppCard>
      </v-col>

      <!-- Paymob Gateway Card -->
      <v-col cols="12" md="6">
        <AppCard title="بوابة الدفع Paymob" icon="ri-bank-card-line" icon-color="primary" class="mb-6 h-100 d-flex flex-column">
          <template v-slot:append>
            <div class="d-flex align-center gap-4">
              <v-switch
                v-model="paymobGateway.is_active"
                label="تفعيل البوابة"
                color="success"
                hide-details
                density="compact"
                @update:model-value="handleToggleGatewayActive(paymobGateway)"
              />
              <v-switch
                v-model="paymobGateway.is_test_mode"
                label="وضع التجربة (Test Mode)"
                color="warning"
                hide-details
                density="compact"
                @update:model-value="handleToggleGatewayTestMode(paymobGateway)"
              />
            </div>
          </template>

          <v-card-text class="flex-grow-1 px-0 py-4">
            <v-row dense>
              <v-col cols="12" md="6">
                <AppInput
                  v-model="paymobGateway.config.api_key"
                  label="API Key"
                  :type="showPaymobApi ? 'text' : 'password'"
                  placeholder="أدخل مفتاح الـ API..."
                  dir="ltr"
                >
                  <template v-slot:append-inner>
                    <v-btn icon variant="text" size="x-small" density="comfortable" class="me-1" @click.stop="showPaymobApi = !showPaymobApi">
                      <v-icon :icon="showPaymobApi ? 'ri-eye-off-line' : 'ri-eye-line'" />
                    </v-btn>
                    <template v-if="isGatewayFieldChanged('paymob', 'api_key')">
                      <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSaveGateway(paymobGateway)" />
                      <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertGatewayField('paymob', 'api_key')" />
                    </template>
                  </template>
                </AppInput>
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="paymobGateway.config.integration_id"
                  label="Integration ID"
                  placeholder="أدخل معرف الدمج..."
                  dir="ltr"
                >
                  <template v-slot:append-inner v-if="isGatewayFieldChanged('paymob', 'integration_id')">
                    <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSaveGateway(paymobGateway)" />
                    <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertGatewayField('paymob', 'integration_id')" />
                  </template>
                </AppInput>
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="paymobGateway.config.iframe_id"
                  label="Iframe ID"
                  placeholder="أدخل معرف الـ Iframe..."
                  dir="ltr"
                >
                  <template v-slot:append-inner v-if="isGatewayFieldChanged('paymob', 'iframe_id')">
                    <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSaveGateway(paymobGateway)" />
                    <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertGatewayField('paymob', 'iframe_id')" />
                  </template>
                </AppInput>
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="paymobGateway.config.hmac_secret"
                  label="HMAC Secret"
                  :type="showPaymobHmac ? 'text' : 'password'"
                  placeholder="أدخل HMAC Secret..."
                  dir="ltr"
                >
                  <template v-slot:append-inner>
                    <v-btn icon variant="text" size="x-small" density="comfortable" class="me-1" @click.stop="showPaymobHmac = !showPaymobHmac">
                      <v-icon :icon="showPaymobHmac ? 'ri-eye-off-line' : 'ri-eye-line'" />
                    </v-btn>
                    <template v-if="isGatewayFieldChanged('paymob', 'hmac_secret')">
                      <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSaveGateway(paymobGateway)" />
                      <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertGatewayField('paymob', 'hmac_secret')" />
                    </template>
                  </template>
                </AppInput>
              </v-col>
            </v-row>
          </v-card-text>

          <template v-slot:actions>
            <v-spacer />
            <v-btn color="success" :loading="saving" prepend-icon="ri-save-line" class="px-6 rounded-pill font-weight-bold" @click="handleSaveGateway(paymobGateway)">
              حفظ
            </v-btn>
          </template>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Global Loader -->
    <v-overlay :model-value="loading" class="align-center justify-center" persistent>
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const gatewaysApi = useApi('/api/v1/payment-gateways');

const loading = ref(false);
const saving = ref(false);

const showStripeSecret = ref(false);
const showStripeWebhook = ref(false);
const showPaymobApi = ref(false);
const showPaymobHmac = ref(false);

const stripeGateway = ref({
  id: null,
  name: 'Stripe',
  driver: 'stripe',
  is_active: false,
  is_test_mode: true,
  config: {
    secret_key: '',
    publishable_key: '',
    webhook_secret: '',
  }
});

const paymobGateway = ref({
  id: null,
  name: 'Paymob',
  driver: 'paymob',
  is_active: false,
  is_test_mode: true,
  config: {
    api_key: '',
    integration_id: '',
    iframe_id: '',
    hmac_secret: '',
  }
});

const originalGatewayConfigs = ref({
  stripe: {
    secret_key: '',
    publishable_key: '',
    webhook_secret: '',
  },
  paymob: {
    api_key: '',
    integration_id: '',
    iframe_id: '',
    hmac_secret: '',
  }
});

const isGatewayFieldChanged = (driver, key) => {
  const currentVal = driver === 'stripe' ? stripeGateway.value.config[key] : paymobGateway.value.config[key];
  const originalVal = originalGatewayConfigs.value[driver][key];
  return currentVal !== originalVal;
};

const revertGatewayField = (driver, key) => {
  if (driver === 'stripe') {
    stripeGateway.value.config[key] = originalGatewayConfigs.value.stripe[key];
  } else {
    paymobGateway.value.config[key] = originalGatewayConfigs.value.paymob[key];
  }
};

const loadPaymentGateways = async () => {
  loading.value = true;
  try {
    const response = await gatewaysApi.get(null, { showLoading: false, showError: false });
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(item => {
        if (item.driver === 'stripe') {
          stripeGateway.value.id = item.id;
          stripeGateway.value.is_active = !!item.is_active;
          stripeGateway.value.is_test_mode = !!item.is_test_mode;
          stripeGateway.value.config = {
            secret_key: item.config.secret_key || '',
            publishable_key: item.config.publishable_key || '',
            webhook_secret: item.config.webhook_secret || '',
          };
          originalGatewayConfigs.value.stripe = JSON.parse(JSON.stringify(stripeGateway.value.config));
        } else if (item.driver === 'paymob') {
          paymobGateway.value.id = item.id;
          paymobGateway.value.is_active = !!item.is_active;
          paymobGateway.value.is_test_mode = !!item.is_test_mode;
          paymobGateway.value.config = {
            api_key: item.config.api_key || '',
            integration_id: item.config.integration_id || '',
            iframe_id: item.config.iframe_id || '',
            hmac_secret: item.config.hmac_secret || '',
          };
          originalGatewayConfigs.value.paymob = JSON.parse(JSON.stringify(paymobGateway.value.config));
        }
      });
    }
  } catch (e) {
    console.error('Failed to load payment gateways', e);
  } finally {
    loading.value = false;
  }
};

const handleSaveGateway = async (gatewayRef) => {
  saving.value = true;
  try {
    const payload = {
      name: gatewayRef.name,
      driver: gatewayRef.driver,
      is_active: gatewayRef.is_active,
      is_test_mode: gatewayRef.is_test_mode,
      config: gatewayRef.config
    };
    
    let res;
    if (gatewayRef.id) {
      res = await gatewaysApi.update(gatewayRef.id, payload);
    } else {
      res = await gatewaysApi.create(payload);
    }
    
    if (res.data) {
      gatewayRef.id = res.data.id;
      gatewayRef.is_active = !!res.data.is_active;
      gatewayRef.is_test_mode = !!res.data.is_test_mode;
      
      Object.keys(gatewayRef.config).forEach(key => {
        if (res.data.config[key] !== undefined) {
          originalGatewayConfigs.value[gatewayRef.driver][key] = gatewayRef.config[key];
        }
      });
      toast.success(`تم حفظ إعدادات ${gatewayRef.name} بنجاح.`);
    }
  } catch (error) {
    console.error(`Error saving gateway ${gatewayRef.name}:`, error);
  } finally {
    saving.value = false;
  }
};

const handleToggleGatewayActive = async (gatewayRef) => {
  await handleSaveGateway(gatewayRef);
};

const handleToggleGatewayTestMode = async (gatewayRef) => {
  await handleSaveGateway(gatewayRef);
};

onMounted(async () => {
  await loadPaymentGateways();
});
</script>

<style scoped>
.payment-gateway-settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
</style>
