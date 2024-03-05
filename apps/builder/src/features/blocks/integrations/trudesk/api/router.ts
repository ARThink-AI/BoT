import { router } from '@/helpers/server/trpc'
import { listTicketTypes } from './listtickettypes'
export const trudeskRouter = router({
  listTicketTypes : listTicketTypes
})

