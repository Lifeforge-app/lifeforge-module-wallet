import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ModalHeader, NumberInput, TagChip } from 'lifeforge-ui'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import forgeAPI from '@/utils/forgeAPI'
import numberToCurrency from '@/utils/numberToCurrency'

import type { SavingGoal } from '..'
import GoalProgress from '../components/GoalProgress'

const QUICK_AMOUNTS = [10, 50, 100, 500]

const QUICK_PERCENTAGES = [25, 50, 75, 100]

function ContributeModal({
  data: { goal },
  onClose
}: {
  data: { goal: SavingGoal }
  onClose: () => void
}) {
  const { t } = useTranslation('apps.wallet')

  const [amount, setAmount] = useState(0)

  const queryClient = useQueryClient()

  const mutation = useMutation(
    forgeAPI.savingsGoals.contribute.input({ id: goal.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', 'savingsGoals']
        })

        toast.success(t('savingGoals.messages.contributionAdded'))

        onClose()
      }
    })
  )

  const handleSubmit = () => {
    if (amount === 0) return

    mutation.mutate({ amount })
  }

  const remaining = goal.target_amount - goal.current_amount

  const handleQuickAmount = (value: number) => {
    setAmount(prev => prev + value)
  }

  const handlePercentage = (percent: number) => {
    const value = Math.round(((remaining * percent) / 100) * 100) / 100

    setAmount(value)
  }

  return (
    <div className="min-w-[40vw] space-y-4">
      <ModalHeader
        icon="tabler:plus"
        namespace="apps.wallet"
        title="savingGoals.contribute"
        onClose={onClose}
      />
      <GoalProgress goal={goal} previewAmount={amount} />
      <NumberInput
        icon="tabler:coin"
        label="contributeAmount"
        namespace="apps.wallet"
        value={amount}
        onChange={setAmount}
      />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map(value => (
            <TagChip
              key={value}
              icon="tabler:plus"
              label={`RM ${numberToCurrency(value)}`}
              onClick={() => handleQuickAmount(value)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PERCENTAGES.map(percent => (
            <TagChip
              key={percent}
              icon="tabler:percentage"
              label={`${percent}% (RM ${numberToCurrency(Math.round(((remaining * percent) / 100) * 100) / 100)})`}
              onClick={() => handlePercentage(percent)}
            />
          ))}
        </div>
      </div>
      <div className="mt-6! flex gap-2">
        <Button
          className="w-full"
          icon="tabler:x"
          variant="secondary"
          onClick={onClose}
        >
          cancel
        </Button>
        <Button
          className="w-full"
          icon="tabler:check"
          loading={mutation.isPending}
          namespace="apps.wallet"
          variant="primary"
          onClick={handleSubmit}
        >
          buttons.contribute
        </Button>
      </div>
    </div>
  )
}

export default ContributeModal
