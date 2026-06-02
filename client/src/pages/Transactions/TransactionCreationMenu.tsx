import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useLocation } from '@lifeforge/shared'
import {
  Button,
  ContextMenu,
  ContextMenuItem,
  FAB,
  useModalStore
} from '@lifeforge/ui'

import ManageTemplatesModal from './modals/ManageTemplatesModal'
import ModifyTransactionsModal from './modals/ModifyTransactionsModal'
import ScanReceiptModal from './modals/ScanReceiptModal'

function TransactionCreationMenu({
  variant
}: {
  variant: 'desktop' | 'mobile'
}) {
  const { open } = useModalStore()

  const { t } = useTranslation('apps.wallet')

  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#new') {
      open(ModifyTransactionsModal, { type: 'create' })
    }

    if (hash === '#scan') {
      open(ScanReceiptModal, {})
    }
  }, [hash])

  const items = (
    <>
      <ContextMenuItem
        icon="tabler:plus"
        label="Add Manually"
        namespace="apps.wallet"
        onClick={() => open(ModifyTransactionsModal, { type: 'create' })}
      />
      <ContextMenuItem
        icon="tabler:template"
        label="From Template"
        namespace="apps.wallet"
        onClick={() => open(ManageTemplatesModal, { choosing: true })}
      />
      <ContextMenuItem
        icon="tabler:scan"
        label="Scan Receipt"
        namespace="apps.wallet"
        onClick={() => open(ScanReceiptModal, {})}
      />
    </>
  )

  if (variant === 'desktop') {
    return (
      <ContextMenu
        buttonComponent={
          <Button
            display={{ base: 'none', md: 'flex' }}
            icon="tabler:plus"
            tProps={{ item: t('items.transaction') }}
            onClick={() => {}}
          >
            new
          </Button>
        }
      >
        {items}
      </ContextMenu>
    )
  }

  return (
    <ContextMenu
      buttonComponent={<FAB visibilityBreakpoint="md" />}
      styles={{
        wrapper: {
          position: 'fixed',
          right: '1.5rem',
          bottom: '1.5rem',
          width: 'min-content'
        }
      }}
    >
      {items}
    </ContextMenu>
  )
}

export default TransactionCreationMenu
