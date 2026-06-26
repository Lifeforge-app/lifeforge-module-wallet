import { useCallback, useMemo } from 'react'

import { SidebarItem } from '@lifeforge/ui'

import { useWalletStore } from '@/stores/useWalletStore'

function AllTransactionsButton() {
  const {
    selectedType,
    selectedAsset,
    selectedLedger,
    selectedCategory,
    setSelectedType,
    setSelectedCategory,
    setSelectedAsset,
    setSelectedLedger
  } = useWalletStore()

  const activeState = useMemo(
    () =>
      selectedAsset === null &&
      selectedLedger === null &&
      selectedCategory === null &&
      selectedType === null,
    [selectedAsset, selectedLedger, selectedCategory, selectedType]
  )

  const handleAllTransactionsClick = useCallback(() => {
    setSelectedType(null)
    setSelectedCategory(null)
    setSelectedAsset(null)
    setSelectedLedger(null)
  }, [
    setSelectedType,
    setSelectedCategory,
    setSelectedAsset,
    setSelectedLedger
  ])

  return (
    <SidebarItem
      active={activeState}
      icon="tabler:list"
      label="allTransactions"
      onClick={handleAllTransactionsClick}
    />
  )
}

export default AllTransactionsButton
