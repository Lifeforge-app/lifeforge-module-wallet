import { useMemo } from 'react'
import { useModuleTranslation } from '@lifeforge/localization'
import { useNavigate } from 'react-router'

import { SidebarTitle, WithQuery } from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { useWalletStore } from '@/stores/useWalletStore'

import LedgerSectionItem from './LedgerSectionItem'

function LedgerSection() {
  const { t } = useModuleTranslation()

  const navigate = useNavigate()

  const { ledgersQuery } = useWalletData()

  const { selectedLedger } = useWalletStore()

  const ledgers = useMemo(
    () =>
      [
        {
          icon: 'tabler:book',
          name: t('sidebar.allLedgers'),
          color: 'white',
          id: null,
          amount: undefined
        }
      ].concat(ledgersQuery.data ?? ([] as any)),
    [ledgersQuery.data, selectedLedger, t]
  )

  return (
    <>
      <SidebarTitle
        actionButton={{
          icon: 'tabler:plus',
          onClick: () => {
            navigate('/wallet/ledgers#new')
          }
        }}
        label={t('sidebar.ledgers')}
      />
      <WithQuery query={ledgersQuery}>
        {() => (
          <>
            {ledgers.map(({ icon, name, color, id, amount }) => (
              <LedgerSectionItem
                key={id}
                amount={amount}
                color={color}
                icon={icon}
                id={id}
                label={name}
              />
            ))}
          </>
        )}
      </WithQuery>
    </>
  )
}

export default LedgerSection
