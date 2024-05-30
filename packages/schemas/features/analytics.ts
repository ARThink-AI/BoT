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

export const totalTextInput = z.object({
  text: z.string(),
  total: z.number(),
})

export const totalRatingInput = z.object({
  rating: z.string(),
  total: z.number(),
})

export type TotalTextInput = z.infer<typeof totalTextInput>
export type TotalRatingInput = z.infer<typeof totalRatingInput>

export type TotalContentInBlock = z.infer<typeof totalContentInBlock>
export type TotalAnswersInBlock = z.infer<typeof totalAnswersInBlock>
