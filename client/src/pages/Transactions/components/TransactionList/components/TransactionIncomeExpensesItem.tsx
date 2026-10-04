import dayjs from 'dayjs'
import { useCallback } from 'react'

import {
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  ViewImageModal,
  useModalStore
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { forgeAPI } from '@/manifest'
import numberToCurrency from '@/utils/numberToCurrency'

import type { WalletTransaction } from '../../..'

function TransactionIncomeExpensesItem({
  transaction
}: {
  transaction: WalletTransaction
}) {
  const { open } = useModalStore()

  const { categoriesQuery, ledgersQuery, assetsQuery, platformsQuery } =
    useWalletData()

  const categories = categoriesQuery.data ?? []

  const ledgers = ledgersQuery.data ?? []

  const assets = assetsQuery.data ?? []

  const platforms = platformsQuery.data ?? []

  const handleViewReceipt = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!transaction.receipt) return

      open(ViewImageModal, {
        src: forgeAPI.getMedia({
          key: transaction.receipt
        })
      })
    },
    [transaction]
  )

  if (transaction.type === 'transfer') return null

  const platform = platforms.find(p => p.id === transaction.platform)

  const category = categories.find(c => c.id === transaction.category)

  const asset = assets.find(a => a.id === transaction.asset)

  return (
    <Flex align="center" gap="xl" justify="between" minWidth="0" width="100%">
      <Flex align="center" flex="1" gap="md" minWidth="0" width="100%">
        <Box
          display={{ base: 'block', sm: 'none' }}
          height="3rem"
          r="full"
          style={{
            backgroundColor: category?.color ?? 'transparent'
          }}
          width="0.25rem"
        />
        <Box
          display={{ base: 'none', sm: 'block' }}
          p="md"
          r="md"
          style={{
            backgroundColor: category ? `${category.color}20` : 'transparent',
            color: category?.color
          }}
        >
          <Icon icon={category?.icon ?? 'tabler:category'} size="1.5rem" />
        </Box>
        <Stack
          direction={{ base: 'column-reverse', sm: 'column' }}
          gap="xs"
          minWidth="0"
        >
          <Flex align="center" gap="sm" minWidth="0">
            <Text truncate size="lg" weight="medium">
              {transaction.particulars}{' '}
              {transaction.location_name && (
                <>
                  <Text color="muted">@</Text> {transaction.location_name}
                </>
              )}
            </Text>
            {transaction.receipt && (
              <button onClick={handleViewReceipt}>
                <Icon
                  color={{ base: 'muted', print: 'zinc-500' }}
                  icon="tabler:file-text"
                />
              </button>
            )}
          </Flex>
          <Text asChild color="muted">
            <Flex align="center" gap="sm">
              <Text
                display={{ base: 'block', sm: 'none' }}
                size="sm"
                weight="medium"
              >
                {dayjs(transaction.date).format('DD MMM')}
              </Text>
              <Text
                display={{ base: 'none', sm: 'block' }}
                size="sm"
                weight="medium"
              >
                {dayjs(transaction.date).format('MMM DD, YYYY')}
              </Text>
              {asset && (
                <>
                  <Icon icon="tabler:circle-filled" size="0.25rem" />
                  <Flex align="center" gap="xs">
                    <Icon icon={asset.icon} size="1rem" />
                    <Text
                      color="muted"
                      display={{ base: 'none', md: 'block' }}
                      size="sm"
                      weight="medium"
                    >
                      {asset.name}
                    </Text>
                  </Flex>
                </>
              )}
              {transaction.ledgers.length > 0 && (
                <>
                  <Icon icon="tabler:circle-filled" size="0.25rem" />
                  <Text size="sm" weight="medium">
                    In
                  </Text>
                  <Flex align="center" gap="xs">
                    <Icon
                      icon={
                        ledgers.find(
                          ledger => ledger.id === transaction.ledgers[0]
                        )?.icon ?? ''
                      }
                      size="1rem"
                      style={{
                        color:
                          ledgers.find(
                            ledger => ledger.id === transaction.ledgers[0]
                          )?.color ?? 'white'
                      }}
                    />
                    <Text
                      color="muted"
                      display={{ base: 'none', md: 'block' }}
                      size="sm"
                      weight="medium"
                    >
                      {ledgers.find(
                        ledger => ledger.id === transaction.ledgers[0]
                      )?.name ?? 'Unknown'}
                    </Text>
                  </Flex>
                  {transaction.ledgers.length > 1 && (
                    <Text truncate size="sm" weight="medium">
                      + {transaction.ledgers.length - 1} more
                    </Text>
                  )}
                </>
              )}
              {platform && (
                <>
                  <Icon icon="tabler:circle-filled" size="0.25rem" />
                  <Flex align="center" gap="xs">
                    <Icon
                      icon={platform.icon}
                      size="1rem"
                      style={{ color: platform.color }}
                    />
                    <Text
                      color="muted"
                      display={{ base: 'none', md: 'block' }}
                      size="sm"
                      weight="medium"
                    >
                      {platform.name}
                    </Text>
                  </Flex>
                </>
              )}
            </Flex>
          </Text>
        </Stack>
      </Flex>
      <Text
        color={transaction.type === 'income' ? 'green-500' : 'red-500'}
        size="lg"
        weight="medium"
      >
        {transaction.type === 'income' ? '+' : '-'}
        {numberToCurrency(transaction.amount)}
      </Text>
    </Flex>
  )
}

export default TransactionIncomeExpensesItem
