import { z } from 'zod'

export const totalAnswersInBlock = z.object({
  blockId: z.string(),
  itemId: z.string().optional(),
  total: z.number(),
})
export const totalContentInBlock = z.object({
  blockId: z.string(),
  content: z.string(),
  itemId: z.string().optional(),
  total: z.number(),
})

export type TotalContentInBlock = z.infer<typeof totalContentInBlock>
export type TotalAnswersInBlock = z.infer<typeof totalAnswersInBlock>
