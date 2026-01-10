import {
  Button,
  EmptyStateScreen,
  FAB,
  ModuleHeader,
  WithQuery
} from 'lifeforge-ui'
import { useModalStore } from 'lifeforge-ui'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'shared'

import { useWalletData } from '@/hooks/useWalletData'

import '../../index.css'
import LedgerItem from './components/LedgerItem'
import ModifyLedgerModal from './modals/ModifyLedgerModal'

function Ledgers() {
  const { t } = useTranslation('apps.wallet')

  const { ledgersQuery } = useWalletData()

  const { hash } = useLocation()

  const { open } = useModalStore()

  const handleCreateLedger = () => {
    open(ModifyLedgerModal, {
      type: 'create'
    })
  }

  useEffect(() => {
    if (hash === '#new') {
      open(ModifyLedgerModal, {
        type: 'create'
      })
    }
  }, [hash])

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            className="hidden md:flex"
            icon="tabler:plus"
            tProps={{
              item: t('items.ledger')
            }}
            onClick={handleCreateLedger}
          >
            New
          </Button>
        }
        icon="tabler:book"
        namespace="apps.wallet"
        title="Ledgers"
        tKey="subsectionsTitleAndDesc"
      />
      <WithQuery query={ledgersQuery}>
        {ledgers => (
          <>
            {ledgers.length > 0 ? (
              <div className="mb-24 space-y-3 md:mb-6">
                {ledgers.map(ledger => (
                  <LedgerItem key={ledger.id} ledger={ledger} />
                ))}
              </div>
            ) : (
              <EmptyStateScreen
                icon="tabler:wallet-off"
                message={{
                  id: 'ledger',
                  namespace: 'apps.wallet'
                }}
              />
            )}
            <FAB visibilityBreakpoint="md" onClick={handleCreateLedger} />
          </>
        )}
      </WithQuery>
    </>
  )
}

export default Ledgers
