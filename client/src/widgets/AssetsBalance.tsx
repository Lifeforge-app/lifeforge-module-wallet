import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { Button, Card, EmptyStateScreen, Widget, WithQuery } from 'lifeforge-ui'
import { useRef, useState } from 'react'
import { Link, useDivSize } from 'shared'
import type { WidgetConfig } from 'shared'

import { useWalletData } from '../hooks/useWalletData'
import numberToCurrency from '../utils/numberToCurrency'

export default function AssetsBalance() {
  const { assetsQuery } = useWalletData()

  const ref = useRef<HTMLDivElement>(null)

  const { width } = useDivSize(ref)

  const [showBalance, setShowBalance] = useState(false)

  return (
    <Widget
      actionComponent={
        <Button
          className="p-2!"
          icon={!showBalance ? 'tabler:eye-off' : 'tabler:eye'}
          variant="plain"
          onClick={() => {
            setShowBalance(!showBalance)
          }}
        />
      }
      icon="tabler:wallet"
      namespace="apps.wallet"
      title="Assets Balance"
    >
      <WithQuery query={assetsQuery}>
        {assets =>
          assets.length === 0 ? (
            <EmptyStateScreen
              smaller
              icon="tabler:wallet-off"
              message={{
                id: 'assets',
                namespace: 'apps.wallet',
                tKey: 'widgets.assetsBalance'
              }}
            />
          ) : (
            <ul
              className={clsx(
                'grid h-full gap-2 overflow-y-auto',
                width > 400 && 'grid-cols-[repeat(auto-fill,minmax(240px,1fr))]'
              )}
            >
              {assets.map(asset => (
                <Card
                  key={asset.id}
                  isInteractive
                  as={Link}
                  className="flex-between component-bg-lighter-with-hover flex min-w-0 gap-3"
                  to={'/wallet/assets'}
                >
                  <div className="flex w-full min-w-0 items-center gap-3">
                    <div className="bg-bg-200 dark:bg-bg-700 rounded-md p-2">
                      <Icon
                        className="text-bg-500 dark:text-bg-100 size-6"
                        icon={asset.icon}
                      />
                    </div>
                    <div className="flex w-full min-w-0 flex-col">
                      <div className="w-full min-w-0 truncate font-semibold">
                        {asset.name}
                      </div>
                      <div className="text-bg-500 flex items-center gap-1 text-sm">
                        RM{' '}
                        {showBalance ? (
                          numberToCurrency(asset.current_balance)
                        ) : (
                          <span className="flex items-center">
                            {Array(4)
                              .fill(0)
                              .map((_, i) => (
                                <Icon
                                  key={i}
                                  className="size-3"
                                  icon="uil:asterisk"
                                />
                              ))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-bg-300 dark:text-bg-700 rounded-lg p-4 transition-all">
                    <Icon className="text-xl" icon="tabler:chevron-right" />
                  </button>
                </Card>
              ))}
            </ul>
          )
        }
      </WithQuery>
    </Widget>
  )
}

export const config: WidgetConfig = {
  namespace: 'apps.wallet',
  id: 'assetsBalance',
  icon: 'tabler:coin'
}
