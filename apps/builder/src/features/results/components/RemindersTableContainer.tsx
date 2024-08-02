import React, { useEffect, useMemo, useState } from 'react'
import { Flex, Table, Thead, Tbody, Tr, Th, Td, Box, Input, Select } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@udecode/plate-common'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import TimeFilterDropdown from '../helpers/TimeFilterDropdown'
import { defaultTimeFilter, timeFilterValues } from '../api/constants'
import { parseResultHeader } from '@typebot.io/lib/results'
import { LogicBlockType } from '@typebot.io/schemas'
import { convertResultsToTableData } from '../helpers/convertResultsToTableData'




export const RemindersTableContainer = () => {
  const { typebot, publishedTypebot } = useTypebot()
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<(typeof timeFilterValues)[number]>(defaultTimeFilter)
  const [selectedType, setSelectedType] = useState('')

  const { data } = trpc.results.getReminders.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter: selectedTimeFilter

    },
    { enabled: isDefined(publishedTypebot) }
  )
  console.log("reminderssss data", data)

  const linkedTypebotIds =
    publishedTypebot?.groups
      .flatMap((group) => group.blocks)
      .reduce<string[]>(
        (typebotIds, block) =>
          block.type === LogicBlockType.TYPEBOT_LINK &&
            isDefined(block.options.typebotId) &&
            !typebotIds.includes(block.options.typebotId) &&
            block.options.mergeResults !== false
            ? [...typebotIds, block.options.typebotId]
            : typebotIds,
        []
      ) ?? []

  const { data: linkedTypebotsData } = trpc.getLinkedTypebots.useQuery(
    {
      typebotId: typebot?.id as string,
    },
    {
      enabled: linkedTypebotIds.length > 0,
    }
  )


  const resultHeader = useMemo(
    () =>
      publishedTypebot
        ? parseResultHeader(publishedTypebot, linkedTypebotsData?.typebots)
        : [],
    [linkedTypebotsData?.typebots, publishedTypebot]
  )



  // const tableData = useMemo(
  //   () =>
  //     publishedTypebot
  //       ? convertResultsToTableData(
  //         data?.flatMap((d) => d.results) ?? [],
  //         resultHeader
  //       )
  //       : [],
  //   [publishedTypebot, data, resultHeader]
  // )
  const tableData = useMemo(
    () =>
      publishedTypebot
        ? convertResultsToTableData(
          data?.results,
          resultHeader
        )
        : [],
    [publishedTypebot, data, resultHeader]
  )

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value)

  }

  console.log("tabledataaaaaaa", tableData)
  console.log("headerssssss", resultHeader)

  // const generateTableHTML = (resultHeader: any[], data: any[]) => {
  //   const headerHTML = resultHeader.map(header => `<th>${header.label}</th>`).join('');
  //   const rowsHTML = data.map(row => {
  //     const cellsHTML = resultHeader.map(header => `<td>${row[header.id] || ''}</td>`).join('');
  //     return `<tr>${cellsHTML}</tr>`;
  //   }).join('');

  //   return `
  //     <table style="width: 100%; border-collapse: collapse;">
  //       <thead>
  //         <tr>${headerHTML}</tr>
  //       </thead>
  //       <tbody>${rowsHTML}</tbody>
  //     </table>
  //   `;
  // };

  // const htmlTable = generateTableHTML(resultHeader, tableData);
  const types = [
    {
      'label': 'Email'
    }
  ]

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <TypebotHeader />
      <h1 style={{ textAlign: 'center' }}>Reminders</h1>
      {/* <TimeFilterDropdown
        selectedTimeFilter={selectedTimeFilter}
        onChange={setSelectedTimeFilter}
        placeholder="Choose a time filter"
      /> */}

      <Box mx={'auto'} w={'max-content'} p={4}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Frequency</Th>
              <Th>Typebot ID</Th>
              <Th>Email</Th>
              {/* <Th>Created At</Th>
              <Th>Updated At</Th> */}
            </Tr>
          </Thead>
          <Tbody>

            <Tr >
              <Td>
                <Select onChange={handleTypeChange} value={selectedType}>
                  {types.map((type) => (<option>{type.label}</option>)
                  )}
                </Select>
              </Td>
              <Td>
                <TimeFilterDropdown
                  selectedTimeFilter={selectedTimeFilter}
                  onChange={setSelectedTimeFilter}
                  placeholder="Choose a frequency"
                />
              </Td>
              <Td>{typebot?.id}</Td>
              <Td><Input placeholder='Please enter your email' type='email' /></Td>
              {/* <Td>{ }</Td>
              <Td>{ }</Td> */}
            </Tr>

          </Tbody>
        </Table>
      </Box>


    </Flex>
  )
}