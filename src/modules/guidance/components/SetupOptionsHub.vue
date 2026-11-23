<template><section class="setup-hub" aria-label="إعدادات إضافية"><h2>إعدادات إضافية</h2><p class="text-body-2 mb-4">افتح ما تحتاجه فقط. كل إعداد يحتفظ ببياناته وصلاحياته.</p><div class="setup-hub-groups"><section v-for="group in groups" :key="group.title" class="setup-hub-group"><h3>{{ group.title }}</h3><div class="setup-hub-links"><button v-for="key in group.keys" :key="key" type="button" @click="store.openPanel(key)">{{ optionTitles[key] }}</button></div></section></div></section></template>
<script setup>
import {computed} from 'vue'
import {useUserStore} from '@/stores/user'
import {useCompanySetupStore} from '../store/useCompanySetupStore'
import {optionGroups,optionTitles,optionPermissions} from '../config/setupOptions'
import '../styles/setup.css'
const user=useUserStore(),store=useCompanySetupStore()
const groups=computed(()=>optionGroups.map(g=>({...g,keys:g.keys.filter(k=>user.hasPermission('admin.super')||user.hasPermission('admin.company')||user.hasPermission(optionPermissions[k]))})).filter(g=>g.keys.length))
</script>
