import forgeAPI from '@/utils/forgeAPI'
import numberToCurrency from '@/utils/numberToCurrency'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { WithQuery } from 'lifeforge-ui'

function OverviewSummary({ month, year }: { month: number; year: number }) {
  const incomeExpensesQuery = useQuery(
    forgeAPI.wallet.utils.getIncomeExpensesSummary
      .input({
        year: year.toString(),
        month: (month + 1).toString()
      })
      .queryOptions()
  )

  return (
    <WithQuery query={incomeExpensesQuery}>
      {({ monthlyIncome, monthlyExpenses }) => {
        const netIncome = monthlyIncome - monthlyExpenses

        return (
          <div className="mt-6 flex w-full flex-col">
            <div className="flex items-center justify-between p-3">
              <p className="text-xl">Income</p>
              <p className="text-lg">RM {numberToCurrency(monthlyIncome)}</p>
            </div>
            <div className="bg-bg-200 dark:bg-bg-900 flex items-center justify-between p-3 print:bg-black/[3%]!">
              <p className="text-xl">Expenses</p>
              <p className="text-lg">
                RM ({numberToCurrency(monthlyExpenses)})
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="p-3 text-xl font-semibold">Net Income / (Loss)</p>
              <p
                className={clsx(
                  'p-3 text-lg font-medium',
                  netIncome < 0 && 'text-rose-600'
                )}
                style={{
                  borderTop: '2px solid',
                  borderBottom: '6px double'
                }}
              >
                RM{' '}
                {netIncome >= 0
                  ? numberToCurrency(netIncome)
                  : `(${numberToCurrency(Math.abs(netIncome))})`}
              </p>
            </div>
          </div>
        )
      }}
    </WithQuery>
  )
}

export default OverviewSummary
