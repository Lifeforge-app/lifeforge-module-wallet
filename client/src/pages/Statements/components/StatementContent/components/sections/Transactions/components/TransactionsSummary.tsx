import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { WithQuery } from 'lifeforge-ui'

import forgeAPI from '@/utils/forgeAPI'

function TransactionsSummary({ month, year }: { month: number; year: number }) {
  const typesCountQuery = useQuery(
    forgeAPI.analytics.getTypesCount
      .input({
        year: year.toString(),
        month: (month + 1).toString() // API expects 1-indexed
      })
      .queryOptions()
  )

  const ROWS = [
    {
      type: 'income' as const,
      label: 'Income',
      icon: 'tabler:login-2',
      color: 'text-green-500'
    },
    {
      type: 'expenses' as const,
      label: 'Expenses',
      icon: 'tabler:logout',
      color: 'text-red-500'
    },
    {
      type: 'transfer' as const,
      label: 'Transfer',
      icon: 'tabler:arrows-exchange',
      color: 'text-blue-500'
    }
  ]

  return (
    <WithQuery query={typesCountQuery}>
      {data => {
        const total =
          (data.income?.transactionCount ?? 0) +
          (data.expenses?.transactionCount ?? 0) +
          (data.transfer?.transactionCount ?? 0)

        return (
          <div className="mt-6 flex w-full flex-col">
            {ROWS.map((row, index) => (
              <div
                key={row.label}
                className={`flex items-center justify-between p-3 ${
                  index % 2 === 1
                    ? 'bg-bg-200 dark:bg-bg-900 print:bg-black/[3%]!'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`size-6 ${row.color}`} icon={row.icon} />
                  <p className="text-xl">{row.label}</p>
                </div>
                <p className="text-lg">
                  {data[row.type]?.transactionCount ?? 0} entries
                </p>
              </div>
            ))}
            <div className="bg-bg-200 dark:bg-bg-900 flex items-center justify-between print:bg-black/[3%]!">
              <p className="p-3 text-xl font-semibold">Total</p>
              <p
                className="p-3 text-lg font-medium"
                style={{
                  borderTop: '2px solid',
                  borderBottom: '6px double'
                }}
              >
                {total} entries
              </p>
            </div>
          </div>
        )
      }}
    </WithQuery>
  )
}

export default TransactionsSummary
