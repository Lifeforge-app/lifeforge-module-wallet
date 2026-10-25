import { useModuleTranslation } from '@lifeforge/localization'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
  Text,
  WithQuery
} from '@lifeforge/ui'

import { useStatementData } from '@/pages/Statements/providers/StatementDataProvider'
import numberToCurrency from '@/utils/numberToCurrency'

function OverviewSummary() {
  const { statementQuery } = useStatementData()
  const { t } = useModuleTranslation()

  return (
    <WithQuery query={statementQuery}>
      {({ overview }) => {
        const { monthlyIncome, monthlyExpenses, netIncome } = overview

        return (
          <Table mt="lg" width="100%">
            <TableBody>
              <TableRow>
                <TableCell width="100%">
                  <Text>{t('statement.income')}</Text>
                </TableCell>
                <TableCell nowrap align="right" width="min-content">
                  <Text>RM {numberToCurrency(monthlyIncome)}</Text>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell width="100%">
                  <Text>{t('statement.expenses')}</Text>
                </TableCell>
                <TableCell nowrap align="right" width="min-content">
                  <Text>
                    RM ({numberToCurrency(monthlyExpenses)})
                  </Text>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell width="100%">
                  <Text weight="semibold">
                    {t('statement.netIncomeLoss')}
                  </Text>
                </TableCell>
                <TableCell nowrap align="right" variant="total" width="min-content">
                  <Text
                    color={netIncome < 0 ? 'rose-600' : undefined}
                    weight="medium"
                  >
                    RM{' '}
                    {netIncome >= 0
                      ? numberToCurrency(netIncome)
                      : `(${numberToCurrency(Math.abs(netIncome))})`}
                  </Text>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )
      }}
    </WithQuery>
  )
}

export default OverviewSummary
