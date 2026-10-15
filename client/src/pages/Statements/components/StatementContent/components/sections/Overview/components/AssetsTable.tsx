import dayjs from 'dayjs'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Flex,
  Icon,
  Stack,
  Text,
  WithQuery,
  colorWithOpacity,
  usePersonalization
} from '@lifeforge/ui'

import LiabilityUtilisation from '@/components/LiabilityUtilisation'
import { useWalletData } from '@/hooks/useWalletData'
import { useStatementData } from '@/pages/Statements/providers/StatementDataProvider'
import numberToCurrency from '@/utils/numberToCurrency'

function AssetsTable({ month }: { month: number }) {
  const { assetsQuery } = useWalletData()
  const { statementQuery } = useStatementData()
  const { t } = useModuleTranslation()
  const { getMostReadableColor } = usePersonalization()

  const headerTextColor = getMostReadableColor()

  return (
    <WithQuery query={assetsQuery}>
      {assets => (
        <WithQuery query={statementQuery}>
          {({ assets: assetData }) => {
            const inactiveBalances = assets
              .filter(asset => asset.is_inactive)
              .map(asset => assetData.balances[asset.id])
              .filter(balance => balance !== undefined)

            const inactiveAggregate =
              inactiveBalances.length > 0
                ? inactiveBalances.reduce(
                    (acc, balance) => ({
                      last: acc.last + balance.last,
                      current: acc.current + balance.current,
                      change: acc.change + balance.change
                    }),
                    { last: 0, current: 0, change: 0 }
                  )
                : null

            const inactivePercentage =
              inactiveAggregate && inactiveAggregate.last !== 0
                ? (inactiveAggregate.change / inactiveAggregate.last) * 100
                : 0

            return (
              <table
                style={{ width: '100%', marginTop: '1.5rem', minWidth: '0' }}
              >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--color-custom-500)',
                    color: headerTextColor
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
                    {t('statement.assets')}
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
                    {t('statement.change')}
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
                {assets
                  .filter(asset => !asset.is_inactive)
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
                          <Stack gap="xs">
                            <Flex align="center" gap="sm">
                              <Icon icon={asset.icon} size="1.5rem" />
                              <Text whiteSpace="nowrap">{asset.name}</Text>
                              {asset.is_liability && (
                                <Text
                                  size="sm"
                                  style={{
                                    color: '#e11d48',
                                    border: '1px solid #e11d48',
                                    borderRadius: '999px',
                                    padding: '0 0.5rem',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {t('tags.liability')}
                                </Text>
                              )}
                            </Flex>
                            <LiabilityUtilisation asset={asset} />
                          </Stack>
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
                {inactiveAggregate && (
                  <tr
                    style={{
                      backgroundColor: colorWithOpacity('bg-500', '5%').toString()
                    }}
                  >
                    <td
                      style={{
                        padding: '0.75rem',
                        fontSize: '1.125rem'
                      }}
                    >
                      <Flex align="center" gap="sm">
                        <Icon icon="tabler:archive" size="1.5rem" />
                        <Text whiteSpace="nowrap">
                          {t('labels.inactiveAssets')}
                        </Text>
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
                      {numberToCurrency(inactiveAggregate.last)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontSize: '1.125rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {numberToCurrency(inactiveAggregate.current)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontSize: '1.125rem',
                        whiteSpace: 'nowrap',
                        color: inactiveAggregate.change < 0 ? '#e11d48' : undefined
                      }}
                    >
                      {inactiveAggregate.change < 0
                        ? `(${numberToCurrency(Math.abs(inactiveAggregate.change))})`
                        : numberToCurrency(inactiveAggregate.change)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        fontSize: '1.125rem',
                        whiteSpace: 'nowrap',
                        color: inactivePercentage < 0 ? '#e11d48' : undefined
                      }}
                    >
                      {inactivePercentage < 0
                        ? `(${Math.abs(inactivePercentage).toFixed(2)}%)`
                        : `${inactivePercentage.toFixed(2)}%`}
                    </td>
                  </tr>
                )}
                {[
                  { label: t('widgets.totalAssets'), data: assetData.total },
                  {
                    label: t('widgets.totalLiabilities'),
                    data: assetData.liabilitiesTotal
                  },
                  { label: t('widgets.netWorth'), data: assetData.netWorth }
                ].map(row => (
                  <tr key={row.label}>
                    <td
                      style={{
                        padding: '0.75rem',
                        fontSize: '1.125rem'
                      }}
                    >
                      <Text size="xl" weight="semibold">
                        {row.label}
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
                      {numberToCurrency(row.data.last)}
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
                      {numberToCurrency(row.data.current)}
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
                        color: row.data.change < 0 ? '#e11d48' : undefined
                      }}
                    >
                      {row.data.change < 0
                        ? `(${numberToCurrency(Math.abs(row.data.change))})`
                        : numberToCurrency(row.data.change)}
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
                        color: row.data.percentage < 0 ? '#e11d48' : undefined
                      }}
                    >
                      {row.data.percentage < 0
                        ? `(${Math.abs(row.data.percentage).toFixed(2)}%)`
                        : `${row.data.percentage.toFixed(2)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )
          }}
        </WithQuery>
      )}
    </WithQuery>
  )
}

export default AssetsTable
