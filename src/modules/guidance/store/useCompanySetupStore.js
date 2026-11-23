import {defineStore} from 'pinia'
import api from '../api/setupApi'
export const useCompanySetupStore=defineStore('companySetup',{
 state:()=>({snapshot:null,open:false,loading:false,saving:false,error:'',scope:null,autoPending:false,generation:0,panel:null,panelDraft:null,locationAccept:null,drafts:{}}),
 actions:{
  async load(companyId){const scope=String(companyId||''),generation=++this.generation;this.scope=scope;this.loading=true;this.error='';try{const r=await api.get('/guidance/setup/compact');if(this.scope!==scope||generation!==this.generation)return;const d=r.data?.data;this.snapshot=d?.company_id===Number(companyId)&&Array.isArray(d.steps)?d:null;return this.snapshot}catch(e){if(this.scope===scope&&generation===this.generation)this.error=e.response?.data?.message||'تعذر تحميل إعداد شركتك. أعد المحاولة.'}finally{if(this.scope===scope&&generation===this.generation)this.loading=false}},
  async show(id){await this.load(id);if(this.scope===String(id)&&this.snapshot)this.open=true},
  reset(){this.generation++;this.saving=false;this.scope=null;this.snapshot=null;this.open=false;this.panel=null;this.panelDraft=null;this.locationAccept=null;this.drafts={};this.error='';this.autoPending=false},
  async save(step,data={},defer=false){if(this.saving||!this.snapshot)return false;this.saving=true;this.error='';const scope=this.scope,generation=this.generation;try{const r=await api.put('/guidance/setup/compact/'+step,{revision:this.snapshot.revision,data,defer});if(this.scope!==scope||generation!==this.generation)return false;this.snapshot=r.data.data;return true}catch(e){if(this.scope===scope)this.error=Object.values(e.response?.data?.errors||{}).flat().join('، ')||e.response?.data?.message||'تعذر الحفظ. بقيت بياناتك لإعادة المحاولة.';return false}finally{if(this.scope===scope&&generation===this.generation)this.saving=false}},
  async setHidden(hidden){const scope=this.scope,generation=this.generation;try{await api.patch('/guidance/setup/preferences',{hidden});if(this.scope!==scope||generation!==this.generation)return false;if(this.snapshot)this.snapshot.state.hidden=hidden;return true}catch{if(this.scope===scope&&generation===this.generation)this.error='تعذر حفظ اختيار عدم الإظهار. أعد المحاولة.';return false}},
  openPanel(key){this.panel=key},
  pickLocation(point,accept){this.panelDraft=JSON.parse(JSON.stringify(point));this.locationAccept=accept;this.panel='location'},
  closePanel(){this.panel=null;this.panelDraft=null;this.locationAccept=null},
 },
})
