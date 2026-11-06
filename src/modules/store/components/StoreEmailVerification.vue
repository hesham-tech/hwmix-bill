<template>
  <v-card rounded="xl" class="pa-5 my-5" variant="outlined">
    <h2 class="text-h6 mb-3">توثيق البريد الإلكتروني</h2>
    <p class="mb-4">وثّق بريدك لحماية حسابك واسترجاعه ومتابعة مشترياتك. ستبقى منتجاتك في السلة.</p>
    <p v-if="email && !editing" class="mb-3" dir="ltr">{{ email }}</p>
    <v-btn v-if="!editing" variant="text" class="mb-3" @click="editing = true">إضافة بريد أو تصحيحه</v-btn>
    <template v-if="editing">
      <v-text-field v-model="newEmail" label="البريد الإلكتروني" type="email" autocomplete="email" dir="ltr" />
      <v-text-field v-model="password" label="كلمة مرور الحساب لتأكيد تغيير البريد" type="password" autocomplete="current-password" />
    </template>
    <v-alert v-if="message" type="info" variant="tonal" class="mb-3">{{ message }}</v-alert>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>
    <v-btn :loading="sending" :disabled="sending || cooldown > 0" variant="outlined" @click="send">
      {{ cooldown > 0 ? 'إعادة الإرسال بعد ' + cooldown + ' ثانية' : 'إرسال رمز التوثيق' }}
    </v-btn>
    <v-form class="mt-5" @submit.prevent="verify">
      <v-text-field v-model="code" label="رمز التوثيق المكون من 8 أرقام" inputmode="numeric" autocomplete="one-time-code" maxlength="8" dir="ltr" />
      <v-btn type="submit" color="primary" :loading="checking" :disabled="!/^\d{8}$/.test(code)">توثيق البريد والمتابعة</v-btn>
    </v-form>
  </v-card>
</template>
<script setup>
import { ref, onUnmounted } from 'vue'
import { storeOrdersApi } from '../api/storeOrders.api'
import { storePayload } from '../utils/checkoutSession'
import { parseApiError } from '@/utils/errorParser'
const props = defineProps({ email: { type: String, default: '' } })
const emit = defineEmits(['verified'])
const editing = ref(!props.email)
const newEmail = ref(props.email)
const password = ref('')
const code = ref('')
const sending = ref(false)
const checking = ref(false)
const cooldown = ref(0)
const message = ref('')
const error = ref('')
let timer
function startCooldown(seconds) {
  clearInterval(timer)
  cooldown.value = seconds
  timer = setInterval(() => { cooldown.value = Math.max(0, cooldown.value - 1); if (!cooldown.value) clearInterval(timer) }, 1000)
}
async function send() {
  sending.value = true; error.value = ''
  try {
    const result = storePayload(await storeOrdersApi.sendVerification(editing.value ? { email: newEmail.value, password: password.value } : {}))
    password.value = ''
    if (result.verified) emit('verified', result)
    else { message.value = 'تم طلب رمز التوثيق. راجع بريدك والرسائل غير المرغوب فيها.'; startCooldown(result.retry_after || 60) }
  } catch (err) { error.value = parseApiError(err, 'تعذر طلب رمز التوثيق.') }
  finally { sending.value = false }
}
async function verify() {
  checking.value = true; error.value = ''
  try { emit('verified', storePayload(await storeOrdersApi.verifyEmail(code.value))); code.value = '' }
  catch (err) { error.value = parseApiError(err, 'تعذر توثيق البريد.') }
  finally { checking.value = false }
}
onUnmounted(() => clearInterval(timer))
</script>
