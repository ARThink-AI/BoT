// import { trpc } from '@/lib/trpc'

// export const useResultsQuery = ({
//   typebotId,
//   onError,
// }: {
//   typebotId: string
//   onError?: (error: string) => void
// }) => {
//   const { data, error, fetchNextPage, hasNextPage, refetch } =
//     trpc.results.getResults.useInfiniteQuery(
//       {
//         typebotId,
//       },
//       {
//         getNextPageParam: (lastPage) => lastPage.nextCursor,
//       }
//     )

//   if (error && onError) onError(error.message)
//   return {
//     data: data?.pages,
//     isLoading: !error && !data,
//     fetchNextPage,
//     hasNextPage,
//     refetch,
//   }
// }
import { trpc } from '@/lib/trpc'

export const useResultsQuery = ({
  typebotId,
  startDate,
  endDate,
  onError,
}: {
  typebotId: string
  startDate: Date | null
  endDate: Date | null
  onError?: (error: string) => void
}) => {
  const { data, error, fetchNextPage, hasNextPage, refetch } =
    trpc.results.getResults.useInfiniteQuery(
      {
        typebotId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        startDate,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        endDate,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )

  if (error && onError) onError(error.message)
  return {
    data: data?.pages,
    isLoading: !error && !data,
    fetchNextPage,
    hasNextPage,
    refetch,
  }
}
