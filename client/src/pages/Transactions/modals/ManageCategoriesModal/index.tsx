import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  ModalHeader,
  Stack,
  WithTab,
  useModalStore
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'

import ModifyCategoryModal from '../ModifyCategoryModal'
import CategoryList from './components/CategoryList'

function ManageCategoriesModal({ onClose }: { onClose: () => void }) {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()
  const { categoriesQuery } = useWalletData()

  return (
    <Stack minHeight="80vh" minWidth="40vw">
      <ModalHeader
        headerActions={
          <Button
            icon="tabler:plus"
            variant="plain"
            onClick={() => open(ModifyCategoryModal, { type: 'create' })}
          />
        }
        icon="tabler:apps"
        title="categories.manage"
        onClose={onClose}
      />
      <WithTab
        tabs={[
          {
            name: t('transactionTypes.income'),
            id: 'income',
            icon: 'tabler:login-2',
            amount:
              categoriesQuery.data?.filter(
                category => category.type === 'income'
              ).length || 0
          },
          {
            name: t('transactionTypes.expenses'),
            id: 'expenses',
            icon: 'tabler:logout',
            amount:
              categoriesQuery.data?.filter(
                category => category.type === 'expenses'
              ).length || 0
          }
        ]}
        useNuqs={false}
      >
        {({ TabSelector }) => (
          <>
            <TabSelector />
            <CategoryList />
          </>
        )}
      </WithTab>
    </Stack>
  )
}

export default ManageCategoriesModal
