import { useQuery } from '@tanstack/react-query'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Alert,
  Button,
  ModalHeader,
  Stack,
  WithTab,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import ModifyTemplatesModal from '../ModifyTemplatesModal'
import TemplateList from './components/TemplateList'

function ManageTemplatesModal({
  onClose,
  data: { choosing }
}: {
  onClose: () => void
  data: { choosing?: boolean }
}) {
  const { t } = useModuleTranslation()
  const { open } = useModalStore()

  const transactionTemplatesQuery = useQuery(
    forgeAPI.templates.list.queryOptions()
  )

  return (
    <Stack minHeight="80vh" minWidth="40vw">
      <ModalHeader
        headerActions={
          !choosing ? (
            <Button
              icon="tabler:plus"
              variant="plain"
              onClick={() => open(ModifyTemplatesModal, { type: 'create' })}
            />
          ) : undefined
        }
        icon="tabler:template"
        title={`templates.${choosing ? 'choose' : 'manage'}`}
        onClose={onClose}
      />
      {!choosing && (
        <Alert mb="md" type="note">
          {t('messages.aiAccuracy')}
        </Alert>
      )}
      <WithTab
        tabs={[
          {
            name: t('transactionTypes.income'),
            id: 'income',
            icon: 'tabler:login-2',
            amount: transactionTemplatesQuery.data?.income?.length || 0
          },
          {
            name: t('transactionTypes.expenses'),
            id: 'expenses',
            icon: 'tabler:logout',
            amount: transactionTemplatesQuery.data?.expenses?.length || 0
          }
        ]}
      >
        {({ TabSelector }) => (
          <>
            <TabSelector />
            <TemplateList choosing={choosing} onClose={onClose} />
          </>
        )}
      </WithTab>
    </Stack>
  )
}

export default ManageTemplatesModal
