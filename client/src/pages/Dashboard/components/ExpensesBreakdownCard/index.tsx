import { useWalletData } from '@/hooks/useWalletData'
import useYearMonthState from '@/hooks/useYearMonthState'
import forgeAPI from '@/utils/forgeAPI'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import {
  EmptyStateScreen,
  Listbox,
  ListboxOption,
  Widget,
  WithQuery
} from 'lifeforge-ui'
import { createContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'shared'
import type { InferOutput } from 'shared'

import type { WalletCategory } from '../../../Transactions'
import BreakdownChartLegend from './components/BreakdownChartLegend'
import BreakdownDetails from './components/BreakdownDetails'
import BreakdownDoughnutChart from './components/BreakdownDoughnutChart'

export const ExpensesBreakdownContext = createContext<{
  spentOnEachCategory: InferOutput<
    typeof forgeAPI.wallet.utils.getExpensesBreakdown
  >
  expensesCategories: WalletCategory[]
}>({
  spentOnEachCategory: {},
  expensesCategories: []
})

function ExpensesBreakdownCard() {
  const { t } = useTranslation('common.misc')

  const { categoriesQuery } = useWalletData()

  const {
    yearMonth: { year, month },
    setYearMonth,
    options: { years: yearsOptions, months: monthsOptions }
  } = useYearMonthState()

  const expensesBreakdownQuery = useQuery(
    forgeAPI.wallet.utils.getExpensesBreakdown
      .input({
        year: year?.toString() ?? '',
        month: ((month ?? 0) + 1).toString()
      })
      .queryOptions({
        enabled: year !== null && month !== null
      })
  )

  const expensesCategories = useMemo(
    () =>
      Object.keys(expensesBreakdownQuery.data ?? {})
        .map(
          categoryId =>
            categoriesQuery.data?.find(
              category => category.id === categoryId
            ) ||
            ({
              id: categoryId,
              name: categoryId,
              icon: 'tabler:category',
              color: '#000000'
            } as WalletCategory)
        )
        .filter(e => e),
    [categoriesQuery.data, expensesBreakdownQuery.data]
  )

  const memoizedContextValue = useMemo(() => {
    return {
      spentOnEachCategory: expensesBreakdownQuery.data ?? {},
      expensesCategories
    }
  }, [expensesBreakdownQuery.data, expensesCategories])

  return (
    <ExpensesBreakdownContext value={memoizedContextValue}>
      <Widget
        actionComponent={
          <Link
            className="text-bg-500 hover:bg-bg-100 hover:text-bg-800 dark:hover:bg-bg-700/30 dark:hover:text-bg-50 flex items-center gap-2 rounded-lg p-2 font-medium transition-all"
            to="/wallet/transactions?type=expenses"
          >
            <Icon className="text-xl" icon="tabler:chevron-right" />
          </Link>
        }
        className="col-span-1 row-span-4"
        icon="tabler:chart-donut-3"
        namespace="apps.wallet"
        title="Expenses Breakdown"
      >
        <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row">
          <Listbox
            buttonContent={
              <div className="flex items-center gap-3">
                <Icon className="text-bg-500 size-6" icon="tabler:calendar" />
                {t('dates.months.' + month)}
              </div>
            }
            className="component-bg-lighter flex-1"
            value={month}
            onChange={setYearMonth.bind(null, { month })}
          >
            {monthsOptions.map(option => (
              <ListboxOption
                key={option}
                label={t('dates.months.' + option)}
                value={option}
              />
            ))}
          </Listbox>
          <Listbox
            buttonContent={
              <div className="flex items-center gap-3">{year}</div>
            }
            className="component-bg-lighter sm:w-36!"
            value={year}
            onChange={setYearMonth.bind(null, { year })}
          >
            {yearsOptions.map(option => (
              <ListboxOption
                key={option}
                label={option.toString()}
                value={option}
              />
            ))}
          </Listbox>
        </div>
        <WithQuery query={expensesBreakdownQuery}>
          {data =>
            Object.keys(data).length === 0 ? (
              <EmptyStateScreen
                message={{
                  id: 'transactions',
                  namespace: 'apps.wallet'
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
      </Widget>
    </ExpensesBreakdownContext>
  )
}

export default ExpensesBreakdownCard
