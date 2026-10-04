import { eq } from 'drizzle-orm'
import z from 'zod'

import { getPromptGenerationPrompt } from '../constants/prompts'
import forge from '../forge'
import {
  walletTransactionsIncomeExpenses,
  walletTransactionsPrompts
} from '../schema.drizzle'

const promptDto = z.object({
  income: z.string(),
  expenses: z.string()
})

export const get = forge
  .query({
    description: 'Get AI prompts for transaction generation',
    output: {
      OK: promptDto
    }
  })
  .callback(async ({ db, response }) => {
    const record = await db.query.transactions_prompts.findFirst()

    return response.ok({
      income: record?.income ?? '',
      expenses: record?.expenses ?? ''
    })
  })

export const update = forge
  .mutation({
    description: 'Update AI generation prompts',
    input: {
      body: z.object({
        income: z.string().min(1),
        expenses: z.string().min(1)
      })
    },
    output: {
      OK: promptDto
    }
  })
  .callback(async ({ db, body, response }) => {
    const record = await db.query.transactions_prompts.findFirst()

    if (!record) {
      const [created] = await db
        .insert(walletTransactionsPrompts)
        .values(body)
        .returning()

      return response.ok({ income: created.income, expenses: created.expenses })
    }

    const [updated] = await db
      .update(walletTransactionsPrompts)
      .set(body)
      .where(eq(walletTransactionsPrompts.id, record.id))
      .returning()

    return response.ok({ income: updated.income, expenses: updated.expenses })
  })

export const autoGenerate = forge
  .mutation({
    description: 'Auto-generate prompt using AI',
    input: {
      body: z.object({
        type: z.enum(['income', 'expenses']),
        count: z.number().min(10).max(500)
      })
    },
    output: {
      OK: z.string()
    }
  })
  .callback(
    async ({
      db,
      body: { type, count },
      core: {
        api: { fetchAI }
      },
      response
    }) => {
      const rows = await db
        .select({ particulars: walletTransactionsIncomeExpenses.particulars })
        .from(walletTransactionsIncomeExpenses)
        .where(eq(walletTransactionsIncomeExpenses.type, type))

      const sampleTransactions: string[] = []

      while (
        sampleTransactions.length < Math.min(count, rows.length) &&
        rows.length > 0
      ) {
        const randomIndex = Math.floor(Math.random() * rows.length)

        const transaction = rows[randomIndex]

        if (!sampleTransactions.includes(transaction.particulars)) {
          sampleTransactions.push(transaction.particulars)
        }
      }

      const prompt = getPromptGenerationPrompt(type)

      const result = await fetchAI({
        provider: 'deepseek',
        model: 'deepseek-v4-flash',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: sampleTransactions.join('\n')
          }
        ]
      })

      if (!result) {
        return response.badRequest('Failed to generate prompt using AI')
      }

      return response.ok(result)
    }
  )
