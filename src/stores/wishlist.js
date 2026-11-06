import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import api from '@/modules/store/api/storeClient'
import { useAuthStore } from './auth'
function guestItems(){try{const value=JSON.parse(localStorage.getItem('hwnix_store_wishlist')||'[]');return Array.isArray(value)?[...new Set(value.map(Number).filter(Number.isSafeInteger).filter(i=>i>0))]:[]}catch{return []}}
export const useWishlistStore=defineStore('wishlist',()=>{
  const authStore=useAuthStore(),items=ref(guestItems()),loading=ref(false)
  const pending=new Set();let generation=0
  watch(items,value=>{if(!authStore.isAuthenticated){try{localStorage.setItem('hwnix_store_wishlist',JSON.stringify(value))}catch{}}},{deep:true})
  async function fetchWishlist(){
    if(!authStore.isAuthenticated)return
    const current=generation;loading.value=true
    try{const response=await api.get('/store/wishlist/ids');const data=response.data?.data
      if(current===generation&&authStore.isAuthenticated&&Array.isArray(data))items.value=[...new Set(data.map(Number).filter(Number.isSafeInteger).filter(i=>i>0))]
    }finally{if(current===generation)loading.value=false}
  }
  async function toggle(productId){
    const id=Number(productId);if(!Number.isSafeInteger(id)||id<=0||pending.has(id))return false
    const current=generation,previous=items.value.includes(id)
    items.value=previous?items.value.filter(i=>i!==id):[...items.value,id]
    if(!authStore.isAuthenticated)return true
    pending.add(id)
    try{await api.post('/store/wishlist/toggle',{product_id:id});return true}
    catch{if(current===generation)items.value=previous?[...new Set([...items.value,id])]:items.value.filter(i=>i!==id);return false}
    finally{pending.delete(id)}
  }
  watch(()=>[authStore.isAuthenticated,authStore.user?.id],()=>{
    generation++;pending.clear();loading.value=false
    if(authStore.isAuthenticated){items.value=[];fetchWishlist().catch(()=>{})}else items.value=guestItems()
  },{immediate:true})
  return{items,loading,fetchWishlist,toggle,isFavorite:id=>items.value.includes(Number(id)),clear:()=>{items.value=[]}}
})
