import { useState } from 'react'

import { SearchInput, WithQuery } from '@lifeforge/ui'

import useEntityBreakdown from '@/hooks/useEntityBreakdown'
import { useWalletData } from '@/hooks/useWalletData'

import PlatformList from './PlatformList'

function PlatformsSection() {
  const { platformsQuery } = useWalletData()
  const { data: breakdown } = useEntityBreakdown()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <SearchInput
        debounceMs={300}
        my="md"
        searchTarget="platform"
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <WithQuery query={platformsQuery}>
        {platforms => (
          <PlatformList
            breakdown={breakdown?.platforms ?? {}}
            platforms={platforms}
            searchQuery={searchQuery}
          />
        )}
      </WithQuery>
    </>
  )
}

export default PlatformsSection
