import dayjs from 'dayjs'
import { useMemo } from 'react'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  WithQuery,
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { useStatementData } from '@/pages/Statements/providers/StatementDataProvider'
import numberToCurrency from '@/utils/numberToCurrency'

const EMPTY_ITEM = {
  currentAmount: 0,
  previousAmount: 0,
  change: 0,
  percentageChange: 0
}

function IncomeExpensesTable({
  month,
  year,
  type
}: {
  month: number
  year: number
  type: 'income' | 'expenses'
}) {
  const { categoriesQuery } = useWalletData()
  const { statementQuery } = useStatementData()
  const { t } = useModuleTranslation()

  const categories = categoriesQuery.data ?? []

  const prevMonth = useMemo(() => {
    const date = dayjs().year(year).month(month).subtract(1, 'month')

    return { month: date.month() + 1, year: date.year() }
  }, [month, year])

  const filteredCategories = useMemo(
    () =>
      categories
        .filter(category => category.type === type)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories, type]
  )

  return (
    <WithQuery query={statementQuery}>
      {({ categoryComparison }) => {
        const comparison = categoryComparison[type]

        const change = comparison.totalChange

        const isNegativeChange = type === 'income' ? change < 0 : change > 0

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
              <Text>1.{type === 'income' ? '2' : '3'} </Text>
              {t(`transactionTypes.${type}`)}
            </Text>
            <Table minWidth="0" mt="lg" width="100%">
              <TableHeader>
                <TableRow bg="custom-500">
                  <TableHeaderCell align="left" width="100%">
                    {t('statement.category')}
                  </TableHeaderCell>
                  <TableHeaderCell>
                    {dayjs()
                      .year(prevMonth.year)
                      .month(prevMonth.month - 1)
                      .format('MMM YYYY')}
                  </TableHeaderCell>
                  <TableHeaderCell>
                    {dayjs().year(year).month(month).format('MMM YYYY')}
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
                {filteredCategories.map(category => {
                  const item = comparison.items[category.id] ?? EMPTY_ITEM

                  const isNegativeChange =
                    type === 'income' ? item.change < 0 : item.change > 0

                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Flex align="center" gap="sm">
                          <Icon
                            icon={category.icon}
                            size="1.5rem"
                            style={{ color: category.color }}
                          />
                          <Text whiteSpace="nowrap">{category.name}</Text>
                        </Flex>
                      </TableCell>
                      <TableCell nowrap align="right">
                        {numberToCurrency(item.previousAmount)}
                      </TableCell>
                      <TableCell nowrap align="right">
                        {numberToCurrency(item.currentAmount)}
                      </TableCell>
                      <TableCell
                        nowrap
                        align="right"
                        color={isNegativeChange ? 'rose-600' : undefined}
                      >
                        {item.change < 0
                          ? `(${numberToCurrency(Math.abs(item.change))})`
                          : numberToCurrency(item.change)}
                      </TableCell>
                      <TableCell
                        nowrap
                        align="right"
                        color={isNegativeChange ? 'rose-600' : undefined}
                      >
                        {Math.abs(item.previousAmount) < 0.001
                          ? '-'
                          : `${item.percentageChange.toFixed(2)}%`}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>
                    <Text weight="semibold">
                      {t('statement.totalType', {
                        type: t(`transactionTypes.${type}`)
                      })}
                    </Text>
                  </TableCell>
                  <TableCell nowrap align="right" variant="total">
                    {numberToCurrency(comparison.previousTotal)}
                  </TableCell>
                  <TableCell nowrap align="right" variant="total">
                    {numberToCurrency(comparison.currentTotal)}
                  </TableCell>
                  <TableCell
                    nowrap
                    align="right"
                    color={isNegativeChange ? 'rose-600' : undefined}
                    variant="total"
                  >
                    {change < 0
                      ? `(${numberToCurrency(Math.abs(change))})`
                      : numberToCurrency(change)}
                  </TableCell>
                  <TableCell
                    nowrap
                    align="right"
                    color={isNegativeChange ? 'rose-600' : undefined}
                    variant="total"
                  >
                    {Math.abs(comparison.previousTotal) < 0.001
                      ? '-'
                      : `${comparison.totalPercentageChange.toFixed(2)}%`}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </>
        )
      }}
    </WithQuery>
  )
}

export default IncomeExpensesTable
