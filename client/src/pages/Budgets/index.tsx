import YearMonthInput from '@/components/YearMonthInput'
import useYearMonthState from '@/hooks/useYearMonthState'
import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import {
  EmptyStateScreen,
  FAB,
  ModuleHeader,
  Scrollbar,
  Tabs,
  WithQuery
} from 'lifeforge-ui'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { InferOutput } from 'shared'

import BudgetCard from './components/BudgetCard'
import NoBudgetCard from './components/NoBudgetCard'
import SummaryCard from './components/SummaryCard'

export type Category = InferOutput<
  typeof forgeAPI.wallet.categories.list
>[number]

export type Budget = InferOutput<typeof forgeAPI.wallet.budgets.list>[number]

function Budgets() {
  const { t } = useTranslation('apps.wallet')

  const BUDGET_TABS = [
    { id: 'active', name: t('budgets.active'), icon: 'tabler:chart-pie' },
    { id: 'unset', name: t('budgets.noSet'), icon: 'tabler:chart-pie-off' }
  ] as const

  const [currentTab, setCurrentTab] = useState<'active' | 'unset'>('active')

  const {
    yearMonth: { year, month },
    setYearMonth,
    options: { years: yearsOptions, months: monthsOptions }
  } = useYearMonthState(forgeAPI.wallet.budgets.getAvailableYearMonths)

  const categoriesQuery = useQuery(
    forgeAPI.wallet.categories.list.queryOptions()
  )

  const budgetsQuery = useQuery({
    ...forgeAPI.wallet.budgets.list
      .input({
        year: year?.toString() ?? '',
        month: month?.toString() ?? ''
      })
      .queryOptions(),
    enabled: year !== null && month !== null
  })

  return (
    <>
      <ModuleHeader
        icon="tabler:chart-pie"
        namespace="apps.wallet"
        title="Budgets"
        tKey="subsectionsTitleAndDesc"
      />
      <YearMonthInput
        className="mb-6"
        month={month}
        monthsOptions={monthsOptions}
        setMonth={(month: number | null) => setYearMonth({ month })}
        setYear={(year: number | null) => setYearMonth({ year })}
        year={year}
        yearsOptions={yearsOptions}
      />
      <WithQuery query={categoriesQuery}>
        {categories => (
          <WithQuery query={budgetsQuery}>
            {budgets => {
              const expenseCategories = categories.filter(
                c => c.type === 'expenses'
              )

              const budgetMap = new Map(budgets.map(b => [b.category, b]))

              const categoriesWithBudget = expenseCategories.filter(c =>
                budgetMap.has(c.id)
              )

              const categoriesWithoutBudget = expenseCategories.filter(
                c => !budgetMap.has(c.id)
              )

              const tabsWithCounts = BUDGET_TABS.map(tab => ({
                ...tab,
                amount:
                  tab.id === 'active'
                    ? categoriesWithBudget.length
                    : categoriesWithoutBudget.length
              }))

              const totalBudgeted = budgets.reduce(
                (sum, b) => sum + b.amount + (b.rollover_amount ?? 0),
                0
              )

              const totalSpent = budgets.reduce(
                (sum, b) => sum + b.spent_amount,
                0
              )

              const totalRemaining = totalBudgeted - totalSpent

              const overallPercentage =
                totalBudgeted > 0
                  ? Math.round((totalSpent / totalBudgeted) * 100)
                  : 0

              const progressColor =
                overallPercentage >= 100
                  ? '#ef4444'
                  : overallPercentage >= 80
                    ? '#f59e0b'
                    : '#22c55e'

              return (
                <>
                  {budgets.length > 0 && (
                    <SummaryCard
                      overallPercentage={overallPercentage}
                      progressColor={progressColor}
                      totalBudgeted={totalBudgeted}
                      totalRemaining={totalRemaining}
                      totalSpent={totalSpent}
                    />
                  )}
                  <Tabs
                    className="mb-6"
                    currentTab={currentTab}
                    enabled={['active', 'unset'] as const}
                    items={tabsWithCounts}
                    onTabChange={setCurrentTab}
                  />
                  <div className="flex-1">
                    {currentTab === 'active' ? (
                      categoriesWithBudget.length > 0 ? (
                        <Scrollbar>
                          <div className="mb-24 flex flex-col gap-3 md:mb-6">
                            {categoriesWithBudget.map(category => {
                              const budget = budgetMap.get(category.id)!

                              return (
                                <BudgetCard
                                  key={category.id}
                                  budget={budget}
                                  category={category}
                                  month={month!}
                                  year={year!}
                                />
                              )
                            })}
                          </div>
                        </Scrollbar>
                      ) : (
                        <EmptyStateScreen
                          icon="tabler:chart-pie-off"
                          message={{
                            id: 'budgets',
                            namespace: 'apps.wallet'
                          }}
                        />
                      )
                    ) : categoriesWithoutBudget.length > 0 ? (
                      <Scrollbar>
                        <div className="mb-24 flex flex-col gap-3 md:mb-6">
                          {categoriesWithoutBudget.map(category => (
                            <NoBudgetCard
                              key={category.id}
                              category={category}
                              month={month!}
                              year={year!}
                            />
                          ))}
                        </div>
                      </Scrollbar>
                    ) : (
                      <EmptyStateScreen
                        icon="tabler:check"
                        message={{
                          id: 'allCategoriesHaveBudgetsSet',
                          namespace: 'apps.wallet'
                        }}
                      />
                    )}
                  </div>
                  <FAB
                    icon="tabler:plus"
                    visibilityBreakpoint="md"
                    onClick={() => setCurrentTab('unset')}
                  />
                </>
              )
            }}
          </WithQuery>
        )}
      </WithQuery>
    </>
  )
}

export default Budgets
