import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import z from 'zod'

import forge from '../forge'
import walletSchemas from '../schema'
import getDateRange from '../utils/getDateRange'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export const list = forge
  .query()
  .description('Get all wallet assets')
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('assets_aggregated').sort(['name']).execute()
  )

export const getAssetAccumulatedBalance = forge
  .query()
  .description('Get asset balance over time')
  .input({
    query: z.object({
      id: z.string(),
      rangeMode: z.enum(['week', 'month', 'year', 'all', 'custom', 'quarter']),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    })
  })
  .existenceCheck('query', {
    id: 'assets'
  })
  .callback(async ({ pb, query: { id, rangeMode, startDate, endDate } }) => {
    const dateRange = getDateRange(rangeMode, startDate, endDate)

    const { starting_balance } = await pb.getOne
      .collection('assets')
      .id(id)
      .fields({
        starting_balance: true
      })
      .execute()

    const allIncomeExpensesTransactions = await pb.getFullList
      .collection('transactions_income_expenses')
      .expand({
        base_transaction: 'transactions'
      })
      .filter([
        {
          field: 'asset',
          operator: '=',
          value: id
        }
      ])
      .fields({
        type: true,
        'expand.base_transaction.amount': true,
        'expand.base_transaction.date': true
      })
      .execute()

    const allTransferTransactions = await pb.getFullList
      .collection('transactions_transfer')
      .expand({
        base_transaction: 'transactions'
      })
      .filter([
        {
          combination: '||',
          filters: [
            {
              field: 'from',
              operator: '=',
              value: id
            },
            {
              field: 'to',
              operator: '=',
              value: id
            }
          ]
        }
      ])
      .fields({
        'expand.base_transaction.amount': true,
        'expand.base_transaction.date': true,
        from: true,
        to: true
      })
      .execute()

    const allTransactions = [
      ...allIncomeExpensesTransactions.map(t => ({
        type: t.type,
        amount: t.expand!.base_transaction!.amount!,
        date: t.expand!.base_transaction!.date!
      })),
      ...allTransferTransactions.map(t => ({
        type: t.from === id ? 'expenses' : 'income',
        amount: t.expand!.base_transaction!.amount!,
        date: t.expand!.base_transaction!.date!
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (allTransactions.length === 0) {
      return {}
    }

    let currentBalance = starting_balance

    const accumulatedBalance: Record<string, number> = {}

    const allDateInBetween = []

    const start = dayjs(
      dateRange.startDate || allTransactions[allTransactions.length - 1].date
    )

    const end = dayjs(dateRange.endDate || allTransactions[0].date)

    let currDate = start.clone()

    while (currDate.isSameOrBefore(end, 'day')) {
      allDateInBetween.push(currDate.clone())
      currDate = currDate.add(1, 'day')
    }

    for (const date of allDateInBetween) {
      const dateStr = date.format('YYYY-MM-DD')

      accumulatedBalance[dateStr] = parseFloat(currentBalance.toFixed(2))

      const transactionsOnDate = allTransactions.filter(t =>
        dayjs(t.date).isSame(date, 'day')
      )

      for (const transaction of transactionsOnDate) {
        if (transaction.type === 'expenses') {
          currentBalance -= transaction.amount
        } else if (transaction.type === 'income') {
          currentBalance += transaction.amount
        }
      }
    }

    return Object.fromEntries(
      Object.entries(accumulatedBalance).filter(([date]) => {
        const dateMoment = dayjs(date)

        const isAfterStartDate = dateRange.startDate
          ? dateMoment.isSameOrAfter(dayjs(dateRange.startDate), 'day')
          : true

        const isBeforeEndDate = dateRange.endDate
          ? dateMoment.isSameOrBefore(dayjs(dateRange.endDate), 'day')
          : true

        return isAfterStartDate && isBeforeEndDate
      })
    )
  })

export const getAllAssetAccumulatedBalance = forge
  .query()
  .description('Get all asset balances for a specific month')
  .input({
    query: z.object({
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val))
    })
  })
  .callback(async ({ pb, query: { year, month } }) => {
    // Calculate dates
    const currentMonthEnd = dayjs()
      .year(year)
      .month(month - 1)
      .endOf('month')

    const prevMonthEnd = dayjs()
      .year(year)
      .month(month - 1)
      .startOf('month')
      .subtract(1, 'day')

    // Get all assets
    const assets = await pb.getFullList
      .collection('assets')
      .fields({
        id: true,
        starting_balance: true
      })
      .execute()

    // Get all income/expenses transactions
    const allIncomeExpensesTransactions = await pb.getFullList
      .collection('transactions_income_expenses')
      .expand({
        base_transaction: 'transactions'
      })
      .fields({
        type: true,
        asset: true,
        'expand.base_transaction.amount': true,
        'expand.base_transaction.date': true
      })
      .execute()

    // Get all transfer transactions
    const allTransferTransactions = await pb.getFullList
      .collection('transactions_transfer')
      .expand({
        base_transaction: 'transactions'
      })
      .fields({
        'expand.base_transaction.amount': true,
        'expand.base_transaction.date': true,
        from: true,
        to: true
      })
      .execute()

    const result: Record<string, { last: number; current: number }> = {}

    for (const asset of assets) {
      // Get transactions for this asset
      const incomeExpenses = allIncomeExpensesTransactions
        .filter(t => t.asset === asset.id)
        .map(t => ({
          type: t.type as 'income' | 'expenses',
          amount: t.expand!.base_transaction!.amount!,
          date: t.expand!.base_transaction!.date!
        }))

      const transfers = allTransferTransactions
        .filter(t => t.from === asset.id || t.to === asset.id)
        .map(t => ({
          type: (t.from === asset.id ? 'expenses' : 'income') as
            | 'income'
            | 'expenses',
          amount: t.expand!.base_transaction!.amount!,
          date: t.expand!.base_transaction!.date!
        }))

      const allTransactions = [...incomeExpenses, ...transfers].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      // Calculate balances by walking through transactions
      let balance = asset.starting_balance
      let lastMonthBalance = asset.starting_balance
      let currentMonthBalance = asset.starting_balance

      for (const transaction of allTransactions) {
        const txDate = dayjs(transaction.date)

        if (transaction.type === 'income') {
          balance += transaction.amount
        } else {
          balance -= transaction.amount
        }

        // Update last month balance if transaction is on or before prev month end
        if (txDate.isSameOrBefore(prevMonthEnd, 'day')) {
          lastMonthBalance = balance
        }

        // Update current month balance if transaction is on or before current month end
        if (txDate.isSameOrBefore(currentMonthEnd, 'day')) {
          currentMonthBalance = balance
        }
      }

      result[asset.id] = {
        last: parseFloat(lastMonthBalance.toFixed(2)),
        current: parseFloat(currentMonthBalance.toFixed(2))
      }
    }

    return result
  })

export const create = forge
  .mutation()
  .description('Create a new wallet asset')
  .input({
    body: walletSchemas.assets
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('assets').data(body).execute()
  )

export const update = forge
  .mutation()
  .description('Update asset details')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: walletSchemas.assets
  })
  .existenceCheck('query', {
    id: 'assets'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('assets').id(id).data(body).execute()
  )

export const remove = forge
  .mutation()
  .description('Delete a wallet asset')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'assets'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('assets').id(id).execute()
  )
