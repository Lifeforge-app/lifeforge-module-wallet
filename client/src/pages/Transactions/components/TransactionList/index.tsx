import { EmptyStateScreen, Pagination, Scrollbar, Stack } from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'
import useTransactionsQuery from '@/hooks/useTransactionsQuery'

import TransactionItem from './components/TransactionItem'

function TransactionList() {
  const transactionsQuery = useTransactionsQuery()
  const { page, setPage, asset } = useFilter()

  const transactions = transactionsQuery.data?.items ?? []

  if (transactions.length === 0) {
    return (
      <EmptyStateScreen
        icon="tabler:filter-off"
        message={{
          id: 'results'
        }}
      />
    )
  }

  return (
    <>
      <Pagination
        page={page}
        totalPages={transactionsQuery.data?.totalPages ?? 1}
        onPageChange={setPage}
      />
      <Scrollbar>
        <Stack>
          {transactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              highlightAsset={asset}
              transaction={transaction}
            />
          ))}
        </Stack>
      </Scrollbar>
    </>
  )
}

export default TransactionList
