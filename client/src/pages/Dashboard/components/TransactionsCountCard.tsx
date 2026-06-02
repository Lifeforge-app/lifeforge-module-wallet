import { useTranslation } from 'react-i18next'

import { Link } from '@lifeforge/shared'
import {
  Box,
  Card,
  Flex,
  Icon,
  Scrollbar,
  Stack,
  Text,
  Widget,
  surface
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { useWalletStore } from '@/stores/useWalletStore'

import numberToCurrency from '../../../utils/numberToCurrency'

function TransactionsCountCard() {
  const { typesCountQuery } = useWalletData()

  const { isAmountHidden } = useWalletStore()

  const { t } = useTranslation('apps.wallet')

  const typesCount = typesCountQuery.data ?? {}

  return (
    <Widget
      actionComponent={
        <Link
          className="text-bg-500 hover:bg-bg-100 hover:text-bg-800 dark:hover:bg-bg-700/30 dark:hover:text-bg-50 flex items-center gap-2 rounded-lg p-2 transition-all"
          to="./transactions"
        >
          <Icon icon="tabler:chevron-right" />
        </Link>
      }
      className="col-span-1 row-span-1 min-h-96 xl:min-h-0"
      icon="tabler:arrows-exchange"
      namespace="apps.wallet"
      title="Transactions Count"
    >
      <Scrollbar>
        <Stack as="ul" gap="sm">
          {(
            [
              ['income', 'green-500'],
              ['expenses', 'red-500'],
              ['transfer', 'blue-500']
            ] as const
          ).map(([type, color]) => (
            <Card
              key={type}
              as={Link}
              bg={surface.lightInteractive}
              direction={{ base: 'column', sm: 'row' }}
              gap="md"
              to={`/wallet/transactions?type=${type}`}
              width="100%"
            >
              <Flex align="center" gap="md" width="100%">
                <Box bg={color} height="1rem" r="full" width="1rem" />
                <Stack gap="none">
                  <Text weight="semibold">{t(`transactionTypes.${type}`)}</Text>
                  <Text color="muted" size="sm">
                    {typesCount[type]?.transactionCount || 0}{' '}
                    {t('transactionCount')}
                  </Text>
                </Stack>
              </Flex>
              <Flex
                align="end"
                direction={{ base: 'row', sm: 'column' }}
                justify="between"
                width={{ base: '100%', sm: 'auto' }}
              >
                <Flex asChild gap="sm" justify="end">
                  <Text weight="medium" wrap="nowrap">
                    {{
                      income: '+',
                      expenses: '-',
                      transfer: ' '
                    }[type] || ''}{' '}
                    RM{' '}
                    {isAmountHidden ? (
                      <Flex asChild align="center">
                        <Text>
                          {Array(4)
                            .fill(0)
                            .map((_, i) => (
                              <Icon key={i} icon="uil:asterisk" size="1rem" />
                            ))}
                        </Text>
                      </Flex>
                    ) : (
                      numberToCurrency(typesCount[type]?.accumulatedAmount)
                    )}
                  </Text>
                </Flex>
                <Text align="right" as="p" color="muted" size="sm">
                  {(
                    (typesCount[type]?.accumulatedAmount /
                      Object.values(typesCount).reduce(
                        (acc, curr) => acc + curr.accumulatedAmount,
                        0
                      )) *
                      100 || 0
                  ).toFixed(2)}
                  %
                </Text>
              </Flex>
            </Card>
          ))}
        </Stack>
      </Scrollbar>
    </Widget>
  )
}

export default TransactionsCountCard
