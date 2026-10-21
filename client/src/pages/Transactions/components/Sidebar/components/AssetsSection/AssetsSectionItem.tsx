import { useCallback } from 'react'

import { SidebarItem } from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'

function AssetsSectionItem({
  icon,
  label,
  id,
  amount,
  filterKey = 'asset'
}: {
  icon: string
  label: string
  id: string | null
  amount: number | undefined
  filterKey?: 'asset' | 'inactiveAssets'
}) {
  const { asset, inactiveAssets, setFilters } = useFilter()

  const value = filterKey === 'inactiveAssets' ? inactiveAssets : asset

  const active =
    id === null ? asset === '' && inactiveAssets === '' : value === id

  const handleCancelButtonClick = useCallback(() => {
    setFilters({ asset: '', inactiveAssets: '' })
  }, [setFilters])

  const handleClick = useCallback(() => {
    if (filterKey === 'inactiveAssets') {
      setFilters({ asset: '', inactiveAssets: 'true' })
    } else {
      setFilters({ asset: id ?? '', inactiveAssets: '' })
    }
  }, [id, filterKey, setFilters])

  return (
    <SidebarItem
      active={active}
      icon={icon}
      label={label}
      namespace={id ? false : undefined}
      number={amount}
      onCancelButtonClick={id !== null ? handleCancelButtonClick : undefined}
      onClick={handleClick}
    />
  )
}

export default AssetsSectionItem
