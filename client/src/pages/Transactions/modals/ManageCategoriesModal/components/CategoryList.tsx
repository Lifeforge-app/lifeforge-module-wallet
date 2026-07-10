import { AutoSizer } from 'react-virtualized'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  EmptyStateScreen,
  Flex,
  Scrollbar,
  Stack,
  Text,
  WithQuery,
  useModalStore,
  useTabContext
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'

import ModifyCategoryModal from '../../ModifyCategoryModal'
import CategoryItem from './CategoryItem'

function CategoryList() {
  const { t } = useModuleTranslation()
  const { open } = useModalStore()
  const { currentTab } = useTabContext()
  const { categoriesQuery } = useWalletData()

  const filteredCategories =
    categoriesQuery.data?.filter(category => category.type === currentTab) ?? []

  return (
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
                        No {currentTab} categories found
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
                id: 'categories'
              }}
            />
          </Flex>
        )
      }
    </WithQuery>
  )
}

export default CategoryList
