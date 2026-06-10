import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { AutoSizer } from 'react-virtualized'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Alert,
  Box,
  Button,
  EmptyStateScreen,
  Flex,
  ModalHeader,
  Scrollbar,
  Stack,
  Tabs,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import ModifyTemplatesModal from '../ModifyTemplatesModal'
import TemplateItem from './components/Templateitem'

function ManageTemplatesModal({
  onClose,
  data: { choosing }
}: {
  onClose: () => void
  data: { choosing?: boolean }
}) {
  const { t } = useModuleTranslation()
  const { open } = useModalStore()

  const [selectedTab, setSelectedTab] = useState<'income' | 'expenses'>(
    'income'
  )

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
      <Tabs
        currentTab={selectedTab}
        enabled={['income', 'expenses']}
        items={[
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
        onTabChange={setSelectedTab as (value: string) => void}
      />
      <WithQuery query={transactionTemplatesQuery}>
        {templates =>
          templates[selectedTab].length > 0 ? (
            <Box flex="1" height="100%" mt="md">
              <AutoSizer>
                {({ width, height }) => (
                  <Scrollbar style={{ width, height }}>
                    <Stack>
                      {templates[selectedTab].map(template => (
                        <TemplateItem
                          key={template.id}
                          choosing={!!choosing}
                          template={template}
                          onClose={onClose}
                        />
                      ))}
                    </Stack>
                  </Scrollbar>
                )}
              </AutoSizer>
            </Box>
          ) : (
            <Flex centered flex="1">
              <EmptyStateScreen
                CTAButtonProps={{
                  children: 'new',
                  icon: 'tabler:plus',
                  onClick: () => open(ModifyTemplatesModal, { type: 'create' }),
                  tProps: { item: t('items.template') }
                }}
                icon="tabler:template-off"
                message={{
                  id: 'templates'
                }}
              />
            </Flex>
          )
        }
      </WithQuery>
    </Stack>
  )
}

export default ManageTemplatesModal
