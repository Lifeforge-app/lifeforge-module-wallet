import dayjs from 'dayjs'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Box,
  DateInput,
  Flex,
  Icon,
  Listbox,
  ListboxOption,
  Stack,
  Text,
  surface
} from '@lifeforge/ui'

import {
  type DashboardRange,
  useDashboardRange
} from '../providers/DashboardRangeProvider'

const RANGE_OPTIONS: DashboardRange[] = [
  'week',
  'month',
  'mtd',
  'quarter',
  'year',
  'ytd',
  'all',
  'custom'
]

function DashboardRangeSelector() {
  const { t } = useModuleTranslation()

  const { range, setRange, startDate, endDate, setStartDate, setEndDate } =
    useDashboardRange()

  return (
    <Stack gap="sm" mb="sm">
      <Listbox
        bg={surface.default}
        renderContent={() => (
          <Flex align="center" gap="md" minWidth="0" width="100%">
            <Icon color="muted" icon="tabler:history" size="1.5rem" />
            <Text truncate>{t(`rangeModes.${range}`)}</Text>
          </Flex>
        )}
        value={range}
        width="100%"
        onChange={(value: DashboardRange) => setRange(value)}
      >
        {RANGE_OPTIONS.map(option => (
          <ListboxOption
            key={option}
            label={t(`rangeModes.${option}`)}
            value={option}
          />
        ))}
      </Listbox>
      {range === 'custom' && (
        <Flex gap="sm" width="100%">
          <Box flex="1" minWidth="0">
            <DateInput
              icon="tabler:calendar"
              label="startDate"
              value={startDate ? dayjs(startDate).toDate() : null}
              wrapperProps={{ bg: surface.default }}
              onChange={value =>
                setStartDate(value ? dayjs(value).format('YYYY-MM-DD') : '')
              }
            />
          </Box>
          <Box flex="1" minWidth="0">
            <DateInput
              icon="tabler:calendar"
              label="endDate"
              value={endDate ? dayjs(endDate).toDate() : null}
              wrapperProps={{ bg: surface.default }}
              onChange={value =>
                setEndDate(value ? dayjs(value).format('YYYY-MM-DD') : '')
              }
            />
          </Box>
        </Flex>
      )}
    </Stack>
  )
}

export default DashboardRangeSelector
