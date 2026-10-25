import dayjs from 'dayjs'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Flex,
  Icon,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  WithQuery,
  colorWithOpacity,
} from '@lifeforge/ui'

import LiabilityUtilisation from '@/components/LiabilityUtilisation'
import { useWalletData } from '@/hooks/useWalletData'
import { useStatementData } from '@/pages/Statements/providers/StatementDataProvider'
import numberToCurrency from '@/utils/numberToCurrency'

function AssetsTable({ month }: { month: number }) {
  const { assetsQuery } = useWalletData()
  const { statementQuery } = useStatementData()
  const { t } = useModuleTranslation()

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
              <Table minWidth="0" mt="lg" width="100%">
                <TableHeader>
                  <TableRow bg="custom-500">
                    <TableHeaderCell align="left" width="100%">
                      {t('statement.assets')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {dayjs()
                        .month(month - 1)
                        .format('MMM YYYY')}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {dayjs().month(month).format('MMM YYYY')}
                    </TableHeaderCell>
                    <TableHeaderCell colSpan={2}>
                      {t('statement.change')}
                    </TableHeaderCell>
                  </TableRow>
                  <TableRow bg="bg-800" color="bg-50">
                    <TableHeaderCell align="left" width="100%" />
                    <TableHeaderCell>RM</TableHeaderCell>
                    <TableHeaderCell>RM</TableHeaderCell>
                    <TableHeaderCell>RM</TableHeaderCell>
                    <TableHeaderCell>%</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets
                    .filter(asset => !asset.is_inactive)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(asset => {
                      const balance = assetData.balances[asset.id]

                      if (!balance) return null

                      const { last, current, change, percentage } = balance

                      return (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <Stack gap="xs">
                              <Flex align="center" gap="sm">
                                <Icon icon={asset.icon} size="1.5rem" />
                                <Text whiteSpace="nowrap">{asset.name}</Text>
                                {asset.is_liability && (
                                  <Text
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
                          </TableCell>
                          <TableCell nowrap align="right">
                            {numberToCurrency(last)}
                          </TableCell>
                          <TableCell nowrap align="right">
                            {numberToCurrency(current)}
                          </TableCell>
                          <TableCell
                            nowrap
                            align="right"
                            color={change < 0 ? 'rose-600' : undefined}
                          >
                            {change < 0
                              ? `(${numberToCurrency(Math.abs(change))})`
                              : numberToCurrency(change)}
                          </TableCell>
                          <TableCell
                            nowrap
                            align="right"
                            color={percentage < 0 ? 'rose-600' : undefined}
                          >
                            {percentage < 0
                              ? `(${Math.abs(percentage).toFixed(2)}%)`
                              : `${percentage.toFixed(2)}%`}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {inactiveAggregate && (
                    <TableRow bg={colorWithOpacity('bg-500', '5%')} color="inherit">
                      <TableCell>
                        <Flex align="center" gap="sm">
                          <Icon icon="tabler:archive" size="1.5rem" />
                          <Text whiteSpace="nowrap">
                            {t('labels.inactiveAssets')}
                          </Text>
                        </Flex>
                      </TableCell>
                      <TableCell nowrap align="right">
                        {numberToCurrency(inactiveAggregate.last)}
                      </TableCell>
                      <TableCell nowrap align="right">
                        {numberToCurrency(inactiveAggregate.current)}
                      </TableCell>
                      <TableCell
                        nowrap
                        align="right"
                        color={
                          inactiveAggregate.change < 0 ? 'rose-600' : undefined
                        }
                      >
                        {inactiveAggregate.change < 0
                          ? `(${numberToCurrency(Math.abs(inactiveAggregate.change))})`
                          : numberToCurrency(inactiveAggregate.change)}
                      </TableCell>
                      <TableCell
                        nowrap
                        align="right"
                        color={inactivePercentage < 0 ? 'rose-600' : undefined}
                      >
                        {inactivePercentage < 0
                          ? `(${Math.abs(inactivePercentage).toFixed(2)}%)`
                          : `${inactivePercentage.toFixed(2)}%`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  {[
                    { label: t('widgets.totalAssets'), data: assetData.total },
                    {
                      label: t('widgets.totalLiabilities'),
                      data: assetData.liabilitiesTotal
                    },
                    { label: t('widgets.netWorth'), data: assetData.netWorth }
                  ].map(row => (
                    <TableRow key={row.label}>
                      <TableCell>
                        <Text weight="semibold">
                          {row.label}
                        </Text>
                      </TableCell>
                      <TableCell nowrap align="right" variant="total">
                        {numberToCurrency(row.data.last)}
                      </TableCell>
                      <TableCell nowrap align="right" variant="total">
                        {numberToCurrency(row.data.current)}
                      </TableCell>
                      <TableCell
                        nowrap
                        align="right"
                        color={row.data.change < 0 ? 'rose-600' : undefined}
                        variant="total"
                      >
                        {row.data.change < 0
                          ? `(${numberToCurrency(Math.abs(row.data.change))})`
                          : numberToCurrency(row.data.change)}
                      </TableCell>
                      <TableCell
                        nowrap
                        align="right"
                        color={row.data.percentage < 0 ? 'rose-600' : undefined}
                        variant="total"
                      >
                        {row.data.percentage < 0
                          ? `(${Math.abs(row.data.percentage).toFixed(2)}%)`
                          : `${row.data.percentage.toFixed(2)}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableFooter>
              </Table>
            )
          }}
        </WithQuery>
      )}
    </WithQuery>
  )
}

export default AssetsTable
