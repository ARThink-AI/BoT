import { z } from 'zod'
import { stripeCredentialsSchema , razorpayCredentialsSchema } from './blocks/inputs/payment/schemas'
import { googleSheetsCredentialsSchema } from './blocks/integrations/googleSheets/schemas'
import { openAICredentialsSchema } from './blocks/integrations/openai'
import {  trudeskCredentialsSchema } from "./blocks/integrations/trudesk"
import { smtpCredentialsSchema } from './blocks/integrations/sendEmail'
import { whatsAppCredentialsSchema } from './whatsapp'
import { zemanticAiCredentialsSchema } from './blocks'

export const credentialsSchema = z.discriminatedUnion('type', [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  razorpayCredentialsSchema,
  openAICredentialsSchema,
  whatsAppCredentialsSchema,
  zemanticAiCredentialsSchema,
  trudeskCredentialsSchema,
])

export type Credentials = z.infer<typeof credentialsSchema>
