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

const getExpensesBreakdown = forgeController
  .query()
  .description({
    en: 'Get expenses breakdown by category for a month',
    ms: 'Dapatkan pecahan perbelanjaan mengikut kategori untuk sebulan',
    'zh-CN': '按类别获取月度支出明细',
    'zh-TW': '按類別獲取月度支出明細'
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

    const expenses = await pb.getFullList
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
        },
        {
          field: 'type',
          operator: '=',
          value: 'expenses'
        }
      ])
      .fields({
        'expand.base_transaction.amount': true,
        'expand.base_transaction.date': true,
        'expand.category.id': true
      })
      .execute()

    const spentOnEachCategory: Record<
      string,
      {
        amount: number
        count: number
        percentage: number
      }
    > = {}

    for (const expense of expenses) {
      const categoryId = expense.expand?.category?.id

      if (!categoryId) {
        continue
      }

      if (spentOnEachCategory[categoryId]) {
        spentOnEachCategory[categoryId].amount +=
          expense.expand?.base_transaction?.amount || 0
        spentOnEachCategory[categoryId].count += 1
      } else {
        spentOnEachCategory[categoryId] = {
          amount: expense.expand?.base_transaction?.amount || 0,
          count: 1,
          percentage: 0
        }
      }
    }

    const totalSpent = Object.values(spentOnEachCategory).reduce(
      (acc, { amount }) => acc + amount,
      0
    )

    for (const categoryId in spentOnEachCategory) {
      spentOnEachCategory[categoryId].percentage =
        (spentOnEachCategory[categoryId].amount / totalSpent) * 100
    }

    return spentOnEachCategory
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
  .callback(async ({ pb }) => {
    const expenses = await pb.getFullList
      .collection('wallet__transactions_income_expenses')
      .expand({
        base_transaction: 'wallet__transactions'
      })
      .filter([
        {
          field: 'type',
          operator: '=',
          value: 'expenses'
        }
      ])
      .execute()

    const locationGroups: Record<
      string,
      {
        lat: number
        lng: number
        amount: number
        locationName: string
        count: number
      }
    > = {}

    for (const expense of expenses) {
      const baseTransaction = expense.expand?.base_transaction

      if (!baseTransaction) continue

      const lat = expense.location_coords?.lat

      const lon = expense.location_coords?.lon

      const locationName = expense.location_name

      // Skip transactions without valid location data
      if (!lat || !lon || !locationName) continue

      const key = `${lat},${lon},${locationName}`

      if (locationGroups[key]) {
        locationGroups[key].amount += baseTransaction.amount
        locationGroups[key].count += 1
      } else {
        locationGroups[key] = {
          lat,
          lng: lon,
          amount: baseTransaction.amount,
          locationName,
          count: 1
        }
      }
    }

    return Object.values(locationGroups)
  })

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

export default forgeRouter({
  getTypesCount,
  getIncomeExpensesSummary,
  getExpensesBreakdown,
  getSpendingByLocation,
  getAvailableYearMonths
})
