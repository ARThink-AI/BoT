// import prisma from '@typebot.io/lib/prisma'
// import { authenticatedProcedure } from '@/helpers/server/trpc'
// import { TRPCError } from '@trpc/server'
// import { ReminderSchema } from '@typebot.io/schemas'
// import { z } from 'zod'

// // Define a schema for the different operations
// const ReminderActionSchema = z.union([
//   z.object({
//     action: z.literal('add'),
//     data: ReminderSchema.omit({ id: true, createdAt: true, updatedAt: true }), // omit fields generated automatically
//   }),
//   z.object({
//     action: z.literal('update'),
//     id: z.string().cuid(),
//     data: ReminderSchema.partial().omit({ id: true, createdAt: true }), // omit fields that should not be updated
//   }),
//   z.object({
//     action: z.literal('delete'),
//     id: z.string().cuid(),
//   }),
// ])

// export const manageReminder = authenticatedProcedure
//   .meta({
//     openapi: {
//       method: 'POST',
//       path: '/reminders',
//       protect: true,
//       summary: 'Manage reminders (add, update, or delete)',
//       tags: ['Reminders'],
//     },
//   })
//   .input(ReminderActionSchema)
//   .mutation(async ({ input }) => {
//     const { action, id, data } = input
//     console.log('hhhgghghghghghgh', await prisma.reminder)

//     try {
//       switch (action) {
//         case 'add':
//           const newReminder = await prisma.reminder.create({
//             data: {
//               ...data,
//               createdAt: new Date(), // automatically set createdAt
//               updatedAt: new Date(), // automatically set updatedAt
//             },
//           })
//           return newReminder

//         case 'update':
//           const updatedReminder = await prisma.reminder.update({
//             where: { id },
//             data: {
//               ...data,
//               updatedAt: new Date(), // automatically update updatedAt
//             },
//           })
//           return updatedReminder

//         case 'delete':
//           await prisma.reminder.delete({
//             where: { id },
//           })
//           return { success: true }

//         default:
//           throw new TRPCError({
//             code: 'BAD_REQUEST',
//             message: 'Invalid action type',
//           })
//       }
//     } catch (error) {
//       if (error instanceof TRPCError) {
//         throw error
//       }
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'An error occurred while managing the reminder',
//       })
//     }
//   })

import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { ReminderSchema } from '@typebot.io/schemas' // Adjust import path as needed
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { TRPCError } from '@trpc/server'
import { canReadTypebots } from '@/helpers/databaseRules'

// const { typebot, publishedTypebot } = useTypebot()

export const reminderRouter = {
  // Create a new reminder
  createReminder: authenticatedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/reminders',
        protect: true,
        summary: 'Create a new reminder',
        tags: ['Reminder'],
      },
    })
    .input(ReminderSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .output(ReminderSchema)
    .mutation(async ({ input }) => {
      const newReminder = await prisma.reminder.create({
        data: input,
      })
      return newReminder
    }),

  // Update an existing reminder
  // updateReminder: authenticatedProcedure
  //   .meta({
  //     openapi: {
  //       method: 'PATCH',
  //       path: '/reminders/{id}',
  //       protect: true,
  //       summary: 'Update an existing reminder',
  //       tags: ['Reminder'],
  //     },
  //   })
  //   .input(
  //     z.object({
  //       id: z.string(),
  //       updates: ReminderSchema.omit({
  //         id: true,
  //         createdAt: true,
  //         updatedAt: true,
  //       }).partial(),
  //     })
  //   )
  //   .output(ReminderSchema)
  //   .mutation(async ({ input: { id, updates } }) => {
  //     const updatedReminder = await prisma.reminder.update({
  //       where: { id },
  //       data: updates,
  //     })
  //     return updatedReminder
  //   }),
  updateReminder: authenticatedProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/reminders/{id}',
        protect: true,
        summary: 'Update an existing reminder',
        tags: ['Reminder'],
      },
    })
    .input(
      z.object({
        id: z.string(),
        updates: ReminderSchema.omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        }),
      })
    )
    .output(ReminderSchema)
    .mutation(async ({ input: { id, updates } }) => {
      const updatedReminder = await prisma.reminder.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(), // Automatically update updatedAt
        },
      })
      return updatedReminder
    }),

  // Delete a reminder
  deleteReminder: authenticatedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/reminders/{id}',
        protect: true,
        summary: 'Delete a reminder',
        tags: ['Reminder'],
      },
    })
    .input(z.string()) // Expects the ID of the reminder to delete
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input: id }) => {
      await prisma.reminder.delete({
        where: { id },
      })
      return { success: true }
    }),

  // getReminders: authenticatedProcedure
  //   .meta({
  //     openapi: {
  //       method: 'GET',
  //       path: '/reminders',
  //       protect: true,
  //       summary: 'Fetch all reminders',
  //       tags: ['Reminder'],
  //     },
  //   })
  //   .input(z.object({ typebotId: z.string() }))
  //   .output(z.array(ReminderSchema))
  //   .query(async () => {
  //     const reminders = await prisma.reminder.findMany({
  //       where: {
  //         typebotId: publishedTypebot?.id,
  //       },
  //     })
  //     // console.log('reminder', reminders)
  //     return reminders
  //   }),
  getReminders: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/reminders/typebot/{typebotId}',
        protect: true,
        summary: 'Get reminders by typebotId',
        tags: ['Reminder'],
      },
    })
    .input(
      z.object({
        typebotId: z.string(),
      })
    )
    .output(z.array(ReminderSchema))
    .query(async ({ input: { typebotId }, ctx: { user } }) => {
      // Check if the user can read typebots
      const typebot = await prisma.typebot.findFirst({
        where: canReadTypebots(typebotId, user),
        select: { publishedTypebot: true },
      })

      if (!typebot) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have access to this typebot',
        })
      }

      // Query reminders based on typebotId and optional date range
      const reminders = await prisma.reminder.findMany({
        where: {
          typebotId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return reminders
    }),
}
