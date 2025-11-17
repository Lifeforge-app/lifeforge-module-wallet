import { SchemaWithPB } from '@functions/database/PBService/typescript/pb_service'
import { forgeController, forgeRouter } from '@functions/routes'
import { Location } from '@lib/locations/typescript/location.types'
import COLLECTION_SCHEMAS from '@schema'
import z from 'zod'

const list = forgeController
  .query()
  .description({
    en: 'Get all transaction templates',
    ms: 'Dapatkan semua templat transaksi',
    'zh-CN': '获取所有交易模板',
    'zh-TW': '獲取所有交易模板'
  })
  .input({})
  .callback(async ({ pb }) =>
    (
      await pb.getFullList
        .collection('wallet__transaction_templates')
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
        SchemaWithPB<
          z.infer<typeof COLLECTION_SCHEMAS.wallet__transaction_templates>
        >[]
      >
    )
  )

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new transaction template',
    ms: 'Cipta templat transaksi baharu',
    'zh-CN': '创建新交易模板',
    'zh-TW': '創建新交易模板'
  })
  .input({
    body: COLLECTION_SCHEMAS.wallet__transaction_templates
      .omit({
        location_coords: true,
        location_name: true
      })
      .extend({
        location: Location.optional()
      })
  })
  .existenceCheck('body', {
    asset: 'wallet__assets',
    category: 'wallet__categories',
    ledgers: '[wallet__ledgers]'
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create
      .collection('wallet__transaction_templates')
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

const update = forgeController
  .mutation()
  .description({
    en: 'Update transaction template',
    ms: 'Kemas kini templat transaksi',
    'zh-CN': '更新交易模板',
    'zh-TW': '更新交易模板'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: COLLECTION_SCHEMAS.wallet__transaction_templates
      .omit({
        location_coords: true,
        location_name: true
      })
      .extend({
        location: Location.optional()
      })
  })
  .existenceCheck('query', {
    id: 'wallet__transaction_templates'
  })
  .existenceCheck('body', {
    asset: 'wallet__assets',
    category: 'wallet__categories',
    ledgers: '[wallet__ledgers]'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update
      .collection('wallet__transaction_templates')
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

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a transaction template',
    ms: 'Padam templat transaksi',
    'zh-CN': '删除交易模板',
    'zh-TW': '刪除交易模板'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__transaction_templates'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('wallet__transaction_templates').id(id).execute()
  )

export default forgeRouter({
  list,
  create,
  update,
  remove
})
