import { z } from 'zod'
import { blockBaseSchema, optionBaseSchema } from '../baseSchemas'
// import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'

export const authloginOptionsBaseSchema = z.object({
  
})

export const authLoginOptionsSchema = authloginOptionsBaseSchema
  .merge(optionBaseSchema)
  .merge(
    z.object({
      mode  : z.string()
    })
  )


  export const defaultAuthLoginInputOptions: AuthLoginInputOptions = {
   mode  : "google"
  }


export const authLoginSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.AUTH_LOGIN]),
    options: authLoginOptionsSchema,
  })
)

export type AuthLoginInputBlock = z.infer<typeof authLoginSchema>
export type AuthLoginInputOptions = z.infer<typeof authLoginOptionsSchema>
