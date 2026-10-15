import {
  Box,
  EmptyStateScreen,
  ModalHeader,
  Stack,
  WithQuery,
  surface
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'

import AssetItem from '../components/AssetItem'

function InactiveAssetsModal({
  data: { rangeMode = 'month' },
  onClose
}: {
  data: {
    rangeMode?: 'week' | 'month' | 'quarter' | 'year' | 'all'
  }
  onClose: () => void
}) {
  const { assetsQuery } = useWalletData()

  return (
    <Box minWidth="50vw">
      <ModalHeader
        icon="tabler:archive"
        title="inactiveAssets"
        onClose={onClose}
      />
      <WithQuery query={assetsQuery}>
        {assets => {
          const inactiveAssets = assets.filter(asset => asset.is_inactive)

          if (inactiveAssets.length === 0) {
            return (
              <EmptyStateScreen
                smaller
                icon="tabler:archive-off"
                message={{
                  id: 'inactiveAssets'
                }}
              />
            )
          }

          return (
            <Stack>
              {inactiveAssets.map(asset => (
                <AssetItem
                  key={asset.id}
                  asset={asset}
                  bg={surface.light}
                  rangeMode={rangeMode}
                />
              ))}
            </Stack>
          )
        }}
      </WithQuery>
    </Box>
  )
}

export default InactiveAssetsModal
