import z from 'zod'

import forge from '../forge'
import walletSchemas from '../schema'

export const list = forge
  .query()
  .description('Get all transaction categories')
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('categories_aggregated').sort(['name']).execute()
  )

export const create = forge
  .mutation()
  .description('Create a new transaction category')
  .input({
    body: walletSchemas.categories
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('categories').data(body).execute()
  )

export const update = forge
  .mutation()
  .description('Update category details')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: walletSchemas.categories
  })
  .existenceCheck('query', {
    id: 'categories'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('categories').id(id).data(body).execute()
  )

export const remove = forge
  .mutation()
  .description('Delete a transaction category')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'categories'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('categories').id(id).execute()
  )
