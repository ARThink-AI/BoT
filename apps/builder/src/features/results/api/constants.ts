import {
  startOfDay,
  subDays,
  startOfYear,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns'

export const timeFilterValues = [
  'today',
  'last7Days',
  'last30Days',
  // 'monthToDate',
  // 'lastMonth',
  // 'yearToDate',
  // 'allTime',
] as const

export const timeFilterLabels: Record<
  (typeof timeFilterValues)[number],
  string
> = {
  today: 'Today',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  // monthToDate: 'Month to date',
  // lastMonth: 'Last month',
  // yearToDate: 'Year to date',
  // allTime: 'All time',
}

export const defaultTimeFilter = 'last7Days' as const

export const parseFromDateFromTimeFilter = (
  timeFilter: (typeof timeFilterValues)[number]
): Date | null => {
  const now = new Date()

  switch (timeFilter) {
    case 'today':
      return startOfDay(now)
    case 'last7Days':
      return subDays(startOfDay(now), 6)
    case 'last30Days':
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
    case 'last30Days':
    case 'last7Days':
    case 'today':
      // case 'monthToDate':
      // case 'yearToDate':
      return null
  }
}
