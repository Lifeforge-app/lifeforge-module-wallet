import z from 'zod'

import { forgeController, forgeRouter } from '@functions/routes'

const list = forgeController
  .query()
  .description({
    en: 'Get all active saving goals',
    ms: 'Dapatkan semua matlamat simpanan aktif',
    'zh-CN': '获取所有活动储蓄目标',
    'zh-TW': '獲取所有活動儲蓄目標'
  })
  .input({})
  .callback(async ({ pb }) =>
    pb.getFullList
      .collection('wallet__savings_goals')
      .filter([
        {
          field: 'is_active',
          operator: '=',
          value: true
        }
      ])
      .expand({
        asset: 'wallet__assets'
      })
      .execute()
  )

const getById = forgeController
  .query()
  .description({
    en: 'Get saving goal by ID',
    ms: 'Dapatkan matlamat simpanan mengikut ID',
    'zh-CN': '按ID获取储蓄目标',
    'zh-TW': '按ID獲取儲蓄目標'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__savings_goals'
  })
  .callback(async ({ pb, query: { id } }) =>
    pb.getOne
      .collection('wallet__savings_goals')
      .id(id)
      .expand({
        asset: 'wallet__assets'
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

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new saving goal',
    ms: 'Cipta matlamat simpanan baharu',
    'zh-CN': '创建新储蓄目标',
    'zh-TW': '創建新儲蓄目標'
  })
  .input({
    body: ModifyGoalSchema
  })
  .statusCode(201)
  .callback(async ({ pb, body }) =>
    pb.create
      .collection('wallet__savings_goals')
      .data({
        ...body,
        current_amount: 0,
        is_active: true
      })
      .execute()
  )

const update = forgeController
  .mutation()
  .description({
    en: 'Update a saving goal',
    ms: 'Kemaskini matlamat simpanan',
    'zh-CN': '更新储蓄目标',
    'zh-TW': '更新儲蓄目標'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: ModifyGoalSchema.partial()
  })
  .existenceCheck('query', {
    id: 'wallet__savings_goals'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('wallet__savings_goals').id(id).data(body).execute()
  )

const contribute = forgeController
  .mutation()
  .description({
    en: 'Add or withdraw from a saving goal',
    ms: 'Tambah atau keluarkan dari matlamat simpanan',
    'zh-CN': '向储蓄目标存入或取出',
    'zh-TW': '向儲蓄目標存入或取出'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: z.object({
      amount: z.number()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__savings_goals'
  })
  .callback(async ({ pb, query: { id }, body: { amount } }) => {
    const goal = await pb.getOne
      .collection('wallet__savings_goals')
      .id(id)
      .execute()

    const newAmount = Math.max(0, (goal.current_amount || 0) + amount)

    return pb.update
      .collection('wallet__savings_goals')
      .id(id)
      .data({ current_amount: newAmount })
      .execute()
  })

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a saving goal',
    ms: 'Padam matlamat simpanan',
    'zh-CN': '删除储蓄目标',
    'zh-TW': '刪除儲蓄目標'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__savings_goals'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.update
      .collection('wallet__savings_goals')
      .id(id)
      .data({ is_active: false })
      .execute()
  )

export default forgeRouter({
  list,
  getById,
  create,
  update,
  contribute,
  remove
})
