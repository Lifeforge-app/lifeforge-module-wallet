import { SCHEMAS } from '@schema'
import z from 'zod'

import { PBService, getAPIKey } from '@functions/database'
import { fetchAI } from '@functions/external/ai'
import searchLocations from '@functions/external/location'

export async function getTransactionDetails(ocrResult: string, pb: PBService) {
  type FinalResult = Omit<
    z.infer<typeof SCHEMAS.wallet.transactions.schema>,
    'type'
  > &
    Omit<
      z.infer<typeof SCHEMAS.wallet.transactions_income_expenses.schema>,
      'base_transaction' | 'type'
    > & {
      type: 'income' | 'expenses'
    }

  // Fetch all data in parallel
  const [particularPrompt, categories, key] = await Promise.all([
    pb.getFirstListItem
      .collection('wallet__transactions_prompts')
      .execute()
      .catch(() => null),
    pb.getFullList.collection('wallet__categories').execute(),
    getAPIKey('gcloud', pb)
  ])

  // Map category names to IDs for efficient lookup
  const categoryMap = new Map(categories.map(c => [c.name, c.id]))

  const categoryNames = categories.map(c => c.name) as [string, ...string[]]

  // Single AI call to extract all basic transaction data + location
  const FullTransactionDetails = z.object({
    date: z.string().describe('Transaction date in YYYY-MM-DD format'),
    type: z.enum(['income', 'expenses']),
    category: z.enum(categoryNames),
    amount: z.number().describe('Numeric amount without currency symbol'),
    location: z.string().describe('Location name or "Unknown"')
  })

  const extractedData = await fetchAI({
    pb,
    provider: 'openai',
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Extract transaction details from receipt text. Categories: ${categoryNames.join(', ')}`
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

  let finalResult: Partial<FinalResult> = {
    date: extractedData.date,
    type: extractedData.type,
    amount: extractedData.amount,
    category: categoryMap.get(extractedData.category)
  }

  const particularsPrompt = particularPrompt?.[extractedData.type]
    ? `${particularPrompt[extractedData.type]}`
    : 'Generate brief transaction description (5-10 words).'

  // Fetch templates matching the transaction type
  const templates = await pb.getFullList
    .collection('wallet__transaction_templates')
    .filter([{ field: 'type', operator: '=', value: extractedData.type }])
    .execute()

  // Match template and generate particulars in one AI call (only if templates exist)
  if (templates.length > 0) {
    const templateNames = templates.map(t => t.name)

    // First, try to match template
    const TemplateMatch = z.object({
      template: z
        .enum(['None', ...templateNames] as [string, ...string[]])
        .describe('Best matching template name or None')
    })

    const templateData = await fetchAI({
      pb,
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
        // Data from template takes precedence
        finalResult = {
          ...selectedTemplate,
          ...finalResult,
          // Ensure category is set from template if available
          category: selectedTemplate.category || finalResult.category
        }
      }
    }

    // Generate particulars only if not set by template
    if (!finalResult.particulars?.trim()) {
      const particularsData = await fetchAI({
        pb,
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
    // No templates available, just generate particulars
    const particularsData = await fetchAI({
      pb,
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

  // Process location if extracted and API key available
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
