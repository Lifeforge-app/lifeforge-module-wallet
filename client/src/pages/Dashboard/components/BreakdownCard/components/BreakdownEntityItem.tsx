import { useContext, useMemo } from 'react'
import { Link } from 'react-router'

import { useModuleTranslation } from '@lifeforge/localization'
import { Box, Card, Flex, Icon, Stack, Text, surface } from '@lifeforge/ui'

import { useWalletStore } from '@/stores/useWalletStore'
import numberToCurrency from '@/utils/numberToCurrency'
import getDateRange from '@/utils/getDateRange'

import { type BreakdownEntity, type BreakdownGroupBy, BreakdownContext } from '..'

const PARAM_KEY: Record<BreakdownGroupBy, string> = {
  categories: 'category',
  assets: 'asset',
  platforms: 'platform',
  ledgers: 'ledger'
}

function BreakdownEntityItem({ entity }: { entity: BreakdownEntity }) {
  const { t } = useModuleTranslation()
  const { isAmountHidden } = useWalletStore()

  const { breakdown, type, groupBy, range, startDate, endDate } =
    useContext(BreakdownContext)

  const filterParams = useMemo(() => {
    const dates = getDateRange(
      range,
      startDate || undefined,
      endDate || undefined
    )

    const params = new URLSearchParams({
      type,
      [PARAM_KEY[groupBy]]: entity.id
    })

    if (dates.startDate) params.set('startDate', dates.startDate)

    if (dates.endDate) params.set('endDate', dates.endDate)

    return `?${params.toString()}`
  }, [range, startDate, endDate, type, groupBy, entity.id])

  return (
    <Card
      key={entity.id}
      as={Link}
      bg={surface.lightInteractive}
      direction="row"
      gap="lg"
      justify="between"
      minWidth="0"
      to={`/wallet/transactions${filterParams}`}
      width="100%"
    >
      <Flex align="center" gap="md" minWidth="0" width="100%">
        <Box
          p="sm"
          r="md"
          style={{
            backgroundColor: entity.color + '20',
            color: entity.color
          }}
        >
          <Icon icon={entity.icon} size="1.5rem" />
        </Box>
        <Stack gap="none" minWidth="0">
          <Text truncate weight="semibold">
            {entity.name}
          </Text>
          <Text color="muted" size="sm" whiteSpace="nowrap">
            {breakdown[entity.id]?.count} {t('transactionCount')}
          </Text>
        </Stack>
      </Flex>
      <Stack align="end" flexShrink="0" gap="none" width="min-content">
        <Flex align={isAmountHidden ? 'center' : 'end'} gap="sm">
          <Text
            color={type === 'income' ? 'green-500' : 'red-500'}
            weight="medium"
            whiteSpace="nowrap"
          >
            {type === 'income' ? '+' : '-'} RM{' '}
            {isAmountHidden ? (
              <Flex align="center" display="inline-flex">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Icon key={i} icon="uil:asterisk" size="1rem" />
                  ))}
              </Flex>
            ) : (
              numberToCurrency(breakdown[entity.id]?.amount)
            )}
          </Text>
        </Flex>
        <Text align="right" color="muted" size="sm">
          {breakdown[entity.id]?.percentage.toFixed(2)}%
        </Text>
      </Stack>
    </Card>
  )
}

export default BreakdownEntityItem
