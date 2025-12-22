import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  EmptyStateScreen,
  FAB,
  ModuleHeader,
  Scrollbar,
  WithQuery,
  useModalStore
} from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import type { InferOutput } from 'shared'

import GoalCard from './components/GoalCard'
import ModifyGoalModal from './modals/ModifyGoalModal'

export type SavingGoal = InferOutput<
  typeof forgeAPI.wallet.savingsGoals.list
>[number]

function SavingGoals() {
  const { t } = useTranslation('apps.wallet')

  const open = useModalStore(state => state.open)

  const goalsQuery = useQuery(forgeAPI.wallet.savingsGoals.list.queryOptions())

  const handleCreate = () => {
    open(ModifyGoalModal, { type: 'create' })
  }

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            className="hidden md:flex"
            icon="tabler:plus"
            tProps={{ item: t('items.savingGoal') }}
            variant="secondary"
            onClick={handleCreate}
          >
            new
          </Button>
        }
        icon="tabler:target"
        namespace="apps.wallet"
        title="Saving Goals"
        tKey="subsectionsTitleAndDesc"
      />
      <WithQuery query={goalsQuery}>
        {goals =>
          goals.length > 0 ? (
            <Scrollbar>
              <div className="mb-24 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-6 lg:grid-cols-3 xl:grid-cols-4">
                {goals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </Scrollbar>
          ) : (
            <EmptyStateScreen
              icon="tabler:target-off"
              message={{
                id: 'savingGoals',
                namespace: 'apps.wallet'
              }}
            />
          )
        }
      </WithQuery>
      <FAB alwaysShow as="button" icon="tabler:plus" onClick={handleCreate}>
        {t('common.buttons:new', { item: t('items.savingGoal') })}
      </FAB>
    </>
  )
}

export default SavingGoals
