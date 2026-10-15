import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { EmptyStateScreen, Stack, WithQuery } from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { forgeAPI } from '@/manifest'
import { useWalletRange } from '@/providers/RangeProvider'

import {
  type BreakdownGroupBy,
  BreakdownContext
} from '..'
import BreakdownChartLegend from './BreakdownChartLegend'
import BreakdownDetails from './BreakdownDetails'
import BreakdownDoughnutChart from './BreakdownDoughnutChart'
import BreakdownFilters from './BreakdownFilters'

const ASSET_PALETTE = [
  '#3b82f6',
  '#f97316',
  '#22c55e',
  '#a855f7',
  '#eab308',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#ec4899',
  '#14b8a6'
]

const FALLBACK_ICONS: Record<BreakdownGroupBy, string> = {
  assets: 'tabler:coin',
  categories: 'tabler:category',
  platforms: 'tabler:building-store',
  ledgers: 'tabler:book'
}

function BreakdownContent({
  selectedType,
  setSelectedType,
  selectedGroupBy,
  setSelectedGroupBy
}: {
  selectedType: 'income' | 'expenses'
  setSelectedType: (type: 'income' | 'expenses') => void
  selectedGroupBy: BreakdownGroupBy
  setSelectedGroupBy: (groupBy: BreakdownGroupBy) => void
}) {
  const { assetsQuery, categoriesQuery, platformsQuery, ledgersQuery } =
    useWalletData()

  const { range, startDate, endDate, queryInput } = useWalletRange()

  const breakdownQuery = useQuery(
    forgeAPI.analytics.getCategoriesBreakdown
      .input({ ...queryInput, groupBy: selectedGroupBy })
      .queryOptions()
  )

  const currentBreakdown = breakdownQuery.data?.[selectedType] ?? {}

  const sourceList = useMemo(() => {
    switch (selectedGroupBy) {
      case 'assets':
        return assetsQuery.data ?? []
      case 'platforms':
        return platformsQuery.data ?? []
      case 'ledgers':
        return ledgersQuery.data ?? []
      default:
        return categoriesQuery.data ?? []
    }
  }, [
    selectedGroupBy,
    assetsQuery.data,
    platformsQuery.data,
    ledgersQuery.data,
    categoriesQuery.data
  ])

  const entities = useMemo(
    () =>
      Object.keys(currentBreakdown).map((id, index) => {
        const source = sourceList.find(entity => entity.id === id)

        return {
          id,
          name: source?.name ?? id,
          icon: source?.icon ?? FALLBACK_ICONS[selectedGroupBy],
          color:
            (source && 'color' in source ? source.color : undefined) ??
            ASSET_PALETTE[index % ASSET_PALETTE.length] ??
            '#71717a'
        }
      }),
    [currentBreakdown, sourceList, selectedGroupBy]
  )

  const memoizedContextValue = useMemo(() => {
    return {
      breakdown: currentBreakdown,
      entities,
      type: selectedType,
      groupBy: selectedGroupBy,
      range,
      startDate,
      endDate
    }
  }, [
    currentBreakdown,
    entities,
    selectedType,
    selectedGroupBy,
    range,
    startDate,
    endDate
  ])

  return (
    <BreakdownContext value={memoizedContextValue}>
      <Stack centered flex="1" gap="lg" minHeight="0">
        <BreakdownFilters
          selectedGroupBy={selectedGroupBy}
          selectedType={selectedType}
          setSelectedGroupBy={setSelectedGroupBy}
          setSelectedType={setSelectedType}
        />
        <WithQuery query={breakdownQuery}>
          {data =>
            Object.keys(data[selectedType]).length === 0 ? (
              <EmptyStateScreen
                icon="tabler:wallet-off"
                message={{
                  id: 'transactions'
                }}
              />
            ) : (
              <>
                <BreakdownDoughnutChart />
                <BreakdownChartLegend />
                <BreakdownDetails />
              </>
            )
          }
        </WithQuery>
      </Stack>
    </BreakdownContext>
  )
}

export default BreakdownContent
