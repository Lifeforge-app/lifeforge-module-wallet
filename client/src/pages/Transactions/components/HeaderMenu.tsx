import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { ContextMenu, ContextMenuItem } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

function HeaderMenu() {
  const queryClient = useQueryClient()

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: forgeAPI.transactions.key
    })
  }, [queryClient])

  return (
    <ContextMenu
      componentProps={{
        menu: { minWidth: '16rem' }
      }}
    >
      <ContextMenuItem
        icon="tabler:refresh"
        label="Refresh"
        onClick={handleRefresh}
      />
    </ContextMenu>
  )
}

export default HeaderMenu
