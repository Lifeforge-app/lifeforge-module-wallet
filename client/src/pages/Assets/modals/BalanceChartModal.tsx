import type { WalletAsset } from '@/hooks/useWalletData'
import forgeAPI from '@/utils/forgeAPI'
import getChartScale from '@/utils/getChartScale'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import {
  Card,
  DateInput,
  EmptyStateScreen,
  ListboxInput,
  ListboxOption,
  ModalHeader,
  WithQuery
} from 'lifeforge-ui'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { usePersonalization } from 'shared'

import numberToCurrency from '../../../utils/numberToCurrency'

const RANGE_MODE = [
  'week',
  'month',
  'quarter',
  'year',
  'all',
  'custom'
] as const

function BalanceChartModal({
  data: { initialData },
  onClose
}: {
  data: {
    initialData: WalletAsset
  }
  onClose: () => void
}) {
  const { t } = useTranslation('apps.wallet')

  const { derivedThemeColor } = usePersonalization()

  const [rangeMode, setRangeMode] =
    useState<(typeof RANGE_MODE)[number]>('month')

  const [startDate, setStartDate] = useState<Date | null>(
    dayjs().subtract(1, 'month').toDate()
  )

  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const assetBalanceQuery = useQuery(
    forgeAPI.wallet.assets.getAssetAccumulatedBalance
      .input({
        id: initialData.id,
        rangeMode: rangeMode,
        startDate:
          rangeMode === 'custom'
            ? dayjs(startDate).format('YYYY-MM-DD')
            : undefined,
        endDate:
          rangeMode === 'custom'
            ? dayjs(endDate).format('YYYY-MM-DD')
            : undefined
      })
      .queryOptions()
  )

  const chartData = useMemo(() => {
    if (!assetBalanceQuery.data) return []

    const sortedEntries = Object.entries(assetBalanceQuery.data).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    )

    // Check if data spans multiple years
    const years = new Set(
      sortedEntries.map(([date]) => new Date(date).getFullYear())
    )

    const includeYear = years.size > 1

    return sortedEntries.map(([date, balance]) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(includeYear && { year: '2-digit' })
      }),
      balance
    }))
  }, [assetBalanceQuery.data])

  const chartScale = useMemo(
    () => getChartScale(chartData.map(d => d.balance)),
    [chartData]
  )

  const chartDomain = useMemo(() => {
    if (chartScale === 'log') {
      // Log scale can't start from 0, use the minimum value or 1
      const minValue = Math.min(...chartData.map(d => d.balance))

      return [Math.max(minValue * 0.9, 1), 'auto'] as [number, 'auto']
    }

    return [0, 'auto'] as [number, 'auto']
  }, [chartScale, chartData])

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean
    payload?: Array<{
      value: number
      payload: { date: string; balance: number }
    }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-bg-200 dark:border-bg-700/50 border">
          <p className="text-bg-500 mb-1.5 font-medium">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-bg-500">Balance:</span>
            <span className="text-lg font-semibold">
              RM {numberToCurrency(payload[0].value)}
            </span>
          </div>
        </Card>
      )
    }

    return null
  }

  return (
    <div className="min-w-[50vw]">
      <ModalHeader
        appendTitle={
          <p className="hidden truncate sm:block"> - {initialData.name}</p>
        }
        icon="tabler:chart-line"
        namespace="apps.wallet"
        title="assetsBalanceChart"
        onClose={onClose}
      />
      <div className="mb-6 space-y-4">
        <ListboxInput
          buttonContent={<span>{t(`rangeModes.${rangeMode}`)}</span>}
          icon="tabler:history"
          label="range mode"
          namespace="apps.wallet"
          value={rangeMode}
          onChange={setRangeMode}
        >
          {RANGE_MODE.map(mode => (
            <ListboxOption
              key={mode}
              label={t(`rangeModes.${mode}`)}
              value={mode}
            />
          ))}
        </ListboxInput>
        {rangeMode === 'custom' && (
          <div className="mt-4 flex w-full gap-3">
            <DateInput
              className="flex-1"
              icon="tabler:calendar-up"
              label="startDate"
              namespace="apps.wallet"
              value={startDate}
              onChange={(date: Date | null) => {
                setStartDate(date)

                if (endDate && date && dayjs(date).isAfter(dayjs(endDate))) {
                  setEndDate(date)
                }
              }}
            />
            <DateInput
              className="flex-1"
              icon="tabler:calendar-down"
              label="endDate"
              namespace="apps.wallet"
              value={endDate}
              onChange={(date: Date | null) => {
                setEndDate(date)

                if (
                  startDate &&
                  date &&
                  dayjs(date).isBefore(dayjs(startDate))
                ) {
                  setStartDate(date)
                }
              }}
            />
          </div>
        )}
      </div>
      <WithQuery query={assetBalanceQuery}>
        {() => (
          <>
            {chartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorBalance"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={derivedThemeColor}
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor={derivedThemeColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="rgba(156, 163, 175, 0.2)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      angle={-45}
                      axisLine={false}
                      dataKey="date"
                      height={60}
                      textAnchor="end"
                      tick={{ fill: 'currentColor' }}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      domain={chartDomain}
                      scale={chartScale}
                      tick={{ fill: 'currentColor' }}
                      tickFormatter={value => `${numberToCurrency(value)}`}
                      tickLine={false}
                      width="auto"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      activeDot={{
                        r: 6,
                        fill: derivedThemeColor,
                        stroke: derivedThemeColor
                      }}
                      dataKey="balance"
                      dot={false}
                      fill="url(#colorBalance)"
                      stroke={derivedThemeColor}
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyStateScreen
                message={{
                  id: 'transactions',
                  namespace: 'apps.wallet'
                }}
              />
            )}
          </>
        )}
      </WithQuery>
    </div>
  )
}

export default BalanceChartModal
