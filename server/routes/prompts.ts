import z from 'zod'

import { getPromptGenerationPrompt } from '../constants/prompts'
import forge from '../forge'

export const get = forge
  .query()
  .description('Get AI prompts for transaction generation')
  .input({})
  .callback(async ({ pb }) => {
    const records = await pb.getFullList
      .collection('transactions_prompts')
      .execute()

    if (records.length === 0) {
      return {
        income: '',
        expenses: ''
      }
    }

    return {
      income: records[0].income,
      expenses: records[0].expenses
    }
  })

export const update = forge
  .mutation()
  .description('Update AI generation prompts')
  .input({
    body: z.object({
      income: z.string().min(1),
      expenses: z.string().min(1)
    })
  })
  .callback(async ({ pb, body }) => {
    const records = await pb.getFullList
      .collection('transactions_prompts')
      .execute()

    if (records.length === 0) {
      const newRecord = await pb.create
        .collection('transactions_prompts')
        .data(body)
        .execute()

      return {
        income: newRecord.income,
        expenses: newRecord.expenses
      }
    }

    const updatedRecord = await pb.update
      .collection('transactions_prompts')
      .id(records[0].id)
      .data(body)
      .execute()

    return {
      income: updatedRecord.income,
      expenses: updatedRecord.expenses
    }
  })

export const autoGenerate = forge
  .mutation()
  .description('Auto-generate prompt using AI')
  .input({
    body: z.object({
      type: z.enum(['income', 'expenses']),
      count: z.number().min(10).max(500)
    })
  })
  .callback(
    async ({
      pb,
      body: { type, count },
      core: {
        api: { fetchAI }
      }
    }) => {
      const allTransactions = await pb.getFullList
        .collection(`transactions_income_expenses`)
        .expand({
          base_transaction: 'transactions'
        })
        .filter([
          {
            field: 'type',
            operator: '=',
            value: type
          }
        ])
        .execute()

      const sampleTransactions: string[] = []

      while (
        sampleTransactions.length < Math.min(count, allTransactions.length)
      ) {
        const randomIndex = Math.floor(Math.random() * allTransactions.length)

        const transaction = allTransactions[randomIndex]

        if (!sampleTransactions.includes(transaction.particulars)) {
          sampleTransactions.push(transaction.particulars)
        }
      }

      console.log('Sample Transactions:', sampleTransactions)

      const prompt = getPromptGenerationPrompt(type)

      const response = await fetchAI({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: sampleTransactions.join('\n')
          }
        ],
        pb
      })

      if (!response) {
        throw new Error('Failed to generate prompt using AI')
      }

      return response
    }
  )
