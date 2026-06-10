import { SearchInput } from '@lifeforge/ui'

import { useWalletStore } from '@/stores/useWalletStore'

function SearchBar() {
  const { searchQuery, setSearchQuery } = useWalletStore()

  return (
    <SearchInput
      debounceMs={300}
      mt="md"
      searchTarget="transaction"
      value={searchQuery}
      onChange={setSearchQuery}
    />
  )
}

export default SearchBar
