import { useWalletData } from '@/hooks/useWalletData'
import forgeAPI from '@/utils/forgeAPI'
import numberToCurrency from '@/utils/numberToCurrency'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { WithQuery } from 'lifeforge-ui'

function AssetsTable({ month, year }: { month: number; year: number }) {
  const { assetsQuery } = useWalletData()

  const balancesQuery = useQuery(
    forgeAPI.wallet.assets.getAllAssetAccumulatedBalance
      .input({
        year: year.toString(),
        month: (month + 1).toString() // API expects 1-indexed
      })
      .queryOptions()
  )

  return (
    <WithQuery query={assetsQuery}>
      {assets => (
        <WithQuery query={balancesQuery}>
          {balances => (
            <div className="overflow-x-auto print:overflow-visible">
              <table className="mt-6 w-full print:break-inside-auto">
                <thead>
                  <tr className="bg-custom-500 text-white print:bg-lime-600">
                    <th className="w-full p-3 text-left text-lg font-medium">
                      Assets
                    </th>
                    <th className="p-3 text-lg font-medium whitespace-nowrap">
                      {dayjs()
                        .month(month - 1)
                        .format('MMM YYYY')}
                    </th>
                    <th className="p-3 text-lg font-medium whitespace-nowrap">
                      {dayjs().month(month).format('MMM YYYY')}
                    </th>
                    <th
                      className="p-3 text-lg font-medium whitespace-nowrap"
                      colSpan={2}
                    >
                      Change
                    </th>
                  </tr>
                  <tr className="bg-bg-800 text-white print:bg-black/70">
                    <th className="w-full px-4 py-2 text-left text-lg font-medium"></th>
                    <th className="px-4 py-2 text-lg font-medium">RM</th>
                    <th className="px-4 py-2 text-lg font-medium">RM</th>
                    <th className="px-4 py-2 text-lg font-medium">RM</th>
                    <th className="px-4 py-2 text-lg font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {assets
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(asset => {
                      const assetBalance = balances[asset.id]

                      const change = assetBalance.current - assetBalance.last

                      const percentage =
                        assetBalance.last !== 0
                          ? (change / assetBalance.last) * 100
                          : 0

                      return (
                        <tr
                          key={asset.id}
                          className="even:bg-bg-200 dark:even:bg-bg-800/30 print:break-inside-avoid print:even:bg-black/[3%]"
                        >
                          <td className="p-3 text-lg">
                            <div className="flex items-center gap-2">
                              <Icon
                                className="size-6 shrink-0"
                                icon={asset.icon}
                              />
                              <span className="whitespace-nowrap">
                                {asset.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right text-lg whitespace-nowrap">
                            {balancesQuery.isLoading
                              ? '...'
                              : numberToCurrency(assetBalance.last)}
                          </td>
                          <td className="p-3 text-right text-lg whitespace-nowrap">
                            {balancesQuery.isLoading
                              ? '...'
                              : numberToCurrency(assetBalance.current)}
                          </td>
                          <td
                            className={clsx(
                              'p-3 text-right text-lg whitespace-nowrap',
                              change < 0 && 'text-rose-600'
                            )}
                          >
                            {balancesQuery.isLoading
                              ? '...'
                              : change < 0
                                ? `(${numberToCurrency(Math.abs(change))})`
                                : numberToCurrency(change)}
                          </td>
                          <td
                            className={clsx(
                              'p-3 text-right text-lg whitespace-nowrap',
                              percentage < 0 && 'text-rose-600'
                            )}
                          >
                            {balancesQuery.isLoading
                              ? '...'
                              : percentage < 0
                                ? `(${Math.abs(percentage).toFixed(2)}%)`
                                : `${percentage.toFixed(2)}%`}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </WithQuery>
      )}
    </WithQuery>
  )
}

export default AssetsTable
