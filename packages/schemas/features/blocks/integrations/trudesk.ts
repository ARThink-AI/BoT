import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const trudeskTasks = ['Create Ticket', 'Create Note','Update Assignee and Group','Update Tags','Update Priority','Update Status' ,'Create Customer' ] as const

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
  assignee : z.string().optional() ,
  group : z.string().optional() ,
  type : z.string().optional() ,
  priority : z.string().optional() ,
  variableId : z.string().optional(),
  variableId1 : z.string().optional(),
  variableId2 : z.string().optional(),
  tags : z.array( z.object( {
    id : z.string() ,
    name : z.string() ,
    normalized : z.string()
  } ) ).optional()

}).merge(trudeskBaseOptionsSchema)


const createNoteOptionsSchema = z.object({
  task : z.literal( trudeskTasks[1] ),
  variableId1 : z.string().optional(),
  variableId2 : z.string().optional()
}).merge(trudeskBaseOptionsSchema);


const updateAssigneeAndGroupSchema = z.object({
  task : z.literal( trudeskTasks[2] ),
  assignee : z.string().optional() ,
  group : z.string().optional() ,
  variableId : z.string().optional(),
  variableId1:  z.string().optional()

}).merge( trudeskBaseOptionsSchema );

const updateTagsSchema = z.object({
  task : z.literal( trudeskTasks[3] ),
  variableId : z.string().optional(),
  variableId1:  z.string().optional(),
  tags : z.array( z.object( {
    id : z.string() ,
    name : z.string() ,
    normalized : z.string()
  } ) ).optional()
}).merge(trudeskBaseOptionsSchema );

const updatePrioritySchema = z.object({
  task : z.literal( trudeskTasks[4] ),
  type : z.string().optional() ,
  priority : z.string().optional() ,
  variableId : z.string().optional(),
  variableId1:  z.string().optional(),
}).merge( trudeskBaseOptionsSchema );

const updateStatusSchema = z.object({
  task : z.literal( trudeskTasks[5] ),
  variableId : z.string().optional(),
  status : z.string().optional() ,
  variableId1:  z.string().optional(),
}).merge( trudeskBaseOptionsSchema );

const createCustomerSchema = z.object({
  task : z.literal( trudeskTasks[6] ),
  variableNameId : z.string().optional(),
  variablePhoneId : z.string().optional(),
  variableEmailId : z.string().optional(),
  variableCustomerId : z.string().optional(),
  variableAddressId : z.string().optional()
}).merge(trudeskBaseOptionsSchema);

export const trudeskBlockSchema = blockBaseSchema.merge(
    z.object({
      type: z.enum([IntegrationBlockType.TRUDESK]),
      options: z.discriminatedUnion('task', [
        initialOptionsSchema ,
        createTicketOptionsSchema ,
        createNoteOptionsSchema ,
        updateAssigneeAndGroupSchema ,
        updateTagsSchema ,
        updatePrioritySchema ,
        updateStatusSchema ,
        createCustomerSchema
        
      ]),
    })
  )
  
  export type TrudeskCredentials = z.infer<typeof trudeskCredentialsSchema>
  export type TrudeskBlock = z.infer<typeof trudeskBlockSchema>  
