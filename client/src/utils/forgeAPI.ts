import { createForgeProxy } from '@lifeforge/shared'

import contract from '@/contract'

const API_HOST = import.meta.env.VITE_API_HOST || (window as any).VITE_API_HOST

if (!API_HOST) {
  throw new Error('VITE_API_HOST is not defined')
}

const forgeAPI = createForgeProxy(
  contract,
  API_HOST,
  'wallet'
)

export default forgeAPI
