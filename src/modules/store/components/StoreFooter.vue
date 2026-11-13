<template>
  <footer class="store-footer" dir="rtl" aria-label="تواصل معنا وسياسات متجر هونكس">
    <div class="store-footer__content">
      <section aria-labelledby="store-footer-brand">
        <h2 id="store-footer-brand">متجر هونكس</h2>
        <p>تصفح المنتجات وأسعارها بالجنيه المصري، وتواصل معنا للاستفسارات ومتابعة طلباتك.</p>
        <router-link to="/store" class="store-footer__browse">تصفح المنتجات والأسعار <span aria-hidden="true">←</span></router-link>
      </section>

      <section id="store-contact" aria-labelledby="store-footer-contact">
        <h2 id="store-footer-contact">تواصل معنا</h2>
        <address v-if="contact">
          <p><span>البريد الإلكتروني</span><a :href="`mailto:${contact.email}`" dir="ltr">{{ contact.email }}</a></p>
          <p><span>الهاتف — مصر</span><a :href="phoneLink(contact.phone)" dir="ltr">{{ contact.phone }}</a></p>
          <p><span>العنوان — مصر</span><span class="store-footer__address">{{ contact.address }}</span></p>
        </address>
        <p v-if="store.loading&&!contact" role="status">جار تحميل بيانات التواصل…</p>
        <p v-if="store.error" role="status">{{ store.error }} <button type="button" class="store-footer__retry" @click="store.refresh()">إعادة المحاولة</button></p>
      </section>

      <nav aria-label="سياسات وروابط المتجر">
        <h2>معلومات المتجر</h2>
        <router-link to="/store/policies/store-terms-of-sale">شروط الشراء</router-link>
        <router-link to="/store/policies/store-privacy-policy">سياسة الخصوصية</router-link>
        <router-link to="/store/policies/store-returns-policy">الاستبدال والاسترجاع</router-link>
        <router-link to="/saas">نظام إدارة الشركات</router-link>
      </nav>
    </div>
    <p class="store-footer__copyright">جميع الحقوق محفوظة © {{ new Date().getFullYear() }} — هونكس</p>
  </footer>
</template>

<script setup>
import {computed,onMounted,onUnmounted} from 'vue'
import {phoneLink,usePublicContactStore} from '../stores/publicContact'
const store=usePublicContactStore(),contact=computed(()=>store.contact)
const refresh=()=>store.refresh()
onMounted(()=>{refresh();window.addEventListener('focus',refresh)})
onUnmounted(()=>window.removeEventListener('focus',refresh))
</script>

<style scoped>
.store-footer{background:#10243b;color:#e6eef7;padding:32px 24px 24px;margin-top:auto}
.store-footer__content{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr .8fr;gap:36px}
.store-footer h2{font-size:18px;font-weight:700;line-height:1.6;color:#fff;margin-bottom:12px}
.store-footer p{font-size:14px;line-height:1.9;margin:0 0 10px;overflow-wrap:anywhere}
.store-footer a{color:#e6eef7;text-decoration:none;display:inline-flex;align-items:center;min-height:44px;font-size:14px;line-height:1.7;overflow-wrap:anywhere}
.store-footer a:hover{text-decoration:underline;color:#fff}
.store-footer a:focus-visible{outline:2px solid #7dd3fc;outline-offset:4px;border-radius:4px}
.store-footer__retry{color:#7dd3fc;min-height:44px;text-decoration:underline}.store-footer__browse{gap:12px;color:#7dd3fc!important}
.store-footer nav{display:flex;flex-direction:column;align-items:flex-start}
.store-footer address{font-style:normal}
.store-footer address p{display:flex;flex-direction:column;margin-bottom:8px}
.store-footer address p>span:first-child{color:#b9cce0;font-size:13px}
.store-footer address a{align-self:flex-start}
.store-footer__address{font-size:14px;line-height:1.9}
.store-footer__copyright{max-width:1320px;margin:24px auto 0!important;border-top:1px solid #37506b;padding-top:18px;color:#b9cce0}
@media(max-width:959px){.store-footer{padding:28px 20px calc(24px + var(--store-bottom-height,66px) + var(--store-purchase-height,0px) + env(safe-area-inset-bottom,0px))}.store-footer__content{grid-template-columns:1fr;gap:24px}}
</style>
