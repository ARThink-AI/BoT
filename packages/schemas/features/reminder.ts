import { z } from 'zod'

export const reminderSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string(),
  typebotId: z.string(),
  type: z.string(),
  payload: z.object({
    email: z.string().email(),
  }),
})

export type Reminder = z.infer<typeof reminderSchema>
