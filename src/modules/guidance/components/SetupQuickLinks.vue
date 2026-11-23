<template><div v-if="available.length" class="setup-quick-links" aria-label="اختصارات الإعدادات"><button v-for="key in available" :key="key" type="button" @click="store.openPanel(key)">{{ optionTitles[key] }}</button></div></template>
<script setup>
import {computed} from 'vue'
import {useUserStore} from '@/stores/user'
import {useCompanySetupStore} from '../store/useCompanySetupStore'
import {optionTitles,optionPermissions} from '../config/setupOptions'
const props=defineProps({options:{type:Array,required:true}}),store=useCompanySetupStore(),user=useUserStore()
const available=computed(()=>props.options.filter(key=>user.hasPermission('admin.super')||user.hasPermission('admin.company')||user.hasPermission(optionPermissions[key])))
</script>
<style scoped>.setup-quick-links{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 20px}.setup-quick-links button{min-height:44px;padding:8px 14px;border-radius:10px;border:1px solid rgba(var(--v-border-color),.18);color:rgb(var(--v-theme-primary));font:inherit;font-size:13px}.setup-quick-links button:focus-visible{outline:3px solid rgba(var(--v-theme-primary),.5);outline-offset:2px}</style>
