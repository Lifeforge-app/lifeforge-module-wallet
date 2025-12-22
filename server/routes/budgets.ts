import moment from 'moment'
import z from 'zod'

import { forgeController, forgeRouter } from '@functions/routes'

const list = forgeController
  .query()
  .description({
    en: 'Get all budgets for a specific month with spent amounts',
    ms: 'Dapatkan semua bajet untuk bulan tertentu dengan jumlah perbelanjaan',
    'zh-CN': '获取特定月份的所有预算及其支出金额',
    'zh-TW': '獲取特定月份的所有預算及其支出金額'
  })
  .input({
    query: z.object({
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val))
    })
  })
  .callback(async ({ pb, query: { year, month } }) =>
    pb.getFullList
      .collection('wallet__budgets_aggregated')
      .filter([
        {
          field: 'year',
          operator: '=',
          value: year
        },
        {
          field: 'month',
          operator: '=',
          value: month
        }
      ])
      .expand({
        category: 'wallet__categories'
      })
      .execute()
  )

const ModifyBudgetSchema = z.object({
  amount: z.number().min(0),
  rollover_enabled: z.boolean().optional().default(false),
  rollover_cap: z.number().min(0).optional().default(100),
  alert_threshold: z.number().min(0).max(200).optional().default(80)
})

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new budget',
    ms: 'Cipta bajet baharu',
    'zh-CN': '创建新预算',
    'zh-TW': '創建新預算'
  })
  .input({
    query: z.object({
      category: z.string(),
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val))
    }),
    body: ModifyBudgetSchema
  })
  .existenceCheck('query', {
    category: 'wallet__categories'
  })
  .statusCode(201)
  .callback(async ({ pb, body, query: { category, year, month } }) => {
    // Check if budget already exists for this category in the same year/month
    const existingBudget = await pb.getFirstListItem
      .collection('wallet__budgets')
      .filter([
        {
          field: 'category',
          operator: '=',
          value: category
        },
        {
          field: 'year',
          operator: '=',
          value: year
        },
        {
          field: 'month',
          operator: '=',
          value: month
        },
        {
          field: 'is_active',
          operator: '=',
          value: true
        }
      ])
      .execute()
      .catch(() => null)

    if (existingBudget) {
      throw new Error(
        'A budget for this category already exists for this month'
      )
    }

    return pb.create
      .collection('wallet__budgets')
      .data({
        category,
        amount: body.amount,
        year,
        month,
        rollover_enabled: body.rollover_enabled,
        rollover_cap: body.rollover_cap,
        alert_thresholds: [body.alert_threshold],
        is_active: true
      })
      .execute()
  })

const update = forgeController
  .mutation()
  .description({
    en: 'Update budget settings',
    ms: 'Kemas kini tetapan bajet',
    'zh-CN': '更新预算设置',
    'zh-TW': '更新預算設置'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: ModifyBudgetSchema
  })
  .existenceCheck('query', {
    id: 'wallet__budgets'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('wallet__budgets').id(id).data(body).execute()
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a budget (soft delete)',
    ms: 'Padam bajet (padam lembut)',
    'zh-CN': '删除预算（软删除）',
    'zh-TW': '刪除預算（軟刪除）'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__budgets'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.update
      .collection('wallet__budgets')
      .id(id)
      .data({ is_active: false })
      .execute()
  )

const getAvailableYearMonths = forgeController
  .query()
  .description({
    en: 'Get available year/months for budget viewing',
    ms: 'Dapatkan tahun/bulan yang tersedia untuk paparan bajet',
    'zh-CN': '获取可用的年/月以查看预算',
    'zh-TW': '獲取可用的年/月以查看預算'
  })
  .input({})
  .callback(async ({ pb }) => {
    const earliestBudget = await pb.getFirstListItem
      .collection('wallet__budgets')
      .filter([
        {
          field: 'is_active',
          operator: '=',
          value: true
        }
      ])
      .fields({
        created: true
      })
      .sort(['created'])
      .execute()
      .catch(() => null)

    const now = moment()

    const nextMonth = now.clone().add(1, 'month')

    if (!earliestBudget) {
      return {
        years: [now.year()],
        monthsByYear: {
          [now.year()]: [now.month(), nextMonth.month()].filter(
            (m, i, arr) => arr.indexOf(m) === i
          )
        }
      }
    }

    const startDate = moment(earliestBudget.created).startOf('month')

    const endDate = nextMonth.clone().endOf('month')

    const years: number[] = []

    const monthsByYear: Record<number, number[]> = {}

    const current = startDate.clone()

    while (current.isSameOrBefore(endDate)) {
      const year = current.year()

      const month = current.month()

      if (!years.includes(year)) {
        years.push(year)
        monthsByYear[year] = []
      }

      if (!monthsByYear[year].includes(month)) {
        monthsByYear[year].push(month)
      }

      current.add(1, 'month')
    }

    return { years, monthsByYear }
  })

export default forgeRouter({
  list,
  create,
  update,
  remove,
  getAvailableYearMonths
})
