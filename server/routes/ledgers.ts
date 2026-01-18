import z from 'zod'

import forge from '../forge'
import walletSchemas from '../schema'

export const list = forge
  .query()
  .description('Get all ledgers')
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('ledgers_aggregated').sort(['name']).execute()
  )

export const create = forge
  .mutation()
  .description('Create a new ledger')
  .input({
    body: walletSchemas.ledgers
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('ledgers').data(body).execute()
  )

export const update = forge
  .mutation()
  .description('Update ledger details')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: walletSchemas.ledgers
  })
  .existenceCheck('query', {
    id: 'ledgers'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('ledgers').id(id).data(body).execute()
  )

export const remove = forge
  .mutation()
  .description('Delete a ledger')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'ledgers'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('ledgers').id(id).execute()
  )
