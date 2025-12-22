import forgeAPI from '@/utils/forgeAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { FormModal, defineForm } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import type { SavingGoal } from '..'

interface GoalFormData {
  name: string
  icon: string
  color: string
  target_amount: number
  target_date: string
}

function ModifyGoalModal({
  data: { type, existingGoal },
  onClose
}: {
  data: {
    type: 'create' | 'update'
    existingGoal?: SavingGoal
  }
  onClose: () => void
}) {
  const { t } = useTranslation('apps.wallet')

  const queryClient = useQueryClient()

  const mutation = useMutation(
    (type === 'create'
      ? forgeAPI.wallet.savingsGoals.create
      : forgeAPI.wallet.savingsGoals.update.input({
          id: existingGoal?.id || ''
        })
    ).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'savingsGoals'] })

        toast.success(
          t(
            type === 'create'
              ? 'savingGoals.messages.goalCreated'
              : 'savingGoals.messages.goalUpdated'
          )
        )
      }
    })
  )

  const { formProps } = defineForm<GoalFormData>({
    namespace: 'apps.wallet',
    icon: type === 'create' ? 'tabler:plus' : 'tabler:pencil',
    title: `modals.savingGoal.${type}`,
    submitButton: type,
    onClose
  })
    .typesMap({
      name: 'text',
      icon: 'icon',
      color: 'color',
      target_amount: 'number',
      target_date: 'datetime'
    })
    .setupFields({
      name: {
        placeholder: 'Enter goal name',
        required: true,
        label: 'goalName',
        icon: 'tabler:target'
      },
      icon: {
        label: 'goalIcon'
      },
      color: {
        label: 'goalColor',
        icon: 'tabler:palette'
      },
      target_amount: {
        required: true,
        label: 'goalTargetAmount',
        icon: 'tabler:coin'
      },
      target_date: {
        label: 'goalTargetDate',
        icon: 'tabler:calendar'
      }
    })
    .initialData({
      name: existingGoal?.name || '',
      icon: existingGoal?.icon || 'tabler:target',
      color: existingGoal?.color || '#22c55e',
      target_amount: existingGoal?.target_amount || 0,
      target_date: dayjs(existingGoal?.target_date).toDate()
    })
    .onSubmit(async formData => {
      await mutation.mutateAsync(formData)
    })
    .build()

  return <FormModal {...formProps} />
}

export default ModifyGoalModal
