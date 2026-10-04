import { asc, eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod'

import { LocationSchema } from '@lifeforge/server-utils'

import forge from '../forge'
import { walletTransactionTemplates } from '../schema.drizzle'

const templateDto = createSelectSchema(walletTransactionTemplates).extend({
  type: z.enum(['income', 'expenses']),
  ledgers: z.array(z.string()),
  location_coords: z.object({ lon: z.number(), lat: z.number() }).nullable()
})

const templateInputDto = z.object({
  name: z.string(),
  type: z.enum(['income', 'expenses']),
  amount: z.number(),
  particulars: z.string(),
  asset: z.string().optional(),
  category: z.string().optional(),
  platform: z.string().optional(),
  ledgers: z.array(z.string()).optional(),
  location: LocationSchema.optional()
})

function mapTemplate(body: z.infer<typeof templateInputDto>) {
  return {
    name: body.name,
    type: body.type,
    amount: body.amount,
    particulars: body.particulars,
    asset: body.asset || null,
    category: body.category || null,
    platform: body.platform || null,
    ledgers: body.ledgers ?? [],
    location_coords: {
      lon: body.location?.location.longitude ?? 0,
      lat: body.location?.location.latitude ?? 0
    },
    location_name: body.location?.name ?? ''
  }
}

export const list = forge
  .query({
    description: 'Get all transaction templates',
    output: {
      OK: z.record(
        z.enum(['income', 'expenses']),
        z.array(templateDto)
      )
    }
  })
  .callback(async ({ db, response }) => {
    const rows = await db
      .select()
      .from(walletTransactionTemplates)
      .orderBy(asc(walletTransactionTemplates.type), asc(walletTransactionTemplates.name))

    const grouped: Record<'income' | 'expenses', z.infer<typeof templateDto>[]> =
      {
        income: [],
        expenses: []
      }

    for (const template of rows) {
      const type = template.type as 'income' | 'expenses'

      if (grouped[type]) {
        grouped[type].push(template)
      }
    }

    return response.ok(grouped)
  })

export const create = forge
  .mutation({
    description: 'Create a new transaction template',
    input: {
      body: templateInputDto
    },
    output: {
      CREATED: templateDto
    }
  })
  .callback(async ({ db, body, response }) => {
    const [created] = await db
      .insert(walletTransactionTemplates)
      .values(mapTemplate(body))
      .returning()

    return response.created(created)
  })

export const update = forge
  .mutation({
    description: 'Update transaction template',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), walletTransactionTemplates)
      }),
      body: templateInputDto
    },
    output: {
      OK: templateDto
    }
  })
  .callback(async ({ db, query: { id }, body, response }) => {
    const [updated] = await db
      .update(walletTransactionTemplates)
      .set(mapTemplate(body))
      .where(eq(walletTransactionTemplates.id, id))
      .returning()

    return response.ok(updated)
  })

export const remove = forge
  .mutation({
    description: 'Delete a transaction template',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), walletTransactionTemplates)
      })
    },
    output: {
      NO_CONTENT: true
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    await db
      .delete(walletTransactionTemplates)
      .where(eq(walletTransactionTemplates.id, id))

    return response.noContent()
  })
