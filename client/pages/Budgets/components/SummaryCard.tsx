import { useTranslation } from 'react-i18next'

function SummaryCard({
  totalBudgeted,
  totalSpent,
  totalRemaining,
  overallPercentage,
  progressColor
}: {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  overallPercentage: number
  progressColor: string
}) {
  const { t } = useTranslation('apps.wallet')

  return (
    <div className="bg-bg-50 dark:bg-bg-800/50 shadow-custom mb-6 rounded-lg p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-bg-500">{t('budgets.totalBudgeted')}</p>
          <p className="text-2xl font-semibold">
            RM {totalBudgeted.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-bg-500">{t('budgets.spent')}</p>
          <p className="text-2xl font-semibold">RM {totalSpent.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-bg-500">{t('budgets.remaining')}</p>
          <p
            className="text-2xl font-semibold"
            style={{
              color: totalRemaining < 0 ? '#ef4444' : undefined
            }}
          >
            RM {Math.abs(totalRemaining).toFixed(2)}
            {totalRemaining < 0 && ` ${t('budgets.over')}`}
          </p>
        </div>
      </div>
      <div className="bg-bg-200 dark:bg-bg-700 h-3 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(overallPercentage, 100)}%`,
            backgroundColor: progressColor
          }}
        />
      </div>
      <p
        className="mt-2 text-right font-medium"
        style={{ color: progressColor }}
      >
        {overallPercentage}% {t('budgets.budgetUsed')}
      </p>
    </div>
  )
}

export default SummaryCard
