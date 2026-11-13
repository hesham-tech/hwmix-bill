import {beforeEach,describe,expect,it,vi} from 'vitest'
import {createPinia,setActivePinia} from 'pinia'
import api from '@/modules/store/api/storeClient'
import {contactFields,phoneLink,usePublicContactStore} from '@/modules/store/stores/publicContact'
vi.mock('@/modules/store/api/storeClient',()=>({default:{get:vi.fn()}}))
const contact={email:'support@example.test',phone:'01012345678',address:'الشرقية، مصر'}
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();setActivePinia(createPinia())})
describe('public store contact',()=>{
 it('keeps only the public DTO, including in browser storage',()=>{
  const store=usePublicContactStore();store.accept({...contact,company_id:99,password:'not-public'})
  expect(store.contact).toEqual(contact)
  expect(JSON.parse(localStorage.getItem('hwnix_store_public_contact_v1'))).toEqual(contact)
 })
 it('uses the last known public contact when loading fails',async()=>{
  localStorage.setItem('hwnix_store_public_contact_v1',JSON.stringify(contact));const store=usePublicContactStore();api.get.mockRejectedValueOnce(new Error('offline'))
  await store.refresh();expect(store.contact).toEqual(contact);expect(store.error).toContain('آخر بيانات محفوظة');expect(store.loading).toBe(false)
 })
 it('does not invent fallback data if no valid cached contact exists',async()=>{
  localStorage.setItem('hwnix_store_public_contact_v1',JSON.stringify({...contact,phone:'javascript:alert(1)'}));const store=usePublicContactStore();api.get.mockRejectedValueOnce(new Error('offline'))
  await store.refresh();expect(store.contact).toBeNull();expect(store.error).toContain('تعذر تحميل')
 })
 it('keeps newly saved contact when an older public request finishes later',async()=>{
  let finish;api.get.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve}));const store=usePublicContactStore();const pending=store.refresh()
  const changed={...contact,email:'new@example.test'};store.accept(changed);finish({data:{data:contact}});await pending
  expect(store.contact).toEqual(changed);expect(store.loading).toBe(false)
 })
 it('updates successfully on retry after an initial failure',async()=>{
  api.get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({data:{data:contact}});const store=usePublicContactStore()
  await store.refresh();await store.refresh();expect(store.contact).toEqual(contact);expect(store.error).toBe('')
 })
 it('normalizes clickable phone numbers and rejects malformed payloads',()=>{
  expect(phoneLink('010 1234 5678')).toBe('tel:+201012345678')
  expect(phoneLink('0020 1012345678')).toBe('tel:+201012345678')
  expect(phoneLink('+20 (10) 1234-5678')).toBe('tel:+201012345678')
  expect(contactFields({...contact,email:'invalid'})).toBeNull()
  expect(contactFields({...contact,address:''})).toBeNull()
 })
})
