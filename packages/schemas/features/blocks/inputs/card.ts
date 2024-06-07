import { z } from 'zod'
import { blockBaseSchema, optionBaseSchema } from '../baseSchemas'
// import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'

export const cardOptionsBaseSchema = z.object({})
export const cardInputTypes = [
  'text',
  'email',
  'phone',
  'dropdown',
  'checkbox',
  'textarea',
  'radio',
  'rating'
]

export const cardOptionsSchema = cardOptionsBaseSchema
  .merge(optionBaseSchema)
  .merge(
    z.object({
      heading: z.string().optional(),
      subHeading: z.string().optional(),
      isVoiceFill : z.boolean().optional(),
      inputs: z.array(
        z.object({
          id: z.string().optional(),
          type: z.string().optional(),
          label: z.string().optional(),
          placeholder: z.string().optional(),
          dynamicDataVariableId: z.string().optional(),
          defaultValue: z.string().optional(),
          answerVariableId: z.string().optional(),
          values: z.string().optional(),
          default: z.string().optional(),
          required: z.boolean().optional(),
          buttonType: z.literal('Icons').or(z.literal('Numbers')).optional(),
          length: z.number().optional(),
          labels: z.object({
            left: z.string().optional(),
            right: z.string().optional(),
            button: z.string().default("Send"),
          }).optional(),
          customIcon: z.object({
            isEnabled: z.boolean().default(false),
            svg: z.string().optional(),
          }).optional(),
          isOneClickSubmitEnabled: z.boolean().optional(),
        })
      ),
    })
  )

export const defaultCardInputOptions: CardInputOptions = {
  inputs: [],
}

export const cardSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.CARD]),
    options: cardOptionsSchema,
  })
)

export type CardInputBlock = z.infer<typeof cardSchema>
export type CardInputOptions = z.infer<typeof cardOptionsSchema>
