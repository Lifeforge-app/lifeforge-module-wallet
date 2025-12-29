import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { Card } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'

function DetailItem({
  icon,
  label,
  vertical = false,
  children
}: {
  icon: string
  label: string
  vertical?: boolean
  children: React.ReactElement
}) {
  const { t } = useTranslation('apps.wallet')

  return (
    <Card
      className={clsx(
        'component-bg-lighter w-full min-w-0',
        vertical ? 'space-y-3' : 'sm:flex-between gap-12 space-y-3 sm:space-y-0'
      )}
    >
      <div className="text-bg-500 flex min-w-0 shrink-0 items-center gap-3">
        <Icon className="size-6 shrink-0" icon={icon} />
        <h3 className="w-full min-w-0 truncate text-lg font-medium">
          {t(`inputs.${label}`)}
        </h3>
      </div>
      {children}
    </Card>
  )
}

export default DetailItem
