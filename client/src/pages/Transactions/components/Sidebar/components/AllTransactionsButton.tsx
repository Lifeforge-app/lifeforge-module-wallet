import { useCallback, useMemo } from 'react'

import { SidebarItem } from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'

function AllTransactionsButton() {
  const { type, category, asset, ledger, inactiveAssets, updateFilter } =
    useFilter()

  const activeState = useMemo(
    () =>
      category === '' &&
      asset === '' &&
      ledger === '' &&
      inactiveAssets === '' &&
      type === '',
    [category, asset, ledger, inactiveAssets, type]
  )

  const handleAllTransactionsClick = useCallback(() => {
    updateFilter('type', '')
    updateFilter('category', '')
    updateFilter('asset', '')
    updateFilter('ledger', '')
    updateFilter('inactiveAssets', '')
  }, [updateFilter])

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
