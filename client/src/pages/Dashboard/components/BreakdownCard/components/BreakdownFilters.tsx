import { useModuleTranslation } from '@lifeforge/localization'
import { Flex, Icon, Listbox, ListboxOption, Text } from '@lifeforge/ui'

import type { BreakdownGroupBy } from '..'

const GROUP_BY_OPTIONS: {
  value: BreakdownGroupBy
  icon: string
}[] = [
  { value: 'categories', icon: 'tabler:category' },
  { value: 'assets', icon: 'tabler:coin' },
  { value: 'platforms', icon: 'tabler:building-store' },
  { value: 'ledgers', icon: 'tabler:book' }
]

function BreakdownFilters({
  selectedType,
  setSelectedType,
  selectedGroupBy,
  setSelectedGroupBy
}: {
  selectedType: 'income' | 'expenses'
  setSelectedType: (type: 'income' | 'expenses') => void
  selectedGroupBy: BreakdownGroupBy
  setSelectedGroupBy: (groupBy: BreakdownGroupBy) => void
}) {
  const { t } = useModuleTranslation()

  return (
    <Flex
      align="center"
      direction={{ base: 'column', sm: 'row' }}
      gap="sm"
      width="100%"
    >
      <Listbox
        flex="1"
        renderContent={() => (
          <Flex align="center" gap="md" minWidth="0">
            <Icon
              color={selectedType === 'income' ? 'green-500' : 'red-500'}
              icon={
                selectedType === 'income' ? 'tabler:login-2' : 'tabler:logout'
              }
              size="1.5rem"
            />
            <Text truncate>{t(`transactionTypes.${selectedType}`)}</Text>
          </Flex>
        )}
        value={selectedType}
        width="100%"
        onChange={(value: 'income' | 'expenses') => setSelectedType(value)}
      >
        {(['income', 'expenses'] as const).map(type => (
          <ListboxOption
            key={type}
            icon={type === 'income' ? 'tabler:login-2' : 'tabler:logout'}
            label={t(`transactionTypes.${type}`)}
            value={type}
          />
        ))}
      </Listbox>
      <Listbox
        flex="1"
        renderContent={() => (
          <Flex align="center" gap="md" minWidth="0">
            <Icon
              icon={
                GROUP_BY_OPTIONS.find(o => o.value === selectedGroupBy)?.icon ??
                'tabler:category'
              }
              size="1.5rem"
            />
            <Text truncate>{t(`sidebar.${selectedGroupBy}`)}</Text>
          </Flex>
        )}
        value={selectedGroupBy}
        width="100%"
        onChange={(value: BreakdownGroupBy) => setSelectedGroupBy(value)}
      >
        {GROUP_BY_OPTIONS.map(option => (
          <ListboxOption
            key={option.value}
            icon={option.icon}
            label={t(`sidebar.${option.value}`)}
            value={option.value}
          />
        ))}
      </Listbox>
    </Flex>
  )
}

export default BreakdownFilters
