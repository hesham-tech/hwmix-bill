import { afterEach, describe, expect, it, vi } from 'vitest'
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
const { remove }=vi.hoisted(()=>({remove:vi.fn()}))
vi.mock('@imgly/background-removal',()=>({removeBackground:remove}))
afterEach(()=>{vi.unstubAllGlobals();remove.mockReset()})
describe('background removal configuration boundary',()=>{
  it('does not forward caller collections into the dependency schema',async()=>{
    remove.mockResolvedValue(new Blob(['fixture'],{type:'image/png'}))
    vi.stubGlobal('URL',class extends URL {static createObjectURL(){return 'blob:fixture'}})
    const huge=Array(10000).fill({unexpected:true})
    const result=await useBackgroundRemoval().removeBackground(new File(['fixture'],'fixture.png'),{model:huge,quality:huge,output:huge,fetchArgs:huge})
    expect(result).not.toBeNull()
    const config=remove.mock.calls[0][1]
    expect(config.model).toBe('medium')
    expect(config.output).toEqual({format:'image/png',quality:0.9})
    expect(config).not.toHaveProperty('fetchArgs')
    expect(Object.values(config).some(Array.isArray)).toBe(false)
  })
})
