import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { PublicTypebot } from '@typebot.io/schemas'
import { z } from 'zod'
import { canReadTypebots } from '@/helpers/databaseRules'
import {
  totalAnswersInBlock,
  totalContentInBlock,
} from '@typebot.io/schemas/features/analytics'

export const getTotalAnswersInBlocks = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/analytics/totalAnswersInBlocks',
      protect: true,
      summary: 'List total answers in blocks',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
    })
  )
  .output(
    z.object({
      totalAnswersInBlocks: z.array(totalAnswersInBlock),
      totalContentInBlock: z.array(totalContentInBlock),
    })
  )
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { publishedTypebot: true },
    })
    if (!typebot?.publishedTypebot)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Published typebot not found',
      })

    const publishedTypebot = typebot.publishedTypebot as PublicTypebot

    const totalAnswersPerBlock = await prisma.answer.groupBy({
      by: ['itemId', 'blockId'],
      where: {
        result: {
          typebotId: typebot.publishedTypebot.typebotId,
        },
        blockId: {
          in: publishedTypebot.groups.flatMap((group) =>
            group.blocks.map((block) => block.id)
          ),
        },
      },

      _count: { _all: true },
    })

    const totalAnswersPerContent = await prisma.answer.groupBy({
      by: ['blockId', 'content'],
      where: {
        content: {
          notIn: ['Hi!'],
        },
        result: {
          typebotId: typebot.publishedTypebot.typebotId,
        },
        blockId: {
          in: publishedTypebot.groups.flatMap((group) =>
            group.blocks
              .filter((block) => block.type === 'choice input')
              .map((block) => block.id)
          ),
        },
      },
      _count: {
        _all: true,
        // Count the number of answers
      },
    })

    // const aggregations = await prisma.answer.aggregate({
    //   where: {
    //     result: {
    //       typebotId: typebot.publishedTypebot.typebotId,
    //     },
    //     blockId: {
    //       in: publishedTypebot.groups.flatMap((group) =>
    //         group.blocks
    //           .filter((block) => block.type === 'choice input')
    //           .map((block) => block.id)
    //       ),
    //     },
    //   },
    //   _count: {
    //     _all: true,
    //   },
    // })
    // console.log('count aggregations', totalAnswersPerContent)

    // console.log('answer content', totalAnswersPerContent)

    // function getTotalCounts(data) {
    //   const contentTotals = {}

    //   data.forEach((item) => {
    //     const contents = item.content
    //       .split(',')
    //       .map((content) => content.trim())

    //     contents.forEach((content) => {
    //       if (!contentTotals[content]) {
    //         contentTotals[content] = 0
    //       }
    //       contentTotals[content] += item._count._all
    //     })
    //   })

    //   return contentTotals
    // }

    // // Get the total counts for each unique content type
    // const totalCounts = getTotalCounts(totalAnswersPerContent)

    // console.log(totalCounts)

    const inputType = [
      'choice input',
      'number input',
      'email input',
      'date input',
      'phone number input',
      'text input',
      'url input',
    ]

    // const totalAnswersPerInputTypes = await prisma.answer.groupBy({
    //   by: ['blockId', 'content'], // Group by blockId and content
    //   where: {
    //     result: {
    //       typebotId: typebot.publishedTypebot.typebotId,
    //     },
    //     blockId: {
    //       in: publishedTypebot.groups.flatMap((group) =>
    //         group.blocks
    //           .filter((block) => inputType.includes(block.type))
    //           .map((block) => block.id)
    //       ),
    //     },
    //   },
    //   _count: {
    //     _all: true,
    //     // Count the number of answers
    //   },
    // })

    // function getTotalCounts(totalAnswersPerInputTypes) {
    //   const contentTotals = {}

    //   totalAnswersPerInputTypes.forEach((item) => {
    //     const contents = item.content
    //       .split(',')
    //       .map((content) => content.trim())

    //     contents.forEach((content) => {
    //       if (!contentTotals[content]) {
    //         contentTotals[content] = 0
    //       }
    //       contentTotals[content] += item._count._all
    //     })
    //   })

    //   return contentTotals
    // }

    // // Get the total counts for each unique content type
    // const totalCounts = getTotalCounts(totalAnswersPerInputTypes)

    // console.log('base on type', totalCounts)

    const totalAnswersInputPerBlock = await prisma.answer.groupBy({
      by: ['itemId', 'blockId'],
      where: {
        result: {
          typebotId: typebot.publishedTypebot.typebotId,
        },
        blockId: {
          in: publishedTypebot.groups.flatMap((group) =>
            group.blocks.map((block) => block.id)
          ),
        },
      },

      _count: { _all: true },
    })

    return {
      totalAnswersInBlocks: totalAnswersPerBlock.map((answer) => ({
        blockId: answer.blockId,
        itemId: answer.itemId ?? undefined,
        total: answer._count._all,
      })),
      totalContentInBlock: totalAnswersPerContent.map((answer) => ({
        blockId: answer.blockId,
        content: answer.content,
        total: answer._count._all,
      })),
    }
  })
