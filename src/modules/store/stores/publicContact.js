import {defineStore} from 'pinia'
import api from '../api/storeClient'

const CACHE_KEY='hwnix_store_public_contact_v1'
export function contactFields(value){
  if(!value||typeof value!=='object')return null
  if(![value.email,value.phone,value.address].every(v=>typeof v==='string'))return null
  const email=value.email.trim(),phone=value.phone.trim(),address=value.address.trim()
  if(typeof email!=='string'||!/^[^\s@]+@[^\s@]+$/.test(email)||email.length>254)return null
  if(typeof phone!=='string'||! /^(?:\+|00)?[0-9][0-9\s()\-]{6,25}$/.test(phone)||phone.length>30)return null
  if(typeof address!=='string'||!address.trim()||address.length>500)return null
  return {email,phone,address}
}
function cachedContact(){try{return contactFields(JSON.parse(localStorage.getItem(CACHE_KEY)||'null'))}catch{return null}}
export function phoneLink(phone){
  let value=String(phone||'').replace(/[\s()\-]/g,'')
  if(value.startsWith('00'))value='+'+value.slice(2)
  else if(value.startsWith('0'))value='+20'+value.slice(1)
  return 'tel:'+value
}
export const usePublicContactStore=defineStore('storePublicContact',{
  state:()=>({contact:cachedContact(),loading:false,error:'',generation:0}),
  actions:{
    accept(value){
      const data=contactFields(value)
      if(!data)throw new Error('بيانات التواصل غير مكتملة.')
      this.generation++;this.contact=data;this.error='';this.loading=false
      try{localStorage.setItem(CACHE_KEY,JSON.stringify(data))}catch{/* Storage may be disabled; the current page still works. */}
      return data
    },
    async refresh(){
      if(this.loading)return
      const generation=++this.generation;this.loading=true
      try{const response=await api.get('/store/public/contact');if(generation!==this.generation)return;this.accept(response.data?.data)}
      catch{if(generation===this.generation)this.error=this.contact?'تعذر تحديث بيانات التواصل؛ نعرض آخر بيانات محفوظة.':'تعذر تحميل بيانات التواصل.'}
      finally{if(generation===this.generation)this.loading=false}
    },
  },
})
