import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { ContextMenuItem, useModalStore } from '@lifeforge/ui'

import ManageCategoriesModal from '../modals/ManageCategoriesModal'
import ManageTemplatesModal from '../modals/ManageTemplatesModal'

function HeaderMenu() {
  const { open } = useModalStore()
  const queryClient = useQueryClient()

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['wallet', 'transactions']
    })
  }, [queryClient])

  return (
    <>
      <ContextMenuItem
        icon="tabler:refresh"
        label="Refresh"
        onClick={handleRefresh}
      />
      <ContextMenuItem
        icon="tabler:apps"
        label="Manage Categories"
        onClick={() => open(ManageCategoriesModal, {})}
      />
      <ContextMenuItem
        icon="tabler:template"
        label="Manage Templates"
        onClick={() => open(ManageTemplatesModal, {})}
      />
    </>
  )
}

export default HeaderMenu
