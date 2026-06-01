import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import z from 'zod'

import {
  CheckboxField,
  FormModal,
  NumberField,
  createDefaultValues
} from '@lifeforge/ui'

import forgeAPI from '@/utils/forgeAPI'

import type { Budget, Category } from '..'

const schema = z.object({
  amount: z.number().nonnegative('Amount must be non-negative'),
  rollover_enabled: z.boolean(),
  rollover_cap: z.number().nonnegative().optional(),
  alert_threshold: z.number().gte(0).lte(200)
})

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

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      amount: existingBudget?.amount || 0,
      rollover_enabled: existingBudget?.rollover_enabled ?? false,
      rollover_cap: existingBudget?.rollover_cap ?? 100,
      alert_threshold: alertThreshold
    },
    mode: 'all',
    resolver: zodResolver(schema)
  })

  const rolloverEnabled = useWatch({
    control: form.control,
    name: 'rollover_enabled'
  })

  return (
    <FormModal
      form={form}
      submissionConfig={{
        handler: async formData => {
          await mutation.mutateAsync({
            amount: formData.amount,
            rollover_enabled: formData.rollover_enabled ?? false,
            rollover_cap: formData.rollover_cap ?? 100,
            alert_threshold: formData.alert_threshold ?? 80
          })
        },
        template: type
      }}
      uiConfig={{
        icon: type === 'create' ? 'tabler:plus' : 'tabler:pencil',
        namespace: 'apps.wallet',
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
            <span>
              {t(`modals.budget.${type}`, { category: category.name })}
            </span>
          </div>
        ),
        onClose
      }}
    >
      <NumberField
        required
        control={form.control}
        icon="tabler:currency-dollar"
        label="Monthly Budget"
        name="amount"
      />
      <CheckboxField
        control={form.control}
        icon="tabler:refresh"
        label="Enable Rollover"
        name="rollover_enabled"
      />
      {rolloverEnabled && (
        <NumberField
          control={form.control}
          icon="tabler:percentage"
          label="Rollover Cap"
          name="rollover_cap"
        />
      )}
      <NumberField
        required
        control={form.control}
        icon="tabler:bell"
        label="Alert Threshold"
        name="alert_threshold"
      />
    </FormModal>
  )
}

export default ModifyBudgetModal
