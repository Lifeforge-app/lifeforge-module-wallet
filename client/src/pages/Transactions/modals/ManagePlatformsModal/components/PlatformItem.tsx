import { useForgeMutation } from '@lifeforge/api'
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
  useModalStore
} from '@lifeforge/ui'

import type { WalletPlatform } from '@/hooks/useWalletData'
import { forgeAPI } from '@/manifest'

import ModifyPlatformModal from '../../ModifyPlatformModal'

function PlatformItem({ platform }: { platform: WalletPlatform }) {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()

  const deleteMutation = useForgeMutation(
    forgeAPI.platforms.remove.input({ id: platform.id }),
    { action: 'delete', queryKey: forgeAPI.platforms.key }
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
        <Box p="sm" r="md" style={{ backgroundColor: platform.color + '20' }}>
          <Icon
            icon={platform.icon}
            size="1.75rem"
            style={{ color: platform.color }}
          />
        </Box>
        <Stack gap="none" minWidth="0" width="100%">
          <Text truncate size="lg" weight="medium">
            {platform.name}
          </Text>
          <Text color="muted" size="sm">
            {platform.amount} {t('transactionCount')}
          </Text>
        </Stack>
      </Flex>
      <ContextMenu>
        <ContextMenuItem
          icon="tabler:pencil"
          label="Edit"
          onClick={() =>
            open(ModifyPlatformModal, { type: 'update', initialData: platform })
          }
        />
        <ContextMenuItem
          dangerous
          icon="tabler:trash"
          label="Delete"
          onClick={() => {
            open(ConfirmationModal, {
              title: 'Delete Platform',
              description: 'Are you sure you want to delete this platform?',
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

export default PlatformItem
