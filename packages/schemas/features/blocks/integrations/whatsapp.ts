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
  to: z.string().optional(),
  variableId: z.string().optional(),
  phoneNumberId: z.string().optional(),
  selectedTemplateName: z.string().optional(),
  selectedTemplateId: z.string().optional(),
  selectedTemplateLang: z.string().optional(),
  components: z.array(z.object({
    type: z.string(),
    text: z.string().optional(),
    variables: z.array(z.string()).default([]),
    // image: z.object({ link: z.string() }).optional(),
    image: z.boolean().optional(),
    location: z.object({ latitude: z.string(), longitude: z.string(), name: z.string().optional(), address: z.string().optional() }).optional()
  })).default([]),

  // templateInfo: z.object({
  //   id: z.string(),
  //   name: z.string(),
  //   language: z.string(),
  //   status: z.string(),
  //   category: z.string(),
  //   sub_category: z.string().optional(),
  //   components: z.array(z.object({
  //     type: z.string(),
  //     text: z.string().optional(),
  //     image: z.object({ link: z.string() }).optional(),
  //     location: z.object({ latitude: z.string(), longitude: z.string(), name: z.string().optional(), address: z.string().optional() }).optional()
  //   })).optional(),

  // }).optional()

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

