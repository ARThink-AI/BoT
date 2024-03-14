import { router } from '@/helpers/server/trpc'

import { listTicketType } from './listTicketType' 
export const trudeskRouter = router({
  listTicketTypes : listTicketType
})

