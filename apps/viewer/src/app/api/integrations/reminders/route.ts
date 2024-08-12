import { NextResponse } from 'next/dist/server/web/spec-extension/response'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { TranslationServiceClient } from '@google-cloud/translate'
import { SpeechClient } from '@google-cloud/speech'
import { env } from '@typebot.io/env'
import { LogicBlockType, ResultWithAnswers } from '@typebot.io/schemas'
import prisma from '@typebot.io/lib/prisma'
import {
  startOfDay,
  subDays,
  startOfYear,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns'
// import { parseResultHeader } from '@typebot.io/lib/results'
// import { useMemo } from 'react'
// import { isDefined } from '@typebot.io/lib'

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
}
// import { trpc } from '@/lib/trpc'
// const { typebot, publishedTypebot } = useTypebot()

export const timeFilterValues = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  // 'monthToDate',
  // 'lastMonth',
  // 'yearToDate',
  // 'allTime',
] as const

export const parseFromDateFromTimeFilter = (
  timeFilter: (typeof timeFilterValues)[number]
): Date | null => {
  const now = new Date()

  switch (timeFilter) {
    case 'DAILY':
      return startOfDay(now)
    case 'WEEKLY':
      return subDays(startOfDay(now), 6)
    case 'MONTHLY':
      return subDays(startOfDay(now), 29)
    // case 'lastMonth':
    //   return subMonths(startOfMonth(now), 1)
    // case 'monthToDate':
    //   return startOfMonth(now)
    // case 'yearToDate':
    //   return startOfYear(now)
    // case 'allTime':
    // return null
  }
}

export const parseToDateFromTimeFilter = (
  timeFilter: (typeof timeFilterValues)[number]
): Date | null => {
  const now = new Date()

  switch (timeFilter) {
    // case 'lastMonth':
    //   return subMonths(endOfMonth(now), 1)
    // case 'allTime':
    case 'MONTHLY':
    case 'WEEKLY':
    case 'DAILY':
      // case 'monthToDate':
      // case 'yearToDate':
      return null
  }
}

// const linkedTypebotIds =
//     publishedTypebot?.groups
//       .flatMap((group) => group.blocks)
//       .reduce<string[]>(
//         (typebotIds, block) =>
//           block.type === LogicBlockType.TYPEBOT_LINK &&
//             isDefined(block.options.typebotId) &&
//             !typebotIds.includes(block.options.typebotId) &&
//             block.options.mergeResults !== false
//             ? [...typebotIds, block.options.typebotId]
//             : typebotIds,
//         []
//       ) ?? []

// const { data: linkedTypebotsData } = trpc.getLinkedTypebots.useQuery(
//   {
//     typebotId: typebot?.id as string,
//   },
//   {
//     enabled: linkedTypebotIds.length > 0,
//   }
// )

// const resultHeader = useMemo(
//   () =>
//     publishedTypebot
//       ? parseResultHeader(publishedTypebot, linkedTypebotsData?.typebots)
//       : [],
//   [linkedTypebotsData?.typebots, publishedTypebot]
// )

export async function POST(req: Request) {
  try {
    // const { timeFilter } = input
    const { typebotId, timeFilter } = (await req.json()) as {
      typebotId: string
      timeFilter: string
    }

    // Calculate start and end dates based on timeFilter
    const adjustedStartDate = parseFromDateFromTimeFilter(timeFilter)
    const adjustedEndDate = parseToDateFromTimeFilter(timeFilter)

    const typebot = await prisma.typebot.findUnique({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        workspaceId: true,
        variables: true,
        groups: true,
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    })

    if (!typebot) {
      return NextResponse.json(
        { message: 'Error converting text to speech' },
        { status: 500, headers: responseHeaders }
      )
    }

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

    // return { results }
    return NextResponse.json(
      { message: results },
      { status: 200, headers: responseHeaders }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { message: 'Error converting text to speech' },
      { status: 500, headers: responseHeaders }
    )
  }
}
