import { Box, Card, Flex, Icon, Text, surface } from '@lifeforge/ui'

import type { WalletAsset } from '@/hooks/useWalletData'

import AssetAmount from './AssetAmount'
import AssetBalanceChart from './AssetBalanceChart'
import AssetContextMenu from './AssetContextMenu'

function AssetItem({ asset }: { asset: WalletAsset }) {
  return (
    <Card gap="md">
      <Flex align="center" gap="2xl" justify="between">
        <Flex align="center" gap="md">
          <Box bg={surface.light} color="muted" p="sm" r="md">
            <Icon icon={asset.icon} />
          </Box>
          <Text as="h2" size="xl" weight="medium">
            {asset.name}
          </Text>
        </Flex>
        <AssetContextMenu asset={asset} />
      </Flex>
      <AssetAmount amount={asset.current_balance} />
      <AssetBalanceChart asset={asset} />
    </Card>
  )
}

export default AssetItem
