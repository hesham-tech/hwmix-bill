import {defineStore} from 'pinia'
import api from '@/api/axios.config'
export const useCompanySetupStore=defineStore('companySetup',{
  state:()=>({snapshot:null,open:false,loading:false,saving:false,error:'',scope:null,autoPending:false}),
  actions:{
    async load(companyId){const scope=String(companyId||'');this.scope=scope;this.loading=true;this.error='';try{const r=await api.get('/guidance/setup');if(this.scope!==scope)return;const d=r.data?.data;this.snapshot=d?.company_id===Number(companyId)&&Array.isArray(d.steps)?d:null;return this.snapshot}catch(e){if(this.scope===scope)this.error=e.response?.data?.message||'تعذر تحميل إعداد شركتك. أعد المحاولة.'}finally{if(this.scope===scope)this.loading=false}},
    async show(id){this.open=true;await this.load(id)},
    reset(){this.scope=null;this.snapshot=null;this.open=false;this.error='';this.autoPending=false},
    async save(step,data={},defer=false){if(this.saving||!this.snapshot)return false;this.saving=true;this.error='';const scope=this.scope;try{const r=await api.put('/guidance/setup/steps/'+step,{revision:this.snapshot.revision,data,defer});if(this.scope!==scope)return false;this.snapshot=r.data.data;return true}catch(e){if(this.scope===scope)this.error=Object.values(e.response?.data?.errors||{}).flat().join('، ')||e.response?.data?.message||'تعذر الحفظ. بقيت بياناتك لإعادة المحاولة.';return false}finally{this.saving=false}},
    async setHidden(hidden){try{const r=await api.patch('/guidance/setup/preferences',{hidden});this.snapshot=r.data.data;return true}catch{this.error='تعذر حفظ اختيار عدم الإظهار. أعد المحاولة.';return false}},
  },
})
