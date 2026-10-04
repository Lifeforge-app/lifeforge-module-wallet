import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import z from 'zod'

import type { BuiltModuleSchema } from '@lifeforge/drizzle'
import type { FetchAIFunc, SearchLocationsFunc } from '@lifeforge/server-utils'

import type { WalletSchema } from '../forge'
import {
  walletCategories,
  walletPlatforms,
  walletTransactionTemplates
} from '../schema.drizzle'

type WalletDb = PostgresJsDatabase<BuiltModuleSchema<WalletSchema>>

type GetAPIKeyFunc = (id: string) => Promise<string>

export async function getTransactionDetails(
  ocrResult: string,
  db: WalletDb,
  fetchAI: FetchAIFunc,
  getAPIKey: GetAPIKeyFunc,
  searchLocations: SearchLocationsFunc
) {
  type FinalResult = {
    date: string
    type: 'income' | 'expenses'
    amount: number
    category: string
    particulars: string
    location_coords: {
      lon: number
      lat: number
    }
    location_name: string
    asset?: string
    platform: string | null
    ledgers?: string[]
  }

  const [particularPrompt, categories, platforms, key] = await Promise.all([
    db.query.transactions_prompts.findFirst().catch(() => null),
    db.select().from(walletCategories),
    db
      .select()
      .from(walletPlatforms)
      .catch(() => []),
    getAPIKey('gcloud')
  ])

  const categoryMap = new Map(categories.map(c => [c.name, c.id]))

  const categoryNames = categories.map(c => c.name) as [string, ...string[]]

  const platformMap = new Map(platforms.map(p => [p.name, p.id]))

  const platformEnum =
    platforms.length > 0
      ? z.enum(['None', ...platforms.map(p => p.name)] as [string, ...string[]])
      : z.literal('None')

  const FullTransactionDetails = z.object({
    date: z.string().describe('Transaction date in YYYY-MM-DD format'),
    type: z.enum(['income', 'expenses']),
    category: z.enum(categoryNames),
    platform: platformEnum.describe(
      'The purchase platform for expenses, or "None"'
    ),
    amount: z.number().describe('Numeric amount without currency symbol'),
    location: z.string().describe('Location name or "Unknown"')
  })

  const extractedData = await fetchAI({
    provider: 'openai',
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Extract transaction details from receipt text. Categories: ${categoryNames.join(', ')}. Purchase platforms: ${platforms.length > 0 ? platforms.map(p => p.name).join(', ') : 'None'}. Extract the purchase platform only for expenses if explicitly present; otherwise use "None".`
      },
      {
        role: 'user',
        content: ocrResult
      }
    ],
    structure: FullTransactionDetails
  })

  if (!extractedData) {
    throw new Error('Failed to extract transaction details')
  }

  let finalResult: FinalResult = {
    date: extractedData.date,
    type: extractedData.type,
    amount: extractedData.amount,
    category: categoryMap.get(extractedData.category) ?? '',
    platform:
      extractedData.type === 'expenses' && extractedData.platform !== 'None'
        ? (platformMap.get(extractedData.platform) ?? null)
        : null,
    particulars: '',
    location_coords: {
      lon: 0,
      lat: 0
    },
    location_name: ''
  }

  const particularsPrompt = particularPrompt?.[extractedData.type]
    ? `${particularPrompt[extractedData.type]}`
    : 'Generate brief transaction description (5-10 words).'

  const templates = await db
    .select()
    .from(walletTransactionTemplates)
    .where(eq(walletTransactionTemplates.type, extractedData.type))

  if (templates.length > 0) {
    const templateNames = templates.map(t => t.name)

    const TemplateMatch = z.object({
      template: z
        .enum(['None', ...templateNames] as [string, ...string[]])
        .describe('Best matching template name or None')
    })

    const templateData = await fetchAI({
      provider: 'openai',
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            `Match transaction to template. Return the best matching template name or None if no suitable template is found.\nTemplates:\n` +
            templates
              .map(
                t =>
                  `${t.name}: ${t.particulars || 'N/A'} ${t.location_name ? `@ ${t.location_name}` : ''}`
              )
              .join('\n')
        },
        {
          role: 'user',
          content: `${extractedData.amount} ${extractedData.category}\n${ocrResult}`
        }
      ],
      structure: TemplateMatch
    })

    if (templateData && templateData.template !== 'None') {
      const selectedTemplate = templates.find(
        t => t.name === templateData.template
      )

      if (selectedTemplate) {
        finalResult = {
          ...finalResult,
          category: selectedTemplate.category || finalResult.category,
          asset: selectedTemplate.asset ?? '',
          platform: finalResult.platform || selectedTemplate.platform || null,
          ledgers: selectedTemplate.ledgers
        }
      }
    }

    if (!finalResult.particulars?.trim()) {
      const particularsData = await fetchAI({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: particularsPrompt },
          { role: 'user', content: ocrResult }
        ],
        structure: z.object({ particulars: z.string() })
      })

      if (particularsData) {
        finalResult.particulars = particularsData.particulars
      }
    }
  } else {
    const particularsData = await fetchAI({
      provider: 'openai',
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: particularsPrompt },
        { role: 'user', content: ocrResult }
      ],
      structure: z.object({ particulars: z.string() })
    })

    if (particularsData) {
      finalResult.particulars = particularsData.particulars
    }
  }

  if (
    !finalResult.location_coords &&
    key &&
    extractedData.location &&
    extractedData.location !== 'Unknown'
  ) {
    const locations = await searchLocations(key, extractedData.location)

    if (locations.length > 0) {
      finalResult.location_coords = {
        lon: locations[0].location.longitude,
        lat: locations[0].location.latitude
      }
      finalResult.location_name = locations[0].name
    }
  }

  return finalResult
}
