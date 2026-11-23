import {beforeEach,describe,expect,it,vi} from 'vitest'
import {createPinia,setActivePinia} from 'pinia'
vi.mock('@/api/axios.config',()=>({default:{get:vi.fn(),put:vi.fn(),patch:vi.fn()}}))
import api from '@/api/axios.config'
import {useCompanySetupStore} from '@/modules/guidance/store/useCompanySetupStore'
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}}
const snapshot=id=>({company_id:id,version:2,revision:'r1',steps:[{key:'basics'}],state:{hidden:false}})
beforeEach(()=>{setActivePinia(createPinia());vi.clearAllMocks()})
describe('compact setup company boundaries',()=>{
 it('never applies an older snapshot after switching companies',async()=>{const old=deferred();api.get.mockReturnValueOnce(old.promise).mockResolvedValueOnce({data:{data:snapshot(2)}});const s=useCompanySetupStore();const pending=s.load(1);s.reset();await s.load(2);old.resolve({data:{data:snapshot(1)}});await pending;expect(s.snapshot.company_id).toBe(2)})
 it('an older hide response cannot hide another company',async()=>{const old=deferred();const s=useCompanySetupStore();s.scope='1';s.snapshot=snapshot(1);api.patch.mockReturnValueOnce(old.promise);const pending=s.setHidden(true);s.reset();s.scope='2';s.snapshot=snapshot(2);old.resolve({data:{data:snapshot(1)}});expect(await pending).toBe(false);expect(s.snapshot.state.hidden).toBe(false)})
 it('does not replace a compact snapshot with the legacy preferences response',async()=>{const s=useCompanySetupStore();s.scope='1';s.snapshot=snapshot(1);api.patch.mockResolvedValue({data:{data:{steps:[{key:'uses'}]}}});await s.setHidden(true);expect(s.snapshot.version).toBe(2);expect(s.snapshot.steps[0].key).toBe('basics');expect(s.snapshot.state.hidden).toBe(true)})
 it('keeps drafts and revision when saving fails',async()=>{const s=useCompanySetupStore();s.scope='1';s.snapshot=snapshot(1);s.drafts.basics={form:{company:{name:'draft'}},baseline:'{}'};api.put.mockRejectedValue({response:{status:409,data:{message:'تعارض'}}});expect(await s.save('basics',{company:{name:'draft'}})).toBe(false);expect(s.drafts.basics.form.company.name).toBe('draft');expect(s.snapshot.revision).toBe('r1');expect(s.error).toBe('تعارض')})
 it('location dialogs edit an isolated copy until explicit acceptance',()=>{const s=useCompanySetupStore(),point={latitude:30,longitude:31,location_confirmed:true},accept=vi.fn();s.pickLocation(point,accept);s.panelDraft.latitude=40;expect(point.latitude).toBe(30);expect(accept).not.toHaveBeenCalled();s.closePanel();expect(s.locationAccept).toBeNull()})
})
