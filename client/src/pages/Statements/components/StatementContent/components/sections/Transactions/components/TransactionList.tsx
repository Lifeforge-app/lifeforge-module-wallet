import dayjs from 'dayjs'

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
  TagChip,
  Text,
} from '@lifeforge/ui'

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
  const { t } = useModuleTranslation()

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
        {t(`transactionTypes.${type}`)}
      </Text>
      <Table mt="lg" width="100%">
        <TableHeader>
          <TableRow bg="custom-500">
            <TableHeaderCell>{t('statement.date')}</TableHeaderCell>
            <TableHeaderCell align="left" width="100%">
              {t('statement.particular')}
            </TableHeaderCell>
            {type !== 'transfer' && (
              <>
                <TableHeaderCell>{t('statement.asset')}</TableHeaderCell>
                <TableHeaderCell>{t('statement.category')}</TableHeaderCell>
              </>
            )}
            <TableHeaderCell>{t('statement.amount')}</TableHeaderCell>
          </TableRow>
          <TableRow bg="bg-800" color="bg-50">
            <TableHeaderCell />
            <TableHeaderCell align="left" width="100%" />
            {type !== 'transfer' && (
              <>
                <TableHeaderCell />
                <TableHeaderCell />
              </>
            )}
            <TableHeaderCell>RM</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell nowrap>
                {dayjs(transaction.date).format('MMM DD')}
              </TableCell>
              <TableCell minWidth="24rem">
                {transaction.type === 'transfer'
                  ? t('statement.transferFromTo', {
                      from:
                        assets.find(a => a.id === transaction.from)?.name ??
                        t('statement.unknownAsset'),
                      to:
                        assets.find(a => a.id === transaction.to)?.name ??
                        t('statement.unknownAsset')
                    })
                  : transaction.particulars}
              </TableCell>
              {transaction.type !== 'transfer' && (
                <TableCell nowrap>
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
                </TableCell>
              )}
              {transaction.type !== 'transfer' && (
                <TableCell nowrap>
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
                </TableCell>
              )}
              <TableCell nowrap align="right">
                {type === 'expenses'
                  ? `(${numberToCurrency(transaction.amount)})`
                  : numberToCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={type !== 'transfer' ? 4 : 2}>
              <Text weight="semibold">
                {t('statement.totalType', {
                  type: t(`transactionTypes.${type}`)
                })}
              </Text>
            </TableCell>
            <TableCell nowrap align="right" variant="total">
              {total < 0
                ? `(${numberToCurrency(Math.abs(total))})`
                : numberToCurrency(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  )
}

export default TransactionList
