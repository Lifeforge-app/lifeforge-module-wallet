import forgeAPI from '@/utils/forgeAPI'
import getChartScale from '@/utils/getChartScale'
import numberToCurrency from '@/utils/numberToCurrency'
import { useQuery } from '@tanstack/react-query'
import { Card, EmptyStateScreen, Widget, WithQuery } from 'lifeforge-ui'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { usePersonalization } from 'shared'

import RangeSelector from './components/RangeSelector'

function StatisticChardCard() {
  const { t } = useTranslation('apps.wallet')

  const { bgTempPalette, derivedTheme } = usePersonalization()

  const [range, setRange] = useState<'week' | 'month' | 'ytd'>('week')

  const chartDataQuery = useQuery(
    forgeAPI.wallet.analytics.getChartData.input({ range }).queryOptions()
  )

  const data = chartDataQuery.data ?? []

  const chartScale = useMemo(() => {
    const allValues = data.flatMap(d => [d.income, Math.abs(d.expenses)])

    return getChartScale(allValues, { startFromZero: false })
  }, [data])

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean
    payload?: Array<{
      value: number
      name: string
      stroke: string
    }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-bg-200 dark:border-bg-700/50 border">
          <p className="mb-2 font-medium">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: entry.stroke }}
                  />
                  <span className="text-bg-500">{entry.name}:</span>
                </div>
                <span className="font-semibold" style={{ color: entry.stroke }}>
                  RM {numberToCurrency(Math.abs(entry.value))}
                </span>
              </div>
            ))}
          </div>
          <div className="border-bg-200 dark:border-bg-700/50 my-2 w-full border-b" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-bg-500 font-medium">Difference:</span>
            <span className="font-semibold">
              RM{' '}
              {(payload[0]?.value ?? 0) + (payload[1]?.value ?? 0) < 0
                ? '('
                : ''}
              {numberToCurrency(
                Math.abs((payload[0]?.value ?? 0) + (payload[1]?.value ?? 0))
              )}
              {(payload[0]?.value ?? 0) + (payload[1]?.value ?? 0) < 0
                ? ')'
                : ''}
            </span>
          </div>
        </Card>
      )
    }

    return null
  }

  return (
    <Widget
      actionComponent={
        <RangeSelector
          className="hidden w-72! sm:flex"
          range={range}
          setRange={setRange}
        />
      }
      className="col-span-2 row-span-2 max-h-120"
      icon="tabler:chart-dots"
      namespace="apps.wallet"
      title="Statistics"
    >
      <RangeSelector className="sm:hidden" range={range} setRange={setRange} />
      <div className="flex-center size-full min-h-96 flex-1">
        <WithQuery query={chartDataQuery}>
          {chartData =>
            chartData.length === 0 ? (
              <EmptyStateScreen
                message={{
                  id: 'transactions',
                  namespace: 'apps.wallet'
                }}
              />
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <ComposedChart
                  barGap={0}
                  data={data}
                  margin={{ top: 0, bottom: 20, left: 0, right: 0 }}
                >
                  <CartesianGrid
                    stroke={
                      bgTempPalette[derivedTheme === 'dark' ? '800' : '200']
                    }
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    domain={['auto', 'auto']}
                    scale={chartScale}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    tickFormatter={value =>
                      `${numberToCurrency(Math.abs(value))}`
                    }
                    tickLine={false}
                    width="auto"
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                  />
                  <Bar
                    dataKey="income"
                    fill="rgba(34,197,94,0.2)"
                    name="Income"
                    radius={[8, 8, 8, 8]}
                    stroke="rgb(34 197 94)"
                    strokeWidth={2}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="rgba(239,68,68,0.2)"
                    name="Expenses"
                    radius={[8, 8, 8, 8]}
                    stroke="rgb(239 68 68)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )
          }
        </WithQuery>
      </div>
      <div className="flex-center gap-12">
        <div className="flex items-center gap-2">
          <span className="-mb-0.5 size-3 rounded-full bg-green-500"></span>
          <span className="text-sm">{t('transactionTypes.income')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="-mb-0.5 size-3 rounded-full bg-red-500"></span>
          <span className="text-sm">{t('transactionTypes.expenses')}</span>
        </div>
      </div>
    </Widget>
  )
}

export default StatisticChardCard
