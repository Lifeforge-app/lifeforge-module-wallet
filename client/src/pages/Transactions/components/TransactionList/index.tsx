import dayjs from 'dayjs'
import { useMemo } from 'react'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  EmptyStateScreen,
  Flex,
  Pagination,
  Scrollbar,
  Stack,
  Text
} from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'
import useTransactionsQuery from '@/hooks/useTransactionsQuery'

import TransactionItem from './components/TransactionItem'

function TransactionList() {
  const { t } = useModuleTranslation()
  const transactionsQuery = useTransactionsQuery()
  const { page, setPage, asset } = useFilter()

  const transactions = transactionsQuery.data?.items ?? []

  const groups = useMemo(() => {
    const today = dayjs().startOf('day')
    const yesterday = today.subtract(1, 'day')

    return transactions.reduce<
      { key: string; label: string; items: typeof transactions }[]
    >((acc, transaction) => {
      const date = dayjs(transaction.date)
      const key = date.format('YYYY-MM-DD')

      let group = acc[acc.length - 1]

      if (!group || group.key !== key) {
        group = {
          key,
          label: date.isSame(today, 'day')
            ? t('transactionGroups.today')
            : date.isSame(yesterday, 'day')
              ? t('transactionGroups.yesterday')
              : date.format('MMM DD, YYYY'),
          items: []
        }
        acc.push(group)
      }

      group.items.push(transaction)

      return acc
    }, [])
  }, [transactions, t])

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
        <Stack gap="xl">
          {groups.map(group => (
            <Stack key={group.key} gap="sm">
              <Flex align="center" gap="sm">
                <Box bg="primary" height="1.25rem" r="full" width="0.25rem" />
                <Text
                  color="muted"
                  size="sm"
                  tracking="wide"
                  weight="semibold"
                >
                  {group.label}
                </Text>
              </Flex>
              <Stack gap="sm">
                {group.items.map(transaction => (
                  <TransactionItem
                    key={transaction.id}
                    highlightAsset={asset}
                    transaction={transaction}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Scrollbar>
    </>
  )
}

export default TransactionList
