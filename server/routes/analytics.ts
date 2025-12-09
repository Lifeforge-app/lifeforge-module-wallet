import moment from 'moment'
import z from 'zod'

import { forgeController, forgeRouter } from '@functions/routes'

const getTypesCount = forgeController
  .query()
  .description({
    en: 'Get transaction counts and totals by type',
    ms: 'Dapatkan kiraan dan jumlah transaksi mengikut jenis',
    'zh-CN': '按类型获取交易数量和总额',
    'zh-TW': '按類型獲取交易數量和總額'
  })
  .input({})
  .callback(async ({ pb }) => {
    const types = await pb.getFullList
      .collection('wallet__transaction_types_aggregated')
      .execute()

    const typesCount = types.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.name]: {
          transactionCount: cur.transaction_count,
          accumulatedAmount: cur.accumulated_amount as number
        }
      }),
      {} as Record<
        string,
        { transactionCount: number; accumulatedAmount: number }
      >
    )

    return typesCount
  })

const getIncomeExpensesSummary = forgeController
  .query()
  .description({
    en: 'Get income and expenses summary for a month',
    ms: 'Dapatkan ringkasan pendapatan dan perbelanjaan untuk sebulan',
    'zh-CN': '获取月度收入和支出摘要',
    'zh-TW': '獲取月度收入和支出摘要'
  })
  .input({
    query: z.object({
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val))
    })
  })
  .callback(async ({ pb, query: { year, month } }) => {
    const start = moment(`${year}-${month}-01`)
      .startOf('month')
      .format('YYYY-MM-DD')

    const end = moment(`${year}-${month}-01`)
      .endOf('month')
      .format('YYYY-MM-DD')

    const transactions = await pb.getFullList
      .collection('wallet__transactions_income_expenses')
      .expand({
        base_transaction: 'wallet__transactions'
      })
      .fields({
        type: true,
        'expand.base_transaction.date': true,
        'expand.base_transaction.amount': true
      })
      .execute()

    const inThisMonth = transactions.filter(
      transaction =>
        moment(
          moment(transaction.expand!.base_transaction!.date!).format(
            'YYYY-MM-DD'
          )
        ).isSameOrAfter(start) &&
        moment(
          moment(transaction.expand!.base_transaction!.date!).format(
            'YYYY-MM-DD'
          )
        ).isSameOrBefore(end)
    )

    const totalIncome = transactions.reduce((acc, cur) => {
      if (cur.type === 'income') {
        return acc + cur.expand!.base_transaction!.amount!
      }

      return acc
    }, 0)

    const totalExpenses = transactions.reduce((acc, cur) => {
      if (cur.type === 'expenses') {
        return acc + cur.expand!.base_transaction!.amount!
      }

      return acc
    }, 0)

    const monthlyIncome = inThisMonth.reduce((acc, cur) => {
      if (cur.type === 'income') {
        return acc + cur.expand!.base_transaction!.amount!
      }

      return acc
    }, 0)

    const monthlyExpenses = inThisMonth.reduce((acc, cur) => {
      if (cur.type === 'expenses') {
        return acc + cur.expand!.base_transaction!.amount!
      }

      return acc
    }, 0)

    return {
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses
    }
  })

const getCategoriesBreakdown = forgeController
  .query()
  .description({
    en: 'Get income and expenses breakdown by category for a month',
    ms: 'Dapatkan pecahan pendapatan dan perbelanjaan mengikut kategori untuk sebulan',
    'zh-CN': '按类别获取月度收入和支出明细',
    'zh-TW': '按類別獲取月度收入和支出明細'
  })
  .input({
    query: z.object({
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val))
    })
  })
  .callback(async ({ pb, query: { year, month } }) => {
    const startDate = moment()
      .year(year)
      .month(month - 1)
      .startOf('month')
      .format('YYYY-MM-DD')

    const endDate = moment()
      .year(year)
      .month(month - 1)
      .endOf('month')
      .format('YYYY-MM-DD')

    const transactions = await pb.getFullList
      .collection('wallet__transactions_income_expenses')
      .expand({
        category: 'wallet__categories',
        base_transaction: 'wallet__transactions'
      })
      .filter([
        {
          field: 'base_transaction.date',
          operator: '>=',
          value: startDate
        },
        {
          field: 'base_transaction.date',
          operator: '<=',
          value: endDate
        }
      ])
      .fields({
        type: true,
        'expand.base_transaction.amount': true,
        'expand.base_transaction.date': true,
        'expand.category.id': true
      })
      .execute()

    type CategoryBreakdown = Record<
      string,
      {
        amount: number
        count: number
        percentage: number
      }
    >

    const incomeByCategory: CategoryBreakdown = {}

    const expensesByCategory: CategoryBreakdown = {}

    for (const transaction of transactions) {
      const categoryId = transaction.expand?.category?.id

      const amount = transaction.expand?.base_transaction?.amount || 0

      const type = transaction.type

      if (!categoryId) continue

      const targetMap =
        type === 'income' ? incomeByCategory : expensesByCategory

      if (targetMap[categoryId]) {
        targetMap[categoryId].amount += amount
        targetMap[categoryId].count += 1
      } else {
        targetMap[categoryId] = {
          amount,
          count: 1,
          percentage: 0
        }
      }
    }

    // Calculate percentages for income
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

    // Calculate percentages for expenses
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

    return {
      income: incomeByCategory,
      expenses: expensesByCategory
    }
  })

const getSpendingByLocation = forgeController
  .query()
  .description({
    en: 'Get spending aggregated by location for heatmap',
    ms: 'Dapatkan perbelanjaan yang diagregatkan mengikut lokasi untuk peta haba',
    'zh-CN': '获取按位置汇总的支出（用于热力图）',
    'zh-TW': '獲取按位置匯總的支出（用於熱力圖）'
  })
  .input({})
  .callback(async ({ pb }) =>
    pb.getFullList.collection('wallet__expenses_location_aggregated').execute()
  )

const getAvailableYearMonths = forgeController
  .query()
  .description({
    en: 'Get available years and months from transaction dates',
    ms: 'Dapatkan tahun dan bulan yang tersedia daripada tarikh transaksi',
    'zh-CN': '获取交易日期中可用的年份和月份',
    'zh-TW': '獲取交易日期中可用的年份和月份'
  })
  .input({})
  .callback(async ({ pb }) => {
    const transactions = await pb.getFullList
      .collection('wallet__transactions')
      .fields({
        date: true
      })
      .execute()

    const yearMonthMap: Record<number, Set<number>> = {}

    for (const transaction of transactions) {
      const date = moment(transaction.date)

      const year = date.year()

      const month = date.month()

      if (!yearMonthMap[year]) {
        yearMonthMap[year] = new Set()
      }
      yearMonthMap[year].add(month)
    }

    // Convert Sets to sorted arrays
    const years = Object.keys(yearMonthMap)
      .map(Number)
      .sort((a, b) => b - a) // Sort years descending (newest first)

    const monthsByYear: Record<number, number[]> = {}

    for (const year of years) {
      monthsByYear[year] = Array.from(yearMonthMap[year]).sort((a, b) => b - a) // Sort months descending
    }

    return { years, monthsByYear }
  })

const getTransactionCountByDay = forgeController
  .query()
  .description({
    en: 'Get transaction counts by day for a specific month',
    ms: 'Dapatkan bilangan transaksi mengikut hari untuk bulan tertentu',
    'zh-CN': '获取特定月份每天的交易数量',
    'zh-TW': '獲取特定月份每天的交易數量'
  })
  .input({
    query: z.object({
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val)),
      viewFilter: z
        .string()
        .optional()
        .transform((val): ('income' | 'expenses' | 'transfer')[] => {
          if (!val) return ['income', 'expenses', 'transfer']

          const types = val.split(',').map(v => v.trim())

          if (
            !types.every(t => ['income', 'expenses', 'transfer'].includes(t))
          ) {
            throw new Error('Invalid viewFilter types')
          }

          return types as ('income' | 'expenses' | 'transfer')[]
        })
    })
  })
  .callback(async ({ pb, query: { year, month, viewFilter } }) => {
    const data = await pb.getFullList
      .collection('wallet__transactions_amount_aggregated')
      .filter([
        {
          field: 'year',
          operator: '=',
          value: year
        },
        {
          field: 'month',
          operator: '=',
          value: month + 1 // Convert 0-indexed to 1-indexed
        }
      ])
      .execute()

    // Convert to the expected format keyed by date
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

    for (const row of data) {
      const dateKey = `${row.year}-${row.month}-${row.date}`

      countMap[dateKey] = {
        income: 0,
        expenses: 0,
        transfer: 0,
        total: 0,
        count: 0
      }

      const types = ['income', 'expenses', 'transfer'] as const

      for (const type of types) {
        if (viewFilter.includes(type)) {
          const count = row[`${type}_count`] || 0

          countMap[dateKey][type] = count
          countMap[dateKey].total += count
          countMap[dateKey].count += count > 0 ? count : 0
        }
      }
    }

    return countMap
  })

const getChartData = forgeController
  .query()
  .description({
    en: 'Get chart data for income/expenses by date range',
    ms: 'Dapatkan data carta untuk pendapatan/perbelanjaan mengikut julat tarikh',
    'zh-CN': '获取收入/支出按日期范围的图表数据',
    'zh-TW': '獲取收入/支出按日期範圍的圖表數據'
  })
  .input({
    query: z.object({
      range: z.enum(['week', 'month', 'ytd'])
    })
  })
  .callback(async ({ pb, query: { range } }) => {
    const now = moment()

    const currentYear = now.year()

    let startDate: string
    let endDate: string
    let groupBy: 'day' | 'month'

    const labels: string[] = []

    switch (range) {
      case 'week': {
        const startOfWeek = moment().startOf('week')

        startDate = startOfWeek.format('YYYY-MM-DD')
        endDate = moment().endOf('week').format('YYYY-MM-DD')
        groupBy = 'day'

        for (let i = 0; i <= 6; i++) {
          labels.push(startOfWeek.clone().add(i, 'day').format('MMM DD'))
        }
        break
      }

      case 'month': {
        const startOfMonth = moment().startOf('month')

        const endOfMonth = moment().endOf('month')

        startDate = startOfMonth.format('YYYY-MM-DD')
        endDate = endOfMonth.format('YYYY-MM-DD')
        groupBy = 'day'

        for (let i = 0; i < endOfMonth.date(); i++) {
          labels.push(startOfMonth.clone().add(i, 'day').format('MMM DD'))
        }
        break
      }

      case 'ytd': {
        startDate = moment().startOf('year').format('YYYY-MM-DD')
        endDate = moment().endOf('month').format('YYYY-MM-DD')
        groupBy = 'month'

        for (let i = 0; i <= now.month(); i++) {
          labels.push(moment().month(i).format('MMM'))
        }
        break
      }
    }

    // Fetch transactions for the date range
    const transactions = await pb.getFullList
      .collection('wallet__transactions_income_expenses')
      .expand({
        base_transaction: 'wallet__transactions'
      })
      .filter([
        {
          field: 'base_transaction.date',
          operator: '>=',
          value: startDate
        },
        {
          field: 'base_transaction.date',
          operator: '<=',
          value: endDate
        }
      ])
      .execute()

    // Build the result map
    const resultMap: Record<string, { income: number; expenses: number }> = {}

    for (const label of labels) {
      resultMap[label] = { income: 0, expenses: 0 }
    }

    for (const transaction of transactions) {
      const base = transaction.expand?.base_transaction

      if (!base) continue

      // Only include transactions from current year
      const transactionYear = moment(base.date).year()

      if (transactionYear !== currentYear) continue

      let dateKey: string

      if (groupBy === 'day') {
        dateKey = moment(base.date).format('MMM DD')
      } else {
        dateKey = moment(base.date).format('MMM')
      }

      if (resultMap[dateKey]) {
        if (transaction.type === 'income') {
          resultMap[dateKey].income += base.amount
        } else if (transaction.type === 'expenses') {
          resultMap[dateKey].expenses += base.amount
        }
      }
    }

    // Convert to array format with expenses as negative
    return labels.map(date => ({
      date,
      income: resultMap[date].income,
      expenses: resultMap[date].expenses > 0 ? -resultMap[date].expenses : 0
    }))
  })

export default forgeRouter({
  getTypesCount,
  getIncomeExpensesSummary,
  getCategoriesBreakdown,
  getSpendingByLocation,
  getAvailableYearMonths,
  getTransactionCountByDay,
  getChartData
})
