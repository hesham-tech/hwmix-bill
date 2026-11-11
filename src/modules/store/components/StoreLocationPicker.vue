<template>
  <section class="location-picker my-4" :aria-label="label">
    <h3 class="text-subtitle-1 mb-2">{{ label }}</h3>
    <p class="text-body-2">اختر نقطة العنوان الفعلية، ثم أكدها. استخدام موقع الجهاز اختياري وقد لا يطابق عنوان التسليم.</p>
    <div class="d-flex flex-wrap ga-2 my-3"><v-btn variant="outlined" @click="showMap">تحديد النقطة على الخريطة</v-btn><v-btn variant="outlined" :loading="locating" @click="locate">استخدام موقعي</v-btn></div>
    <v-alert v-if="error" type="warning" variant="tonal" class="mb-3">{{ error }}</v-alert>
    <div v-if="expanded" ref="canvas" class="location-map" aria-label="خريطة اختيار العنوان" />
    <p v-if="expanded" class="text-caption" v-html="attribution" />
    <v-row class="mt-2"><v-col cols="6"><v-text-field :model-value="modelValue.latitude" type="number" step="any" min="-90" max="90" label="خط العرض" aria-label="خط العرض" @update:model-value="setCoordinate('latitude',$event)" /></v-col><v-col cols="6"><v-text-field :model-value="modelValue.longitude" type="number" step="any" min="-180" max="180" label="خط الطول" aria-label="خط الطول" @update:model-value="setCoordinate('longitude',$event)" /></v-col></v-row>
    <v-btn :disabled="!valid" :color="modelValue.location_confirmed ? 'success' : 'primary'" variant="tonal" @click="confirm">{{ modelValue.location_confirmed ? 'تم تأكيد نقطة العنوان' : 'تأكيد نقطة العنوان' }}</v-btn>
    <p v-if="required && !modelValue.location_confirmed" class="text-body-2 mt-2">تأكيد الموقع مطلوب لحساب طريقة التوصيل.</p>
  </section>
</template>
<script setup>
import {computed,nextTick,onBeforeUnmount,ref,watch} from 'vue'
import {safeHtml} from '@/utils/safeHtml'
const attribution=safeHtml(import.meta.env.VITE_STORE_MAP_ATTRIBUTION||'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>')
const props=defineProps({modelValue:{type:Object,required:true},label:{type:String,default:'موقع عنوان التسليم'},required:Boolean,radiusMeters:{type:Number,default:0}})
const emit=defineEmits(['update:modelValue'])
const canvas=ref(null),expanded=ref(false),error=ref(''),locating=ref(false)
let map,marker,circle,L,disposed=false
const valid=computed(()=>[props.modelValue.latitude,props.modelValue.longitude].every(v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v)))&&Math.abs(Number(props.modelValue.latitude))<=90&&Math.abs(Number(props.modelValue.longitude))<=180)
function point(){return [Number(props.modelValue.latitude),Number(props.modelValue.longitude)]}
function update(latitude,longitude){emit('update:modelValue',{...props.modelValue,latitude,longitude,location_confirmed:false})}
function setCoordinate(key,value){update(key==='latitude'?(value===''?null:Number(value)):props.modelValue.latitude,key==='longitude'?(value===''?null:Number(value)):props.modelValue.longitude)}
function confirm(){if(valid.value)emit('update:modelValue',{...props.modelValue,latitude:Number(props.modelValue.latitude),longitude:Number(props.modelValue.longitude),location_confirmed:true})}
function draw(){if(!map||!valid.value)return;const p=point();if(marker)marker.setLatLng(p);else marker=L.circleMarker(p,{radius:9,color:'#1749ad',fillOpacity:.8}).addTo(map);if(circle)circle.remove();if(props.radiusMeters>0)circle=L.circle(p,{radius:props.radiusMeters,color:'#1749ad',fillOpacity:.08}).addTo(map)}
async function showMap(){expanded.value=true;error.value='';await nextTick();if(map){map.invalidateSize();return}try{const module=await import('leaflet');await import('leaflet/dist/leaflet.css');if(disposed||!canvas.value)return;L=module.default;map=L.map(canvas.value).setView(valid.value?point():[30.0444,31.2357],valid.value?14:6);L.tileLayer(import.meta.env.VITE_STORE_MAP_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution}).on('tileerror',()=>{error.value='تعذر تحميل أجزاء الخريطة. يمكنك إعادة المحاولة أو استخدام موقع الجهاز أو إدخال الإحداثيات وتأكيدها.'}).addTo(map);map.on('click',e=>update(Number(e.latlng.lat.toFixed(7)),Number(e.latlng.lng.toFixed(7))));draw()}catch{error.value='تعذر تشغيل الخريطة. استخدم موقع الجهاز أو أدخل الإحداثيات الصحيحة.'}}
function locate(){error.value='';if(!navigator.geolocation){error.value='هذا الجهاز لا يدعم تحديد الموقع. اختر النقطة يدويًا.';return}locating.value=true;navigator.geolocation.getCurrentPosition(position=>{if(disposed)return;locating.value=false;update(Number(position.coords.latitude.toFixed(7)),Number(position.coords.longitude.toFixed(7)));if(map)map.setView([position.coords.latitude,position.coords.longitude],15)},()=>{if(disposed)return;locating.value=false;error.value='تعذر الحصول على الموقع أو رُفض الإذن. يمكنك تحديد العنوان على الخريطة أو إدخال إحداثياته.'},{enableHighAccuracy:true,timeout:12000,maximumAge:0})}
watch(()=>[props.modelValue.latitude,props.modelValue.longitude,props.radiusMeters],draw)
onBeforeUnmount(()=>{disposed=true;map?.remove()})
</script>
<style scoped>.location-map{height:300px;width:100%;border-radius:12px;z-index:0}.location-picker{min-width:0}.location-picker :deep(.leaflet-control-attribution){font-size:10px}</style>
