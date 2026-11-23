<template>
 <v-dialog :model-value="modelValue" :fullscreen="mobile" :max-width="width" scrollable persistent class="setup-dialog" @keydown.esc.stop.prevent="$emit('close')">
  <section class="setup-surface" dir="rtl" role="document" :aria-label="title" :style="{'--setup-viewport-height':viewportHeight+'px'}">
   <header class="setup-top"><div><p v-if="eyebrow" class="setup-eyebrow">{{ eyebrow }}</p><h2>{{ title }}</h2><p v-if="description" class="setup-description" aria-live="polite">{{ description }}</p></div><button class="setup-icon" type="button" aria-label="إغلاق النافذة" :disabled="busy" @click="$emit('close')"><v-icon icon="ri-close-line" /></button><slot name="progress" /></header>
   <div ref="body" class="setup-scroll"><slot /></div>
   <footer v-if="$slots.actions" class="setup-actions"><slot name="actions" /></footer>
  </section>
 </v-dialog>
</template>
<script setup>
import {computed,nextTick,onMounted,onBeforeUnmount,ref} from 'vue'
import {useDisplay} from 'vuetify'
import '../styles/setup.css'
defineProps({modelValue:Boolean,title:String,description:String,eyebrow:String,busy:Boolean,width:{type:[String,Number],default:880}})
defineEmits(['close'])
const {width:viewportWidth}=useDisplay(),mobile=computed(()=>viewportWidth.value<600),body=ref()
const viewportHeight=ref(window.visualViewport?.height||window.innerHeight)
function resize(){viewportHeight.value=window.visualViewport?.height||window.innerHeight;nextTick(()=>{if(body.value?.contains(document.activeElement))document.activeElement.scrollIntoView?.({block:'nearest'})})}
onMounted(()=>{window.visualViewport?.addEventListener('resize',resize);window.addEventListener('resize',resize)})
onBeforeUnmount(()=>{window.visualViewport?.removeEventListener('resize',resize);window.removeEventListener('resize',resize)})
defineExpose({top(){body.value?.scrollTo({top:0});const heading=body.value?.querySelector('h3');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true})}}})
</script>
