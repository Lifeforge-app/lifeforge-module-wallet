import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import z from 'zod'

import {
  ColorField,
  CurrencyField,
  DateField,
  FormModal,
  IconField,
  TextField,
  createDefaultValues
} from '@lifeforge/ui'

import forgeAPI from '@/utils/forgeAPI'

import type { SavingGoal } from '..'

const schema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  icon: z.string().min(1, 'Goal icon is required'),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'Color must be a valid hex color (e.g. #FF0000)'
    ),
  target_amount: z.number().nonnegative(),
  target_date: z.date()
})

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
      ? forgeAPI.savingsGoals.create
      : forgeAPI.savingsGoals.update.input({
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

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      name: existingGoal?.name || '',
      icon: existingGoal?.icon || 'tabler:target',
      color: existingGoal?.color || '#22c55e',
      target_amount: existingGoal?.target_amount || 0,
      target_date: dayjs(existingGoal?.target_date).toDate()
    },
    mode: 'all',
    resolver: zodResolver(schema)
  })

  return (
    <FormModal
      form={form}
      submissionConfig={{
        handler: async formData => {
          await mutation.mutateAsync({
            ...formData,
            target_date: dayjs(formData.target_date).format('YYYY-MM-DD')
          })
        },
        template: type
      }}
      uiConfig={{
        icon: type === 'create' ? 'tabler:plus' : 'tabler:pencil',
        namespace: 'apps.wallet',
        title: `modals.savingGoal.${type}`,
        onClose
      }}
    >
      <TextField
        required
        control={form.control}
        icon="tabler:target"
        label="goalName"
        name="name"
        placeholder="Enter goal name"
      />
      <IconField control={form.control} label="goalIcon" name="icon" />
      <ColorField control={form.control} label="goalColor" name="color" />
      <CurrencyField
        required
        control={form.control}
        icon="tabler:coin"
        label="goalTargetAmount"
        name="target_amount"
      />
      <DateField
        control={form.control}
        icon="tabler:calendar"
        label="goalTargetDate"
        name="target_date"
      />
    </FormModal>
  )
}

export default ModifyGoalModal
