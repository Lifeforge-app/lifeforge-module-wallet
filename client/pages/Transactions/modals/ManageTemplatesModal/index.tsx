import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  EmptyStateScreen,
  ModalHeader,
  Scrollbar,
  Tabs,
  WithQuery,
  useModalStore
} from 'lifeforge-ui'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AutoSizer } from 'react-virtualized'

import ModifyTemplatesModal from '../ModifyTemplatesModal'
import TemplateItem from './components/Templateitem'

function ManageTemplatesModal({
  onClose,
  data: { choosing }
}: {
  onClose: () => void
  data: { choosing?: boolean }
}) {
  const { t } = useTranslation('apps.wallet')

  const open = useModalStore(state => state.open)

  const [selectedTab, setSelectedTab] = useState<'income' | 'expenses'>(
    'income'
  )

  const transactionTemplatesQuery = useQuery(
    forgeAPI.wallet.templates.list.queryOptions()
  )

  return (
    <div className="flex min-h-[80vh] min-w-[40vw] flex-col">
      <ModalHeader
        actionButtonProps={
          !choosing
            ? {
                icon: 'tabler:plus',
                onClick: () => {
                  open(ModifyTemplatesModal, {
                    type: 'create'
                  })
                }
              }
            : undefined
        }
        icon="tabler:template"
        namespace="apps.wallet"
        title={`templates.${choosing ? 'choose' : 'manage'}`}
        onClose={onClose}
      />
      {!choosing && (
        <Alert className="mb-4" type="note">
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
            <div className="mt-4 flex-1">
              <AutoSizer>
                {({ width, height }) => (
                  <Scrollbar
                    style={{
                      width,
                      height: height
                    }}
                  >
                    <ul className="space-y-3">
                      {templates[selectedTab].map(template => (
                        <TemplateItem
                          key={template.id}
                          choosing={!!choosing}
                          template={template}
                          onClose={onClose}
                        />
                      ))}
                    </ul>
                  </Scrollbar>
                )}
              </AutoSizer>
            </div>
          ) : (
            <div className="flex-center flex-1">
              <EmptyStateScreen
                CTAButtonProps={{
                  children: 'new',
                  icon: 'tabler:plus',
                  onClick: () => {
                    open(ModifyTemplatesModal, {
                      type: 'create'
                    })
                  },
                  tProps: { item: t('items.template') }
                }}
                icon="tabler:template-off"
                message={{
                  id: 'templates',
                  namespace: 'apps.wallet'
                }}
              />
            </div>
          )
        }
      </WithQuery>
    </div>
  )
}

export default ManageTemplatesModal
