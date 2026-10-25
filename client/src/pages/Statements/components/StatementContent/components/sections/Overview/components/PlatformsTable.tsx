import { useModuleTranslation } from '@lifeforge/localization'
import {
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  WithQuery,
} from '@lifeforge/ui'

import { useWalletData } from '@/hooks/useWalletData'
import { useStatementData } from '@/pages/Statements/providers/StatementDataProvider'
import numberToCurrency from '@/utils/numberToCurrency'

function PlatformsTable() {
  const { platformsQuery } = useWalletData()
  const { statementQuery } = useStatementData()
  const { t } = useModuleTranslation()

  return (
    <WithQuery query={platformsQuery}>
      {platforms => (
        <WithQuery query={statementQuery}>
          {({ platformBreakdown }) =>
            platformBreakdown.length === 0 ? null : (
              <>
                <Text
                  as="h2"
                  mt="3xl"
                  size={{ base: '2xl', print: 'lg' }}
                  tracking="widest"
                  transform="uppercase"
                  weight="semibold"
                >
                  <Text>1.4 </Text>
                  {t('widgets.platformsBreakdown')}
                </Text>
                <Table minWidth="0" mt="lg" width="100%">
                  <TableHeader>
                    <TableRow bg="custom-500">
                      <TableHeaderCell align="left" width="100%">
                        {t('statement.platform')}
                      </TableHeaderCell>
                      <TableHeaderCell>RM</TableHeaderCell>
                      <TableHeaderCell>%</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platformBreakdown.map(item => {
                      const platform = platforms.find(
                        p => p.id === item.platform
                      )

                      return (
                        <TableRow key={item.platform ?? 'unassigned'}>
                          <TableCell>
                            <Flex align="center" gap="sm">
                              <Icon
                                icon={
                                  platform?.icon ?? 'tabler:building-store'
                                }
                                size="1.5rem"
                                style={{ color: platform?.color }}
                              />
                              <Text whiteSpace="nowrap">
                                {platform?.name ?? t('statement.unassigned')}
                              </Text>
                            </Flex>
                          </TableCell>
                          <TableCell nowrap align="right">
                            {numberToCurrency(item.amount)}
                          </TableCell>
                          <TableCell nowrap align="right">
                            {item.percentage.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </>
            )
          }
        </WithQuery>
      )}
    </WithQuery>
  )
}

export default PlatformsTable
