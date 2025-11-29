import useYearMonthOptions from '@/hooks/useYearMonthOptions'
import { ListboxInput, ListboxOption } from 'lifeforge-ui'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function YearMonthInput({
  month,
  setMonth,
  year,
  setYear
}: {
  month: number | null
  setMonth: (value: number | null) => void
  year: number | null
  setYear: (value: number | null) => void
}) {
  const { t } = useTranslation('common.misc')

  const { yearsOptions, monthsOptions } = useYearMonthOptions(year)

  useEffect(() => {
    if (yearsOptions.length > 0) {
      setYear(yearsOptions[0])
    }
  }, [yearsOptions])

  useEffect(() => {
    if (monthsOptions.length > 0) {
      setMonth(monthsOptions[0])
    }
  }, [monthsOptions])

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <ListboxInput
        buttonContent={
          <>
            <span className="-mt-px block truncate">
              {month !== null ? t(`dates.months.${month}`) : 'None'}
            </span>
          </>
        }
        className="w-full sm:w-1/2"
        icon="tabler:calendar-month"
        label="Month"
        namespace="apps.wallet"
        onChange={setMonth}
        value={month}
      >
        {monthsOptions.map(mon => (
          <ListboxOption
            key={mon}
            label={t(`dates.months.${mon}`)}
            value={mon}
          />
        ))}
      </ListboxInput>
      <ListboxInput
        buttonContent={
          <>
            <span className="-mt-px block truncate">{year ?? 'None'}</span>
          </>
        }
        className="w-full sm:w-1/2"
        icon="tabler:calendar"
        label="Year"
        namespace="apps.wallet"
        onChange={setYear}
        value={year}
      >
        {yearsOptions.map(yr => (
          <ListboxOption key={yr} label={yr.toString()} value={yr} />
        ))}
      </ListboxInput>
    </div>
  )
}

export default YearMonthInput
