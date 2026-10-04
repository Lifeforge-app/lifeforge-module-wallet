import { useEffect } from 'react'
import { useLocation } from 'react-router'

import type { InferOutput } from '@lifeforge/api'
import {
  ContentWrapperWithSidebar,
  EmptyStateScreen,
  LayoutWithSidebar,
  ModuleHeader,
  Stack,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import useTransactionsQuery from '@/hooks/useTransactionsQuery'
import { forgeAPI } from '@/manifest'

import HeaderMenu from './components/HeaderMenu'
import InnerHeader from './components/InnerHeader'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import TransactionCreationMenu from './components/TransactionCreationMenu'
import TransactionList from './components/TransactionList'
import ManageTemplatesModal from './modals/ManageTemplatesModal'
import ModifyTransactionsModal from './modals/ModifyTransactionsModal'
import NaturalLanguageModal from './modals/NaturalLanguageModal'
import ScanReceiptModal from './modals/ScanReceiptModal'

export type WalletTransaction = InferOutput<
  typeof forgeAPI.transactions.list
>['items'][number]

export type WalletCategory = InferOutput<
  typeof forgeAPI.categories.list
>[number]

function Transactions() {
  const { hash } = useLocation()
  const { open } = useModalStore()
  const transactionsQuery = useTransactionsQuery()

  useEffect(() => {
    if (hash === '#new') {
      open(ModifyTransactionsModal, { type: 'create' })
    }

    if (hash === '#template') {
      open(ManageTemplatesModal, { choosing: true })
    }

    if (hash === '#scan') {
      open(ScanReceiptModal, {})
    }

    if (hash === '#ai') {
      open(NaturalLanguageModal, {})
    }
  }, [hash])

  return (
    <>
      <ModuleHeader
        icon="tabler:arrows-exchange"
        title="Transactions"
        trailing={
          <>
            <TransactionCreationMenu variant="desktop" />
            <HeaderMenu />
          </>
        }
      />
      <LayoutWithSidebar>
        <Sidebar />
        <ContentWrapperWithSidebar>
          <InnerHeader />
          <SearchBar />
          <Stack gap="md" height="100%" my="lg" width="100%">
            <WithQuery query={transactionsQuery}>
              {transactions =>
                transactions.items.length > 0 ? (
                  <TransactionList />
                ) : (
                  <EmptyStateScreen
                    icon="tabler:wallet-off"
                    message={{
                      id: 'transactions'
                    }}
                  />
                )
              }
            </WithQuery>
            <TransactionCreationMenu variant="mobile" />
          </Stack>
        </ContentWrapperWithSidebar>
      </LayoutWithSidebar>
    </>
  )
}

export default Transactions
