import React, { useState } from "react";
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'

import { VStack, FormLabel } from '@chakra-ui/react';
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { Variable } from '@typebot.io/schemas'
import Select from 'react-select';

// @ts-ignore
export const UpdateTags = ({ options, onOptionsChange }) => {
  const [selectedOption, setSelectedOption] = useState(
    options?.tags ? options?.tags.map((t: { id: string, name: string, normalized: string }) => {
      return {
        label: t.name,
        value: t.id
      }
    }) : null
  );
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


  const handleTagsChange = (tags: [{ label: string, value: string }]) => {

    let tagsSelected = tags.map((t: { label: string, value: string }) => {
      return tickettypesdata?.tags?.filter(tp => tp.id == t.value)[0]
    });

    onOptionsChange({
      ...options,
      tags: tagsSelected
    })
    setSelectedOption(tags);

  }

  return (
    <VStack spacing={4} align={"stretch"} >
      <VStack spacing={1} >
        <FormLabel>Update tags  </FormLabel>
        <Select
          theme={(theme) => ({
            ...theme,
            borderRadius: 0,
            colors: {
              ...theme.colors,
              primary25: 'hotpink',
              primary: 'black',
              neutral0: "black"
            },
          })}

          isMulti
          defaultValue={selectedOption}
          // @ts-ignore
          onChange={handleTagsChange}
          options={tickettypesdata?.tags?.map(t => {
            return {
              label: t.name,
              value: t.id
            }
          })}
        />

      </VStack>
      <VStack spacing={1} >
        <FormLabel>Pick TicketId variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId}
        />
      </VStack>

      <VStack spacing={1} >
        <FormLabel>Pick TicketUID  variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange1}
          placeholder="Search for a variable"
          initialVariableId={options?.variableId1}
        />
      </VStack>

    </VStack>
  )
}