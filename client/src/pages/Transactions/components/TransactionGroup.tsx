import dayjs from 'dayjs'

import type { InferOutput } from '@lifeforge/api'
import { useModuleTranslation } from '@lifeforge/localization'
import { Box, Flex, Stack, Text } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import TransactionItem from './TransactionItem'

type WalletTransactionGroup = InferOutput<
  typeof forgeAPI.transactions.list
>['groups'][number]

function TransactionGroup({
  group,
  highlightAsset
}: {
  group: WalletTransactionGroup
  highlightAsset?: string
}) {
  const { t } = useModuleTranslation()

  const today = dayjs().startOf('day')
  const yesterday = today.subtract(1, 'day')

  const getGroupLabel = (date: string) => {
    const groupDate = dayjs(date)

    if (groupDate.isSame(today, 'day')) {
      return t('transactionGroups.today')
    }

    if (groupDate.isSame(yesterday, 'day')) {
      return t('transactionGroups.yesterday')
    }

    return groupDate.format('MMM DD, YYYY')
  }

  return (
    <Stack gap="sm">
      <Flex align="center" gap="sm">
        <Box bg="primary" height="1.25rem" r="full" width="0.25rem" />
        <Text color="muted" size="sm" tracking="wide" weight="semibold">
          {getGroupLabel(group.date)}
        </Text>
      </Flex>
      <Stack gap="sm">
        {group.items.map(transaction => (
          <TransactionItem
            key={transaction.id}
            highlightAsset={highlightAsset}
            transaction={transaction}
          />
        ))}
      </Stack>
    </Stack>
  )
}

export default TransactionGroup
