import z from 'zod'

import { fetchAI } from '@functions/external/ai'
import { forgeController } from '@functions/routes'

import { getPromptGenerationPrompt } from '../constants/prompts'

export const get = forgeController
  .query()
  .description({
    en: 'Get AI prompts for transaction generation',
    ms: 'Dapatkan prompt AI untuk penjanaan transaksi',
    'zh-CN': '获取用于交易生成的 AI 提示词',
    'zh-TW': '獲取用於交易生成的 AI 提示詞'
  })
  .input({})
  .callback(async ({ pb }) => {
    const records = await pb.getFullList
      .collection('wallet__transactions_prompts')
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

export const update = forgeController
  .mutation()
  .description({
    en: 'Update AI generation prompts',
    ms: 'Kemas kini prompt penjanaan AI',
    'zh-CN': '更新 AI 生成提示词',
    'zh-TW': '更新 AI 生成提示詞'
  })
  .input({
    body: z.object({
      income: z.string().min(1),
      expenses: z.string().min(1)
    })
  })
  .callback(async ({ pb, body }) => {
    const records = await pb.getFullList
      .collection('wallet__transactions_prompts')
      .execute()

    if (records.length === 0) {
      const newRecord = await pb.create
        .collection('wallet__transactions_prompts')
        .data(body)
        .execute()

      return {
        income: newRecord.income,
        expenses: newRecord.expenses
      }
    }

    const updatedRecord = await pb.update
      .collection('wallet__transactions_prompts')
      .id(records[0].id)
      .data(body)
      .execute()

    return {
      income: updatedRecord.income,
      expenses: updatedRecord.expenses
    }
  })

export const autoGenerate = forgeController
  .mutation()
  .description({
    en: 'Auto-generate prompt using AI',
    ms: 'Jana prompt secara automatik menggunakan AI',
    'zh-CN': '使用 AI 自动生成提示词',
    'zh-TW': '使用 AI 自動生成提示詞'
  })
  .input({
    body: z.object({
      type: z.enum(['income', 'expenses']),
      count: z.number().min(10).max(500)
    })
  })
  .callback(async ({ pb, body: { type, count } }) => {
    const allTransactions = await pb.getFullList
      .collection(`wallet__transactions_income_expenses`)
      .expand({
        base_transaction: 'wallet__transactions'
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
  })

export default { get, update, autoGenerate }
