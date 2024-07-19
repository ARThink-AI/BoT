import {
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
  Input,

  FormLabel,
  Button,

  FormControl,
  Card

} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stats } from '@typebot.io/schemas'
import React, { useState } from 'react'
import { StatsCards } from './StatsCards'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'

import { useI18n } from '@/locales'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@typebot.io/lib'
import { AnalyticChart } from './graphs/components/AnalyticChart'


export const AnalyticsGraphContainer = ({ stats }: { stats?: Stats }) => {
  const t = useI18n()
  const { isOpen, onOpen, onClose } = useDisclosure();
  console.log("on open", onOpen);
  // const [startDate, setStartDate] = useState<Date>(new Date());
  // const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [appliedStartDate, setAppliedStartDate] = useState<string | null>(null);
  const [appliedEndDate, setAppliedEndDate] = useState<string | null>(null);

  const { typebot, publishedTypebot } = useTypebot()
  const { data } = trpc.analytics.getTotalAnswersInBlocks.useQuery(
    {
      typebotId: typebot?.id as string,
      startDate: appliedStartDate ? new Date(appliedStartDate) : undefined,
      endDate: appliedEndDate ? new Date(appliedEndDate) : undefined,
    },
    { enabled: isDefined(publishedTypebot) }
  )
  const startBlockId = publishedTypebot?.groups
    .find((group) => group.blocks.at(0)?.type === 'start')
    ?.blocks.at(0)?.id


  console.log("dataaaaaaaaaa", data)
  // console.log("groupssss", publishedTypebot?.groups)

  const blocks = publishedTypebot?.groups
  const counts = data?.totalAnswersInBlocks
  // function summarizeCounts(blocks: any, counts: any) {
  //   const blockTypes: any = {};

  //   counts.forEach(({ blockId, total }) => {
  //     blocks.forEach(group => {
  //       group.blocks.forEach(block => {
  //         if (block.id === blockId) {
  //           const type = block.type;
  //           if (!blockTypes[type]) {
  //             blockTypes[type] = 0;
  //           }
  //           blockTypes[type] += total;
  //         }
  //       });
  //     });
  //   });

  //   return blockTypes;
  // }

  // const summary = summarizeCounts(blocks, counts);
  // console.log("type based input dataaaaaaa", summary);
  console.log("data blockkkkkk", data?.orderedGroups)

  console.log("start date", startDate)
  console.log("end date", endDate)
  const isDateAvailable = startDate && endDate
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 
  function summarizeCounts(blocks, counts) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 
    const blockTypes = {};
    if (blocks && counts) {
      {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore */ }
      counts.forEach(({ blockId, total }) => {
        {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore */ }
        blocks.forEach(group => {
          {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore */ }
          group.blocks.forEach(block => {
            if (block.id === blockId) {
              const type = block.type;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore 
              if (!blockTypes[type]) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore 
                blockTypes[type] = { total: 0, blocks: [] };
              }
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore 
              blockTypes[type].total += total;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore 
              blockTypes[type].blocks.push({ blockId, total });
            }
          });
        });
      });
    }
    //   const summary = Object.keys(blockTypes).map(type => ({
    //     type: type,
    //     total: blockTypes[type].total
    // }));

    return blockTypes;
  }
  // const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setStartDate(event.target.value);
  // };

  // const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setEndDate(event.target.value);
  // };
  // const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newStartDate = event.target.value;
  //   setStartDate(newStartDate);

  //   if (endDate && new Date(newStartDate) > new Date(endDate)) {
  //     setEndDate(null);
  //   }
  // };

  // const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newEndDate = event.target.value;
  //   if (startDate && new Date(newEndDate) < new Date(startDate)) {
  //     alert('End date cannot be earlier than start date.');
  //   } else if (new Date(newEndDate) > new Date()) {
  //     alert('End date cannot be later than today.');
  //   } else {
  //     setEndDate(newEndDate);
  //   }
  // };
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);

    if (endDate && new Date(newStartDate) > new Date(endDate)) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = event.target.value;
    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      // Handle case where end date is earlier than start date
      setEndDate(null); // Reset end date or provide feedback
    } else if (new Date(newEndDate) > new Date()) {
      // Handle case where end date is later than today
      setEndDate(null); // Reset end date or provide feedback
    } else {
      setEndDate(newEndDate);
    }
  };
  const handleApplyClick = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const summary = summarizeCounts(blocks, counts);
  console.log("summary data based on input type..", summary)
  console.log("available date", Boolean(isDateAvailable))

  return (
    <Flex
      w="full"
      pos="relative"
      bgColor={useColorModeValue('#f4f5f8', 'gray.850')}
      backgroundImage={useColorModeValue(
        'radial-gradient(#c6d0e1 1px, transparent 0)',
        'radial-gradient(#2f2f39 1px, transparent 0)'
      )}
      backgroundSize="40px 40px"
      backgroundPosition="-19px -19px"
      h="full"
      justifyContent="center"
    >
      {publishedTypebot &&
        data?.totalAnswersInBlocks &&
        stats &&
        startBlockId ? (
        <>
        </>
        // <GraphProvider isReadOnly>
        //   <GroupsCoordinatesProvider groups={publishedTypebot?.groups}>
        //     <Graph
        //       flex="1"
        //       typebot={publishedTypebot}
        //       onUnlockProPlanClick={onOpen}
        //       totalAnswersInBlocks={
        //         startBlockId
        //           ? [
        //             {
        //               blockId: startBlockId,
        //               total: stats.totalViews,
        //             },
        //             ...data.totalAnswersInBlocks,
        //           ]
        //           : []
        //       }
        //     />
        //   </GroupsCoordinatesProvider>
        // </GraphProvider>
      ) : (
        <Flex
          justify="center"
          align="center"
          boxSize="full"
          bgColor="rgba(255, 255, 255, 0.5)"
        >
          <Spinner color="gray" />
        </Flex>
      )
      }
      <ChangePlanModal
        onClose={onClose}
        isOpen={isOpen}
        type={t('billing.limitMessage.analytics')}
        excludedPlans={['STARTER']}
      />
      <StatsCards stats={stats} pos="absolute" />
      <AnalyticChart data={data?.orderedGroups} />

      <Card p={5} position={'absolute'} top={5} left={10} variant={'elevated'}>

        <Flex >
          <Flex gap={2.5} >
            <FormControl>
              <FormLabel fontSize={'small'} fontFamily={'sans-serif'}>Start Date</FormLabel>
              <Input onChange={handleStartDateChange} type='date' value={startDate ?? ''} max={new Date().toISOString().split('T')[0]} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize={'small'} fontFamily={'sans-serif'}>End Date</FormLabel>
              <Input onChange={handleEndDateChange} type='date' value={endDate ?? ''} min={startDate ?? undefined} />
            </FormControl>


            <Button fontSize={'xs'} mt={7} colorScheme='blue' isDisabled={Boolean(!isDateAvailable)} onClick={handleApplyClick}>Apply</Button>
          </Flex>

        </Flex>
      </Card>





    </Flex >
  )
}
