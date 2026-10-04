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

function TransactionTransferItem({
  transaction,
  highlightAsset
}: {
  transaction: WalletTransaction
  highlightAsset?: string
}) {
  const { open } = useModalStore()
  const { assetsQuery } = useWalletData()

  const assets = assetsQuery.data ?? []

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

  if (transaction.type !== 'transfer') return null

  const isIncoming = !!highlightAsset && transaction.to === highlightAsset

  const isOutgoing = !!highlightAsset && transaction.from === highlightAsset

  const amountColor = isIncoming
    ? 'green-500'
    : isOutgoing
      ? 'red-500'
      : 'blue-500'

  const amountSign = isIncoming ? '+' : isOutgoing ? '-' : ''

  return (
    <Flex align="center" gap="xl" justify="between" minWidth="0" width="100%">
      <Flex
        align="center"
        gap={{ base: 'sm', sm: 'md' }}
        minWidth="0"
        width="100%"
      >
        <Box
          p="md"
          r="md"
          style={{
            backgroundColor: 'rgba(59,130,246,0.2)',
            color: 'rgb(59,130,246)'
          }}
        >
          <Icon icon="tabler:transfer" size="1.5rem" />
        </Box>
        <Stack
          direction={{ base: 'column-reverse', sm: 'column' }}
          gap="none"
          minWidth="0"
          width="100%"
        >
          <Flex align="center" gap="sm" minWidth="0" width="100%">
            <Text truncate size="lg" weight="medium">
              Transfer from{' '}
              {assets.find(asset => asset.id === transaction.from)?.name ??
                'Unknown'}{' '}
              to{' '}
              {assets.find(asset => asset.id === transaction.to)?.name ??
                'Unknown'}
            </Text>
            {transaction.receipt && (
              <button onClick={handleViewReceipt}>
                <Icon color="muted" icon="tabler:file-text" />
              </button>
            )}
          </Flex>
          <Flex align="center" gap="sm">
            <Text
              color="muted"
              display={{ base: 'block', sm: 'none' }}
              size="sm"
              weight="medium"
            >
              {dayjs(transaction.date).format('DD MMM')}
            </Text>
            <Text
              color="muted"
              display={{ base: 'none', sm: 'block' }}
              size="sm"
              weight="medium"
            >
              {dayjs(transaction.date).format('MMM DD, YYYY')}
            </Text>
          </Flex>
        </Stack>
      </Flex>
      <Text color={amountColor} size="lg" weight="medium">
        {amountSign}
        {numberToCurrency(transaction.amount)}
      </Text>
    </Flex>
  )
}

export default TransactionTransferItem
