import React, { ChangeEvent } from "react";

import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'


import { VStack, FormLabel, Select as S, Stack } from '@chakra-ui/react';
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { Variable } from '@typebot.io/schemas'

// @ts-ignore
export const UpdateStatus = ({ options, onOptionsChange }) => {
  const { workspace } = useWorkspace();
  const { showToast } = useToast();
  const { data: tickettypesdata } = trpc.trudesk.listTicketTypes.useQuery(
    {
      credentialsId: options?.credentialsId,
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace,
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
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onOptionsChange({
      ...options,
      status: e.target.value
    })
  }
  return (
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
        <FormLabel>Pick TicketUID variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange1}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId1}
        />
      </VStack>


      <VStack spacing={1} >
        <FormLabel>Update Status </FormLabel>
        <S

          placeholder="Select Status"
          value={options?.status}
          onChange={handleStatusChange}
        >
          {tickettypesdata?.status?.map(usr => {
            return (
              <option value={usr.id} key={usr.id}>
                {usr.name}
              </option>
            )
          })}
        </S>


      </VStack>

    </VStack >
  )
}