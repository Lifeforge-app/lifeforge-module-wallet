import { Icon } from '@iconify/react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { Button, TagChip, useModalStore } from 'lifeforge-ui'

import { useWalletData } from '@/hooks/useWalletData'
import type { WalletTransaction } from '@/pages/Transactions'
import forgeAPI from '@/utils/forgeAPI'

import ViewReceiptModal from '../../../ViewReceiptModal'
import DetailItem from './components/DetailItem'
import LocationSection from './components/LocationSection'

function Details({ transaction }: { transaction: WalletTransaction }) {
  const { assetsQuery, categoriesQuery, ledgersQuery } = useWalletData()

  const { open } = useModalStore()

  return (
    <div className="mt-6 space-y-3">
      <DetailItem icon="tabler:exchange" label="transactionType">
        <p className="flex items-center gap-1">
          <Icon
            className={clsx('size-5', {
              'text-green-500': transaction.type === 'income',
              'text-red-500': transaction.type === 'expenses',
              'text-blue-500': transaction.type === 'transfer'
            })}
            icon={
              {
                income: 'tabler:login-2',
                expenses: 'tabler:logout',
                transfer: 'tabler:arrows-exchange'
              }[transaction.type]
            }
          />
          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
        </p>
      </DetailItem>
      <DetailItem icon="tabler:calendar" label="date">
        <p className="sm:text-right">
          {dayjs(transaction.date).format('ddd, D MMM YYYY')}
        </p>
      </DetailItem>
      {transaction.type !== 'transfer' &&
        (() => {
          const category = categoriesQuery.data?.find(
            category => category.id === transaction.category
          )

          return (
            <DetailItem icon="tabler:category" label="category">
              <p className="flex items-center gap-1">
                <Icon
                  className="size-6"
                  icon={category!.icon}
                  style={{
                    color: category!.color
                  }}
                />
                {category!.name}
              </p>
            </DetailItem>
          )
        })()}
      {transaction.type === 'transfer'
        ? (() => {
            const fromAsset = assetsQuery.data?.find(
              asset => asset.id === transaction.from
            )

            const toAsset = assetsQuery.data?.find(
              asset => asset.id === transaction.to
            )

            return (
              <DetailItem icon="tabler:exchange" label="asset">
                <div className="flex min-w-0 items-center gap-1">
                  <div className="flex items-center gap-1">
                    <Icon className="size-6 shrink-0" icon={fromAsset!.icon} />
                    <p className="w-full max-w-96 truncate">
                      {fromAsset!.name}
                    </p>
                  </div>
                  <Icon
                    className="text-bg-500 size-6 shrink-0"
                    icon="tabler:arrow-right"
                  />
                  <p className="flex items-center gap-1">
                    <Icon className="size-6 shrink-0" icon={toAsset!.icon} />
                    <p className="w-full max-w-96 truncate">{toAsset!.name}</p>
                  </p>
                </div>
              </DetailItem>
            )
          })()
        : (() => {
            const asset = assetsQuery.data?.find(
              asset => asset.id === transaction.asset
            )

            return (
              <DetailItem icon="tabler:wallet" label="asset">
                <div className="flex items-center gap-1">
                  <Icon className="size-6 shrink-0" icon={asset!.icon} />
                  <p className="w-full max-w-96 truncate">{asset!.name}</p>
                </div>
              </DetailItem>
            )
          })()}
      {transaction.type !== 'transfer' &&
        (() => {
          const ledger = ledgersQuery.data?.filter(ledger =>
            transaction.ledgers.includes(ledger.id)
          )

          if (!ledger || ledger.length === 0) return null

          return (
            <DetailItem icon="tabler:book" label="ledger">
              {ledger ? (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {ledger.map(ledgerItem => (
                    <TagChip
                      key={ledgerItem.id}
                      color={ledgerItem.color}
                      icon={ledgerItem.icon}
                      label={ledgerItem.name}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-bg-500">No Ledger</span>
              )}
            </DetailItem>
          )
        })()}
      {transaction.receipt && (
        <DetailItem vertical icon="tabler:receipt" label="receipt">
          <Button
            className="w-full"
            icon="tabler:eye"
            namespace="apps.wallet"
            variant="secondary"
            onClick={() => {
              open(ViewReceiptModal, {
                src: forgeAPI.getMedia({
                  collectionId: transaction.collectionId,
                  recordId: transaction.id,
                  fieldId: transaction.receipt
                })
              })
            }}
          >
            View Receipt
          </Button>
        </DetailItem>
      )}
      {transaction.type !== 'transfer' && transaction.location_name && (
        <LocationSection transaction={transaction} />
      )}
    </div>
  )
}

export default Details
