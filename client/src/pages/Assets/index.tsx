import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useLocation } from '@lifeforge/shared'
import {
  Button,
  ContextMenuItem,
  EmptyStateScreen,
  FAB,
  Grid,
  ModuleHeader,
  Widget,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { useWalletStore } from '@/stores/useWalletStore'

import '../../index.css'
import TotalBalance from './components/AssetAmount'
import AssetItem from './components/AssetItem'
import ModifyAssetModal from './modals/ModifyAssetModal'

function Assets() {
  const queryClient = useQueryClient()

  const { open } = useModalStore()

  const { t } = useTranslation('apps.wallet')

  const { assetsQuery } = useWalletData()

  const { isAmountHidden, toggleAmountVisibility } = useWalletStore()

  const { hash } = useLocation()

  const totalBalance = useMemo(() => {
    return (assetsQuery.data ?? []).reduce(
      (sum, asset) => sum + asset.current_balance,
      0
    )
  }, [assetsQuery.data])

  const handleCreateCategory = useCallback(() => {
    open(ModifyAssetModal, {
      type: 'create'
    })
  }, [])

  useEffect(() => {
    if (hash === '#new') {
      handleCreateCategory()
    }
  }, [hash])

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            display={{ base: 'none', sm: 'flex' }}
            icon="tabler:plus"
            tProps={{
              item: t('items.asset')
            }}
            onClick={handleCreateCategory}
          >
            new
          </Button>
        }
        contextMenuProps={{
          children: (
            <>
              <ContextMenuItem
                icon="tabler:refresh"
                label="Refresh"
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: ['wallet', 'assets']
                  })
                  assetsQuery.refetch()
                }}
              />
              <ContextMenuItem
                checked={isAmountHidden}
                icon="tabler:eye-off"
                label="Hide Amount"
                namespace="apps.wallet"
                onClick={() => {
                  toggleAmountVisibility()
                }}
              />
            </>
          ),
          styles: { menu: { minWidth: '15rem' } }
        }}
        icon="tabler:wallet"
        namespace="apps.wallet"
        title="Assets"
        tKey="subsectionsTitleAndDesc"
      />
      <WithQuery query={assetsQuery}>
        {assets => (
          <>
            <Widget
              actionComponent={
                <TotalBalance
                  amount={totalBalance}
                  display={{ base: 'none', sm: 'flex' }}
                />
              }
              icon="tabler:currency-dollar"
              mb="lg"
              namespace="apps.wallet"
              title="Total Assets"
            >
              <TotalBalance amount={totalBalance} display={{ sm: 'none' }} />
            </Widget>
            {assets.length > 0 ? (
              <Grid gap="md" mb="2xl" templateCols={{ base: 1, md: 2, lg: 3 }}>
                {assets.map(asset => (
                  <AssetItem key={asset.id} asset={asset} />
                ))}
              </Grid>
            ) : (
              <EmptyStateScreen
                icon="tabler:wallet-off"
                message={{
                  id: 'assets',
                  namespace: 'apps.wallet'
                }}
              />
            )}
            <FAB icon="tabler:plus" onClick={handleCreateCategory} />
          </>
        )}
      </WithQuery>
    </>
  )
}

export default Assets
