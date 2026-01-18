import z from 'zod'

import forge from '../forge'

export const list = forge
  .query()
  .description('Get all active saving goals')
  .input({})
  .callback(async ({ pb }) =>
    pb.getFullList
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

export const getById = forge
  .query()
  .description('Get saving goal by ID')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'savings_goals'
  })
  .callback(async ({ pb, query: { id } }) =>
    pb.getOne
      .collection('savings_goals')
      .id(id)
      .expand({
        asset: 'assets'
      })
      .execute()
  )

const ModifyGoalSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional().default('tabler:target'),
  color: z.string().optional().default('#22c55e'),
  target_amount: z.number().min(0),
  target_date: z.string().optional(),
  asset: z.string().optional()
})

export const create = forge
  .mutation()
  .description('Create a new saving goal')
  .input({
    body: ModifyGoalSchema
  })
  .statusCode(201)
  .callback(async ({ pb, body }) =>
    pb.create
      .collection('savings_goals')
      .data({
        ...body,
        current_amount: 0,
        is_active: true
      })
      .execute()
  )

export const update = forge
  .mutation()
  .description('Update a saving goal')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: ModifyGoalSchema.partial()
  })
  .existenceCheck('query', {
    id: 'savings_goals'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('savings_goals').id(id).data(body).execute()
  )

export const contribute = forge
  .mutation()
  .description('Add or withdraw from a saving goal')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: z.object({
      amount: z.number()
    })
  })
  .existenceCheck('query', {
    id: 'savings_goals'
  })
  .callback(async ({ pb, query: { id }, body: { amount } }) => {
    const goal = await pb.getOne.collection('savings_goals').id(id).execute()

    const newAmount = Math.max(0, (goal.current_amount || 0) + amount)

    return pb.update
      .collection('savings_goals')
      .id(id)
      .data({ current_amount: newAmount })
      .execute()
  })

export const remove = forge
  .mutation()
  .description('Delete a saving goal')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'savings_goals'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.update
      .collection('savings_goals')
      .id(id)
      .data({ is_active: false })
      .execute()
  )
