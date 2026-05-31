import { SearchInput } from '@lifeforge/ui'

import { useWalletStore } from '@/stores/useWalletStore'

function SearchBar() {
  const { searchQuery, setSearchQuery } = useWalletStore()

  return (
    <div className="flex items-center gap-2">
      <SearchInput
        className="mt-4"
        debounceMs={300}
        namespace="apps.wallet"
        searchTarget="transaction"
        onChange={setSearchQuery}
        value={searchQuery}
      />
    </div>
  )
}

export default SearchBar
