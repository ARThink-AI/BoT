import { router } from '@/helpers/server/trpc'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
import { listTicketTypes } from './listtickettypes'
export const trudeskRouter = router({
  listTicketTypes : listTicketTypes
})

