import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod'

import {
  walletTransactions,
  walletTransactionsIncomeExpenses,
  walletTransactionsTransfer
} from '../schema.drizzle'

export const transactionDto = createSelectSchema(walletTransactions).extend({
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

export const EnrichedTransactionOutput = z.discriminatedUnion('type', [
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

export function mapToEnrichedTransaction(
  base: typeof walletTransactions.$inferSelect,
  sub: typeof walletTransactionsIncomeExpenses.$inferSelect | null,
  transfer: typeof walletTransactionsTransfer.$inferSelect | null
): z.infer<typeof EnrichedTransactionOutput> {
  if (base.type === 'transfer') {
    return {
      ...base,
      type: 'transfer',
      from: transfer?.from ?? null,
      to: transfer?.to ?? null
    }
  }

  return {
    ...base,
    type: (sub?.type ?? 'expenses') as 'income' | 'expenses',
    particulars: sub?.particulars ?? '',
    asset: sub?.asset ?? null,
    category: sub?.category ?? null,
    ledgers: sub?.ledgers ?? [],
    location_name: sub?.location_name ?? '',
    location_coords: sub?.location_coords ?? null
  }
}
