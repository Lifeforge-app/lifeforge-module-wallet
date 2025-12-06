import { SCHEMAS } from '@schema'
import Moment from 'moment'
import MomentRange from 'moment-range'
import z from 'zod'

import { forgeController, forgeRouter } from '@functions/routes'

import getDateRange from '../utils/getDateRange'

// @ts-expect-error - MomentRange types are not fully compatible with Moment
const moment = MomentRange.extendMoment(Moment)

const list = forgeController
  .query()
  .description({
    en: 'Get all wallet assets',
    ms: 'Dapatkan semua aset dompet',
    'zh-CN': '获取所有钱包资产',
    'zh-TW': '獲取所有錢包資產'
  })
  .input({})
  .callback(({ pb }) =>
    pb.getFullList
      .collection('wallet__assets_aggregated')
      .sort(['name'])
      .execute()
  )

const getAssetAccumulatedBalance = forgeController
  .query()
  .description({
    en: 'Get asset balance over time',
    ms: 'Dapatkan baki aset mengikut masa',
    'zh-CN': '获取资产随时间的余额',
    'zh-TW': '獲取資產隨時間的餘額'
  })
  .input({
    query: z.object({
      id: z.string(),
      rangeMode: z.enum(['week', 'month', 'year', 'all', 'custom', 'quarter']),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__assets'
  })
  .callback(async ({ pb, query: { id, rangeMode, startDate, endDate } }) => {
    const dateRange = getDateRange(rangeMode, startDate, endDate)

    const { starting_balance } = await pb.getOne
      .collection('wallet__assets')
      .id(id)
      .fields({
        starting_balance: true
      })
      .execute()

    const allIncomeExpensesTransactions = await pb.getFullList
      .collection('wallet__transactions_income_expenses')
      .expand({
        base_transaction: 'wallet__transactions'
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
      .collection('wallet__transactions_transfer')
      .expand({
        base_transaction: 'wallet__transactions'
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

    const allDateInBetween = moment
      .range(moment(allTransactions[allTransactions.length - 1].date), moment())
      .by('day')

    for (const date of allDateInBetween) {
      const dateStr = date.format('YYYY-MM-DD')

      accumulatedBalance[dateStr] = parseFloat(currentBalance.toFixed(2))

      const transactionsOnDate = allTransactions.filter(t =>
        moment(t.date).isSame(date, 'day')
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
        const dateMoment = moment(date)

        const isAfterStartDate = dateRange.startDate
          ? dateMoment.isSameOrAfter(moment(dateRange.startDate), 'day')
          : true

        const isBeforeEndDate = dateRange.endDate
          ? dateMoment.isSameOrBefore(moment(dateRange.endDate), 'day')
          : true

        return isAfterStartDate && isBeforeEndDate
      })
    )
  })

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new wallet asset',
    ms: 'Cipta aset dompet baharu',
    'zh-CN': '创建新钱包资产',
    'zh-TW': '創建新錢包資產'
  })
  .input({
    body: SCHEMAS.wallet.assets.schema
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('wallet__assets').data(body).execute()
  )

const update = forgeController
  .mutation()
  .description({
    en: 'Update asset details',
    ms: 'Kemas kini butiran aset',
    'zh-CN': '更新资产详情',
    'zh-TW': '更新資產詳情'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: SCHEMAS.wallet.assets.schema
  })
  .existenceCheck('query', {
    id: 'wallet__assets'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('wallet__assets').id(id).data(body).execute()
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a wallet asset',
    ms: 'Padam aset dompet',
    'zh-CN': '删除钱包资产',
    'zh-TW': '刪除錢包資產'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__assets'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('wallet__assets').id(id).execute()
  )

export default forgeRouter({
  list,
  getAssetAccumulatedBalance,
  create,
  update,
  remove
})
