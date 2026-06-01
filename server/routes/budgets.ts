import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import z from 'zod'

import forge from '../forge'
import walletSchemas from '../schema'

dayjs.extend(isSameOrBefore)

const ModifyBudgetSchema = z.object({
  amount: z.number().min(0),
  rollover_enabled: z.boolean().optional().default(false),
  rollover_cap: z.number().min(0).optional().default(100),
  alert_threshold: z.number().min(0).max(200).optional().default(80)
})

export const list = forge
  .query({
    description: 'Get all budgets for a specific month with spent amounts',
    input: {
      query: z.object({
        year: z.string(),
        month: z.string()
      })
    },
    output: {
      OK: z.array(
        walletSchemas.budgets_aggregated.extend({
          rollover_amount: z.number(),
          spent_amount: z.number(),
          expand: z
            .object({ category: walletSchemas.categories.optional() })
            .optional()
        })
      )
    }
  })
  .callback(async ({ pb, query: { year, month }, response }) =>
    response.ok(
      await pb.getFullList
        .collection('budgets_aggregated')
        .filter([
          { field: 'year', operator: '=', value: parseInt(year) },
          { field: 'month', operator: '=', value: parseInt(month) }
        ])
        .expand({ category: 'categories' })
        .execute()
    )
  )

export const create = forge
  .mutation({
    description: 'Create a new budget',
    input: {
      query: z.object({
        category: z.string(),
        year: z.string(),
        month: z.string()
      }),
      body: ModifyBudgetSchema
    },
    existenceCheck: {
      query: {
        category: 'categories'
      }
    },
    output: {
      CREATED: walletSchemas.budgets_aggregated.omit({
        spent_amount: true,
        rollover_amount: true
      }),
      CONFLICT: true,
      NOT_FOUND: true
    }
  })
  .callback(
    async ({ pb, body, query: { category, year, month }, response }) => {
      const parsedYear = parseInt(year)

      const parsedMonth = parseInt(month)

      const existingBudget = await pb.getFirstListItem
        .collection('budgets')
        .filter([
          { field: 'category', operator: '=', value: category },
          { field: 'year', operator: '=', value: parsedYear },
          { field: 'month', operator: '=', value: parsedMonth },
          { field: 'is_active', operator: '=', value: true }
        ])
        .execute()
        .catch(() => null)

      if (existingBudget) {
        return response.conflict()
      }

      return response.created(
        await pb.create
          .collection('budgets')
          .data({
            category,
            amount: body.amount,
            year: parsedYear,
            month: parsedMonth,
            rollover_enabled: body.rollover_enabled,
            rollover_cap: body.rollover_cap,
            alert_thresholds: [body.alert_threshold],
            is_active: true
          })
          .execute()
      )
    }
  )

export const update = forge
  .mutation({
    description: 'Update budget settings',
    input: {
      query: z.object({ id: z.string() }),
      body: ModifyBudgetSchema
    },
    existenceCheck: {
      query: { id: 'budgets' }
    },
    output: {
      OK: walletSchemas.budgets_aggregated.omit({
        spent_amount: true,
        rollover_amount: true
      }),
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, body, response }) =>
    response.ok(
      await pb.update.collection('budgets').id(id).data(body).execute()
    )
  )

export const remove = forge
  .mutation({
    description: 'Delete a budget (soft delete)',
    input: {
      query: z.object({ id: z.string() })
    },
    existenceCheck: {
      query: { id: 'budgets' }
    },
    output: {
      NO_CONTENT: true,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, response }) => {
    await pb.update
      .collection('budgets')
      .id(id)
      .data({ is_active: false })
      .execute()

    return response.noContent()
  })

export const getAvailableYearMonths = forge
  .query({
    description: 'Get available year/months for budget viewing',
    output: {
      OK: z.object({
        years: z.array(z.number()),
        monthsByYear: z.record(z.string(), z.array(z.number()))
      })
    }
  })
  .callback(async ({ pb, response }) => {
    const earliestBudget = await pb.getFirstListItem
      .collection('budgets')
      .filter([{ field: 'is_active', operator: '=', value: true }])
      .fields({ created: true })
      .sort(['created'])
      .execute()
      .catch(() => null)

    const now = dayjs()

    const nextMonth = now.clone().add(1, 'month')

    if (!earliestBudget) {
      return response.ok({
        years: [now.year()],
        monthsByYear: {
          [now.year()]: [now.month(), nextMonth.month()].filter(
            (m, i, arr) => arr.indexOf(m) === i
          )
        }
      })
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

    return response.ok({ years, monthsByYear })
  })
