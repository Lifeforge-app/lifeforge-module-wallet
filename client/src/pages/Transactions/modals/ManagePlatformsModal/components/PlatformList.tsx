import { AutoSizer } from 'react-virtualized'

import {
  Box,
  EmptyStateScreen,
  Flex,
  Scrollbar,
  Stack
} from '@lifeforge/ui'

import type { WalletPlatform } from '@/hooks/useWalletData'

import PlatformItem from './PlatformItem'

function PlatformList({ platforms }: { platforms: WalletPlatform[] }) {
  if (platforms.length === 0) {
    return (
      <Flex centered flex="1">
        <EmptyStateScreen
          icon="tabler:building-store-off"
          message={{
            id: 'platforms'
          }}
        />
      </Flex>
    )
  }

  return (
    <Box flex="1" mt="md">
      <AutoSizer>
        {({ width, height }) => (
          <Scrollbar style={{ width, height }}>
            <Stack>
              {platforms.map(platform => (
                <PlatformItem key={platform.id} platform={platform} />
              ))}
            </Stack>
          </Scrollbar>
        )}
      </AutoSizer>
    </Box>
  )
}

export default PlatformList
