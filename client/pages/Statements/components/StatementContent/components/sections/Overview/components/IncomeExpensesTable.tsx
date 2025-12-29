import { useWalletData } from '@/hooks/useWalletData'
import forgeAPI from '@/utils/forgeAPI'
import numberToCurrency from '@/utils/numberToCurrency'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useMemo } from 'react'

function IncomeExpensesTable({
  month,
  year,
  type
}: {
  month: number
  year: number
  type: 'income' | 'expenses'
}) {
  const { categoriesQuery } = useWalletData()

  const categories = categoriesQuery.data ?? []

  // Calculate previous month/year
  const prevMonth = useMemo(() => {
    const date = dayjs().year(year).month(month).subtract(1, 'month')

    return {
      month: date.month() + 1, // API expects 1-indexed
      year: date.year()
    }
  }, [month, year])

  // Current month breakdown
  const currentMonthQuery = useQuery(
    forgeAPI.wallet.analytics.getCategoriesBreakdown
      .input({
        year: year.toString(),
        month: (month + 1).toString() // API expects 1-indexed
      })
      .queryOptions()
  )

  // Previous month breakdown
  const prevMonthQuery = useQuery(
    forgeAPI.wallet.analytics.getCategoriesBreakdown
      .input({
        year: prevMonth.year.toString(),
        month: prevMonth.month.toString()
      })
      .queryOptions()
  )

  const currentBreakdown = currentMonthQuery.data?.[type] ?? {}

  const prevBreakdown = prevMonthQuery.data?.[type] ?? {}

  // Calculate totals
  const currentTotal = useMemo(
    () =>
      Object.values(currentBreakdown).reduce(
        (acc, curr) => acc + curr.amount,
        0
      ),
    [currentBreakdown]
  )

  const prevTotal = useMemo(
    () =>
      Object.values(prevBreakdown).reduce((acc, curr) => acc + curr.amount, 0),
    [prevBreakdown]
  )

  const filteredCategories = useMemo(
    () =>
      categories
        .filter(category => category.type === type)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories, type]
  )

  return (
    <>
      <h2 className="mt-16 text-2xl font-semibold tracking-widest uppercase print:break-after-avoid print:text-[18px]">
        <span>1.{type === 'income' ? '2' : '3'} </span>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </h2>
      <div className="min-w-0 overflow-x-auto overflow-y-hidden print:overflow-visible">
        <table className="mt-6 w-full min-w-0 print:break-inside-auto">
          <thead>
            <tr className="bg-custom-500 text-white print:bg-lime-600">
              <th className="w-full p-3 text-left text-lg font-medium">
                Category
              </th>
              <th className="p-3 text-lg font-medium whitespace-nowrap">
                {dayjs()
                  .year(prevMonth.year)
                  .month(prevMonth.month - 1)
                  .format('MMM YYYY')}
              </th>
              <th className="p-3 text-lg font-medium whitespace-nowrap">
                {dayjs().year(year).month(month).format('MMM YYYY')}
              </th>
              <th
                className="p-3 text-lg font-medium whitespace-nowrap"
                colSpan={2}
              >
                Change
              </th>
            </tr>
            <tr className="bg-bg-800 text-white print:bg-black/70">
              <th className="w-full px-4 py-2 text-left text-lg font-medium"></th>
              <th className="px-4 py-2 text-lg font-medium">RM</th>
              <th className="px-4 py-2 text-lg font-medium">RM</th>
              <th className="px-4 py-2 text-lg font-medium">RM</th>
              <th className="px-4 py-2 text-lg font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(category => {
              const currentAmount = currentBreakdown[category.id]?.amount ?? 0

              const prevAmount = prevBreakdown[category.id]?.amount ?? 0

              const change = currentAmount - prevAmount

              const isNegativeChange =
                type === 'income' ? change < 0 : change > 0

              return (
                <tr
                  key={category.id}
                  className="even:bg-bg-200 dark:even:bg-bg-800/30 print:break-inside-avoid print:even:bg-black/[3%]"
                >
                  <td className="p-3 text-lg">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="size-6 shrink-0"
                        icon={category.icon}
                        style={{
                          color: category.color
                        }}
                      />
                      <span className="whitespace-nowrap">{category.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-lg whitespace-nowrap">
                    {numberToCurrency(prevAmount)}
                  </td>
                  <td className="p-3 text-right text-lg whitespace-nowrap">
                    {numberToCurrency(currentAmount)}
                  </td>
                  <td
                    className={clsx(
                      'p-3 text-right text-lg whitespace-nowrap',
                      isNegativeChange && 'text-rose-600'
                    )}
                  >
                    {change < 0
                      ? `(${numberToCurrency(Math.abs(change))})`
                      : numberToCurrency(change)}
                  </td>
                  <td
                    className={clsx(
                      'p-3 text-right text-lg whitespace-nowrap',
                      isNegativeChange && 'text-rose-600'
                    )}
                  >
                    {Math.abs(prevAmount) < 0.001
                      ? '-'
                      : `${((change / prevAmount) * 100).toFixed(2)}%`}
                  </td>
                </tr>
              )
            })}
            <tr className="even:bg-bg-200 dark:even:bg-bg-800/30 print:even:bg-black/[3%]">
              <td className="p-3 text-lg">
                <div className="flex items-center gap-2 text-xl font-semibold">
                  <span>Total {type === 'income' ? 'Income' : 'Expenses'}</span>
                </div>
              </td>
              {(() => {
                const change = currentTotal - prevTotal

                const isNegativeChange =
                  type === 'income' ? change < 0 : change > 0

                return (
                  <>
                    <td
                      className="p-3 text-right text-lg font-medium whitespace-nowrap"
                      style={{
                        borderTop: '2px solid',
                        borderBottom: '6px double'
                      }}
                    >
                      {numberToCurrency(prevTotal)}
                    </td>
                    <td
                      className="p-3 text-right text-lg font-medium whitespace-nowrap"
                      style={{
                        borderTop: '2px solid',
                        borderBottom: '6px double'
                      }}
                    >
                      {numberToCurrency(currentTotal)}
                    </td>
                    <td
                      className={clsx(
                        'p-3 text-right text-lg font-medium whitespace-nowrap',
                        isNegativeChange && 'text-rose-600'
                      )}
                      style={{
                        borderTop: '2px solid',
                        borderBottom: '6px double'
                      }}
                    >
                      {change < 0
                        ? `(${numberToCurrency(Math.abs(change))})`
                        : numberToCurrency(change)}
                    </td>
                    <td
                      className={clsx(
                        'p-3 text-right text-lg font-medium whitespace-nowrap',
                        isNegativeChange && 'text-rose-600'
                      )}
                      style={{
                        borderTop: '2px solid',
                        borderBottom: '6px double'
                      }}
                    >
                      {Math.abs(prevTotal) < 0.001
                        ? '-'
                        : `${((change / prevTotal) * 100).toFixed(2)}%`}
                    </td>
                  </>
                )
              })()}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default IncomeExpensesTable
