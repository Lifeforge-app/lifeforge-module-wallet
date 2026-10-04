import dayjs from 'dayjs'

import { Flex, Icon, TagChip, Text, colorWithOpacity } from '@lifeforge/ui'

import { type WalletTransaction, useWalletData } from '@/hooks/useWalletData'
import numberToCurrency from '@/utils/numberToCurrency'

function TransactionList({
  type,
  transactions,
  total
}: {
  type: 'income' | 'expenses' | 'transfer'
  transactions: WalletTransaction[]
  total: number
}) {
  const { assetsQuery, categoriesQuery } = useWalletData()

  const assets = assetsQuery.data ?? []

  const categories = categoriesQuery.data ?? []

  return (
    <>
      <Text
        as="h2"
        mt="3xl"
        size={{ base: '2xl', print: 'lg' }}
        tracking="widest"
        transform="uppercase"
        weight="semibold"
      >
        <Text>2.{['income', 'expenses', 'transfer'].indexOf(type) + 1} </Text>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
      <table style={{ width: '100%', marginTop: '1.5rem' }}>
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-custom-500)',
              color: 'white'
            }}
          >
            <th
              style={{
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              Date
            </th>
            <th
              style={{
                width: '100%',
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '1.125rem',
                fontWeight: '500'
              }}
            >
              Particular
            </th>
            {type !== 'transfer' && (
              <>
                <th
                  style={{
                    padding: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Asset
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Category
                </th>
              </>
            )}
            <th
              style={{
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              Amount
            </th>
          </tr>
          <tr
            style={{ backgroundColor: 'var(--color-bg-800)', color: 'white' }}
          >
            <th
              style={{
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            ></th>
            <th
              style={{
                width: '100%',
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '1.125rem',
                fontWeight: '500'
              }}
            ></th>
            {type !== 'transfer' && (
              <>
                <th
                  style={{
                    padding: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                ></th>
                <th
                  style={{
                    padding: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                ></th>
              </>
            )}
            <th
              style={{
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              RM
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr
              key={transaction.id}
              style={{
                backgroundColor:
                  index % 2 === 0
                    ? colorWithOpacity('bg-500', '5%').toString()
                    : undefined
              }}
            >
              <td
                style={{
                  padding: '0.75rem',
                  fontSize: '1.125rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {dayjs(transaction.date).format('MMM DD')}
              </td>
              <td
                style={{
                  minWidth: '24rem',
                  padding: '0.75rem',
                  fontSize: '1.125rem'
                }}
              >
                {transaction.type === 'transfer' ? (
                  <>
                    Transfer from{' '}
                    {assets.find(a => a.id === transaction.from)?.name ??
                      'Unknown Asset'}{' '}
                    to{' '}
                    {assets.find(a => a.id === transaction.to)?.name ??
                      'Unknown Asset'}
                  </>
                ) : (
                  transaction.particulars
                )}
              </td>
              {transaction.type !== 'transfer' && (
                <td
                  style={{
                    padding: '0.75rem',
                    fontSize: '1.125rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Flex align="center" gap="sm">
                    <Icon
                      icon={
                        assets.find(a => a.id === transaction.asset)?.icon ??
                        'tabler:coin'
                      }
                      size="1.5rem"
                    />
                    <Text>
                      {assets.find(a => a.id === transaction.asset)?.name}
                    </Text>
                  </Flex>
                </td>
              )}
              {transaction.type !== 'transfer' && (
                <td
                  style={{
                    padding: '0.75rem',
                    fontSize: '1.125rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TagChip
                    color={
                      categories.find(c => c.id === transaction.category)?.color
                    }
                    icon={
                      categories.find(c => c.id === transaction.category)?.icon
                    }
                    label={
                      categories.find(c => c.id === transaction.category)
                        ?.name ?? '-'
                    }
                  />
                </td>
              )}
              <td
                style={{
                  padding: '0.75rem',
                  textAlign: 'right',
                  fontSize: '1.125rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {type === 'expenses'
                  ? `(${numberToCurrency(transaction.amount)})`
                  : numberToCurrency(transaction.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={type !== 'transfer' ? 4 : 2}
              style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '1.25rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              Total {type.charAt(0).toUpperCase() + type.slice(1)}
            </td>
            <td
              style={{
                padding: '0.75rem',
                textAlign: 'right',
                fontSize: '1.125rem',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                borderTop: '2px solid',
                borderBottom: '6px double'
              }}
            >
              {total < 0
                ? `(${numberToCurrency(Math.abs(total))})`
                : numberToCurrency(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default TransactionList
