import client from '@/api/axios.config'
// Setup owns retry/error UI; authentication expiry keeps the application's central handling.
export default {
 get:(url,config={})=>client.get(url,{...config,handleErrorsLocally:true}),
 post:(url,data,config={})=>client.post(url,data,{...config,handleErrorsLocally:true}),
 put:(url,data,config={})=>client.put(url,data,{...config,handleErrorsLocally:true}),
 patch:(url,data,config={})=>client.patch(url,data,{...config,handleErrorsLocally:true}),
}
