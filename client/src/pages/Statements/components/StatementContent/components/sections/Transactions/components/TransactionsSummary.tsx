import { useWalletData } from '@/hooks/useWalletData'
import { Icon } from '@iconify/react'
import dayjs from 'dayjs'
import { useMemo } from 'react'

function TransactionsSummary({ month, year }: { month: number; year: number }) {
  const { transactionsQuery } = useWalletData()

  const transactions = transactionsQuery.data ?? []

  const counts = useMemo(() => {
    const filtered = transactions.filter(
      transaction =>
        dayjs(transaction.date).month() === month &&
        dayjs(transaction.date).year() === year
    )

    return {
      income: filtered.filter(t => t.type === 'income').length,
      expenses: filtered.filter(t => t.type === 'expenses').length,
      transfer: filtered.filter(t => t.type === 'transfer').length,
      total: filtered.length
    }
  }, [transactions, month, year])

  const ROWS = [
    {
      label: 'Income',
      icon: 'tabler:login-2',
      color: 'text-green-500',
      count: counts.income
    },
    {
      label: 'Expenses',
      icon: 'tabler:logout',
      color: 'text-red-500',
      count: counts.expenses
    },
    {
      label: 'Transfer',
      icon: 'tabler:arrows-exchange',
      color: 'text-blue-500',
      count: counts.transfer
    }
  ]

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
          <p className="text-lg">{row.count} entries</p>
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
          {counts.total} entries
        </p>
      </div>
    </div>
  )
}

export default TransactionsSummary
