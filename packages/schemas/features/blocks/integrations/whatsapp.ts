import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'
export const whatsappTasks = ['Initiate Message'] as const

export const WhatsappCredentialsSchema = z
  .object({
    type: z.literal('Whatsapp'),
    data: z.object({
      systemAccessToken: z.string()
    }),
  })
  .merge(credentialsBaseSchema)

const whatsappBaseOptionsSchema = z.object({
  credentialsId: z.string().optional(),
})

const initialOptionsSchema = z
  .object({
    task: z.undefined(),
  }).merge(whatsappBaseOptionsSchema);

const initiateMessageOptionsSchema = z.object({
  task: z.literal(whatsappTasks[0]),

}).merge(whatsappBaseOptionsSchema);

export const whatsappBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.WHATSAPP]),
    options: z.discriminatedUnion('task', [
      initialOptionsSchema,
      initiateMessageOptionsSchema

    ]),
  })
)

export type WhatsappCredentials = z.infer<typeof WhatsappCredentialsSchema>
export type WhatsappBlock = z.infer<typeof whatsappBlockSchema>

