import { eq } from 'drizzle-orm'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import z from 'zod'

import type { BuiltModuleSchema } from '@lifeforge/drizzle'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import forge, { type WalletSchema } from '../forge'
import {
  walletTransactions,
  walletTransactionsIncomeExpenses,
  walletTransactionsTransfer
} from '../schema.drizzle'

type WalletDb = PostgresJsDatabase<BuiltModuleSchema<WalletSchema>>

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const TypesCountOutput = z.record(
  z.string(),
  z.object({
    transactionCount: z.number(),
    accumulatedAmount: z.number()
  })
)

const IncomeExpensesSummaryOutput = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number()
})

const CategoryBreakdownItem = z.object({
  amount: z.number(),
  count: z.number(),
  percentage: z.number()
})

const CategoryBreakdownOutput = z.object({
  income: z.record(z.string(), CategoryBreakdownItem),
  expenses: z.record(z.string(), CategoryBreakdownItem)
})

const AvailableYearMonthsOutput = z.object({
  years: z.array(z.number()),
  monthsByYear: z.record(z.string(), z.array(z.number()))
})

const TransactionCountByDayOutput = z.record(
  z.string(),
  z.object({
    income: z.number(),
    expenses: z.number(),
    transfer: z.number(),
    total: z.number(),
    count: z.number()
  })
)

const ChartDataOutput = z.array(
  z.object({
    date: z.string(),
    income: z.number(),
    expenses: z.number()
  })
)

async function fetchTransactions(db: WalletDb) {
  const [incomeExpenses, transfers] = await Promise.all([
    db
      .select({
        type: walletTransactionsIncomeExpenses.type,
        amount: walletTransactions.amount,
        date: walletTransactions.date,
        category: walletTransactionsIncomeExpenses.category,
        location_name: walletTransactionsIncomeExpenses.location_name,
        location_coords: walletTransactionsIncomeExpenses.location_coords
      })
      .from(walletTransactionsIncomeExpenses)
      .innerJoin(
        walletTransactions,
        eq(
          walletTransactionsIncomeExpenses.base_transaction,
          walletTransactions.id
        )
      ),
    db
      .select({
        amount: walletTransactions.amount,
        date: walletTransactions.date
      })
      .from(walletTransactionsTransfer)
      .innerJoin(
        walletTransactions,
        eq(walletTransactionsTransfer.base_transaction, walletTransactions.id)
      )
  ])

  return { incomeExpenses, transfers }
}

export const getTypesCount = forge
  .query({
    description: 'Get transaction counts and totals by type',
    input: {
      query: z.object({
        year: z.string().optional(),
        month: z.string().optional()
      })
    },
    output: {
      OK: TypesCountOutput
    }
  })
  .callback(async ({ db, query: { year, month }, response }) => {
    const parsedYear = year ? parseInt(year) : undefined

    const parsedMonth = month ? parseInt(month) : undefined

    const hasRange = parsedYear !== undefined && parsedMonth !== undefined

    const { incomeExpenses, transfers } = await fetchTransactions(db)

    const inRange = (date: Date) =>
      !hasRange ||
      (date.getFullYear() === parsedYear &&
        date.getMonth() + 1 === parsedMonth)

    const typesCount: Record<
      string,
      { transactionCount: number; accumulatedAmount: number }
    > = {
      income: { transactionCount: 0, accumulatedAmount: 0 },
      expenses: { transactionCount: 0, accumulatedAmount: 0 },
      transfer: { transactionCount: 0, accumulatedAmount: 0 }
    }

    for (const transaction of incomeExpenses) {
      if (!inRange(transaction.date)) continue

      typesCount[transaction.type].transactionCount++
      typesCount[transaction.type].accumulatedAmount += transaction.amount
    }

    for (const transaction of transfers) {
      if (!inRange(transaction.date)) continue

      typesCount.transfer.transactionCount++
      typesCount.transfer.accumulatedAmount += transaction.amount
    }

    return response.ok(typesCount)
  })

export const getIncomeExpensesSummary = forge
  .query({
    description: 'Get income and expenses summary for a month',
    input: {
      query: z.object({
        year: z.string(),
        month: z.string()
      })
    },
    output: {
      OK: IncomeExpensesSummaryOutput
    }
  })
  .callback(async ({ db, query: { year, month }, response }) => {
    const parsedYear = parseInt(year)

    const parsedMonth = parseInt(month)

    const start = dayjs(`${parsedYear}-${parsedMonth}-01`).startOf('month')

    const end = dayjs(`${parsedYear}-${parsedMonth}-01`).endOf('month')

    const { incomeExpenses } = await fetchTransactions(db)

    const inThisMonth = incomeExpenses.filter(transaction =>
      dayjs(transaction.date).isSameOrAfter(start) &&
      dayjs(transaction.date).isSameOrBefore(end)
    )

    const totalIncome = incomeExpenses.reduce(
      (acc, cur) => (cur.type === 'income' ? acc + cur.amount : acc),
      0
    )

    const totalExpenses = incomeExpenses.reduce(
      (acc, cur) => (cur.type === 'expenses' ? acc + cur.amount : acc),
      0
    )

    const monthlyIncome = inThisMonth.reduce(
      (acc, cur) => (cur.type === 'income' ? acc + cur.amount : acc),
      0
    )

    const monthlyExpenses = inThisMonth.reduce(
      (acc, cur) => (cur.type === 'expenses' ? acc + cur.amount : acc),
      0
    )

    return response.ok({
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses
    })
  })

export const getCategoriesBreakdown = forge
  .query({
    description: 'Get income and expenses breakdown by category for a month',
    input: {
      query: z.object({
        year: z.string(),
        month: z.string()
      })
    },
    output: {
      OK: CategoryBreakdownOutput
    }
  })
  .callback(async ({ db, query: { year, month }, response }) => {
    const parsedYear = parseInt(year)

    const parsedMonth = parseInt(month)

    const startDate = dayjs()
      .year(parsedYear)
      .month(parsedMonth - 1)
      .startOf('month')

    const endDate = dayjs()
      .year(parsedYear)
      .month(parsedMonth - 1)
      .endOf('month')

    const { incomeExpenses } = await fetchTransactions(db)

    const transactions = incomeExpenses.filter(
      transaction =>
        dayjs(transaction.date).isSameOrAfter(startDate) &&
        dayjs(transaction.date).isSameOrBefore(endDate)
    )

    const incomeByCategory: Record<
      string,
      { amount: number; count: number; percentage: number }
    > = {}

    const expensesByCategory: Record<
      string,
      { amount: number; count: number; percentage: number }
    > = {}

    for (const transaction of transactions) {
      const categoryId = transaction.category

      const amount = transaction.amount

      const type = transaction.type

      if (!categoryId) continue

      const targetMap =
        type === 'income' ? incomeByCategory : expensesByCategory

      if (targetMap[categoryId]) {
        targetMap[categoryId].amount += amount
        targetMap[categoryId].count += 1
      } else {
        targetMap[categoryId] = { amount, count: 1, percentage: 0 }
      }
    }

    const totalIncome = Object.values(incomeByCategory).reduce(
      (acc, { amount }) => acc + amount,
      0
    )

    for (const categoryId in incomeByCategory) {
      incomeByCategory[categoryId].percentage =
        totalIncome > 0
          ? (incomeByCategory[categoryId].amount / totalIncome) * 100
          : 0
    }

    const totalExpenses = Object.values(expensesByCategory).reduce(
      (acc, { amount }) => acc + amount,
      0
    )

    for (const categoryId in expensesByCategory) {
      expensesByCategory[categoryId].percentage =
        totalExpenses > 0
          ? (expensesByCategory[categoryId].amount / totalExpenses) * 100
          : 0
    }

    return response.ok({
      income: incomeByCategory,
      expenses: expensesByCategory
    })
  })

export const getSpendingByLocation = forge
  .query({
    description: 'Get spending aggregated by location for heatmap',
    output: {
      OK: z.array(
        z.object({
          lat: z.number(),
          lng: z.number(),
          locationName: z.string(),
          amount: z.number(),
          count: z.number()
        })
      )
    }
  })
  .callback(async ({ db, response }) => {
    const { incomeExpenses } = await fetchTransactions(db)

    const grouped: Record<
      string,
      { lat: number; lng: number; locationName: string; amount: number; count: number }
    > = {}

    for (const transaction of incomeExpenses) {
      if (transaction.type !== 'expenses') continue

      if (
        !transaction.location_name ||
        !transaction.location_coords ||
        transaction.location_coords.lat === 0 ||
        transaction.location_coords.lon === 0
      ) {
        continue
      }

      const key = `${transaction.location_coords.lat}_${transaction.location_coords.lon}_${transaction.location_name}`

      if (!grouped[key]) {
        grouped[key] = {
          lat: transaction.location_coords.lat,
          lng: transaction.location_coords.lon,
          locationName: transaction.location_name,
          amount: 0,
          count: 0
        }
      }

      grouped[key].amount += transaction.amount
      grouped[key].count += 1
    }

    return response.ok(Object.values(grouped))
  })

export const getAvailableYearMonths = forge
  .query({
    description: 'Get available years and months from transaction dates',
    output: {
      OK: AvailableYearMonthsOutput
    }
  })
  .callback(async ({ db, response }) => {
    const transactions = await db
      .select({ date: walletTransactions.date })
      .from(walletTransactions)

    const yearMonthMap: Record<number, Set<number>> = {}

    for (const transaction of transactions) {
      const date = dayjs(transaction.date)

      const year = date.year()

      const month = date.month()

      if (!yearMonthMap[year]) {
        yearMonthMap[year] = new Set()
      }

      yearMonthMap[year].add(month)
    }

    const years = Object.keys(yearMonthMap)
      .map(Number)
      .sort((a, b) => b - a)

    const monthsByYear: Record<number, number[]> = {}

    for (const year of years) {
      monthsByYear[year] = Array.from(yearMonthMap[year]).sort((a, b) => b - a)
    }

    return response.ok({ years, monthsByYear })
  })

export const getTransactionCountByDay = forge
  .query({
    description: 'Get transaction counts by day for a specific month',
    input: {
      query: z.object({
        year: z.string(),
        month: z.string(),
        viewFilter: z.string().optional()
      })
    },
    output: {
      OK: TransactionCountByDayOutput
    }
  })
  .callback(async ({ db, query: { year, month, viewFilter }, response }) => {
    const parsedYear = parseInt(year)

    const parsedMonth = parseInt(month) + 1

    const parsedViewFilter: ('income' | 'expenses' | 'transfer')[] = (viewFilter
      ?.split(',')
      .map(v => v.trim())
      .filter(t => ['income', 'expenses', 'transfer'].includes(t)) as (
      'income' | 'expenses' | 'transfer'
    )[]) ?? ['income', 'expenses', 'transfer']

    const { incomeExpenses, transfers } = await fetchTransactions(db)

    const countMap: Record<
      string,
      {
        income: number
        expenses: number
        transfer: number
        total: number
        count: number
      }
    > = {}

    const ensure = (dateKey: string) => {
      if (!countMap[dateKey]) {
        countMap[dateKey] = {
          income: 0,
          expenses: 0,
          transfer: 0,
          total: 0,
          count: 0
        }
      }

      return countMap[dateKey]
    }

    const isInMonth = (date: Date) =>
      date.getFullYear() === parsedYear && date.getMonth() + 1 === parsedMonth

    for (const transaction of incomeExpenses) {
      if (!isInMonth(transaction.date)) continue

      const date = dayjs(transaction.date)

      const dateKey = `${date.year()}-${date.month() + 1}-${date.date()}`

      const entry = ensure(dateKey)

      if (parsedViewFilter.includes(transaction.type as 'income' | 'expenses')) {
        entry[transaction.type as 'income' | 'expenses'] += 1
      }
    }

    for (const transaction of transfers) {
      if (!isInMonth(transaction.date)) continue

      const date = dayjs(transaction.date)

      const dateKey = `${date.year()}-${date.month() + 1}-${date.date()}`

      const entry = ensure(dateKey)

      if (parsedViewFilter.includes('transfer')) {
        entry.transfer += 1
      }
    }

    for (const dateKey in countMap) {
      const entry = countMap[dateKey]

      for (const type of ['income', 'expenses', 'transfer'] as const) {
        if (parsedViewFilter.includes(type)) {
          entry.total += entry[type]
          entry.count += entry[type] > 0 ? entry[type] : 0
        }
      }
    }

    return response.ok(countMap)
  })

export const getChartData = forge
  .query({
    description: 'Get chart data for income/expenses by date range',
    input: {
      query: z.object({
        range: z.enum(['week', 'month', 'ytd'])
      })
    },
    output: {
      OK: ChartDataOutput
    }
  })
  .callback(async ({ db, query: { range }, response }) => {
    const now = dayjs()

    const currentYear = now.year()

    let startDate: dayjs.Dayjs
    let endDate: dayjs.Dayjs
    let groupBy: 'day' | 'month'

    const labels: string[] = []

    switch (range) {
      case 'week': {
        const startOfWeek = dayjs().startOf('week')

        startDate = startOfWeek
        endDate = dayjs().endOf('week')
        groupBy = 'day'

        for (let i = 0; i <= 6; i++) {
          labels.push(startOfWeek.clone().add(i, 'day').format('MMM DD'))
        }
        break
      }

      case 'month': {
        const startOfMonth = dayjs().startOf('month')

        const endOfMonth = dayjs().endOf('month')

        startDate = startOfMonth
        endDate = endOfMonth
        groupBy = 'day'

        for (let i = 0; i < endOfMonth.date(); i++) {
          labels.push(startOfMonth.clone().add(i, 'day').format('MMM DD'))
        }
        break
      }

      case 'ytd': {
        startDate = dayjs().startOf('year')
        endDate = dayjs().endOf('month')
        groupBy = 'month'

        for (let i = 0; i <= now.month(); i++) {
          labels.push(dayjs().month(i).format('MMM'))
        }
        break
      }
    }

    const { incomeExpenses } = await fetchTransactions(db)

    const transactions = incomeExpenses.filter(
      transaction =>
        dayjs(transaction.date).isSameOrAfter(startDate) &&
        dayjs(transaction.date).isSameOrBefore(endDate)
    )

    const resultMap: Record<string, { income: number; expenses: number }> = {}

    for (const label of labels) {
      resultMap[label] = { income: 0, expenses: 0 }
    }

    for (const transaction of transactions) {
      const transactionYear = dayjs(transaction.date).year()

      if (transactionYear !== currentYear) continue

      let dateKey: string

      if (groupBy === 'day') {
        dateKey = dayjs(transaction.date).format('MMM DD')
      } else {
        dateKey = dayjs(transaction.date).format('MMM')
      }

      if (resultMap[dateKey]) {
        if (transaction.type === 'income') {
          resultMap[dateKey].income += transaction.amount
        } else if (transaction.type === 'expenses') {
          resultMap[dateKey].expenses += transaction.amount
        }
      }
    }

    return response.ok(
      labels.map(date => ({
        date,
        income: resultMap[date].income,
        expenses: resultMap[date].expenses > 0 ? -resultMap[date].expenses : 0
      }))
    )
  })
