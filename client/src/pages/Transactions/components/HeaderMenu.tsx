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

  const handleManageCategories = useCallback(() => {
    open(ManageCategoriesModal, {})
  }, [])

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
        namespace="apps.lifeforge--wallet"
        onClick={handleManageCategories}
      />
      <ContextMenuItem
        icon="tabler:template"
        label="Manage Templates"
        namespace="apps.lifeforge--wallet"
        onClick={() => {
          open(ManageTemplatesModal, {})
        }}
      />
    </>
  )
}

export default HeaderMenu
