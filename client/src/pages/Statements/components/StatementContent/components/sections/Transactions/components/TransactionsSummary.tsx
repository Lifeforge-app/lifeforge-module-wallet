import { useModuleTranslation } from '@lifeforge/localization'
import {
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
  Text,
  WithQuery
} from '@lifeforge/ui'

import { useStatementData } from '@/pages/Statements/providers/StatementDataProvider'

function TransactionsSummary() {
  const { statementQuery } = useStatementData()
  const { t } = useModuleTranslation()

  const ROWS = [
    {
      type: 'income' as const,
      label: t('transactionTypes.income'),
      icon: 'tabler:login-2',
      color: 'green-500'
    },
    {
      type: 'expenses' as const,
      label: t('transactionTypes.expenses'),
      icon: 'tabler:logout',
      color: 'red-500'
    },
    {
      type: 'transfer' as const,
      label: t('transactionTypes.transfer'),
      icon: 'tabler:arrows-exchange',
      color: 'blue-500'
    }
  ] as const

  return (
    <WithQuery query={statementQuery}>
      {({ transactions }) => (
        <Table mt="lg" width="100%">
          <TableBody>
            {ROWS.map(row => (
              <TableRow key={row.label}>
                <TableCell width="100%">
                  <Flex align="center" gap="sm">
                    <Icon color={row.color} icon={row.icon} size="1.5rem" />
                    <Text>{row.label}</Text>
                  </Flex>
                </TableCell>
                <TableCell nowrap align="right" width="min-content">
                  <Text>
                    {transactions[row.type].count} {t('transactionCount')}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell width="100%">
                <Text weight="semibold">{t('statement.total')}</Text>
              </TableCell>
              <TableCell
                nowrap
                align="right"
                variant="total"
                width="min-content"
              >
                <Text weight="medium">
                  {transactions.totalCount} {t('transactionCount')}
                </Text>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </WithQuery>
  )
}

export default TransactionsSummary
