import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  Box,
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  Flex,
  Icon,
  Text,
  surface,
  toast,
  useModalStore
} from '@lifeforge/ui'

import type { WalletTemplate } from '@/hooks/useWalletData'
import { forgeAPI } from '@/manifest'

import ModifyTemplatesModal from '../../ModifyTemplatesModal'
import ModifyTransactionsModal from '../../ModifyTransactionsModal'

function TemplateItem({
  template,
  choosing,
  onClose
}: {
  template: WalletTemplate
  choosing: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(forgeAPI.categories.list.queryOptions())

  const categories = categoriesQuery.data ?? []

  const { open } = useModalStore()

  const deleteMutation = useMutation(
    forgeAPI.templates.remove.input({ id: template.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wallet', 'templates'] })
      },
      onError: () => {
        toast.error('Failed to delete template')
      }
    })
  )

  return (
    <Card
      align="center"
      bg={choosing ? surface.lightInteractive : surface.light}
      direction="row"
      gap="md"
      justify="between"
      onClick={
        choosing
          ? () => {
              onClose()
              setTimeout(() => {
                open(ModifyTransactionsModal, {
                  type: 'create',
                  initialData: template
                })
              }, 200)
            }
          : undefined
      }
    >
      <Flex align="center" gap="md" minWidth="0" width="100%">
        {(() => {
          const targetCategory = categories.find(
            cat => cat.id === template.category
          )

          return (
            <Box
              p="sm"
              r="md"
              style={{
                backgroundColor: targetCategory
                  ? targetCategory.color + '10'
                  : undefined
              }}
            >
              <Icon
                icon={targetCategory?.icon || 'tabler:template'}
                size="1.5rem"
                style={{ color: targetCategory?.color }}
              />
            </Box>
          )
        })()}
        <Text truncate size="lg" weight="medium">
          {template.name}
        </Text>
      </Flex>
      {!choosing && (
        <ContextMenu>
          <ContextMenuItem
            icon="tabler:pencil"
            label="Edit"
            onClick={() =>
              open(ModifyTemplatesModal, {
                type: 'update',
                initialData: template
              })
            }
          />
          <ContextMenuItem
            dangerous
            icon="tabler:trash"
            label="Delete"
            onClick={() => {
              open(ConfirmationModal, {
                title: 'Delete Template',
                description: 'Are you sure you want to delete this template?',
                confirmationButton: 'delete',
                onConfirm: async () => {
                  await deleteMutation.mutateAsync(undefined)
                }
              })
            }}
          />
        </ContextMenu>
      )}
    </Card>
  )
}

export default TemplateItem
