import { LocationSchema } from '@lifeforge/server-utils'
import dayjs from 'dayjs'
import fs from 'fs'
import z from 'zod'

import forge from '../forge'
import walletSchemas from '../schema'
import { getTransactionDetails } from '../utils/transactions'

export const list = forge
  .query()
  .description('Get all wallet transactions')
  .input({
    query: z.object({
      q: z.string().optional(),
      type: z.enum(['income', 'expenses', 'transfer']).optional(),
      year: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val) : undefined)),
      month: z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val) : undefined))
    })
  })
  .callback(async ({ pb, query: { q, type, year, month } }) => {
    // Build date filter if year/month provided
    const dateFilters =
      year !== undefined && month !== undefined
        ? ([
            {
              field: 'base_transaction.date' as const,
              operator: '>=' as const,
              value: dayjs()
                .year(year)
                .month(month - 1)
                .startOf('month')
                .format('YYYY-MM-DD')
            },
            {
              field: 'base_transaction.date' as const,
              operator: '<=' as const,
              value: dayjs()
                .year(year)
                .month(month - 1)
                .endOf('month')
                .format('YYYY-MM-DD')
            }
          ] as const)
        : []

    const incomeExpensesTransactions = await pb.getFullList
      .collection('transactions_income_expenses')
      .expand({
        base_transaction: 'transactions'
      })
      .filter([
        q
          ? {
              field: 'particulars' as const,
              operator: '~' as const,
              value: q
            }
          : null,
        ...dateFilters
      ])
      .execute()

    const transferTransactions = await pb.getFullList
      .collection('transactions_transfer')
      .expand({
        base_transaction: 'transactions'
      })
      .filter([...dateFilters])
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

export const getById = forge
  .query()
  .description('Get wallet transaction by ID')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'transactions'
  })
  .callback(async ({ pb, query: { id } }) => {
    const baseTransaction = await pb.getOne
      .collection('transactions')
      .id(id)
      .execute()

    if (baseTransaction.type === 'transfer') {
      const transferTransaction = await pb.getFirstListItem
        .collection('transactions_transfer')
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
        .collection('transactions_income_expenses')
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

const CreateTransactionInputSchema = walletSchemas.transactions
  .omit({
    type: true,
    receipt: true,
    created: true,
    updated: true
  })
  .and(
    z.union([
      walletSchemas.transactions_income_expenses
        .omit({
          base_transaction: true,
          location_name: true,
          location_coords: true
        })
        .extend({
          location: LocationSchema.optional().nullable()
        }),
      walletSchemas.transactions_transfer
        .omit({
          base_transaction: true
        })
        .extend({
          type: z.literal('transfer')
        })
    ])
  )

export const create = forge
  .mutation()
  .description('Create a new transaction with receipt')
  .input({
    body: CreateTransactionInputSchema
  })
  .media({
    receipt: {
      optional: true
    }
  })
  .existenceCheck('body', {
    category: '[categories]',
    asset: '[assets]',
    ledger: '[ledgers]',
    fromAsset: '[assets]',
    toAsset: '[assets]'
  })
  .statusCode(201)
  .callback(
    async ({
      pb,
      body,
      media: { receipt: rawReceipt },
      core: {
        media: { convertPDFToImage }
      }
    }) => {
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
        .collection('transactions')
        .data({
          type: data.type === 'transfer' ? 'transfer' : 'income_expenses',
          amount: data.amount,
          date: data.date,
          receipt
        })
        .execute()

      if (data.type === 'transfer') {
        await pb.create
          .collection('transactions_transfer')
          .data({
            from: data.from,
            to: data.to,
            base_transaction: baseTransaction.id
          })
          .execute()
      } else {
        await pb.create
          .collection('transactions_income_expenses')
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
    }
  )

export const update = forge
  .mutation()
  .description('Update transaction details')
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
    id: 'transactions'
  })
  .existenceCheck('body', {
    category: '[categories]',
    asset: '[assets]',
    from: '[assets]',
    to: '[assets]',
    ledger: '[ledgers]'
  })
  .callback(
    async ({
      pb,
      query: { id },
      body,
      media: { receipt: rawReceipt },
      core: {
        media: { convertPDFToImage }
      }
    }) => {
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
        .collection('transactions')
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
          .collection('transactions_transfer')
          .filter([
            {
              field: 'base_transaction',
              operator: '=',
              value: id
            }
          ])
          .execute()

        await pb.update
          .collection('transactions_transfer')
          .id(target.id)
          .data({
            from: data.from,
            to: data.to,
            base_transaction: baseTransaction.id
          })
          .execute()
      } else {
        const target = await pb.getFirstListItem
          .collection('transactions_income_expenses')
          .filter([
            {
              field: 'base_transaction',
              operator: '=',
              value: id
            }
          ])
          .execute()

        await pb.update
          .collection('transactions_income_expenses')
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

export const remove = forge
  .mutation()
  .description('Delete a transaction')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'transactions'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('transactions').id(id).execute()
  )

export const scanReceipt = forge
  .mutation()
  .description('Extract transaction data from receipt using OCR')
  .input({})
  .media({
    file: {
      optional: false
    }
  })
  .callback(
    async ({
      pb,
      media: { file },
      core: {
        media: { convertPDFToImage, parseOCR },
        api: { fetchAI, getAPIKey, searchLocations }
      }
    }) => {
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

      return await getTransactionDetails(
        OCRResult,
        pb,
        fetchAI,
        getAPIKey,
        searchLocations
      )
    }
  )
