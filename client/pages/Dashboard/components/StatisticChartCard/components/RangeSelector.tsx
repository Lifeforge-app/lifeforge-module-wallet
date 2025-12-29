import { Icon } from '@iconify/react/dist/iconify.js'
import clsx from 'clsx'
import { Listbox, ListboxOption } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'

function RangeSelector({
  range,
  setRange,
  className
}: {
  range: 'week' | 'month' | 'ytd'
  setRange: (value: 'week' | 'month' | 'ytd') => void
  className?: string
}) {
  const { t } = useTranslation('apps.wallet')

  return (
    <Listbox
      buttonContent={
        <div className="flex items-center gap-3">
          <Icon className="text-bg-500 size-6" icon="tabler:history" />
          {t(`timeRanges.${range}`)}
        </div>
      }
      className={clsx(className, 'component-bg-lighter')}
      value={range}
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
