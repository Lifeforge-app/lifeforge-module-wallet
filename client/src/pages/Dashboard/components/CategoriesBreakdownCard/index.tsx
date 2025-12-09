import { useWalletData } from '@/hooks/useWalletData'
import useYearMonthState from '@/hooks/useYearMonthState'
import forgeAPI from '@/utils/forgeAPI'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import {
  EmptyStateScreen,
  Listbox,
  ListboxOption,
  Widget,
  WithQuery
} from 'lifeforge-ui'
import { createContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'shared'
import type { InferOutput } from 'shared'

import type { WalletCategory } from '../../../Transactions'
import BreakdownChartLegend from './components/BreakdownChartLegend'
import BreakdownDetails from './components/BreakdownDetails'
import BreakdownDoughnutChart from './components/BreakdownDoughnutChart'

type CategoryBreakdown = InferOutput<
  typeof forgeAPI.wallet.analytics.getCategoriesBreakdown
>['income']

export const CategoriesBreakdownContext = createContext<{
  breakdown: CategoryBreakdown
  categories: WalletCategory[]
  type: 'income' | 'expenses'
}>({
  breakdown: {},
  categories: [],
  type: 'expenses'
})

function CategoriesBreakdownCard() {
  const { t } = useTranslation(['common.misc', 'apps.wallet'])

  const { categoriesQuery } = useWalletData()

  const [selectedType, setSelectedType] = useState<'income' | 'expenses'>(
    'expenses'
  )

  const {
    yearMonth: { year, month },
    setYearMonth,
    options: { years: yearsOptions, months: monthsOptions }
  } = useYearMonthState()

  const categoriesBreakdownQuery = useQuery(
    forgeAPI.wallet.analytics.getCategoriesBreakdown
      .input({
        year: year?.toString() ?? '',
        month: ((month ?? 0) + 1).toString()
      })
      .queryOptions({
        enabled: year !== null && month !== null
      })
  )

  const currentBreakdown = categoriesBreakdownQuery.data?.[selectedType] ?? {}

  const filteredCategories = useMemo(
    () =>
      Object.keys(currentBreakdown)
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
    [categoriesQuery.data, currentBreakdown]
  )

  const memoizedContextValue = useMemo(() => {
    return {
      breakdown: currentBreakdown,
      categories: filteredCategories,
      type: selectedType
    }
  }, [currentBreakdown, filteredCategories, selectedType])

  return (
    <CategoriesBreakdownContext value={memoizedContextValue}>
      <Widget
        actionComponent={
          <Link
            className="text-bg-500 hover:bg-bg-100 hover:text-bg-800 dark:hover:bg-bg-700/30 dark:hover:text-bg-50 flex items-center gap-2 rounded-lg p-2 font-medium transition-all"
            to={`/wallet/transactions?type=${selectedType}`}
          >
            <Icon className="text-xl" icon="tabler:chevron-right" />
          </Link>
        }
        className="col-span-1 row-span-4"
        icon="tabler:chart-donut-3"
        namespace="apps.wallet"
        title="Categories Breakdown"
      >
        <div className="mb-2 flex flex-col items-center gap-2">
          <Listbox
            buttonContent={
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    'size-6',
                    selectedType === 'income'
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}
                  icon={
                    selectedType === 'income'
                      ? 'tabler:login-2'
                      : 'tabler:logout'
                  }
                />
                {t(`apps.wallet:transactionTypes.${selectedType}`)}
              </div>
            }
            className="component-bg-lighter w-full"
            value={selectedType}
            onChange={(value: 'income' | 'expenses') => setSelectedType(value)}
          >
            {(['income', 'expenses'] as const).map(type => (
              <ListboxOption
                key={type}
                icon={type === 'income' ? 'tabler:login-2' : 'tabler:logout'}
                label={t(`apps.wallet:transactionTypes.${type}`)}
                value={type}
              />
            ))}
          </Listbox>
          <div className="flex w-full flex-col gap-2 min-[360px]:flex-row">
            <Listbox
              buttonContent={
                <div className="flex items-center gap-3">
                  <Icon className="text-bg-500 size-6" icon="tabler:calendar" />
                  {t('common.misc:dates.months.' + month)}
                </div>
              }
              className="component-bg-lighter flex-1"
              value={month}
              onChange={(value: number | null) =>
                setYearMonth({ month: value })
              }
            >
              {monthsOptions.map(option => (
                <ListboxOption
                  key={option}
                  label={t('common.misc:dates.months.' + option)}
                  value={option}
                />
              ))}
            </Listbox>
            <Listbox
              buttonContent={
                <div className="flex items-center gap-3">{year}</div>
              }
              className="component-bg-lighter min-[360px]:w-36!"
              value={year}
              onChange={(value: number | null) => setYearMonth({ year: value })}
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
        </div>
        <WithQuery query={categoriesBreakdownQuery}>
          {data =>
            Object.keys(data[selectedType]).length === 0 ? (
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
    </CategoriesBreakdownContext>
  )
}

export default CategoriesBreakdownCard
