import apiClient from '@/api/axios.config'
const config=options=>({ ...options, handleErrorsLocally: true })
export default {
  get:(url,options)=>apiClient.get(url,config(options)),
  post:(url,data,options)=>apiClient.post(url,data,config(options)),
  put:(url,data,options)=>apiClient.put(url,data,config(options)),
  patch:(url,data,options)=>apiClient.patch(url,data,config(options)),
  delete:(url,options)=>apiClient.delete(url,config(options)),
}
