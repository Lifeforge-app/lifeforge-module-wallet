import { and, asc, eq, gte, lte } from 'drizzle-orm'
import dayjs from 'dayjs'
import z from 'zod'

import forge from '../forge'
import {
  walletCategories,
  walletTransactions,
  walletTransactionsIncomeExpenses,
  walletTransactionsTransfer
} from '../schema.drizzle'
import {
  EnrichedTransactionOutput,
  mapToEnrichedTransaction
} from '../utils/enrichedTransaction'
import { getAllAssetAccumulatedBalance } from '../utils/getAllAssetAccumulatedBalance'

const comparisonItemDto = z.object({
  currentAmount: z.number(),
  previousAmount: z.number(),
  change: z.number(),
  percentageChange: z.number()
})

const comparisonDto = z.object({
  currentTotal: z.number(),
  previousTotal: z.number(),
  totalChange: z.number(),
  totalPercentageChange: z.number(),
  items: z.record(z.string(), comparisonItemDto)
})

const assetBalanceDto = z.object({
  last: z.number(),
  current: z.number(),
  change: z.number(),
  percentage: z.number()
})

const transactionBlockDto = z.object({
  items: z.array(EnrichedTransactionOutput),
  total: z.number(),
  count: z.number()
})

function percentageChange(change: number, previous: number): number {
  return previous !== 0 ? (change / previous) * 100 : 0
}

export const get = forge
  .query({
    description: 'Get fully computed financial statement for a month',
    input: {
      query: z.object({
        year: z.string(),
        month: z.string()
      })
    },
    output: {
      OK: z.object({
        overview: z.object({
          monthlyIncome: z.number(),
          monthlyExpenses: z.number(),
          netIncome: z.number()
        }),
        assets: z.object({
          balances: z.record(z.string(), assetBalanceDto),
          total: assetBalanceDto,
          liabilitiesTotal: assetBalanceDto,
          netWorth: assetBalanceDto
        }),
        categoryComparison: z.object({
          income: comparisonDto,
          expenses: comparisonDto
        }),
        transactions: z.object({
          income: transactionBlockDto,
          expenses: transactionBlockDto,
          transfer: transactionBlockDto,
          totalCount: z.number()
        })
      })
    }
  })
  .callback(async ({ db, query: { year, month }, response }) => {
    const parsedYear = parseInt(year)

    const parsedMonth = parseInt(month)

    const startOfMonth = dayjs()
      .year(parsedYear)
      .month(parsedMonth - 1)
      .startOf('month')

    const endOfMonth = startOfMonth.endOf('month')

    const startOfPrevMonth = startOfMonth.subtract(1, 'month')

    const endOfPrevMonth = startOfMonth.subtract(1, 'day').endOf('day')

    const rows = await db
      .select({
        base: walletTransactions,
        sub: walletTransactionsIncomeExpenses,
        transfer: walletTransactionsTransfer
      })
      .from(walletTransactions)
      .leftJoin(
        walletTransactionsIncomeExpenses,
        eq(
          walletTransactionsIncomeExpenses.base_transaction,
          walletTransactions.id
        )
      )
      .leftJoin(
        walletTransactionsTransfer,
        eq(walletTransactionsTransfer.base_transaction, walletTransactions.id)
      )
      .where(
        and(
          gte(walletTransactions.date, startOfMonth.toDate()),
          lte(walletTransactions.date, endOfMonth.toDate())
        )
      )
      .orderBy(asc(walletTransactions.date), asc(walletTransactions.created))

    const monthTransactions = rows.map(({ base, sub, transfer }) =>
      mapToEnrichedTransaction(base, sub, transfer)
    )

    const prevMonthRows = await db
      .select({
        type: walletTransactionsIncomeExpenses.type,
        category: walletTransactionsIncomeExpenses.category,
        amount: walletTransactions.amount
      })
      .from(walletTransactionsIncomeExpenses)
      .innerJoin(
        walletTransactions,
        eq(
          walletTransactionsIncomeExpenses.base_transaction,
          walletTransactions.id
        )
      )
      .where(
        and(
          gte(walletTransactions.date, startOfPrevMonth.toDate()),
          lte(walletTransactions.date, endOfPrevMonth.toDate())
        )
      )

    const categories = await db.select().from(walletCategories)

    let monthlyIncome = 0
    let monthlyExpenses = 0

    const blocks: Record<
      'income' | 'expenses' | 'transfer',
      z.infer<typeof EnrichedTransactionOutput>[]
    > = {
      income: [],
      expenses: [],
      transfer: []
    }

    for (const transaction of monthTransactions) {
      blocks[transaction.type].push(transaction)

      if (transaction.type === 'income') {
        monthlyIncome += transaction.amount
      } else if (transaction.type === 'expenses') {
        monthlyExpenses += transaction.amount
      }
    }

    const buildBlock = (list: z.infer<typeof EnrichedTransactionOutput>[]) => ({
      items: list,
      total: parseFloat(
        list.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)
      ),
      count: list.length
    })

    const buildComparison = (type: 'income' | 'expenses') => {
      const items: Record<string, z.infer<typeof comparisonItemDto>> = {}

      for (const category of categories.filter(c => c.type === type)) {
        items[category.id] = {
          currentAmount: 0,
          previousAmount: 0,
          change: 0,
          percentageChange: 0
        }
      }

      let currentTotal = 0
      let previousTotal = 0

      for (const transaction of monthTransactions) {
        if (transaction.type !== type || !transaction.category) continue

        currentTotal += transaction.amount

        items[transaction.category] ??= {
          currentAmount: 0,
          previousAmount: 0,
          change: 0,
          percentageChange: 0
        }

        items[transaction.category].currentAmount += transaction.amount
      }

      for (const row of prevMonthRows) {
        if (row.type !== type || !row.category) continue

        previousTotal += row.amount

        items[row.category] ??= {
          currentAmount: 0,
          previousAmount: 0,
          change: 0,
          percentageChange: 0
        }

        items[row.category].previousAmount += row.amount
      }

      for (const id in items) {
        const item = items[id]

        item.change = item.currentAmount - item.previousAmount
        item.percentageChange = percentageChange(
          item.change,
          item.previousAmount
        )
      }

      const totalChange = currentTotal - previousTotal

      return {
        currentTotal,
        previousTotal,
        totalChange,
        totalPercentageChange: percentageChange(totalChange, previousTotal),
        items
      }
    }

    const balanceMap = await getAllAssetAccumulatedBalance(db, year, month)

    const balances: Record<string, z.infer<typeof assetBalanceDto>> = {}

    const buildBalance = (last: number, current: number) => {
      const change = current - last

      return {
        last: parseFloat(last.toFixed(2)),
        current: parseFloat(current.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        percentage: percentageChange(change, last)
      }
    }

    let assetLast = 0
    let assetCurrent = 0

    let liabilityLast = 0
    let liabilityCurrent = 0

    for (const assetId in balanceMap) {
      const { last, current, is_liability } = balanceMap[assetId]

      const change = current - last

      balances[assetId] = {
        last,
        current,
        change,
        percentage: percentageChange(change, last)
      }

      if (is_liability) {
        liabilityLast += last
        liabilityCurrent += current
      } else {
        assetLast += last
        assetCurrent += current
      }
    }

    const incomeBlock = buildBlock(blocks.income)
    const expensesBlock = buildBlock(blocks.expenses)
    const transferBlock = buildBlock(blocks.transfer)

    return response.ok({
      overview: {
        monthlyIncome,
        monthlyExpenses,
        netIncome: monthlyIncome - monthlyExpenses
      },
      assets: {
        balances,
        total: buildBalance(assetLast, assetCurrent),
        liabilitiesTotal: buildBalance(-liabilityLast, -liabilityCurrent),
        netWorth: buildBalance(assetLast + liabilityLast, assetCurrent + liabilityCurrent)
      },
      categoryComparison: {
        income: buildComparison('income'),
        expenses: buildComparison('expenses')
      },
      transactions: {
        income: incomeBlock,
        expenses: expensesBlock,
        transfer: transferBlock,
        totalCount:
          incomeBlock.count + expensesBlock.count + transferBlock.count
      }
    })
  })
