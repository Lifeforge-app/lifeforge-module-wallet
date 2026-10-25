import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  ContextMenu,
  ContextMenuItem,
  ModuleHeader,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import { useWalletStore } from '@/stores/useWalletStore'

import InactiveAssetsModal from '../modals/InactiveAssetsModal'

function AssetsHeader({
  rangeMode,
  onCreate
}: {
  rangeMode: 'week' | 'month' | 'quarter' | 'year' | 'all'
  onCreate: () => void
}) {
  const queryClient = useQueryClient()
  const { open } = useModalStore()
  const { t } = useModuleTranslation()
  const assetsQuery = useQuery(forgeAPI.assets.list.queryOptions())
  const { isAmountHidden, toggleAmountVisibility } = useWalletStore()

  return (
    <ModuleHeader
      icon="tabler:wallet"
      title="Assets"
      trailing={
        <>
          <Button
            display={{ base: 'none', sm: 'flex' }}
            icon="tabler:plus"
            tProps={{
              item: t('items.asset')
            }}
            onClick={onCreate}
          >
            new
          </Button>
          <ContextMenu
            componentProps={{
              menu: { minWidth: '15rem' }
            }}
          >
            <ContextMenuItem
              icon="tabler:archive"
              label={t('labels.inactiveAssets')}
              namespace={false}
              onClick={() => {
                open(InactiveAssetsModal, {
                  rangeMode
                })
              }}
            />
            <ContextMenuItem
              icon="tabler:refresh"
              label="Refresh"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: forgeAPI.assets.key
                })
                assetsQuery.refetch()
              }}
            />
            <ContextMenuItem
              checked={isAmountHidden}
              icon="tabler:eye-off"
              label="Hide Amount"
              onClick={() => {
                toggleAmountVisibility()
              }}
            />
          </ContextMenu>
        </>
      }
    />
  )
}

export default AssetsHeader
