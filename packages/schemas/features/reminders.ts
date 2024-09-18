import { z } from 'zod'
import { Frequency, ReminderType } from '@typebot.io/prisma'

export const ReminderSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  jobId: z.string(),
  payload: z.any(),
  typebotId: z.string(),
  type: z.nativeEnum(ReminderType),
  frequency: z.nativeEnum(Frequency),
})

export type Reminders = z.infer<typeof ReminderSchema>
