import { and, eq, gte, ilike, lte } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import dayjs from 'dayjs'
import fs from 'fs'
import z from 'zod'

import { LocationSchema } from '@lifeforge/server-utils'

import forge from '../forge'
import {
  walletTransactions,
  walletTransactionsIncomeExpenses,
  walletTransactionsTransfer
} from '../schema.drizzle'
import { getTransactionDetails } from '../utils/transactions'

const transactionDto = createSelectSchema(walletTransactions).extend({
  type: z.enum(['transfer', 'income_expenses'])
})

const locationCoordsDto = z.object({
  lon: z.number(),
  lat: z.number()
})

const incomeExpensesFields = {
  particulars: z.string(),
  asset: z.string().nullable(),
  category: z.string().nullable(),
  ledgers: z.array(z.string()),
  location_name: z.string(),
  location_coords: locationCoordsDto.nullable()
}

const EnrichedTransactionOutput = z.discriminatedUnion('type', [
  transactionDto.extend({
    type: z.literal('transfer'),
    from: z.string().nullable(),
    to: z.string().nullable()
  }),
  transactionDto.merge(z.object(incomeExpensesFields)).extend({
    type: z.literal('income')
  }),
  transactionDto.merge(z.object(incomeExpensesFields)).extend({
    type: z.literal('expenses')
  })
])

const MutateTransactionInputSchema = z.union([
  z.object({
    type: z.enum(['income', 'expenses']),
    amount: z.number(),
    date: z.string().optional(),
    particulars: z.string().optional(),
    asset: z.string().optional(),
    category: z.string().optional(),
    ledgers: z.array(z.string()).optional(),
    location: LocationSchema.optional().nullable()
  }),
  z.object({
    type: z.literal('transfer'),
    amount: z.number(),
    date: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional()
  })
])

function mapIncomeExpenses(data: z.infer<typeof MutateTransactionInputSchema>) {
  if (data.type === 'transfer') {
    return null
  }

  return {
    particulars: data.particulars ?? '',
    asset: data.asset || null,
    category: data.category || null,
    ledgers: data.ledgers ?? [],
    location_name: data.location?.name ?? '',
    location_coords: {
      lon: data.location?.location.longitude ?? 0,
      lat: data.location?.location.latitude ?? 0
    }
  }
}

export const list = forge
  .query({
    description: 'Get all wallet transactions',
    input: {
      query: z.object({
        q: z.string().optional(),
        type: z.enum(['income', 'expenses', 'transfer']).optional(),
        year: z.string().optional(),
        month: z.string().optional()
      })
    },
    output: {
      OK: z.array(EnrichedTransactionOutput)
    }
  })
  .callback(async ({ db, query: { q, type, year, month }, response }) => {
    const parsedYear = year ? parseInt(year) : undefined

    const parsedMonth = month ? parseInt(month) : undefined

    const dateConditions = []

    if (parsedYear !== undefined && parsedMonth !== undefined) {
      dateConditions.push(
        gte(
          walletTransactions.date,
          dayjs()
            .year(parsedYear)
            .month(parsedMonth - 1)
            .startOf('month')
            .toDate()
        ),
        lte(
          walletTransactions.date,
          dayjs()
            .year(parsedYear)
            .month(parsedMonth - 1)
            .endOf('month')
            .toDate()
        )
      )
    }

    const incomeExpenses = await db
      .select({
        base: walletTransactions,
        sub: walletTransactionsIncomeExpenses
      })
      .from(walletTransactionsIncomeExpenses)
      .innerJoin(
        walletTransactions,
        eq(
          walletTransactionsIncomeExpenses.base_transaction,
          walletTransactions.id
        )
      )
      .where(
        and(
          ...(q
            ? [ilike(walletTransactionsIncomeExpenses.particulars, `%${q}%`)]
            : []),
          ...dateConditions
        )
      )

    const transfers = await db
      .select({
        base: walletTransactions,
        sub: walletTransactionsTransfer
      })
      .from(walletTransactionsTransfer)
      .innerJoin(
        walletTransactions,
        eq(walletTransactionsTransfer.base_transaction, walletTransactions.id)
      )
      .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)

    const allTransactions: z.infer<typeof EnrichedTransactionOutput>[] = []

    for (const { base, sub } of incomeExpenses) {
      allTransactions.push({
        ...base,
        type: sub.type as 'income' | 'expenses',
        particulars: sub.particulars,
        asset: sub.asset,
        category: sub.category,
        ledgers: sub.ledgers,
        location_name: sub.location_name,
        location_coords: sub.location_coords
      })
    }

    for (const { base, sub } of transfers) {
      allTransactions.push({
        ...base,
        type: 'transfer',
        from: sub.from,
        to: sub.to
      })
    }

    return response.ok(
      allTransactions
        .filter(transaction => !type || transaction.type === type)
        .sort((a, b) => {
          const aDate = a.date.getTime()

          const bDate = b.date.getTime()

          if (aDate === bDate) {
            return b.created.getTime() - a.created.getTime()
          }

          return bDate - aDate
        })
    )
  })

export const getById = forge
  .query({
    description: 'Get wallet transaction by ID',
    input: {
      query: z.object({ id: forge.existsIn(z.string(), walletTransactions) })
    },
    output: {
      OK: EnrichedTransactionOutput
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    const baseTransaction = (await db.query.transactions.findFirst({
      where: { id }
    }))!

    if (baseTransaction.type === 'transfer') {
      const sub = await db.query.transactions_transfer.findFirst({
        where: { base_transaction: id }
      })

      return response.ok({
        ...baseTransaction,
        type: 'transfer' as const,
        from: sub?.from ?? null,
        to: sub?.to ?? null
      })
    }

    const sub = await db.query.transactions_income_expenses.findFirst({
      where: { base_transaction: id }
    })

    return response.ok({
      ...baseTransaction,
      type: (sub?.type ?? 'expenses') as 'income' | 'expenses',
      particulars: sub?.particulars ?? '',
      asset: sub?.asset ?? null,
      category: sub?.category ?? null,
      ledgers: sub?.ledgers ?? [],
      location_name: sub?.location_name ?? '',
      location_coords: sub?.location_coords ?? null
    })
  })

export const create = forge
  .mutation({
    description: 'Create a new transaction with receipt',
    input: {
      body: MutateTransactionInputSchema
    },
    media: {
      receipt: {
        optional: true
      }
    },
    output: {
      CREATED: transactionDto
    }
  })
  .callback(
    async ({
      db,
      body,
      media: { receipt: rawReceipt },
      core: {
        media: { convertPDFToImage },
        storage
      },
      response
    }) => {
      let receiptKey = ''

      if (rawReceipt && typeof rawReceipt !== 'string') {
        if (rawReceipt.originalName.endsWith('.pdf')) {
          const image = await convertPDFToImage(rawReceipt.path)

          if (image) {
            const ref = await storage.save({
              file: {
                buffer: Buffer.from(await image.arrayBuffer()),
                originalName: image.name,
                mimeType: image.type
              }
            })

            receiptKey = ref?.key ?? ''
          }
        } else {
          const ref = await storage.save({ file: rawReceipt })

          receiptKey = ref?.key ?? ''
        }
      }

      const [baseTransaction] = await db
        .insert(walletTransactions)
        .values({
          type: body.type === 'transfer' ? 'transfer' : 'income_expenses',
          amount: body.amount,
          date: body.date ? new Date(body.date) : new Date(),
          receipt: receiptKey
        })
        .returning()

      if (body.type === 'transfer') {
        await db.insert(walletTransactionsTransfer).values({
          from: body.from || null,
          to: body.to || null,
          base_transaction: baseTransaction.id
        })
      } else {
        await db.insert(walletTransactionsIncomeExpenses).values({
          base_transaction: baseTransaction.id,
          type: body.type,
          ...mapIncomeExpenses(body)!
        })
      }

      return response.created(baseTransaction)
    }
  )

export const update = forge
  .mutation({
    description: 'Update transaction details',
    input: {
      query: z.object({ id: forge.existsIn(z.string(), walletTransactions) }),
      body: MutateTransactionInputSchema
    },
    media: {
      receipt: {
        optional: true
      }
    },
    output: {
      OK: transactionDto
    }
  })
  .callback(
    async ({
      db,
      query: { id },
      body,
      media: { receipt: rawReceipt },
      core: {
        media: { convertPDFToImage },
        storage
      },
      response
    }) => {
      let receiptUpdate: { receipt?: string } = {}

      if (rawReceipt === 'removed') {
        receiptUpdate = { receipt: '' }
      } else if (rawReceipt && typeof rawReceipt !== 'string') {
        if (rawReceipt.originalName.endsWith('.pdf')) {
          const image = await convertPDFToImage(rawReceipt.path)

          if (image) {
            const ref = await storage.save({
              file: {
                buffer: Buffer.from(await image.arrayBuffer()),
                originalName: image.name,
                mimeType: image.type
              }
            })

            receiptUpdate = { receipt: ref?.key ?? '' }
          }
        } else {
          const ref = await storage.save({ file: rawReceipt })

          receiptUpdate = { receipt: ref?.key ?? '' }
        }
      }

      const [baseTransaction] = await db
        .update(walletTransactions)
        .set({
          type: body.type === 'transfer' ? 'transfer' : 'income_expenses',
          amount: body.amount,
          date: body.date ? new Date(body.date) : new Date(),
          updated: new Date(),
          ...receiptUpdate
        })
        .where(eq(walletTransactions.id, id))
        .returning()

      if (body.type === 'transfer') {
        await db
          .update(walletTransactionsTransfer)
          .set({ from: body.from || null, to: body.to || null })
          .where(eq(walletTransactionsTransfer.base_transaction, id))
      } else {
        await db
          .update(walletTransactionsIncomeExpenses)
          .set({ type: body.type, ...mapIncomeExpenses(body)! })
          .where(eq(walletTransactionsIncomeExpenses.base_transaction, id))
      }

      return response.ok(baseTransaction)
    }
  )

export const remove = forge
  .mutation({
    description: 'Delete a transaction',
    input: {
      query: z.object({ id: forge.existsIn(z.string(), walletTransactions) })
    },
    output: {
      NO_CONTENT: true
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    await db.delete(walletTransactions).where(eq(walletTransactions.id, id))

    return response.noContent()
  })

export const scanReceipt = forge
  .mutation({
    description: 'Extract transaction data from receipt using OCR',
    media: {
      file: {
        optional: false
      }
    },
    output: {
      OK: z.object({
        date: z.string(),
        amount: z.number(),
        type: z.enum(['income', 'expenses']),
        category: z.string().nullable(),
        particulars: z.string(),
        location_coords: z.object({
          lon: z.number(),
          lat: z.number()
        }),
        location_name: z.string()
      })
    }
  })
  .callback(
    async ({
      db,
      media: { file },
      core: {
        media: { convertPDFToImage, parseOCR },
        api: { fetchAI, getAPIKey, searchLocations }
      },
      response
    }) => {
      if (!file || typeof file === 'string') {
        return response.badRequest('No file uploaded')
      }

      if (file.originalName.endsWith('.pdf')) {
        const image = await convertPDFToImage(file.path)

        if (!image) {
          return response.badRequest('Failed to convert PDF to image')
        }

        const buffer = await image.arrayBuffer()

        fs.writeFileSync('medium/receipt.png', Buffer.from(buffer))
      } else {
        fs.renameSync(file.path, 'medium/receipt.png')
      }

      if (!fs.existsSync('medium/receipt.png')) {
        return response.badRequest('Receipt image not found')
      }

      const OCRResult = await parseOCR('medium/receipt.png')

      if (!OCRResult) {
        return response.badRequest('OCR parsing failed')
      }

      fs.unlinkSync('medium/receipt.png')

      return response.ok(
        await getTransactionDetails(
          OCRResult,
          db,
          fetchAI,
          getAPIKey,
          searchLocations
        )
      )
    }
  )

export const createMultiple = forge
  .mutation({
    description: 'Create multiple new transactions',
    input: {
      body: z.object({
        transactions: z.array(MutateTransactionInputSchema)
      })
    },
    output: {
      CREATED: z.null()
    }
  })
  .callback(async ({ db, body: { transactions }, response }) => {
    for (const body of transactions) {
      const [baseTransaction] = await db
        .insert(walletTransactions)
        .values({
          type: body.type === 'transfer' ? 'transfer' : 'income_expenses',
          amount: body.amount,
          date: body.date ? new Date(body.date) : new Date()
        })
        .returning()

      if (body.type === 'transfer') {
        await db.insert(walletTransactionsTransfer).values({
          from: body.from || null,
          to: body.to || null,
          base_transaction: baseTransaction.id
        })
      } else {
        await db.insert(walletTransactionsIncomeExpenses).values({
          base_transaction: baseTransaction.id,
          type: body.type,
          ...mapIncomeExpenses(body)!
        })
      }
    }

    return response.created(null)
  })
