import {
  startOfDay,
  subDays,
  startOfYear,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns'

export const timeFilterValues = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  // 'monthToDate',
  // 'lastMonth',
  // 'yearToDate',
  // 'allTime',
] as const

export const timeFilterLabels: Record<
  (typeof timeFilterValues)[number],
  string
> = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  // monthToDate: 'Month to date',
  // lastMonth: 'Last month',
  // yearToDate: 'Year to date',
  // allTime: 'All time',
}

export const defaultTimeFilter = 'DAILY' as const

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
