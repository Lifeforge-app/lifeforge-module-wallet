import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import z from 'zod'

import forge from '../forge'

dayjs.extend(isSameOrBefore)

export const list = forge
  .query()
  .description('Get all budgets for a specific month with spent amounts')
  .input({
    query: z.object({
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val))
    })
  })
  .callback(async ({ pb, query: { year, month } }) =>
    pb.getFullList
      .collection('budgets_aggregated')
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
        category: 'categories'
      })
      .execute()
  )

const ModifyBudgetSchema = z.object({
  amount: z.number().min(0),
  rollover_enabled: z.boolean().optional().default(false),
  rollover_cap: z.number().min(0).optional().default(100),
  alert_threshold: z.number().min(0).max(200).optional().default(80)
})

export const create = forge
  .mutation()
  .description('Create a new budget')
  .input({
    query: z.object({
      category: z.string(),
      year: z.string().transform(val => parseInt(val)),
      month: z.string().transform(val => parseInt(val))
    }),
    body: ModifyBudgetSchema
  })
  .existenceCheck('query', {
    category: 'categories'
  })
  .statusCode(201)
  .callback(async ({ pb, body, query: { category, year, month } }) => {
    // Check if budget already exists for this category in the same year/month
    const existingBudget = await pb.getFirstListItem
      .collection('budgets')
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
      .collection('budgets')
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

export const update = forge
  .mutation()
  .description('Update budget settings')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: ModifyBudgetSchema
  })
  .existenceCheck('query', {
    id: 'budgets'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('budgets').id(id).data(body).execute()
  )

export const remove = forge
  .mutation()
  .description('Delete a budget (soft delete)')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'budgets'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.update.collection('budgets').id(id).data({ is_active: false }).execute()
  )

export const getAvailableYearMonths = forge
  .query()
  .description('Get available year/months for budget viewing')
  .input({})
  .callback(async ({ pb }) => {
    const earliestBudget = await pb.getFirstListItem
      .collection('budgets')
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

    const now = dayjs()

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

    const startDate = dayjs(earliestBudget.created).startOf('month')

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
