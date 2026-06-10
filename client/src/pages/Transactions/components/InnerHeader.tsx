import { useModuleTranslation } from '@lifeforge/localization'

import {
  Button,
  Flex,
  Stack,
  TagsFilter,
  Text,
  useModuleSidebarState
} from '@lifeforge/ui'

import { useFilteredTransactions } from '@/hooks/useFilteredTransactions'
import { useWalletData } from '@/hooks/useWalletData'
import { useWalletStore } from '@/stores/useWalletStore'

function InnerHeader() {
  const { transactionsQuery, assetsQuery, categoriesQuery, ledgersQuery } =
    useWalletData()

  const {
    searchQuery,
    selectedType,
    selectedCategory,
    selectedAsset,
    selectedLedger,
    setSelectedType,
    setSelectedCategory,
    setSelectedAsset,
    setSelectedLedger
  } = useWalletStore()

  const { setIsSidebarOpen } = useModuleSidebarState()
  const { t } = useModuleTranslation(['common.buttons'])

  const assets = assetsQuery.data ?? []

  const categories = categoriesQuery.data ?? []

  const ledgers = ledgersQuery.data ?? []

  const filteredTransactions = useFilteredTransactions(
    transactionsQuery.data ?? []
  )

  return (
    <Flex align="center" justify="between">
      <Stack>
        <Text as="h1" size={{ base: '3xl', lg: '4xl' }} weight="semibold">
          {t(
            `apps.lifeforge--wallet:header.${
              !selectedType &&
              !selectedCategory &&
              !selectedAsset &&
              !selectedLedger &&
              searchQuery === ''
                ? 'all'
                : 'filtered'
            }Transactions`
          )}{' '}
          <Text color="muted" size="base">
            ({filteredTransactions.length.toLocaleString()})
          </Text>
        </Text>
        <TagsFilter
          availableFilters={{
            type: {
              data: [
                {
                  id: 'income',
                  icon: 'tabler:login-2',
                  label: 'Income',
                  color: '#22c55e'
                },
                {
                  id: 'expenses',
                  icon: 'tabler:logout',
                  label: 'Expenses',
                  color: '#ef4444'
                },
                {
                  id: 'transfer',
                  icon: 'tabler:transfer',
                  label: 'Transfer',
                  color: '#3b82f6'
                }
              ],
              isColored: true
            },
            category: {
              data: categories.map(category => ({
                id: category.id,
                icon: category.icon,
                color: category.color,
                label: category.name
              })),
              isColored: true
            },
            asset: {
              data: assets.map(asset => ({
                id: asset.id,
                icon: asset.icon,
                label: asset.name
              }))
            },
            ledger: {
              data: ledgers.map(ledger => ({
                id: ledger.id,
                icon: ledger.icon,
                color: ledger.color,
                label: ledger.name
              })),
              isColored: true
            }
          }}
          values={{
            type: selectedType,
            category: selectedCategory,
            asset: selectedAsset,
            ledger: selectedLedger
          }}
          onChange={{
            type: setSelectedType as (value: string | null) => void,
            category: setSelectedCategory,
            asset: setSelectedAsset,
            ledger: setSelectedLedger
          }}
        />
      </Stack>
      <Button
        display={{ xl: 'none' }}
        icon="tabler:menu"
        variant="plain"
        onClick={() => {
          setIsSidebarOpen(true)
        }}
      />
    </Flex>
  )
}

export default InnerHeader
