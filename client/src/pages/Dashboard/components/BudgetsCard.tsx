import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  EmptyStateScreen,
  Scrollbar,
  Widget,
  WithQuery
} from 'lifeforge-ui'
import { Link, useNavigate } from 'shared'

import forgeAPI from '@/utils/forgeAPI'

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#ef4444'
  if (percentage >= 80) return '#f59e0b'

  return '#22c55e'
}

function BudgetsCard() {
  const navigate = useNavigate()

  const now = new Date()

  const budgetsQuery = useQuery(
    forgeAPI.budgets.list
      .input({
        year: now.getFullYear().toString(),
        month: now.getMonth().toString()
      })
      .queryOptions()
  )

  return (
    <Widget
      actionComponent={
        <Link
          className="text-bg-500 hover:bg-bg-100 hover:text-bg-800 dark:hover:bg-bg-700/30 dark:hover:text-bg-50 flex items-center gap-2 rounded-lg p-2 transition-all"
          to="./budgets"
        >
          <Icon className="text-xl" icon="tabler:chevron-right" />
        </Link>
      }
      className="col-span-1 row-span-2 min-h-96 xl:min-h-0"
      icon="tabler:chart-pie"
      namespace="apps.wallet"
      title="Budgets"
    >
      <WithQuery query={budgetsQuery}>
        {budgets =>
          budgets.length > 0 ? (
            <Scrollbar>
              <ul className="flex flex-col gap-3 pb-2">
                {budgets.map(budget => {
                  const category = budget.expand?.category

                  if (!category) return null

                  const rolloverAmount = budget.rollover_amount ?? 0

                  const effectiveAmount = budget.amount + rolloverAmount

                  const percentage = Math.round(
                    (budget.spent_amount / effectiveAmount) * 100
                  )

                  const progressColor = getProgressColor(percentage)

                  const remaining = effectiveAmount - budget.spent_amount

                  return (
                    <Card key={budget.id} className="component-bg-lighter">
                      <div className="mb-4 flex items-center gap-2">
                        <span
                          className="shrink-0 rounded-md p-2 in-[.bordered]:border-2"
                          style={{
                            backgroundColor: category.color + '20',
                            borderColor: category.color + '20'
                          }}
                        >
                          <Icon
                            className="size-4"
                            icon={category.icon}
                            style={{ color: category.color }}
                          />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-lg font-medium">
                          {category.name}
                        </span>
                        <span
                          className="text font-semibold"
                          style={{ color: progressColor }}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div className="bg-bg-200 dark:bg-bg-700 h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: progressColor
                          }}
                        />
                      </div>
                      <div className="text-bg-500 mt-2 flex justify-between text-sm">
                        <span>RM {budget.spent_amount.toFixed(2)}</span>
                        <span
                          style={{
                            color: remaining < 0 ? '#ef4444' : undefined
                          }}
                        >
                          {remaining >= 0
                            ? `RM ${remaining.toFixed(2)} left`
                            : `RM ${Math.abs(remaining).toFixed(2)} over`}
                        </span>
                      </div>
                    </Card>
                  )
                })}
              </ul>
            </Scrollbar>
          ) : (
            <EmptyStateScreen
              smaller
              CTAButtonProps={{
                children: 'new',
                icon: 'tabler:plus',
                onClick: () => {
                  navigate('/wallet/budgets')
                },
                tProps: { item: 'Budget' }
              }}
              icon="tabler:chart-pie-off"
              message={{
                id: 'budgets',
                namespace: 'apps.wallet'
              }}
            />
          )
        }
      </WithQuery>
    </Widget>
  )
}

export default BudgetsCard
