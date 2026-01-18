import { Icon } from '@iconify/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormModal, defineForm } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import forgeAPI from '@/utils/forgeAPI'

import type { Budget, Category } from '..'

interface BudgetFormData {
  amount: number
  rollover_enabled: boolean
  rollover_cap: number
  alert_threshold: number
}

function ModifyBudgetModal({
  data: { type, category, existingBudget, year, month },
  onClose
}: {
  data: {
    type: 'create' | 'update'
    category: Category
    existingBudget?: Budget
    year: number
    month: number
  }
  onClose: () => void
}) {
  const { t } = useTranslation('apps.wallet')

  const queryClient = useQueryClient()

  const mutation = useMutation(
    (type === 'create'
      ? forgeAPI.budgets.create.input({
          category: category.id,
          year: year.toString(),
          month: month.toString()
        })
      : forgeAPI.budgets.update.input({
          id: existingBudget?.id || ''
        })
    ).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'budgets'] })
        toast.success(
          `Budget ${type === 'create' ? 'created' : 'updated'} successfully`
        )
      },
      onError: error => {
        toast.error(
          `Failed to ${type === 'create' ? 'create' : 'update'} budget: ${error.message}`
        )
      }
    })
  )

  const alertThreshold =
    existingBudget && Array.isArray(existingBudget.alert_thresholds)
      ? existingBudget.alert_thresholds[0]
      : 80

  const { formProps } = defineForm<BudgetFormData>({
    namespace: 'apps.wallet',
    icon: type === 'create' ? 'tabler:plus' : 'tabler:pencil',
    title: (
      <div className="flex items-center gap-3">
        <span
          className="rounded-md p-2"
          style={{ backgroundColor: category.color + '20' }}
        >
          <Icon
            className="size-5"
            icon={category.icon}
            style={{ color: category.color }}
          />
        </span>
        <span>{t(`modals.budget.${type}`, { category: category.name })}</span>
      </div>
    ),
    submitButton: type,
    onClose
  })
    .typesMap({
      amount: 'number',
      rollover_enabled: 'checkbox',
      rollover_cap: 'number',
      alert_threshold: 'number'
    })
    .setupFields({
      amount: {
        required: true,
        label: 'Monthly Budget',
        icon: 'tabler:currency-dollar'
      },
      rollover_enabled: {
        label: 'Enable Rollover',
        icon: 'tabler:refresh'
      },
      rollover_cap: {
        label: 'Rollover Cap',
        icon: 'tabler:percentage'
      },
      alert_threshold: {
        required: true,
        label: 'Alert Threshold',
        icon: 'tabler:bell'
      }
    })
    .conditionalFields({
      rollover_cap: data => data.rollover_enabled === true
    })
    .initialData({
      amount: existingBudget?.amount || 0,
      rollover_enabled: existingBudget?.rollover_enabled || false,
      rollover_cap: existingBudget?.rollover_cap || 100,
      alert_threshold: alertThreshold
    })
    .onSubmit(async formData => {
      await mutation.mutateAsync(formData)
    })
    .build()

  return <FormModal {...formProps} />
}

export default ModifyBudgetModal
