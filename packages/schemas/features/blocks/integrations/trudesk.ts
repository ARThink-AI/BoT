import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const trudeskTasks = ['Create Ticket', 'Create Note'] as const

export const createTicketResponseValues = [
  'Ticket Id'
] as const


export const trudeskCredentialsSchema = z
  .object({
    type: z.literal('trudesk'),
    data: z.object({
      userName : z.string(),
      password : z.string(),
      baseUrl:  z.string() 
    }),
  })
  .merge(credentialsBaseSchema)

const trudeskBaseOptionsSchema = z.object({
    credentialsId: z.string().optional(),
  })

const initialOptionsSchema = z
  .object({
    task: z.undefined(),
  }).merge(trudeskBaseOptionsSchema);

const createTicketOptionsSchema = z.object({
  task: z.literal(trudeskTasks[0]),
  subject : z.string().optional() ,
  owner : z.string().optional() ,
  assignee : z.string().optional() ,
  group : z.string().optional() ,
  type : z.string().optional() ,
  priority : z.string().optional() ,
  variableId : z.string().optional()

}).merge(trudeskBaseOptionsSchema)


const createNoteOptionsSchema = z.object({
  task : z.literal( trudeskTasks[1] ),
}).merge(trudeskBaseOptionsSchema);



export const trudeskBlockSchema = blockBaseSchema.merge(
    z.object({
      type: z.enum([IntegrationBlockType.TRUDESK]),
      options: z.discriminatedUnion('task', [
        initialOptionsSchema ,
        createTicketOptionsSchema ,
        createNoteOptionsSchema
        
      ]),
    })
  )
  
  export type TrudeskCredentials = z.infer<typeof trudeskCredentialsSchema>
  export type TrudeskBlock = z.infer<typeof trudeskBlockSchema>  
