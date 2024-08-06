import { z } from 'zod'
import { blockBaseSchema, optionBaseSchema } from '../baseSchemas'
// import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'

export const barCodeOptionsBaseSchema = z.object({
  
})

export const barcodeReaderOptionsSchema = barCodeOptionsBaseSchema
  .merge(optionBaseSchema)
  .merge(
    z.object({
      mode  : z.string()
    })
  )


  export const defaultBarCodeInputOptions: BarCodeInputOptions = {
   mode  : "camera"
  }


export const barCodeSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.BARCODE_READER]),
    options: barcodeReaderOptionsSchema,
  })
)

export type BarCodeInputBlock = z.infer<typeof barCodeSchema>
export type BarCodeInputOptions = z.infer<typeof barcodeReaderOptionsSchema>
