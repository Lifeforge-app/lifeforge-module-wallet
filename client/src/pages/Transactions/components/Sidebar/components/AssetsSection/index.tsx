import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'

import { useModuleTranslation } from '@lifeforge/localization'
import { SidebarTitle } from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'

import AssetsSectionItem from './AssetsSectionItem'

type AssetsSectionEntry = {
  icon: string
  name: string
  id: string | null
  current_balance: number
  filterKey?: 'asset' | 'inactiveAssets'
}

function AssetsSection() {
  const { t } = useModuleTranslation()
  const { assetsQuery } = useWalletData()
  const navigate = useNavigate()

  const handleActionButtonClick = useCallback(() => {
    navigate('/wallet/assets#new')
  }, [navigate])

  const ITEMS = useMemo<AssetsSectionEntry[]>(() => {
    const assets = assetsQuery.data ?? []

    const inactiveAssets = assets.filter(asset => asset.is_inactive)

    const items: AssetsSectionEntry[] = [
      {
        icon: 'tabler:coin',
        name: 'allAssets',
        id: null,
        current_balance: 0
      },
      ...assets
        .filter(asset => !asset.is_inactive)
        .map(asset => ({
          icon: asset.icon,
          name: asset.name,
          id: asset.id,
          current_balance: asset.current_balance
        }))
    ]

    if (inactiveAssets.length > 0) {
      items.push({
        icon: 'tabler:archive',
        name: t('labels.inactiveAssets'),
        id: 'true',
        filterKey: 'inactiveAssets',
        current_balance: inactiveAssets.reduce(
          (sum, asset) => sum + asset.current_balance,
          0
        )
      })
    }

    return items
  }, [assetsQuery.data, t])

  return (
    <>
      <SidebarTitle
        actionButton={{
          icon: 'tabler:plus',
          onClick: handleActionButtonClick
        }}
        label="assets"
      />
      {ITEMS.map(({ icon, name, id, current_balance, filterKey }) => (
        <AssetsSectionItem
          key={id}
          amount={current_balance}
          filterKey={filterKey}
          icon={icon}
          id={id}
          label={name}
        />
      ))}
    </>
  )
}

export default AssetsSection
