import { Icon } from '@iconify/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  TagChip,
  useModalStore
} from 'lifeforge-ui'
import { toast } from 'react-toastify'
import { anyColorToHex } from 'shared'
import COLORS from 'tailwindcss/colors'

import forgeAPI from '@/utils/forgeAPI'

import type { Budget, Category } from '..'
import ModifyBudgetModal from '../modals/ModifyBudgetModal'

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#ef4444'
  if (percentage >= 80) return '#eab308'

  return '#22c55e'
}

function BudgetCard({
  category,
  budget,
  year,
  month
}: {
  category: Category
  budget: Budget
  year: number
  month: number
}) {
  const queryClient = useQueryClient()

  const { open } = useModalStore()

  const deleteMutation = useMutation(
    forgeAPI.wallet.budgets.remove.input({ id: budget.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'budgets'] })
        toast.success('Budget deleted successfully')
      },
      onError: (error: Error) => {
        toast.error('Failed to delete budget: ' + error.message)
      }
    })
  )

  const handleEdit = () => {
    open(ModifyBudgetModal, {
      type: 'update',
      category,
      existingBudget: budget,
      year,
      month
    })
  }

  const handleDelete = () => {
    open(ConfirmationModal, {
      title: 'Delete Budget',
      description: `Are you sure you want to delete the budget for "${category.name}"? This action cannot be undone.`,
      confirmationButton: 'delete',
      confirmationPrompt: category.name,
      onConfirm: async () => {
        await deleteMutation.mutateAsync({})
      }
    })
  }

  const rolloverAmount = budget.rollover_amount ?? 0

  const effectiveAmount = rolloverAmount + budget.amount

  const percentage = Math.round((budget.spent_amount / effectiveAmount) * 100)

  const progressColor = getProgressColor(percentage)

  const remaining = effectiveAmount - budget.spent_amount

  const isOverBudget = remaining < 0

  return (
    <Card className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="absolute top-4 right-4 sm:static sm:order-last">
        <ContextMenu>
          <ContextMenuItem
            icon="tabler:pencil"
            label="Edit"
            onClick={handleEdit}
          />
          <ContextMenuItem
            dangerous
            icon="tabler:trash"
            label="Delete"
            onClick={handleDelete}
          />
        </ContextMenu>
      </div>
      <div className="flex items-center gap-3 sm:flex-1">
        <span
          className="shrink-0 rounded-md p-3 in-[.bordered]:border-2"
          style={{
            backgroundColor: anyColorToHex(category.color) + '20',
            borderColor: anyColorToHex(category.color) + '20'
          }}
        >
          <Icon
            className="size-6"
            icon={category.icon}
            style={{ color: anyColorToHex(category.color) }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-medium">{category.name}</h3>
            {budget.rollover_enabled && (
              <TagChip className="text-xs" label="Rollover" />
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="bg-bg-200 dark:bg-bg-700/50 relative h-2 w-full max-w-32 shrink-0 overflow-hidden rounded-full sm:w-32">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: progressColor
                }}
              />
              {percentage > 100 && (
                <div
                  className="absolute top-0 right-0 h-full rounded-r-full opacity-60"
                  style={{
                    width: `${Math.min(percentage - 100, 100)}%`,
                    backgroundColor: '#ef4444',
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px)'
                  }}
                />
              )}
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: progressColor }}
            >
              {percentage}%
            </span>
          </div>
        </div>
      </div>
      <div className="border-bg-200 dark:border-bg-700/50 flex items-center justify-between gap-4 border-t pt-4 sm:block sm:border-t-0 sm:pt-0 sm:text-right">
        <p className="text-lg font-bold">
          RM {budget.spent_amount.toFixed(2)}
          <span className="text-bg-500 text-sm font-normal">
            {' '}
            / {effectiveAmount.toFixed(2)}
          </span>
          {rolloverAmount > 0 && (
            <span className="text-bg-400 ml-1 text-xs font-normal">
              (+{rolloverAmount.toFixed(2)})
            </span>
          )}
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: isOverBudget ? COLORS.red[500] : COLORS.green[500] }}
        >
          {isOverBudget
            ? `RM ${Math.abs(remaining).toFixed(2)} over`
            : `RM ${remaining.toFixed(2)} left`}
        </p>
      </div>
    </Card>
  )
}

export default BudgetCard
