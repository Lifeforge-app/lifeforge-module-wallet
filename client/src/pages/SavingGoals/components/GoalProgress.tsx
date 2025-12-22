import numberToCurrency from '@/utils/numberToCurrency'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import COLORS from 'tailwindcss/colors'

import type { SavingGoal } from '..'

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return COLORS.green[500]
  if (percentage >= 75) return COLORS.blue[500]
  if (percentage >= 50) return COLORS.yellow[500]
  if (percentage >= 25) return COLORS.orange[500]

  return COLORS.red[500]
}

interface GoalProgressProps {
  goal: SavingGoal
  previewAmount?: number
}

function GoalProgress({ goal, previewAmount = 0 }: GoalProgressProps) {
  const { t } = useTranslation('apps.wallet')

  const goalColor = goal.color || '#22c55e'

  const currentAmount = goal.current_amount

  const previewTotal = currentAmount + previewAmount

  const percentage = Math.round((currentAmount / goal.target_amount) * 100)

  const previewPercentage = Math.round(
    (previewTotal / goal.target_amount) * 100
  )

  const progressColor = getProgressColor(
    previewAmount > 0 ? previewPercentage : percentage
  )

  const remaining = goal.target_amount - currentAmount

  const previewRemaining = goal.target_amount - previewTotal

  const displayRemaining = previewAmount > 0 ? previewRemaining : remaining

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          className="shrink-0 rounded-lg p-3 in-[.bordered]:border-2"
          style={{
            backgroundColor: goalColor + '20',
            borderColor: goalColor + '20'
          }}
        >
          <Icon
            className="size-8"
            icon={goal.icon || 'tabler:target'}
            style={{ color: goalColor }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate pr-8 text-xl font-semibold">{goal.name}</h3>
          {goal.target_date && (
            <p className="text-bg-500">
              {t('savingGoals.target', {
                date: new Date(goal.target_date).toLocaleDateString()
              })}
            </p>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">
            RM {numberToCurrency(currentAmount)}
            {previewAmount > 0 && (
              <span
                className="text-lg font-semibold"
                style={{ color: progressColor }}
              >
                {' '}
                + {numberToCurrency(previewAmount)}
              </span>
            )}
          </span>
          <span className="text-bg-500">
            / RM {numberToCurrency(goal.target_amount)}
          </span>
        </div>
        <div className="bg-bg-200 dark:bg-bg-700 relative mt-3 h-3 w-full overflow-hidden rounded-full">
          <div
            className={`absolute top-0 left-0 h-full transition-colors duration-300 ${
              previewAmount > 0 ? 'rounded-l-full' : 'rounded-full'
            }`}
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: progressColor
            }}
          />
          <div
            className="absolute top-0 h-full rounded-r-full opacity-50 transition-all duration-300"
            style={{
              left: `${Math.min(percentage, 100)}%`,
              width: `${Math.min(previewPercentage - percentage, 100 - percentage)}%`,
              backgroundColor: progressColor
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold" style={{ color: progressColor }}>
            {previewAmount > 0 ? previewPercentage : percentage}%
          </span>
          <span
            className="text-sm font-medium"
            style={{
              color: progressColor
            }}
          >
            {displayRemaining > 0 ? (
              t('savingGoals.toGo', {
                amount: `RM ${numberToCurrency(displayRemaining)}`
              })
            ) : (
              <span className="flex items-center gap-1">
                <Icon icon="tabler:check" />
                {t('savingGoals.goalReached')}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GoalProgress
