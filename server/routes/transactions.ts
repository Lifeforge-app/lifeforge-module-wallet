import parseOCR from '@functions/external/ocr'
import { forgeController, forgeRouter } from '@functions/routes'
import convertPDFToImage from '@functions/utils/convertPDFToImage'
import { Location } from '@lib/locations/typescript/location.types'
import { SCHEMAS } from '@schema'
import fs from 'fs'
import z from 'zod'

import { getTransactionDetails } from '../utils/transactions'

const list = forgeController
  .query()
  .description({
    en: 'Get all wallet transactions',
    ms: 'Dapatkan semua transaksi dompet',
    'zh-CN': '获取所有钱包交易',
    'zh-TW': '獲取所有錢包交易'
  })
  .input({
    query: z.object({
      q: z.string().optional(),
      type: z.enum(['income', 'expenses', 'transfer']).optional()
    })
  })
  .callback(async ({ pb, query: { q, type } }) => {
    const incomeExpensesTransactions = await pb.getFullList
      .collection('wallet__transactions_income_expenses')
      .expand({
        base_transaction: 'wallet__transactions'
      })
      .filter([
        q
          ? {
              field: 'particulars',
              operator: '~',
              value: q
            }
          : null
      ])
      .execute()

    const transferTransactions = await pb.getFullList
      .collection('wallet__transactions_transfer')
      .expand({
        base_transaction: 'wallet__transactions'
      })
      .execute()

    const allTransactions = []

    for (const transaction of incomeExpensesTransactions) {
      const baseTransaction = transaction.expand!.base_transaction!

      allTransactions.push({
        ...baseTransaction,
        type: transaction.type,
        particulars: transaction.particulars,
        asset: transaction.asset,
        category: transaction.category,
        ledgers: transaction.ledgers,
        location_name: transaction.location_name,
        location_coords: transaction.location_coords
      })
    }

    for (const transaction of transferTransactions) {
      const baseTransaction = transaction.expand!.base_transaction!

      allTransactions.push({
        ...baseTransaction,
        type: 'transfer' as const,
        from: transaction.from,
        to: transaction.to
      })
    }

    return allTransactions
      .filter(transaction => !type || transaction.type === type)
      .sort((a, b) => {
        if (new Date(a.date).getTime() === new Date(b.date).getTime()) {
          return new Date(b.created).getTime() - new Date(a.created).getTime()
        }

        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
  })

const getById = forgeController
  .query()
  .description({
    en: 'Get wallet transaction by ID',
    ms: 'Dapatkan transaksi dompet mengikut ID',
    'zh-CN': '通过ID获取钱包交易',
    'zh-TW': '通過ID獲取錢包交易'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__transactions'
  })
  .callback(async ({ pb, query: { id } }) => {
    const baseTransaction = await pb.getOne
      .collection('wallet__transactions')
      .id(id)
      .execute()

    if (baseTransaction.type === 'transfer') {
      const transferTransaction = await pb.getFirstListItem
        .collection('wallet__transactions_transfer')
        .filter([
          {
            field: 'base_transaction',
            operator: '=',
            value: id
          }
        ])
        .execute()

      return {
        ...baseTransaction,
        type: 'transfer' as const,
        from: transferTransaction.from,
        to: transferTransaction.to
      }
    } else {
      const incomeExpensesTransaction = await pb.getFirstListItem
        .collection('wallet__transactions_income_expenses')
        .filter([
          {
            field: 'base_transaction',
            operator: '=',
            value: id
          }
        ])
        .execute()

      return {
        ...baseTransaction,
        type: incomeExpensesTransaction.type,
        particulars: incomeExpensesTransaction.particulars,
        asset: incomeExpensesTransaction.asset,
        category: incomeExpensesTransaction.category,
        ledgers: incomeExpensesTransaction.ledgers,
        location_name: incomeExpensesTransaction.location_name,
        location_coords: incomeExpensesTransaction.location_coords
      }
    }
  })

const CreateTransactionInputSchema = SCHEMAS.wallet.transactions.schema
  .omit({
    type: true,
    receipt: true,
    created: true,
    updated: true
  })
  .and(
    z.union([
      SCHEMAS.wallet.transactions_income_expenses.schema
        .omit({
          base_transaction: true,
          location_name: true,
          location_coords: true
        })
        .extend({
          location: Location.optional().nullable()
        }),
      SCHEMAS.wallet.transactions_transfer.schema
        .omit({
          base_transaction: true
        })
        .extend({
          type: z.literal('transfer')
        })
    ])
  )

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new transaction with receipt',
    ms: 'Cipta transaksi baharu dengan resit',
    'zh-CN': '创建新交易并上传收据',
    'zh-TW': '創建新交易並上傳收據'
  })
  .input({
    body: CreateTransactionInputSchema
  })
  .media({
    receipt: {
      optional: true
    }
  })
  .existenceCheck('body', {
    category: '[wallet__categories]',
    asset: '[wallet__assets]',
    ledger: '[wallet__ledgers]',
    fromAsset: '[wallet__assets]',
    toAsset: '[wallet__assets]'
  })
  .statusCode(201)
  .callback(async ({ pb, body, media: { receipt: rawReceipt } }) => {
    const data = body as z.infer<typeof CreateTransactionInputSchema>

    const receipt =
      rawReceipt && typeof rawReceipt !== 'string'
        ? rawReceipt.originalname.endsWith('.pdf')
          ? await convertPDFToImage(rawReceipt.path)
          : new File([fs.readFileSync(rawReceipt.path)], 'receipt.jpg', {
              type: rawReceipt.mimetype
            })
        : undefined

    const baseTransaction = await pb.create
      .collection('wallet__transactions')
      .data({
        type: data.type === 'transfer' ? 'transfer' : 'income_expenses',
        amount: data.amount,
        date: data.date,
        receipt
      })
      .execute()

    if (data.type === 'transfer') {
      await pb.create
        .collection('wallet__transactions_transfer')
        .data({
          from: data.from,
          to: data.to,
          base_transaction: baseTransaction.id
        })
        .execute()
    } else {
      await pb.create
        .collection('wallet__transactions_income_expenses')
        .data({
          base_transaction: baseTransaction.id,
          type: data.type,
          particulars: data.particulars,
          asset: data.asset,
          category: data.category,
          ledgers: data.ledgers,
          location_name: data.location?.name ?? '',
          location_coords: {
            lon: data.location?.location.longitude ?? 0,
            lat: data.location?.location.latitude ?? 0
          }
        })
        .execute()
    }
  })

const update = forgeController
  .mutation()
  .description({
    en: 'Update transaction details',
    ms: 'Kemas kini butiran transaksi',
    'zh-CN': '更新交易详情',
    'zh-TW': '更新交易詳情'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: CreateTransactionInputSchema
  })
  .media({
    receipt: {
      optional: true
    }
  })
  .existenceCheck('query', {
    id: 'wallet__transactions'
  })
  .existenceCheck('body', {
    category: '[wallet__categories]',
    asset: '[wallet__assets]',
    from: '[wallet__assets]',
    to: '[wallet__assets]',
    ledger: '[wallet__ledgers]'
  })
  .callback(
    async ({ pb, query: { id }, body, media: { receipt: rawReceipt } }) => {
      const data = body as z.infer<typeof CreateTransactionInputSchema>

      const receipt =
        rawReceipt && typeof rawReceipt !== 'string'
          ? rawReceipt.originalname.endsWith('.pdf')
            ? await convertPDFToImage(rawReceipt.path)
            : new File([fs.readFileSync(rawReceipt.path)], 'receipt.jpg', {
                type: rawReceipt.mimetype
              })
          : undefined

      const baseTransaction = await pb.update
        .collection('wallet__transactions')
        .id(id)
        .data({
          type: data.type === 'transfer' ? 'transfer' : 'income_expenses',
          amount: data.amount,
          date: data.date,
          ...(rawReceipt !== 'keep' && {
            receipt: rawReceipt === 'removed' ? null : receipt
          })
        })
        .execute()

      if (data.type === 'transfer') {
        const target = await pb.getFirstListItem
          .collection('wallet__transactions_transfer')
          .filter([
            {
              field: 'base_transaction',
              operator: '=',
              value: id
            }
          ])
          .execute()

        await pb.update
          .collection('wallet__transactions_transfer')
          .id(target.id)
          .data({
            from: data.from,
            to: data.to,
            base_transaction: baseTransaction.id
          })
          .execute()
      } else {
        const target = await pb.getFirstListItem
          .collection('wallet__transactions_income_expenses')
          .filter([
            {
              field: 'base_transaction',
              operator: '=',
              value: id
            }
          ])
          .execute()

        await pb.update
          .collection('wallet__transactions_income_expenses')
          .id(target.id)
          .data({
            type: data.type,
            particulars: data.particulars,
            asset: data.asset,
            category: data.category,
            ledgers: data.ledgers,
            location_name: data.location?.name ?? '',
            location_coords: {
              lon: data.location?.location.longitude ?? 0,
              lat: data.location?.location.latitude ?? 0
            }
          })
          .execute()
      }
    }
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a transaction',
    ms: 'Padam transaksi',
    'zh-CN': '删除交易',
    'zh-TW': '刪除交易'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'wallet__transactions'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('wallet__transactions').id(id).execute()
  )

const scanReceipt = forgeController
  .mutation()
  .description({
    en: 'Extract transaction data from receipt using OCR',
    ms: 'Ekstrak data transaksi dari resit menggunakan OCR',
    'zh-CN': '使用 OCR 从收据中提取交易数据',
    'zh-TW': '使用 OCR 從收據中提取交易數據'
  })
  .input({})
  .media({
    file: {
      optional: false
    }
  })
  .callback(async ({ pb, media: { file } }) => {
    if (!file || typeof file === 'string') {
      throw new Error('No file uploaded')
    }

    if (file.originalname.endsWith('.pdf')) {
      const image = await convertPDFToImage(file.path)

      if (!image) {
        throw new Error('Failed to convert PDF to image')
      }

      const buffer = await image.arrayBuffer()

      fs.writeFileSync('medium/receipt.png', Buffer.from(buffer))
    } else {
      fs.renameSync(file.path, 'medium/receipt.png')
    }

    if (!fs.existsSync('medium/receipt.png')) {
      throw new Error('Receipt image not found')
    }

    const OCRResult = await parseOCR('medium/receipt.png')

    if (!OCRResult) {
      throw new Error('OCR parsing failed')
    }

    fs.unlinkSync('medium/receipt.png')

    return await getTransactionDetails(OCRResult, pb)
  })

export default forgeRouter({
  list,
  getById,
  create,
  update,
  remove,
  scanReceipt
})
