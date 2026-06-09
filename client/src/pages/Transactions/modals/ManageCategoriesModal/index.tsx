import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AutoSizer } from 'react-virtualized'

import {
  Box,
  Button,
  EmptyStateScreen,
  Flex,
  ModalHeader,
  Scrollbar,
  Stack,
  Tabs,
  Text,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'

import ModifyCategoryModal from '../ModifyCategoryModal'
import CategoryItem from './components/CategoryItem'

function ManageCategoriesModal({ onClose }: { onClose: () => void }) {
  const { open } = useModalStore()

  const { t } = useTranslation('apps.lifeforge--wallet')

  const { categoriesQuery } = useWalletData()

  const [selectedTab, setSelectedTab] = useState<'income' | 'expenses'>(
    'income'
  )

  const filteredCategories =
    categoriesQuery.data?.filter(category => category.type === selectedTab) ??
    []

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
        namespace="apps.lifeforge--wallet"
        title="categories.manage"
        onClose={onClose}
      />
      <Tabs
        currentTab={selectedTab}
        enabled={['income', 'expenses']}
        items={[
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
        onTabChange={setSelectedTab as (value: string) => void}
      />
      <WithQuery query={categoriesQuery}>
        {categories =>
          categories.length > 0 ? (
            <Box flex="1" mt="md">
              <AutoSizer>
                {({ width, height }) => (
                  <Scrollbar style={{ width, height }}>
                    <Stack>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map(category => (
                          <CategoryItem key={category.id} category={category} />
                        ))
                      ) : (
                        <Text align="center" color="muted">
                          No {selectedTab} categories found
                        </Text>
                      )}
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
                  onClick: () => {
                    open(ModifyCategoryModal, { type: 'create' })
                  },
                  tProps: { item: t('items.category') }
                }}
                icon="tabler:apps-off"
                message={{
                  id: 'categories',
                  namespace: 'apps.lifeforge--wallet'
                }}
              />
            </Flex>
          )
        }
      </WithQuery>
    </Stack>
  )
}

export default ManageCategoriesModal
