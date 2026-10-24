import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router'

import type { InferOutput } from '@lifeforge/api'
import {
  ContentWrapperWithSidebar,
  ContextMenu,
  ContextMenuItem,
  EmptyStateScreen,
  LayoutWithSidebar,
  ModuleHeader,
  Pagination,
  Scrollbar,
  SearchInput,
  Stack,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'
import useTransactionsQuery from '@/hooks/useTransactionsQuery'
import { forgeAPI } from '@/manifest'

import InnerHeader from './components/InnerHeader'
import Sidebar from './components/Sidebar'
import TransactionCreationMenu from './components/TransactionCreationMenu'
import TransactionGroup from './components/TransactionGroup'
import ChooseTemplateModal from './modals/ChooseTemplateModal'
import ModifyTransactionsModal from './modals/ModifyTransactionsModal'
import NaturalLanguageModal from './modals/NaturalLanguageModal'
import ScanReceiptModal from './modals/ScanReceiptModal'

export type WalletTransaction = InferOutput<
  typeof forgeAPI.transactions.list
>['groups'][number]['items'][number]

export type WalletCategory = InferOutput<
  typeof forgeAPI.categories.list
>[number]

function Transactions() {
  const { hash } = useLocation()
  const { open } = useModalStore()
  const transactionsQuery = useTransactionsQuery()
  const { page, setPage, asset, searchQuery, setSearchQuery } = useFilter()
  const queryClient = useQueryClient()

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: forgeAPI.transactions.key
    })
  }, [queryClient])

  useEffect(() => {
    const modals = {
      '#new': () => open(ModifyTransactionsModal, { type: 'create' }),
      '#template': () => open(ChooseTemplateModal, {}),
      '#scan': () => open(ScanReceiptModal, {}),
      '#ai': () => open(NaturalLanguageModal, {})
    } as const

    if (!Object.keys(modals).includes(hash)) return

    modals[hash as keyof typeof modals]()
  }, [hash])

  return (
    <>
      <ModuleHeader
        icon="tabler:arrows-exchange"
        title="Transactions"
        trailing={
          <>
            <TransactionCreationMenu variant="desktop" />
            <ContextMenu
              componentProps={{
                menu: { minWidth: '16rem' }
              }}
            >
              <ContextMenuItem
                icon="tabler:refresh"
                label="Refresh"
                onClick={handleRefresh}
              />
            </ContextMenu>
          </>
        }
      />
      <LayoutWithSidebar>
        <Sidebar />
        <ContentWrapperWithSidebar>
          <InnerHeader />
          <SearchInput
            debounceMs={300}
            mt="md"
            searchTarget="transaction"
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <Stack gap="md" height="100%" my="lg" width="100%">
            <WithQuery query={transactionsQuery}>
              {transactions =>
                transactions.groups.length > 0 ? (
                  <>
                    <Pagination
                      page={page}
                      totalPages={transactions.totalPages}
                      onPageChange={setPage}
                    />
                    <Scrollbar>
                      <Stack gap="xl" mb={{ base: '2xl', md: 'none' }}>
                        {transactions.groups.map(group => (
                          <TransactionGroup
                            key={group.date}
                            group={group}
                            highlightAsset={asset}
                          />
                        ))}
                      </Stack>
                    </Scrollbar>
                  </>
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
