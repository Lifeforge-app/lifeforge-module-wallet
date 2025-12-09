import { useWalletStore } from '@/stores/useWalletStore'
import numberToCurrency from '@/utils/numberToCurrency'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { Card } from 'lifeforge-ui'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { CategoriesBreakdownContext } from '..'

function BreakdownDoughnutChart() {
  const { t } = useTranslation('apps.wallet')

  const { isAmountHidden } = useWalletStore()

  const { breakdown, categories, type } = useContext(CategoriesBreakdownContext)

  const chartData = useMemo(() => {
    return categories.map(category => ({
      name: category.name,
      value: breakdown?.[category.id]?.amount || 0,
      color: category.color
    }))
  }, [categories, breakdown])

  const totalAmount = useMemo(() => {
    return Object.values(breakdown).reduce((acc, curr) => acc + curr.amount, 0)
  }, [breakdown])

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean
    payload?: Array<{
      value: number
      name: string
      payload: { name: string; value: number; color: string }
    }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0]

      const percentage = totalAmount > 0 ? (data.value / totalAmount) * 100 : 0

      return (
        <Card className="border-bg-200 dark:border-bg-700/50 component-bg border p-0!">
          <div className="component-bg-lighter p-4!">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: data.payload.color }}
              />
              <span className="font-medium">{data.name}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-bg-500">Amount:</span>
              <span
                className="font-semibold"
                style={{ color: data.payload.color }}
              >
                RM {numberToCurrency(data.value)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-bg-500">Percentage:</span>
              <span className="font-semibold">{percentage.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      )
    }

    return null
  }

  return (
    <div className="relative mx-auto flex aspect-square w-4/5 min-w-0 flex-col gap-3">
      <div className="pointer-events-none absolute top-1/2 left-1/2 mt-2 flex size-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
        <div
          className={clsx(
            'flex text-3xl font-medium',
            isAmountHidden ? 'items-center' : 'items-end'
          )}
        >
          <span className="text-bg-500 mr-1 text-xl">RM</span>
          {isAmountHidden ? (
            <span className="flex items-center">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Icon
                    key={i}
                    className="-mx-0.5 size-6 sm:size-8"
                    icon="uil:asterisk"
                  />
                ))}
            </span>
          ) : (
            numberToCurrency(totalAmount)
          )}
        </div>
        <div className="text-bg-500 mt-2 w-1/2 text-center text-sm sm:text-base">
          {type === 'expenses'
            ? t('widgets.expensesBreakdown.thisMonthsSpending')
            : t('widgets.expensesBreakdown.thisMonthsIncome')}
        </div>
      </div>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cornerRadius={4}
            cx="50%"
            cy="50%"
            data={chartData}
            dataKey="value"
            innerRadius="80%"
            nameKey="name"
            outerRadius="100%"
            paddingAngle={2}
            strokeWidth={1}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color + '20'}
                stroke={entry.color}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BreakdownDoughnutChart
