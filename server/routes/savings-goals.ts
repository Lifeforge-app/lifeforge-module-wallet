import z from 'zod'

import forge from '../forge'
import walletSchemas from '../schema'

const GoalSchema = walletSchemas.savings_goals

const ModifyGoalSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional().default('tabler:target'),
  color: z.string().optional().default('#22c55e'),
  target_amount: z.number().min(0),
  target_date: z.string().optional(),
  asset: z.string().optional()
})

export const list = forge
  .query({
    description: 'Get all active saving goals',
    output: {
      OK: z.array(GoalSchema)
    }
  })
  .callback(async ({ pb, response }) =>
    response.ok(
      await pb.getFullList
        .collection('savings_goals')
        .filter([
          {
            field: 'is_active',
            operator: '=',
            value: true
          }
        ])
        .expand({
          asset: 'assets'
        })
        .execute()
    )
  )

export const getById = forge
  .query({
    description: 'Get saving goal by ID',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: {
        id: 'savings_goals'
      }
    },
    output: {
      OK: GoalSchema,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, response }) =>
    response.ok(
      await pb.getOne
        .collection('savings_goals')
        .id(id)
        .expand({
          asset: 'assets'
        })
        .execute()
    )
  )

export const create = forge
  .mutation({
    description: 'Create a new saving goal',
    input: {
      body: ModifyGoalSchema
    },
    output: {
      CREATED: GoalSchema
    }
  })
  .callback(async ({ pb, body, response }) =>
    response.created(
      await pb.create
        .collection('savings_goals')
        .data({
          ...body,
          current_amount: 0,
          is_active: true
        })
        .execute()
    )
  )

export const update = forge
  .mutation({
    description: 'Update a saving goal',
    input: {
      query: z.object({
        id: z.string()
      }),
      body: ModifyGoalSchema.partial()
    },
    existenceCheck: {
      query: {
        id: 'savings_goals'
      }
    },
    output: {
      OK: GoalSchema,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, body, response }) =>
    response.ok(
      await pb.update.collection('savings_goals').id(id).data(body).execute()
    )
  )

export const contribute = forge
  .mutation({
    description: 'Add or withdraw from a saving goal',
    input: {
      query: z.object({
        id: z.string()
      }),
      body: z.object({
        amount: z.number()
      })
    },
    existenceCheck: {
      query: {
        id: 'savings_goals'
      }
    },
    output: {
      OK: GoalSchema,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, body: { amount }, response }) => {
    const goal = await pb.getOne.collection('savings_goals').id(id).execute()

    const newAmount = Math.max(0, (goal.current_amount || 0) + amount)

    return response.ok(
      await pb.update
        .collection('savings_goals')
        .id(id)
        .data({ current_amount: newAmount })
        .execute()
    )
  })

export const remove = forge
  .mutation({
    description: 'Delete a saving goal',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: {
        id: 'savings_goals'
      }
    },
    output: {
      NO_CONTENT: true,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, response }) => {
    await pb.update
      .collection('savings_goals')
      .id(id)
      .data({ is_active: false })
      .execute()

    return response.noContent()
  })
