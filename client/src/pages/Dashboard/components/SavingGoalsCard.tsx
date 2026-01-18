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

function SavingGoalsCard() {
  const navigate = useNavigate()

  const goalsQuery = useQuery(forgeAPI.savingsGoals.list.queryOptions())

  return (
    <Widget
      actionComponent={
        <Link
          className="text-bg-500 hover:bg-bg-100 hover:text-bg-800 dark:hover:bg-bg-700/30 dark:hover:text-bg-50 flex items-center gap-2 rounded-lg p-2 transition-all"
          to="./saving-goals"
        >
          <Icon className="text-xl" icon="tabler:chevron-right" />
        </Link>
      }
      className="col-span-1 row-span-2 min-h-96 xl:min-h-0"
      icon="tabler:target"
      namespace="apps.wallet"
      title="Saving Goals"
    >
      <WithQuery query={goalsQuery}>
        {goals =>
          goals.length > 0 ? (
            <Scrollbar>
              <ul className="flex flex-col gap-3 pb-2">
                {goals.map(goal => {
                  const percentage = Math.round(
                    (goal.current_amount / goal.target_amount) * 100
                  )

                  const progressColor =
                    percentage >= 100
                      ? '#22c55e'
                      : percentage >= 50
                        ? '#3b82f6'
                        : '#f59e0b'

                  return (
                    <Card key={goal.id} className="component-bg-lighter">
                      <div className="mb-4 flex items-center gap-2">
                        <span
                          className="shrink-0 rounded-md p-2 in-[.bordered]:border-2"
                          style={{
                            backgroundColor: (goal.color || '#22c55e') + '20',
                            borderColor: (goal.color || '#22c55e') + '20'
                          }}
                        >
                          <Icon
                            className="size-4"
                            icon={goal.icon || 'tabler:target'}
                            style={{ color: goal.color || '#22c55e' }}
                          />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-lg font-medium">
                          {goal.name}
                        </span>
                        <span
                          className="font-semibold"
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
                        <span>RM {goal.current_amount.toFixed(2)}</span>
                        <span>RM {goal.target_amount.toFixed(2)}</span>
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
                  navigate('/wallet/saving-goals')
                },
                tProps: { item: 'Goal' }
              }}
              icon="tabler:target-off"
              message={{
                id: 'savingGoals',
                namespace: 'apps.wallet'
              }}
            />
          )
        }
      </WithQuery>
    </Widget>
  )
}

export default SavingGoalsCard
