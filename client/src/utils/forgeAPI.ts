import { createForgeProxy } from '@lifeforge/shared'

import contract from '@/contract'

if (!import.meta.env.VITE_API_HOST) {
  throw new Error('VITE_API_HOST is not defined')
}

const forgeAPI = createForgeProxy(
  contract,
  import.meta.env.VITE_API_HOST,
  'wallet'
)

export default forgeAPI
