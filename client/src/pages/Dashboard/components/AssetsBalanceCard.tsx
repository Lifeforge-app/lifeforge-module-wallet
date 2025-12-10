import { useWalletData } from '@/hooks/useWalletData'
import { useWalletStore } from '@/stores/useWalletStore'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import {
  Card,
  EmptyStateScreen,
  Scrollbar,
  Widget,
  WithQuery
} from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'shared'

import numberToCurrency from '../../../utils/numberToCurrency'

function AssetsBalanceCard() {
  const navigate = useNavigate()

  const { assetsQuery } = useWalletData()

  const { isAmountHidden } = useWalletStore()

  const { t } = useTranslation('apps.wallet')

  return (
    <Widget
      actionComponent={
        <Link
          className="text-bg-500 hover:bg-bg-100 hover:text-bg-800 dark:hover:bg-bg-700/30 dark:hover:text-bg-50 flex items-center gap-2 rounded-lg p-2 transition-all"
          to="./assets"
        >
          <Icon className="text-xl" icon="tabler:chevron-right" />
        </Link>
      }
      className="col-span-1 row-span-2 min-h-96 xl:min-h-0"
      icon="tabler:wallet"
      namespace="apps.wallet"
      title="Assets Balance"
    >
      <WithQuery query={assetsQuery}>
        {assets =>
          assets.length > 0 ? (
            <Scrollbar>
              <ul className="flex flex-col gap-3 pb-2">
                {assets.map(asset => (
                  <Card
                    key={asset.id}
                    as={Link}
                    className="flex-between component-bg-lighter-with-hover flex flex-col gap-3 [@media(min-width:400px)]:flex-row"
                    to={`/wallet/transactions?asset=${asset.id}`}
                  >
                    <div className="flex w-full min-w-0 items-center gap-3">
                      <Icon className="size-6 shrink-0" icon={asset.icon} />
                      <div className="w-full min-w-0 truncate font-semibold">
                        {asset.name}
                      </div>
                    </div>
                    <div
                      className={clsx(
                        'mt-4 flex gap-2 text-right text-3xl font-medium whitespace-nowrap [@media(min-width:400px)]:mt-0',
                        isAmountHidden ? 'items-center' : 'items-end'
                      )}
                    >
                      <span className="text-bg-500 text-xl">RM</span>
                      {isAmountHidden ? (
                        <span className="flex items-center">
                          {Array(4)
                            .fill(0)
                            .map((_, i) => (
                              <Icon
                                key={i}
                                className="-mx-0.5 size-4"
                                icon="uil:asterisk"
                              />
                            ))}
                        </span>
                      ) : (
                        <span>{numberToCurrency(asset.current_balance)}</span>
                      )}
                    </div>
                  </Card>
                ))}
              </ul>
            </Scrollbar>
          ) : (
            <EmptyStateScreen
              smaller
              CTAButtonProps={{
                children: 'new',
                icon: 'tabler:plus',
                onClick: () => {
                  navigate('/wallet/assets#new')
                },
                tProps: { item: t('items.asset') }
              }}
              icon="tabler:wallet-off"
              message={{
                id: 'assets',
                namespace: 'apps.wallet'
              }}
            />
          )
        }
      </WithQuery>
    </Widget>
  )
}

export default AssetsBalanceCard
