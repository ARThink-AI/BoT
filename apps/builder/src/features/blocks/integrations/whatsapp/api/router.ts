import { router } from '@/helpers/server/trpc'
import { listMessageTemplates } from './listMessageTemplates';

export const WhatsappRouter = router({
  listMessageTemplates: listMessageTemplates
});