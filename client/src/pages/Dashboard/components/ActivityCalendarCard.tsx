import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  ActivityCalendar,
  Flex,
  Icon,
  Listbox,
  ListboxOption,
  Text,
  Widget,
  WithQuery
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import { useWalletRange } from '@/providers/RangeProvider'
import numberToCurrency from '@/utils/numberToCurrency'

const TYPE_COLORS = {
  income: 'rgb(34 197 94)',
  expenses: 'rgb(239 68 68)'
} as const

function ActivityCalendarCard() {
  const { t } = useModuleTranslation()
  const { queryInput } = useWalletRange()
  const [selectedType, setSelectedType] = useState<'income' | 'expenses'>(
    'expenses'
  )

  const dataQuery = useQuery(
    forgeAPI.analytics.getDailyBreakdown.input(queryInput).queryOptions()
  )

  return (
    <Widget
      icon="tabler:calendar-stats"
      style={{ minHeight: 'min-content' }}
      title="activityCalendar"
    >
      <WithQuery query={dataQuery}>
        {data => {
          const values = data
            .map(item => (selectedType === 'income' ? item.income : item.expenses))
            .filter(value => value > 0)
            .sort((a, b) => a - b)

          const threshold = (percentile: number) =>
            values[Math.floor((values.length - 1) * percentile)] ?? 0

          const thresholds = [
            threshold(0.25),
            threshold(0.5),
            threshold(0.75)
          ]

          const getLevel = (value: number) => {
            if (value <= 0) return 0
            if (value <= thresholds[0]) return 1
            if (value <= thresholds[1]) return 2
            if (value <= thresholds[2]) return 3

            return 4
          }

          const calendarData = data.map(item => {
            const value =
              selectedType === 'income' ? item.income : item.expenses

            return { date: item.date, count: value, level: getLevel(value) }
          })

          return (
            <Flex direction="column" gap="md" width="100%">
              <Listbox
                renderContent={() => (
                  <Flex align="center" gap="md">
                    <Icon
                      color={
                        selectedType === 'income' ? 'green-500' : 'red-500'
                      }
                      icon={
                        selectedType === 'income'
                          ? 'tabler:login-2'
                          : 'tabler:logout'
                      }
                      size="1.5rem"
                    />
                    <Text>{t(`transactionTypes.${selectedType}`)}</Text>
                  </Flex>
                )}
                value={selectedType}
                width="100%"
                onChange={(value: 'income' | 'expenses') =>
                  setSelectedType(value)
                }
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
              <ActivityCalendar
                hideColorLegend
                hideTotalCount
                accentColor={TYPE_COLORS[selectedType]}
                blockMargin={4}
                blockSize={14}
                data={calendarData}
                empty={data.length === 0}
                emptyMessage={{ id: 'transactions' }}
                maxLevel={4}
                tooltipContent={activity =>
                  `${activity.date} - RM ${numberToCurrency(activity.count)}`
                }
              />
            </Flex>
          )
        }}
      </WithQuery>
    </Widget>
  )
}

export default ActivityCalendarCard
