import dayjs from 'dayjs'

import { Flex, Icon, Text, WithQuery, colorWithOpacity } from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { useStatementData } from '@/pages/Statements/providers/StatementDataProvider'
import numberToCurrency from '@/utils/numberToCurrency'

function AssetsTable({ month }: { month: number }) {
  const { assetsQuery } = useWalletData()
  const { statementQuery } = useStatementData()

  return (
    <WithQuery query={assetsQuery}>
      {assets => (
        <WithQuery query={statementQuery}>
          {({ assets: assetData }) => (
            <table
              style={{ width: '100%', marginTop: '1.5rem', minWidth: '0' }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--color-custom-500)',
                    color: 'white'
                  }}
                >
                  <th
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}
                  >
                    Assets
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      fontSize: '1.125rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dayjs().month(month - 1).format('MMM YYYY')}
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      fontSize: '1.125rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dayjs().month(month).format('MMM YYYY')}
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      padding: '0.75rem',
                      fontSize: '1.125rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Change
                  </th>
                </tr>
                <tr
                  style={{
                    backgroundColor: 'var(--color-bg-800)',
                    color: 'white'
                  }}
                >
                  <th
                    style={{
                      width: '100%',
                      padding: '0.5rem 1rem',
                      textAlign: 'left',
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}
                  ></th>
                  <th
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}
                  >
                    RM
                  </th>
                  <th
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}
                  >
                    RM
                  </th>
                  <th
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}
                  >
                    RM
                  </th>
                  <th
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}
                  >
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...assets]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((asset, index) => {
                    const balance = assetData.balances[asset.id]

                    if (!balance) return null

                    const { last, current, change, percentage } = balance

                    return (
                      <tr
                        key={asset.id}
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
                            fontSize: '1.125rem'
                          }}
                        >
                          <Flex align="center" gap="sm">
                            <Icon icon={asset.icon} size="1.5rem" />
                            <Text whiteSpace="nowrap">{asset.name}</Text>
                          </Flex>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            fontSize: '1.125rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {numberToCurrency(last)}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            fontSize: '1.125rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {numberToCurrency(current)}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            fontSize: '1.125rem',
                            whiteSpace: 'nowrap',
                            color: change < 0 ? '#e11d48' : undefined
                          }}
                        >
                          {change < 0
                            ? `(${numberToCurrency(Math.abs(change))})`
                            : numberToCurrency(change)}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem',
                            textAlign: 'right',
                            fontSize: '1.125rem',
                            whiteSpace: 'nowrap',
                            color: percentage < 0 ? '#e11d48' : undefined
                          }}
                        >
                          {percentage < 0
                            ? `(${Math.abs(percentage).toFixed(2)}%)`
                            : `${percentage.toFixed(2)}%`}
                        </td>
                      </tr>
                    )
                  })}
                <tr>
                  <td
                    style={{
                      padding: '0.75rem',
                      fontSize: '1.125rem'
                    }}
                  >
                    <Text size="xl" weight="semibold">
                      Total Assets
                    </Text>
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
                    {numberToCurrency(assetData.total.last)}
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
                    {numberToCurrency(assetData.total.current)}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      textAlign: 'right',
                      fontSize: '1.125rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      borderTop: '2px solid',
                      borderBottom: '6px double',
                      color:
                        assetData.total.change < 0 ? '#e11d48' : undefined
                    }}
                  >
                    {assetData.total.change < 0
                      ? `(${numberToCurrency(Math.abs(assetData.total.change))})`
                      : numberToCurrency(assetData.total.change)}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      textAlign: 'right',
                      fontSize: '1.125rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      borderTop: '2px solid',
                      borderBottom: '6px double',
                      color:
                        assetData.total.percentage < 0 ? '#e11d48' : undefined
                    }}
                  >
                    {assetData.total.percentage < 0
                      ? `(${Math.abs(assetData.total.percentage).toFixed(2)}%)`
                      : `${assetData.total.percentage.toFixed(2)}%`}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </WithQuery>
      )}
    </WithQuery>
  )
}

export default AssetsTable
