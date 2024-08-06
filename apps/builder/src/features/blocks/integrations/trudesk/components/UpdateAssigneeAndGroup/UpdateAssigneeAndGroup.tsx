import React, { ChangeEvent } from "react";
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'

import { VStack, FormLabel, Select as S } from '@chakra-ui/react';

import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { Variable } from '@typebot.io/schemas'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const UpdateAssigneeAndGroup = ({ options, onOptionsChange }) => {
  const { workspace } = useWorkspace();
  const { showToast } = useToast();
  const { data: tickettypesdata } = trpc.trudesk.listTicketTypes.useQuery(
    {
      credentialsId: options?.credentialsId,
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onError: (error) => {
        showToast({
          description: error.message,
          status: 'error',
        })
      },
    }
  );
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId: variable?.id
    })
  }
  const handleVariableChange1 = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId1: variable?.id
    })
  }
  const handleAssigneeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      assignee: e.target.value
    })
  }
  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      group: e.target.value
    })
  }
  return tickettypesdata && (
    <VStack spacing={4} align={"stretch"} >

      <VStack spacing={1} >
        <FormLabel>Pick TicketId variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel>Pick Ticket Uid variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange1}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId1}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel> Update  Assignee   </FormLabel>
        <S
          placeholder="Select Assignee"
          value={options?.assignee}
          onChange={handleAssigneeChange}
        >
          {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */ }
          {tickettypesdata?.users?.map(usr => {
            return (
              <option value={usr.id} key={usr.id}>
                {usr.name}
              </option>
            )
          })}
        </S>

      </VStack>
      <VStack spacing={1} >
        <FormLabel>Update Group </FormLabel>
        <S
          placeholder="Select Group"
          value={options?.group}
          onChange={handleGroupChange}
        >
          {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore */ }
          {tickettypesdata?.groups?.map(usr => {
            return (
              <option value={usr.id} key={usr.id}>
                {usr.name}
              </option>
            )
          })}
        </S>



      </VStack>
    </VStack>
  )
}