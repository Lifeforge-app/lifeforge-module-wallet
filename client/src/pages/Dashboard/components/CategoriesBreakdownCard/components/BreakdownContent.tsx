import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import {
  EmptyStateScreen,
  Listbox,
  ListboxOption,
  LoadingScreen,
  WithQuery
} from 'lifeforge-ui'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type WalletCategory, useWalletData } from '@/hooks/useWalletData'
import useYearMonthState from '@/hooks/useYearMonthState'
import forgeAPI from '@/utils/forgeAPI'

import { CategoriesBreakdownContext } from '..'
import BreakdownChartLegend from './BreakdownChartLegend'
import BreakdownDetails from './BreakdownDetails'
import BreakdownDoughnutChart from './BreakdownDoughnutChart'

function BreakdownContent({
  selectedType,
  setSelectedType
}: {
  selectedType: 'income' | 'expenses'
  setSelectedType: (type: 'income' | 'expenses') => void
}) {
  const { categoriesQuery } = useWalletData()

  const { t } = useTranslation(['common.misc', 'apps.wallet'])

  const {
    yearMonth: { year, month },
    options: { years: yearsOptions, months: monthsOptions },
    setYearMonth,
    isLoading: isYearMonthLoading
  } = useYearMonthState(forgeAPI.analytics.getAvailableYearMonths)

  const categoriesBreakdownQuery = useQuery(
    forgeAPI.analytics.getCategoriesBreakdown
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

  if (isYearMonthLoading) {
    return <LoadingScreen />
  }

  // If no year or month options are available, obviously no data is available
  if (yearsOptions.length === 0 || monthsOptions.length === 0) {
    return (
      <EmptyStateScreen
        icon="tabler:wallet-off"
        message={{
          id: 'transactions',
          namespace: 'apps.wallet'
        }}
      />
    )
  }

  return (
    <CategoriesBreakdownContext value={memoizedContextValue}>
      <div className="mb-2 flex flex-col items-center gap-2">
        <Listbox
          buttonContent={
            <div className="flex items-center gap-3">
              <Icon
                className={clsx(
                  'size-6',
                  selectedType === 'income' ? 'text-green-500' : 'text-red-500'
                )}
                icon={
                  selectedType === 'income' ? 'tabler:login-2' : 'tabler:logout'
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
            onChange={(value: number | null) => setYearMonth({ month: value })}
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
              icon="tabler:wallet-off"
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
    </CategoriesBreakdownContext>
  )
}

export default BreakdownContent
