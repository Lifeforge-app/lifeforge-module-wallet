import dayjs from 'dayjs'
import z from 'zod'

import type {
  FetchAIFunc,
  IPBService,
  SearchLocationsFunc
} from '@lifeforge/server-utils'

import forge from '../forge'
import { schemas } from '../schema'
import type schema from '../schema'

type GetAPIKeyFunc = (
  id: string,
  pb: IPBService<typeof schema>
) => Promise<string>

type InferSchema<T extends keyof typeof schemas> = z.infer<(typeof schema)[T]>

type Category = InferSchema<'categories'>
type Asset = InferSchema<'assets'>
type TransactionPrompt = InferSchema<'transactions_prompts'>
type TransactionTemplate = InferSchema<'transaction_templates'>

type ExtractedData = {
  date: string
  type: 'income' | 'expenses' | 'transfer'
  category: string
  amount: number
  location: string
  asset: string | null
  from: string | null
  to: string | null
}

async function fetchInitialData(
  pb: IPBService<typeof schema>,
  getAPIKey: GetAPIKeyFunc
) {
  const [particularPrompt, categories, key, assets] = await Promise.all([
    pb.getFirstListItem
      .collection('transactions_prompts')
      .execute()
      .catch(function () {
        return null as TransactionPrompt | null
      }),
    pb.getFullList
      .collection('categories')
      .execute()
      .catch(function () {
        return [] as Category[]
      }),
    getAPIKey('gcloud', pb).catch(function () {
      return null as string | null
    }),
    pb.getFullList
      .collection('assets')
      .execute()
      .catch(function () {
        return [] as Asset[]
      })
  ])

  return {
    particularPrompt: particularPrompt as TransactionPrompt | null,
    categories: categories as Category[],
    key: key as string | null,
    assets: assets as Asset[]
  }
}

async function extractBasicDetails(
  fetchAI: FetchAIFunc,
  pb: IPBService<typeof schema>,
  description: string,
  todayStr: string,
  categoryNames: string[],
  assetNames: string[]
) {
  const hasCategories = categoryNames.length > 0

  const hasAssets = assetNames.length > 0

  const assetEnum = hasAssets
    ? z.enum(assetNames as [string, ...string[]])
    : z.string()

  const FullTransactionDetails = z.discriminatedUnion('type', [
    z.object({
      date: z.string().describe('Transaction date in YYYY-MM-DD format'),
      type: z.literal('income').or(z.literal('expenses')),
      category: hasCategories
        ? z
            .enum(categoryNames as [string, ...string[]])
            .describe('The matched category')
        : z.string().describe('The matched category name'),
      amount: z.number().describe('Numeric amount without currency symbol'),
      location: z.string().describe('Location name or "Unknown"'),
      asset: assetEnum.describe(
        'The matched asset/wallet name from the available list'
      )
    }),
    z.object({
      date: z.string().describe('Transaction date in YYYY-MM-DD format'),
      type: z.literal('transfer'),
      amount: z.number().describe('Numeric amount without currency symbol'),
      from: assetEnum.describe('The source asset/wallet for the transfer'),
      to: assetEnum.describe('The destination asset/wallet for the transfer')
    })
  ])

  return await fetchAI({
    pb,
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    messages: [
      {
        role: 'system',
        content: `You are an expert transaction extractor for personal finance software.
Your task is to analyze the receipt text or natural language input and extract structured details.

Strict Rules:
- Identify the correct date of the transaction:
  - If an absolute date is provided (e.g. "May 25", "12/20/2025"), convert it to YYYY-MM-DD.
  - If a relative date or relative time context is provided (e.g. "today", "yesterday", "2 days ago", "last Friday", "yesterday afternoon", "3 hours ago"), you must calculate the exact calendar date in YYYY-MM-DD format based on the Current Reference Date: ${todayStr} (which represents today's date).
  - Never output descriptive relative terms (like "Today", "Yesterday", "2 days ago") in the date field; always output the calculated absolute calendar date in YYYY-MM-DD format.
- Determine transaction type: 'income', 'expenses', or 'transfer'.
  - For income or expenses: extract category, location, and the asset/wallet used.
  - For transfer: extract only date, amount, and the from/to assets (from, to). Skip category, location, and single asset.
- Extract the clean, numerical transaction amount without currency signs. CRITICAL: Never invent or assume an amount. Only extract an amount if it is explicitly stated in the description (e.g., "RM39", "$15", "50 dollars", "spent 20"). If no amount is explicitly mentioned, you MUST set amount to 0.
- Extract the merchant name/location. If not found, use "Unknown".
- Extract the payment asset/wallet used for the transaction. If the text does not contain any clue about which account or method was used, use "Unknown".

Available Categories: ${hasCategories ? categoryNames.join(', ') : 'None'}
Available Assets: ${hasAssets ? assetNames.join(', ') : 'None'}`
      },
      {
        role: 'user',
        content: description
      }
    ],
    structure: FullTransactionDetails
  })
}

async function matchTemplate(
  fetchAI: FetchAIFunc,
  pb: IPBService<typeof schema>,
  templates: TransactionTemplate[],
  extractedData: ExtractedData,
  description: string
) {
  if (templates.length === 0) {
    return null
  }

  const templateNames = templates.map(function (t) {
    return t.name
  })

  const TemplateMatch = z.object({
    template: z
      .enum(['None', ...templateNames])
      .describe(
        'Best matching template name, or None if there is no extremely close match'
      )
  })

  const templateData = await fetchAI({
    pb,
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    messages: [
      {
        role: 'system',
        content: `You are a smart matching system that maps transactions to pre-defined user templates.
Your goal is to determine if the transaction matches a template.

Strict Matching Rules:
- A match is ONLY valid if the merchant/location name or the specific item purchased matches the template's details.
- If the merchant/location, category, or descriptions are different (e.g., "The Library" vs "Lakeview Haus", or "book" vs "beverage"), they are absolutely NOT a match.
- If there is no extremely close match, you MUST return 'None'.
- Do not make loose or creative associations. Be highly conservative and default to 'None'.

Slot Handling:
- Template particulars may contain placeholder slots indicated by various bracket styles like <slot_name>, {slot_name}, {{slot_name}}, [slot_name], (slot_name), etc. (e.g., <item>, {store}, {{service}}, [merchant]). These are empty slots to be filled with real values from the transaction.
- Consider a template with slots as a potential match — the slot indicates the template fits, with details to be filled in from the actual transaction.

Available Templates:
${templates
  .map(function (t) {
    return `- ${t.name}: ${t.particulars || 'N/A'} ${
      t.location_name ? `@ ${t.location_name}` : ''
    }`
  })
  .join('\n')}`
      },
      {
        role: 'user',
        content: `Transaction details:
- Amount: ${extractedData.amount}
- Category: ${extractedData.category}
- Location: ${extractedData.location}
- Raw text: ${description}`
      }
    ],
    structure: TemplateMatch
  })

  if (templateData && templateData.template !== 'None') {
    return (
      templates.find(function (t) {
        return t.name === templateData.template
      }) || null
    )
  }

  return null
}

async function generateParticulars(
  fetchAI: FetchAIFunc,
  pb: IPBService<typeof schema>,
  extractedData: ExtractedData,
  particularPrompt: TransactionPrompt | null,
  description: string,
  baseParticulars?: string
) {
  const todayStr = dayjs().format('YYYY-MM-DD')
  let particularsPrompt = particularPrompt?.[
    extractedData.type as 'income' | 'expenses'
  ]
    ? `${particularPrompt[extractedData.type as 'income' | 'expenses']}\n\nCurrent Reference Date: ${todayStr}\n\nIMPORTANT: If you are given a base reference particular containing placeholder slots (indicated by various bracket styles like <slot_name>, {slot_name}, {{slot_name}}, [slot_name], (slot_name), etc.), you MUST fill those slots with the actual values from the user's transaction description, producing a concrete, complete particulars string.`
    : `You are a copywriter generating clean, concise transaction summaries (particulars) for personal finance ledgers.
Analyze the transaction text and describe only the purchase item or nature of the transaction (5 to 10 words).

Strict Rules:
1. Do NOT include payment methods, card names, or wallets (e.g., "using MAE Wallet", "with Visa", "by card", "credit card", "wallet").
2. Do NOT include dates, relative times, or days of week (e.g., "last Sunday", "today", "yesterday", "Sunday").
3. Do NOT include transaction amounts or currencies (e.g., "RM39", "$15").

Few-Shot Examples:
- Input: "Spend RM39 for the purchase of book at The Library by BookXCess last sunday using MAE Wallet"
  Particulars: "Purchase of book by BookXCess"

- Input: "Starbucks coffee for $5.50 this morning with Visa Card"
  Particulars: "Starbucks coffee"

- Input: "Bought groceries at Tesco yesterday for RM120 using Cash"
  Particulars: "Groceries at Tesco"

Now analyze the user input and produce the clean, concise particulars.`

  if (baseParticulars) {
    particularsPrompt += `\n\nYou have a base reference particular from a matching template: "${baseParticulars}". Current Reference Date: ${todayStr}. This template may contain placeholder slots (indicated by various bracket styles like <slot_name>, {slot_name}, {{slot_name}}, [slot_name], (slot_name), etc.). Your job is to fill those slots with the actual values from the user's transaction description, producing a concrete, complete particulars string. Use this as a base and enhance it with additional context from the user input if appropriate, while keeping it concise.`
  }

  particularsPrompt += `\n\nCRITICAL RULE: Under no circumstances should any asset/wallet name, payment method, amount, date, day of week, or relative time words be included in the particulars.`

  const ParticularsExtraction = z.object({
    particulars: z
      .string()
      .describe(
        'Clean transaction particulars (5-10 words). MUST NOT contain dates, times, day of week, amounts, or payment asset names.'
      )
  })

  const particularsData = await fetchAI({
    pb,
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    messages: [
      {
        role: 'system',
        content: particularsPrompt
      },
      {
        role: 'user',
        content: description
      }
    ],
    structure: ParticularsExtraction
  })

  return particularsData?.particulars || ''
}

async function resolveLocationCoords(
  searchLocations: SearchLocationsFunc,
  key: string | null,
  locationName: string
) {
  if (!key || !locationName || locationName === 'Unknown') {
    return null
  }

  const locations = await searchLocations(key, locationName).catch(function () {
    return []
  })

  if (locations.length > 0) {
    return {
      coords: {
        lon: locations[0].location.longitude,
        lat: locations[0].location.latitude
      },
      name: locations[0].name
    }
  }

  return null
}

export const fromNaturalLanguage = forge
  .mutation({
    description:
      'Convert human natural language into partial transaction object',
    input: {
      body: z.object({
        description: z.string()
      })
    },
    output: {
      OK: z.object({
        date: z.string(),
        amount: z.number(),
        type: z.enum(['income', 'expenses', 'transfer']),
        category: z.string().nullable(),
        particulars: z.string(),
        location_coords: z.object({
          lon: z.number(),
          lat: z.number()
        }),
        location_name: z.string(),
        asset: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        ledgers: z.array(z.string()).optional()
      })
    }
  })
  .callback(async function ({
    response,
    pb,
    body: { description },
    core: {
      api: { fetchAI, getAPIKey, searchLocations }
    }
  }) {
    const todayStr = dayjs().format('YYYY-MM-DD')

    // 1. Fetch initial data from DB
    const { particularPrompt, categories, key, assets } =
      await fetchInitialData(pb, getAPIKey)

    // Map categories and assets
    const categoryMap = new Map(
      categories.map(function (c) {
        return [c.name, c.id]
      })
    )

    const categoryNames = categories.map(function (c) {
      return c.name
    })

    const assetMap = new Map(
      assets.map(function (a) {
        return [a.name, a.id]
      })
    )

    const assetNames = assets.map(function (a) {
      return a.name
    })

    // 2. Extract basic transaction details
    const extractedData = await extractBasicDetails(
      fetchAI,
      pb,
      description,
      todayStr,
      categoryNames,
      assetNames
    )

    if (!extractedData) {
      throw new Error('Failed to extract transaction details')
    }

    if (extractedData.type === 'transfer') {
      return response.ok({
        date: extractedData.date,
        type: 'transfer',
        amount: extractedData.amount,
        category: null,
        particulars: '',
        location_coords: { lon: 0, lat: 0 },
        location_name: '',
        from:
          extractedData.from && extractedData.from !== 'Unknown'
            ? assetMap.get(extractedData.from)
            : undefined,
        to:
          extractedData.to && extractedData.to !== 'Unknown'
            ? assetMap.get(extractedData.to)
            : undefined
      })
    }

    // At this point, type is narrowed to 'income' | 'expenses'
    const finalResult: {
      date: string
      type: 'income' | 'expenses' | 'transfer'
      amount: number
      category: string | null
      particulars: string
      location_coords: {
        lon: number
        lat: number
      }
      location_name: string
      asset: string | undefined
      ledgers: string[] | undefined
    } = {
      date: extractedData.date,
      type: extractedData.type,
      amount: extractedData.amount,
      category:
        categoryMap.get(extractedData.category) ||
        extractedData.category ||
        null,
      particulars: '',
      location_coords: {
        lon: 0,
        lat: 0
      },
      location_name: '',
      asset:
        extractedData.asset && extractedData.asset !== 'Unknown'
          ? assetMap.get(extractedData.asset)
          : undefined,
      ledgers: undefined
    }

    // Fetch transaction templates for type
    const templates = await pb.getFullList
      .collection('transaction_templates')
      .filter([
        {
          field: 'type',
          operator: '=',
          value: extractedData.type
        }
      ])
      .execute()
      .catch(function () {
        return []
      })

    // 3. Match template
    const matchedTemplate = await matchTemplate(
      fetchAI,
      pb,
      templates,
      extractedData as ExtractedData,
      description
    )

    if (matchedTemplate) {
      if (matchedTemplate.category) {
        finalResult.category = matchedTemplate.category
      }

      if (matchedTemplate.location_name) {
        finalResult.location_name = matchedTemplate.location_name
      }

      if (
        matchedTemplate.location_coords &&
        (matchedTemplate.location_coords.lon !== 0 ||
          matchedTemplate.location_coords.lat !== 0)
      ) {
        finalResult.location_coords = matchedTemplate.location_coords
      }

      if (
        finalResult.amount === 0 &&
        matchedTemplate.amount !== undefined &&
        matchedTemplate.amount !== null &&
        matchedTemplate.amount > 0
      ) {
        finalResult.amount = matchedTemplate.amount
      }

      if (matchedTemplate.ledgers && matchedTemplate.ledgers.length > 0) {
        finalResult.ledgers = matchedTemplate.ledgers
      }
    }

    // 4. Generate particulars (always run, with template particulars as base reference if matched)
    finalResult.particulars = await generateParticulars(
      fetchAI,
      pb,
      extractedData as ExtractedData,
      particularPrompt,
      description,
      matchedTemplate?.particulars || undefined
    )

    // 5. Resolve location coordinates if not already set by template
    if (!finalResult.location_name?.trim()) {
      const resolvedLoc = await resolveLocationCoords(
        searchLocations,
        key,
        extractedData.location
      )

      if (resolvedLoc) {
        finalResult.location_coords = resolvedLoc.coords
        finalResult.location_name = resolvedLoc.name
      }
    }

    // 6. Fallback to template asset if AI didn't resolve one
    if (!finalResult.asset && matchedTemplate?.asset) {
      finalResult.asset = matchedTemplate.asset
    }

    return response.ok(finalResult)
  })
