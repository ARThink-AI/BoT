import {
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stats } from '@typebot.io/schemas'
import React from 'react'
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
  const { typebot, publishedTypebot } = useTypebot()
  const { data } = trpc.analytics.getTotalAnswersInBlocks.useQuery(
    {
      typebotId: typebot?.id as string,
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
  console.log("data blockkkkkk", blocks)

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


  const summary = summarizeCounts(blocks, counts);
  console.log("summary data based on input type..", summary)

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
      <AnalyticChart data={summary} multipleSelect={data?.totalContentInBlock} rating={data?.totalRatingInput} />
    </Flex >
  )
}
