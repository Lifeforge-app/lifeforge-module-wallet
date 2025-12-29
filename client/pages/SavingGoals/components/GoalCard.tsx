import forgeAPI from '@/utils/forgeAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  useModalStore
} from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import type { SavingGoal } from '..'
import ContributeModal from '../modals/ContributeModal'
import ModifyGoalModal from '../modals/ModifyGoalModal'
import GoalProgress from './GoalProgress'

function GoalCard({ goal }: { goal: SavingGoal }) {
  const { t } = useTranslation('apps.wallet')

  const queryClient = useQueryClient()

  const open = useModalStore(state => state.open)

  const deleteMutation = useMutation(
    forgeAPI.wallet.savingsGoals.remove.input({ id: goal.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'savingsGoals'] })
        toast.success(t('savingGoals.messages.goalDeleted'))
      },
      onError: () => {
        toast.error(t('savingGoals.messages.deleteFailed'))
      }
    })
  )

  const handleEdit = () => {
    open(ModifyGoalModal, { type: 'update', existingGoal: goal })
  }

  const handleContribute = () => {
    open(ContributeModal, { goal })
  }

  const handleDelete = () => {
    open(ConfirmationModal, {
      title: t('savingGoals.deleteConfirmation.title'),
      description: t('savingGoals.deleteConfirmation.description', {
        name: goal.name
      }),
      confirmationButton: 'delete',
      confirmationPrompt: goal.name,
      onConfirm: async () => {
        await deleteMutation.mutateAsync({})
      }
    })
  }

  return (
    <Card className="relative flex flex-col">
      <div className="absolute top-4 right-4">
        <ContextMenu>
          <ContextMenuItem
            icon="tabler:pencil"
            label={t('common.buttons:edit')}
            onClick={handleEdit}
          />
          <ContextMenuItem
            dangerous
            icon="tabler:trash"
            label={t('common.buttons:delete')}
            onClick={handleDelete}
          />
        </ContextMenu>
      </div>
      <GoalProgress goal={goal} />
      <Button
        className="mt-4 w-full"
        icon="tabler:plus"
        namespace="apps.wallet"
        variant="secondary"
        onClick={handleContribute}
      >
        savingGoals.contribute
      </Button>
    </Card>
  )
}

export default GoalCard
