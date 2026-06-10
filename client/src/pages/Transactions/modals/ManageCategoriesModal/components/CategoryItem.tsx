import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  Flex,
  Icon,
  Stack,
  Text,
  surface,
  toast,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import type { WalletCategory } from '../../..'
import ModifyCategoryModal from '../../ModifyCategoryModal'

function CategoryItem({ category }: { category: WalletCategory }) {
  const queryClient = useQueryClient()
  const { open } = useModalStore()
  const { t } = useModuleTranslation()

  const deleteMutation = useMutation(
    forgeAPI.categories.remove.input({ id: category.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'categories'] })
      },
      onError: err => {
        toast.error(`Failed to delete category: ${err.message}`)
      }
    })
  )

  return (
    <Card
      align="center"
      bg={surface.light}
      direction="row"
      gap="md"
      justify="between"
    >
      <Flex align="center" gap="md" minWidth="0" width="100%">
        <Box p="sm" r="md" style={{ backgroundColor: category.color + '20' }}>
          <Icon
            icon={category.icon}
            size="1.75rem"
            style={{ color: category.color }}
          />
        </Box>
        <Stack gap="none" minWidth="0" width="100%">
          <Text truncate size="lg" weight="medium">
            {category.name}
          </Text>
          <Text color="muted" size="sm">
            {category.amount} {t('transactionCount')}
          </Text>
        </Stack>
      </Flex>
      <ContextMenu>
        <ContextMenuItem
          icon="tabler:pencil"
          label="Edit"
          onClick={() =>
            open(ModifyCategoryModal, { type: 'update', initialData: category })
          }
        />
        <ContextMenuItem
          dangerous
          icon="tabler:trash"
          label="Delete"
          onClick={() => {
            open(ConfirmationModal, {
              title: 'Delete Category',
              description: 'Are you sure you want to delete this category?',
              confirmationButton: 'delete',
              onConfirm: async () => {
                await deleteMutation.mutateAsync(undefined)
              }
            })
          }}
        />
      </ContextMenu>
    </Card>
  )
}

export default CategoryItem
