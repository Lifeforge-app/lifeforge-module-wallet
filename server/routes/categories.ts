import { forgeController, forgeRouter } from '@functions/routes'
import { SCHEMAS } from '@schema'
import z from 'zod'

const list = forgeController
  .query()
  .description({
    en: 'Get all transaction categories',
    ms: 'Dapatkan semua kategori transaksi',
    'zh-CN': '获取所有交易类别',
    'zh-TW': '獲取所有交易類別'
  })
  .input({})
  .callback(({ pb }) =>
    pb.getFullList
      .collection('wallet__categories_aggregated')
      .sort(['name'])
      .execute()
  )

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new transaction category',
    ms: 'Cipta kategori transaksi baharu',
    'zh-CN': '创建新交易类别',
    'zh-TW': '創建新交易類別'
  })
  .input({
    body: SCHEMAS.wallet.categories.schema
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('wallet__categories').data(body).execute()
  )

const update = forgeController
  .mutation()
  .description({
    en: 'Update category details',
    ms: 'Kemas kini butiran kategori',
    'zh-CN': '更新类别详情',
    'zh-TW': '更新類別詳情'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: SCHEMAS.wallet.categories.schema
  })
  .existenceCheck('query', {
    id: 'wallet__categories'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('wallet__categories').id(id).data(body).execute()
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a transaction category',
    ms: 'Padam kategori transaksi',
    'zh-CN': '删除交易类别',
    'zh-TW': '刪除交易類別'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__categories'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('wallet__categories').id(id).execute()
  )

export default forgeRouter({
  list,
  create,
  update,
  remove
})
