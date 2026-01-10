import { useWalletData } from '@/hooks/useWalletData'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { TagChip, WithQuery } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'shared'

import TransactionAmount from '../../components/TransactionAmount'
import TransactionParticular from '../../components/TransactionParticular'

function TableView() {
  const { t } = useTranslation('apps.wallet')

  const navigate = useNavigate()

  const { transactionsQuery, categoriesQuery } = useWalletData()

  const categories = categoriesQuery.data ?? []

  return (
    <WithQuery query={transactionsQuery}>
      {transactions => (
        <table className="hidden w-full text-base! lg:table">
          <thead>
            <tr className="border-bg-200 text-bg-500 dark:border-bg-800 border-b-2 text-center text-base">
              {['date', 'type', 'particulars', 'category', 'amount'].map(
                header => (
                  <th
                    key={header}
                    className={clsx(
                      'py-2 font-medium',
                      header === 'particulars' ? 'text-left' : 'text-center'
                    )}
                  >
                    {t(`table.${header}`)}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 25).map(transaction => {
              return (
                <tr
                  key={transaction.id}
                  className="border-bg-200 dark:border-bg-800 border-b"
                >
                  <td className="py-2 text-center whitespace-nowrap">
                    {dayjs(transaction.date).format('MMM DD')}
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex-center">
                      <TagChip
                        className="w-min"
                        color={
                          {
                            income: '#22c55e',
                            expenses: '#ef4444',
                            transfer: '#3b82f6'
                          }[transaction.type]
                        }
                        label={
                          transaction.type[0].toUpperCase() +
                          transaction.type.slice(1)
                        }
                        onClick={() => {
                          navigate(
                            `/wallet/transactions?type=${transaction.type}`
                          )
                        }}
                      />
                    </div>
                  </td>
                  <td className="max-w-64 truncate py-2">
                    <TransactionParticular transaction={transaction} />
                  </td>
                  <td className="py-2 text-center">
                    {transaction.type !== 'transfer' ? (
                      <div className="flex-center">
                        <TagChip
                          className="w-min"
                          color={
                            categories.find(
                              category => category.id === transaction.category
                            )?.color
                          }
                          icon={
                            categories.find(
                              category => category.id === transaction.category
                            )?.icon
                          }
                          label={
                            categories.find(
                              category => category.id === transaction.category
                            )?.name ?? '-'
                          }
                          onClick={() => {
                            navigate(
                              `/wallet/transactions?category=${transaction.category}`
                            )
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-bg-400 dark:text-bg-600">-</span>
                    )}
                  </td>
                  <td className="py-2 text-center">
                    <TransactionAmount
                      amount={transaction.amount}
                      type={transaction.type}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </WithQuery>
  )
}

export default TableView
