import { useWalletData } from '@/hooks/useWalletData'
import { SidebarTitle } from 'lifeforge-ui'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'shared'

import AssetsSectionItem from './AssetsSectionItem'

function AssetsSection() {
  const { t } = useTranslation('apps.wallet')

  const { assetsQuery } = useWalletData()

  const navigate = useNavigate()

  const handleActionButtonClick = useCallback(() => {
    navigate('/wallet/assets#new')
  }, [navigate])

  const ITEMS = useMemo(
    () =>
      [
        {
          icon: 'tabler:coin',
          name: t('sidebar.allAssets'),
          color: 'white',
          id: null,
          amount: undefined
        }
      ].concat(assetsQuery.data ?? ([] as any)),
    [assetsQuery.data, t]
  )

  return (
    <>
      <SidebarTitle
        actionButton={{
          icon: 'tabler:plus',
          onClick: handleActionButtonClick
        }}
        label={t('sidebar.assets')}
      />
      {ITEMS.map(({ icon, name, id, amount }) => (
        <AssetsSectionItem
          key={id}
          amount={amount}
          icon={icon}
          id={id}
          label={name}
        />
      ))}
    </>
  )
}

export default AssetsSection
