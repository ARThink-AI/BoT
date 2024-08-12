import { router } from '@/helpers/server/trpc'
import { deleteResults } from './deleteResults'
import { getResultLogs } from './getResultLogs'
import { getResults } from './getResults'
import { getResult } from './getResult'
import { getReminders } from './getReminders'
import { reminderRouter } from './reminders'

export const resultsRouter = router({
  getResults,
  getResult,
  deleteResults,
  getResultLogs,
  getReminders,
  reminderCreate: reminderRouter.createReminder,
  updateReminder: reminderRouter.updateReminder,
  deleteReminder: reminderRouter.deleteReminder,
  fetchReminders: reminderRouter.getReminders,
})
