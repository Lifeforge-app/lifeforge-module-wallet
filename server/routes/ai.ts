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
  type: 'income' | 'expenses'
  category: string
  amount: number
  location: string
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
  categoryNames: string[]
) {
  const hasCategories = categoryNames.length > 0

  const FullTransactionDetails = z.object({
    date: z.string().describe('Transaction date in YYYY-MM-DD format'),
    type: z.enum(['income', 'expenses']),
    category: hasCategories
      ? z.enum(categoryNames).describe('The matched category')
      : z.string().describe('The matched category name'),
    amount: z.number().describe('Numeric amount without currency symbol'),
    location: z.string().describe('Location name or "Unknown"')
  })

  return await fetchAI({
    pb,
    provider: 'deepseek',
    model: 'deepseek-chat',
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
- Determine transaction type: 'income' or 'expenses'.
- Assign the best matching category from the available category list. If no categories are provided, output a reasonable general category name (e.g. 'Food', 'Drinks', 'Entertainment', 'Transport').
- Extract the clean, numerical transaction amount without currency signs.
- Extract the merchant name/location. If not found, use "Unknown".

Available Categories: ${hasCategories ? categoryNames.join(', ') : 'None'}`
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
    model: 'deepseek-chat',
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
  description: string
) {
  const fallbackPrompt = `You are a copywriter generating clean, concise transaction summaries (particulars) for personal finance ledgers.
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

  let particularsPrompt = particularPrompt?.[extractedData.type]
    ? `${particularPrompt[extractedData.type]}`
    : fallbackPrompt

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
    model: 'deepseek-chat',
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

async function resolveAsset(
  fetchAI: FetchAIFunc,
  pb: IPBService<typeof schema>,
  assetNames: string[],
  description: string
) {
  if (assetNames.length === 0) {
    return 'Unknown'
  }

  const AssetMatch = z.object({
    assetName: z
      .enum(['Unknown', ...assetNames])
      .describe(
        'The matched asset name from the list, or Unknown if it cannot be derived'
      )
  })

  const assetData = await fetchAI({
    pb,
    provider: 'deepseek',
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `You are an intelligent personal finance assistant.
Your task is to identify which payment asset was used for the transaction based on the transaction text.

Strict Rules:
- Select the exact matching asset name from the provided list.
- If the text does not contain any clues or mention of which account/method was used (e.g. "cash", "credit card", "bank", or a specific bank name), choose 'Unknown'.

Available Assets:
${assetNames
  .map(function (name) {
    return `- ${name}`
  })
  .join('\n')}

Examples:
- Input: "Starbucks coffee using MAE Wallet" -> MAE Wallet
- Input: "Groceries yesterday" -> Unknown
- Input: "Paid with Cash" -> Cash`
      },
      {
        role: 'user',
        content: description
      }
    ],
    structure: AssetMatch
  })

  return assetData?.assetName || 'Unknown'
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
        asset: z.string().optional()
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
      categoryNames
    )

    if (!extractedData) {
      throw new Error('Failed to extract transaction details')
    }

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
      asset: undefined as string | undefined
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
      extractedData,
      description
    )

    if (matchedTemplate) {
      if (matchedTemplate.particulars !== undefined && matchedTemplate.particulars !== null) {
        finalResult.particulars = matchedTemplate.particulars
      }

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
    }

    // 4. Generate particulars if not matched by template
    if (!matchedTemplate && !finalResult.particulars?.trim()) {
      finalResult.particulars = await generateParticulars(
        fetchAI,
        pb,
        extractedData,
        particularPrompt,
        description
      )
    }

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

    // 6. Resolve payment asset
    const matchedAssetName = await resolveAsset(
      fetchAI,
      pb,
      assetNames,
      description
    )

    if (matchedAssetName !== 'Unknown') {
      finalResult.asset = assetMap.get(matchedAssetName)
    }

    return response.ok(finalResult)
  })
