import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { DateInput, SidebarTitle, Stack } from '@lifeforge/ui'

import { useWalletStore } from '@/stores/useWalletStore'

function DateRangeSelector() {
  const { t } = useTranslation('apps.lifeforge--wallet')

  const { startDate, endDate, setStartDate, setEndDate } = useWalletStore()

  const handleClear = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const handleDateChange = (
    date: Date | null,
    type: 'start_date' | 'end_date'
  ) => {
    if (!date) {
      if (type === 'start_date') setStartDate(undefined)
      else setEndDate(undefined)

      return
    }

    const otherDate =
      type === 'start_date'
        ? endDate !== undefined && dayjs(endDate).isValid()
          ? dayjs(endDate)
          : dayjs()
        : startDate !== undefined && dayjs(startDate).isValid()
          ? dayjs(startDate)
          : dayjs()

    if (
      (type === 'start_date' && dayjs(date).isAfter(otherDate)) ||
      (type === 'end_date' && dayjs(date).isBefore(otherDate))
    ) {
      if (type === 'start_date') setEndDate(dayjs(date).format('YYYY-MM-DD'))
      else setStartDate(dayjs(date).format('YYYY-MM-DD'))
    }

    if (type === 'start_date') setStartDate(dayjs(date).format('YYYY-MM-DD'))
    else setEndDate(dayjs(date).format('YYYY-MM-DD'))
  }

  return (
    <>
      <SidebarTitle
        actionButton={
          startDate !== undefined || endDate !== undefined
            ? {
                icon: 'tabler:trash',
                onClick: handleClear
              }
            : undefined
        }
        label={t('sidebar.dateRange')}
      />
      <Stack gap="md" px="md">
        <DateInput
          icon="tabler:calendar-up"
          label="Start Date"
          namespace="apps.lifeforge--wallet"
          value={
            startDate && dayjs(startDate).isValid()
              ? dayjs(startDate).toDate()
              : null
          }
          onChange={date => handleDateChange(date, 'start_date')}
        />
        <DateInput
          icon="tabler:calendar-down"
          label="End Date"
          namespace="apps.lifeforge--wallet"
          value={
            endDate && dayjs(endDate).isValid() ? dayjs(endDate).toDate() : null
          }
          onChange={date => handleDateChange(date, 'end_date')}
        />
      </Stack>
    </>
  )
}

export default DateRangeSelector
