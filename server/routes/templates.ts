import { LocationSchema, type SchemaWithPB } from '@lifeforge/server-utils'
import z from 'zod'

import forge from '../forge'
import walletSchemas from '../schema'

export const list = forge
  .query()
  .description('Get all transaction templates')
  .input({})
  .callback(async ({ pb }) =>
    (
      await pb.getFullList
        .collection('transaction_templates')
        .sort(['type', 'name'])
        .execute()
    ).reduce(
      (acc, template) => {
        const type = template.type as 'income' | 'expenses'

        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(template)

        return acc
      },
      {
        income: [],
        expenses: []
      } as Record<
        'income' | 'expenses',
        SchemaWithPB<z.infer<typeof walletSchemas.transaction_templates>>[]
      >
    )
  )

export const create = forge
  .mutation()
  .description('Create a new transaction template')
  .input({
    body: walletSchemas.transaction_templates
      .omit({
        location_coords: true,
        location_name: true
      })
      .extend({
        location: LocationSchema.optional()
      })
  })
  .existenceCheck('body', {
    asset: 'assets',
    category: 'categories',
    ledgers: '[ledgers]'
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create
      .collection('transaction_templates')
      .data({
        ...body,
        location_coords: {
          lon: body.location?.location.longitude || 0,
          lat: body.location?.location.latitude || 0
        },
        location_name: body.location?.name || ''
      })
      .execute()
  )

export const update = forge
  .mutation()
  .description('Update transaction template')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: walletSchemas.transaction_templates
      .omit({
        location_coords: true,
        location_name: true
      })
      .extend({
        location: LocationSchema.optional()
      })
  })
  .existenceCheck('query', {
    id: 'transaction_templates'
  })
  .existenceCheck('body', {
    asset: 'assets',
    category: 'categories',
    ledgers: '[ledgers]'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update
      .collection('transaction_templates')
      .id(id)
      .data({
        ...body,
        location_coords: {
          lon: body.location?.location.longitude || 0,
          lat: body.location?.location.latitude || 0
        },
        location_name: body.location?.name || ''
      })
      .execute()
  )

export const remove = forge
  .mutation()
  .description('Delete a transaction template')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'transaction_templates'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('transaction_templates').id(id).execute()
  )
