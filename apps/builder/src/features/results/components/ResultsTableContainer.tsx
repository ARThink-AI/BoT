// import { Stack } from '@chakra-ui/react'
// import React, { useEffect, useState } from 'react'
// import { LogsModal } from './LogsModal'
// import { useTypebot } from '@/features/editor/providers/TypebotProvider'
// import { useResults } from '../ResultsProvider'
// import { ResultModal } from './ResultModal'
// import { ResultsTable } from './table/ResultsTable'
// import { useRouter } from 'next/router'

// export const ResultsTableContainer = () => {
//   const { query } = useRouter()
//   const {
//     flatResults: results,
//     fetchNextPage,
//     hasNextPage,
//     resultHeader,
//     tableData,
//   } = useResults()
//   const { typebot, publishedTypebot } = useTypebot()
//   const [inspectingLogsResultId, setInspectingLogsResultId] = useState<
//     string | null
//   >(null)
//   const [expandedResultId, setExpandedResultId] = useState<string | null>(null)

//   const handleLogsModalClose = () => setInspectingLogsResultId(null)

//   const handleResultModalClose = () => setExpandedResultId(null)

//   const handleLogOpenIndex = (index: number) => () => {
//     if (!results[index]) return
//     setInspectingLogsResultId(results[index].id)
//   }

//   const handleResultExpandIndex = (index: number) => () => {
//     if (!results[index]) return
//     setExpandedResultId(results[index].id)
//   }

//   useEffect(() => {
//     if (query.id) setExpandedResultId(query.id as string)
//   }, [query.id])

//   return (
//     <Stack pb="28" px={['4', '0']} spacing="4" maxW="1600px" w="full">
//       {publishedTypebot && (
//         <LogsModal
//           typebotId={publishedTypebot?.typebotId}
//           resultId={inspectingLogsResultId}
//           onClose={handleLogsModalClose}
//         />
//       )}
//       <ResultModal
//         resultId={expandedResultId}
//         onClose={handleResultModalClose}
//       />

//       {typebot && (
//         <ResultsTable
//           preferences={typebot.resultsTablePreferences ?? undefined}
//           resultHeader={resultHeader}
//           data={tableData}
//           onScrollToBottom={fetchNextPage}
//           hasMore={hasNextPage}
//           onLogOpenIndex={handleLogOpenIndex}
//           onResultExpandIndex={handleResultExpandIndex}
//         />
//       )}
//     </Stack>
//   )
// }
// import React, { useEffect, useState } from 'react'
// import { Stack, Button, Input, HStack } from '@chakra-ui/react'
// import { useResults } from '../ResultsProvider'
// import { ResultsTable } from './table/ResultsTable'
// import { useRouter } from 'next/router'
// import { useTypebot } from '@/features/editor/providers/TypebotProvider'
// import { LogsModal } from './LogsModal'
// import { ResultModal } from './ResultModal'

// export const ResultsTableContainer = () => {
//   const { query } = useRouter()
//   const {
//     flatResults: results,
//     fetchNextPage,
//     hasNextPage,
//     resultHeader,
//     tableData,
//     startDate,
//     endDate,
//     setStartDate,
//     setEndDate,
//     refetchResults,
//   } = useResults()
//   const { typebot, publishedTypebot } = useTypebot()
//   const [inspectingLogsResultId, setInspectingLogsResultId] = useState<string | null>(null)
//   const [expandedResultId, setExpandedResultId] = useState<string | null>(null)

//   const handleLogsModalClose = () => setInspectingLogsResultId(null)
//   const handleResultModalClose = () => setExpandedResultId(null)

//   const handleLogOpenIndex = (index: number) => () => {
//     if (!results[index]) return
//     setInspectingLogsResultId(results[index].id)
//   }

//   const handleResultExpandIndex = (index: number) => () => {
//     if (!results[index]) return
//     setExpandedResultId(results[index].id)
//   }

//   useEffect(() => {
//     if (query.id) setExpandedResultId(query.id as string)
//   }, [query.id])

//   // useEffect(() => {
//   //   refetchResults()
//   // }, [startDate, endDate, refetchResults])

//   return (
//     <Stack pb="28" px={['4', '0']} spacing="4" maxW="1600px" w="full">
//       {publishedTypebot && (
//         <LogsModal
//           typebotId={publishedTypebot?.typebotId}
//           resultId={inspectingLogsResultId}
//           onClose={handleLogsModalClose}
//         />
//       )}
//       <ResultModal resultId={expandedResultId} onClose={handleResultModalClose} />

//       <HStack spacing="4">
//         <Input
//           type="date"
//           value={startDate ? startDate.toISOString().split('T')[0] : ''}
//           onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
//         />
//         <Input
//           type="date"
//           value={endDate ? endDate.toISOString().split('T')[0] : ''}
//           onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
//         />
//         <Button onClick={() => refetchResults()}>Apply</Button>
//       </HStack>

//       {typebot && (
//         <ResultsTable
//           preferences={typebot.resultsTablePreferences ?? undefined}
//           resultHeader={resultHeader}
//           data={tableData}
//           onScrollToBottom={fetchNextPage}
//           hasMore={hasNextPage}
//           onLogOpenIndex={handleLogOpenIndex}
//           onResultExpandIndex={handleResultExpandIndex}
//         />
//       )}
//     </Stack>
//   )
// }


import React, { useEffect, useState } from 'react'
import { Stack, Button, Input, Card, Flex, FormControl, FormLabel } from '@chakra-ui/react'
import { useResults } from '../ResultsProvider'
import { ResultsTable } from './table/ResultsTable'
import { useRouter } from 'next/router'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { LogsModal } from './LogsModal'
import { ResultModal } from './ResultModal'

export const ResultsTableContainer = () => {
  const { query } = useRouter()
  const {
    flatResults: results,
    fetchNextPage,
    hasNextPage,
    resultHeader,
    tableData,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    refetchResults,
  } = useResults()
  const { typebot, publishedTypebot } = useTypebot()
  const [inspectingLogsResultId, setInspectingLogsResultId] = useState<string | null>(null)
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null)

  // Local state to manage the date input fields
  const [localStartDate, setLocalStartDate] = useState<string>(startDate ? startDate.toISOString().split('T')[0] : '')
  const [localEndDate, setLocalEndDate] = useState<string>(endDate ? endDate.toISOString().split('T')[0] : '')

  const handleLogsModalClose = () => setInspectingLogsResultId(null)
  const handleResultModalClose = () => setExpandedResultId(null)

  const handleLogOpenIndex = (index: number) => () => {
    if (!results[index]) return
    setInspectingLogsResultId(results[index].id)
  }

  const handleResultExpandIndex = (index: number) => () => {
    if (!results[index]) return
    setExpandedResultId(results[index].id)
  }

  useEffect(() => {
    if (query.id) setExpandedResultId(query.id as string)
  }, [query.id])

  // Handle the "Apply" button click
  const handleApplyClick = () => {
    const newStartDate = localStartDate ? new Date(localStartDate) : null
    const newEndDate = localEndDate ? new Date(localEndDate) : null
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    refetchResults()
  }
  const isDateAvailable = localStartDate && localEndDate

  const handleResetDate = () => {

    setLocalStartDate('')
    setLocalEndDate('')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    setStartDate('')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    setEndDate('')
    refetchResults()
  }


  return (
    <Stack pb="28" px={['4', '0']} spacing="4" maxW="1600px" w="full">
      {publishedTypebot && (
        <LogsModal
          typebotId={publishedTypebot?.typebotId}
          resultId={inspectingLogsResultId}
          onClose={handleLogsModalClose}
        />
      )}
      <ResultModal resultId={expandedResultId} onClose={handleResultModalClose} />


      <Card w={'max-content'} p={5} position={'relative'} top={5} left={10} variant={'elevated'}>

        <Flex >
          <Flex gap={2.5} justifyItems={'center'} alignItems={'center'}>
            <FormControl>
              <FormLabel fontSize={'small'} fontFamily={'sans-serif'}>Start Date</FormLabel>

              <Input
                type="date"
                value={localStartDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setLocalStartDate(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize={'small'} fontFamily={'sans-serif'}>End Date</FormLabel>
              <Input
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                min={localStartDate ?? undefined}

              />
            </FormControl>
            <Button w={'100%'} fontSize={'xs'} mt={7} colorScheme='blue' onClick={handleApplyClick} isDisabled={Boolean(!isDateAvailable)}>Apply</Button>
            <Button w={'100%'} fontSize={'xs'} mt={7} colorScheme='blue' onClick={handleResetDate}>Reset</Button>
          </Flex>
        </Flex>
      </Card>



      {typebot && (
        <ResultsTable
          preferences={typebot.resultsTablePreferences ?? undefined}
          resultHeader={resultHeader}
          data={tableData}
          onScrollToBottom={fetchNextPage}
          hasMore={hasNextPage}
          onLogOpenIndex={handleLogOpenIndex}
          onResultExpandIndex={handleResultExpandIndex}
        />
      )}
    </Stack>
  )
}
