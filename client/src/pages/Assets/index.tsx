import { useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  EmptyStateScreen,
  FAB,
  Flex,
  Listbox,
  ListboxOption,
  SearchInput,
  Stack,
  Text,
  Widget,
  WithQuery,
  surface,
  useModalStore
} from '@lifeforge/ui'

import InactiveAssetsItem from '@/components/InactiveAssetsItem'
import NetWorthSummary from '@/components/NetWorthSummary'
import { useWalletData } from '@/hooks/useWalletData'

import AssetItem from './components/AssetItem'
import AssetsHeader from './components/AssetsHeader'
import ModifyAssetModal from './modals/ModifyAssetModal'

const RANGE_OPTIONS = ['week', 'month', 'quarter', 'year', 'all'] as const

type RangeMode = (typeof RANGE_OPTIONS)[number]

function Assets() {
  const { open } = useModalStore()
  const { t } = useModuleTranslation()
  const { assetsQuery } = useWalletData()
  const { hash } = useLocation()

  const [searchQuery, setSearchQuery] = useQueryState('q', {
    defaultValue: ''
  })

  const [rangeMode, setRangeMode] = useQueryState('range', {
    defaultValue: 'month'
  })

  const activeAssets = useMemo(() => {
    const active = (assetsQuery.data ?? []).filter(asset => !asset.is_inactive)

    if (!searchQuery) return active

    const q = searchQuery.toLowerCase()

    return active.filter(asset => asset.name.toLowerCase().includes(q))
  }, [assetsQuery.data, searchQuery])

  const inactiveAssets = useMemo(
    () => (assetsQuery.data ?? []).filter(asset => asset.is_inactive),
    [assetsQuery.data]
  )

  const handleCreateCategory = useCallback(() => {
    open(ModifyAssetModal, {
      type: 'create'
    })
  }, [])

  useEffect(() => {
    if (hash === '#new') {
      handleCreateCategory()
    }
  }, [hash])

  return (
    <>
      <AssetsHeader
        rangeMode={rangeMode as RangeMode}
        onCreate={handleCreateCategory}
      />
      <Flex
        align="center"
        direction={{ base: 'column', sm: 'row' }}
        gap="sm"
        mb="lg"
      >
        <SearchInput
          searchTarget="asset"
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Listbox
          bg={surface.defaultInteractive}
          minWidth="14em"
          renderContent={() => (
            <Text whiteSpace="nowrap">{t(`rangeModes.${rangeMode}`)}</Text>
          )}
          value={rangeMode}
          width={{ base: '100%', sm: 'auto' }}
          onChange={setRangeMode}
        >
          {RANGE_OPTIONS.map(option => (
            <ListboxOption
              key={option}
              label={t(`rangeModes.${option}`)}
              value={option}
            />
          ))}
        </Listbox>
      </Flex>
      <WithQuery query={assetsQuery}>
        {assets => (
          <>
            <Widget
              height="min-content"
              icon="tabler:currency-dollar"
              mb="lg"
              title="Net Worth"
            >
              <NetWorthSummary spread assets={assets} />
            </Widget>
            {activeAssets.length > 0 || inactiveAssets.length > 0 ? (
              <Stack mb="2xl">
                {activeAssets.map(asset => (
                  <AssetItem
                    key={asset.id}
                    asset={asset}
                    rangeMode={rangeMode as RangeMode}
                  />
                ))}
                {inactiveAssets.length > 0 && (
                  <InactiveAssetsItem
                    assets={inactiveAssets}
                    rangeMode={rangeMode as RangeMode}
                  />
                )}
              </Stack>
            ) : (
              <EmptyStateScreen
                icon="tabler:wallet-off"
                message={{
                  id: 'assets'
                }}
              />
            )}
            <FAB icon="tabler:plus" onClick={handleCreateCategory} />
          </>
        )}
      </WithQuery>
    </>
  )
}

export default Assets
