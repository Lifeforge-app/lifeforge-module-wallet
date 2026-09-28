import type { ComponentProps } from 'react'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Flex,
  Icon,
  Listbox,
  ListboxOption,
  Text,
  surface
} from '@lifeforge/ui'

function RangeSelector({
  range,
  setRange,
  display
}: {
  range: 'week' | 'month' | 'ytd'
  setRange: (value: 'week' | 'month' | 'ytd') => void
  display?: ComponentProps<typeof Flex>['display']
}) {
  const { t } = useModuleTranslation()

  return (
    <Listbox
      bg={surface.light}
      display={display}
      minWidth="min-content"
      renderContent={() => (
        <Flex align="center" gap="md" minWidth="0" width="100%">
          <Icon color="muted" icon="tabler:history" size="1.5rem" />
          <Text truncate>{t(`timeRanges.${range}`)}</Text>
        </Flex>
      )}
      value={range}
      width={{ base: '100%', sm: 'auto' }}
      onChange={setRange}
    >
      {['week', 'month', 'ytd'].map(option => (
        <ListboxOption
          key={option}
          label={t(`timeRanges.${option}`)}
          value={option}
        />
      ))}
    </Listbox>
  )
}

export default RangeSelector
