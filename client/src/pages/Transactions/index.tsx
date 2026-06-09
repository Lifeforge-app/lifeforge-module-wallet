import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import type { InferOutput } from '@lifeforge/api'
import {
  ContentWrapperWithSidebar,
  EmptyStateScreen,
  LayoutWithSidebar,
  ModuleHeader,
  Stack,
  WithQuery
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import { useWalletStore } from '@/stores/useWalletStore'

import HeaderMenu from './components/HeaderMenu'
import InnerHeader from './components/InnerHeader'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import TransactionCreationMenu from './components/TransactionCreationMenu'
import TransactionList from './components/TransactionList'

export type WalletTransaction = InferOutput<
  typeof forgeAPI.transactions.list
>[number]

export type WalletCategory = InferOutput<
  typeof forgeAPI.categories.list
>[number]

function Transactions() {
  // TODO: Migrate to nuqs
  const {
    setSelectedType,
    setSelectedLedger,
    setSelectedAsset,
    setSelectedCategory,
    setSearchQuery
  } = useWalletStore()

  const navigate = useNavigate()

  const transactionsQuery = useQuery(forgeAPI.transactions.list.queryOptions())

  const [searchParams] = useSearchParams()

  useEffect(() => {
    const query = searchParams.get('query')

    const type = searchParams.get('type')

    const ledger = searchParams.get('ledger')

    const asset = searchParams.get('asset')

    const category = searchParams.get('category')

    if (query) {
      setSearchQuery(query)
    }

    if (type && ['income', 'expenses', 'transfer'].includes(type)) {
      setSelectedType(type as WalletTransaction['type'])
    }

    if (ledger) {
      setSelectedLedger(ledger)
    }

    if (asset) {
      setSelectedAsset(asset)
    }

    if (category) {
      setSelectedCategory(category)
    }

    navigate('/wallet/transactions', {
      replace: true
    })
  }, [searchParams])

  return (
    <>
      <ModuleHeader
        actionButton={<TransactionCreationMenu variant="desktop" />}
        contextMenuProps={{
          children: <HeaderMenu />,
          styles: {
            menu: { minWidth: '15rem' }
          }
        }}
        icon="tabler:arrows-exchange"
        namespace="apps.lifeforge--wallet"
        title="Transactions"
        tKey="subsectionsTitleAndDesc"
      />
      <LayoutWithSidebar>
        <Sidebar />
        <ContentWrapperWithSidebar>
          <InnerHeader />
          <SearchBar />
          <Stack gap="md" height="100%" my="lg" width="100%">
            <WithQuery query={transactionsQuery}>
              {transactions =>
                transactions.length > 0 ? (
                  <TransactionList />
                ) : (
                  <EmptyStateScreen
                    icon="tabler:wallet-off"
                    message={{
                      id: 'transactions',
                      namespace: 'apps.lifeforge--wallet'
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
