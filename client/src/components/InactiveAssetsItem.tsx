import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  Card,
  Flex,
  Icon,
  Stack,
  Text,
  surface,
  useModalStore
} from '@lifeforge/ui'

import type { WalletAsset } from '@/hooks/useWalletData'
import InactiveAssetsModal from '@/pages/Assets/modals/InactiveAssetsModal'
import { useWalletStore } from '@/stores/useWalletStore'
import numberToCurrency from '@/utils/numberToCurrency'

function InactiveAssetsItem({
  assets,
  rangeMode
}: {
  assets: WalletAsset[]
  rangeMode?: 'week' | 'month' | 'quarter' | 'year' | 'all'
}) {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()
  const { isAmountHidden } = useWalletStore()

  const total = assets.reduce((sum, asset) => sum + asset.current_balance, 0)

  return (
    <Card
      isInteractive
      direction={{ base: 'column', md: 'row' }}
      gapX="2xl"
      gapY="lg"
      justify="between"
      onClick={() => open(InactiveAssetsModal, { rangeMode })}
    >
      <Flex align="center" gap="md">
        <Box bg={surface.light} color="muted" p="sm" r="md">
          <Icon icon="tabler:archive" />
        </Box>
        <Stack gap="xs" minWidth="0">
          <Text as="h2" size="xl" weight="medium">
            {t('labels.inactiveAssets')}
          </Text>
          <Text color="muted" size="sm">
            {t('labels.inactiveAssetsCount', { count: assets.length })}
          </Text>
        </Stack>
      </Flex>
      <Flex align="center" gap="lg" justify="between">
        <Flex align="center" gap="sm">
          <Text color="muted" size="xl">
            RM
          </Text>
          {isAmountHidden ? (
            <Flex align="center">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Icon key={i} icon="uil:asterisk" size="1rem" />
                ))}
            </Flex>
          ) : (
            <Text size="3xl" weight="medium">
              {numberToCurrency(total)}
            </Text>
          )}
        </Flex>
        <Icon color="muted" icon="tabler:chevron-right" />
      </Flex>
    </Card>
  )
}

export default InactiveAssetsItem
