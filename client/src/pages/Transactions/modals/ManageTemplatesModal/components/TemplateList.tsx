import { useQuery } from '@tanstack/react-query'
import { AutoSizer } from 'react-virtualized'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  EmptyStateScreen,
  Flex,
  Scrollbar,
  Stack,
  WithQuery,
  useModalStore,
  useTabContext
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import ModifyTemplatesModal from '../../ModifyTemplatesModal'
import TemplateItem from './Templateitem'

function TemplateList({
  choosing,
  onClose
}: {
  choosing: boolean | undefined
  onClose: () => void
}) {
  const { t } = useModuleTranslation()
  const { currentTab } = useTabContext<'income' | 'expenses'>()
  const { open } = useModalStore()

  const transactionTemplatesQuery = useQuery(
    forgeAPI.templates.list.queryOptions()
  )

  return (
    <WithQuery query={transactionTemplatesQuery}>
      {templates =>
        templates[currentTab].length > 0 ? (
          <Box flex="1" height="100%" mt="md">
            <AutoSizer>
              {({ width, height }) => (
                <Scrollbar style={{ width, height }}>
                  <Stack>
                    {templates[currentTab].map(template => (
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
  )
}

export default TemplateList
