import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure, publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { ResultWithAnswers } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
  timeFilterValues,
} from './constants' // Update import path if necessary

export const getReminders = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/reminders',
      protect: true,
      summary: 'List results ordered by descending creation date',
      tags: ['Reminders'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      timeFilter: z.enum(timeFilterValues).default('DAILY').optional(),
    })
  )
  .query(async ({ input, ctx: { user } }) => {
    const { timeFilter } = input

    // Calculate start and end dates based on timeFilter
    const adjustedStartDate = parseFromDateFromTimeFilter(timeFilter)
    const adjustedEndDate = parseToDateFromTimeFilter(timeFilter)

    const typebot = await prisma.typebot.findUnique({
      where: {
        id: input.typebotId,
      },
      select: {
        id: true,
        workspaceId: true,
        groups: true,
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    })

    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const results = (await prisma.result.findMany({
      where: {
        typebotId: typebot.id,
        hasStarted: true,
        isArchived: false,
        createdAt: {
          ...(adjustedStartDate ? { gte: adjustedStartDate } : {}),
          ...(adjustedEndDate ? { lte: adjustedEndDate } : {}),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { answers: true },
    })) as ResultWithAnswers[]

    return { results }
  })
