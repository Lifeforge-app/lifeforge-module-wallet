import { forgeController, forgeRouter } from '@functions/routes'
import { SCHEMAS } from '@schema'
import z from 'zod'

const list = forgeController
  .query()
  .description({
    en: 'Get all ledgers',
    ms: 'Dapatkan semua lejar',
    'zh-CN': '获取所有分类账',
    'zh-TW': '獲取所有分類帳'
  })
  .input({})
  .callback(({ pb }) =>
    pb.getFullList
      .collection('wallet__ledgers_aggregated')
      .sort(['name'])
      .execute()
  )

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new ledger',
    ms: 'Cipta lejar baharu',
    'zh-CN': '创建新分类账',
    'zh-TW': '創建新分類帳'
  })
  .input({
    body: SCHEMAS.wallet.ledgers.schema
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('wallet__ledgers').data(body).execute()
  )

const update = forgeController
  .mutation()
  .description({
    en: 'Update ledger details',
    ms: 'Kemas kini butiran lejar',
    'zh-CN': '更新分类账详情',
    'zh-TW': '更新分類帳詳情'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: SCHEMAS.wallet.ledgers.schema
  })
  .existenceCheck('query', {
    id: 'wallet__ledgers'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('wallet__ledgers').id(id).data(body).execute()
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a ledger',
    ms: 'Padam lejar',
    'zh-CN': '删除分类账',
    'zh-TW': '刪除分類帳'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__ledgers'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('wallet__ledgers').id(id).execute()
  )

export default forgeRouter({
  list,
  create,
  update,
  remove
})
