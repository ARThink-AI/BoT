import React from "react";
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { VStack, FormLabel } from '@chakra-ui/react';
import { Variable } from '@typebot.io/schemas'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const CreateNote = ({ options, onOptionsChange }) => {
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId1: variable?.id
    })
  }
  const handleNoteVariableChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableId2: variable?.id
    })
  }

  return (
    <VStack spacing={4} align={"stretch"} >
      <VStack spacing={1} >
        <FormLabel> Pick TicketId variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Search for a ticketid  variable"
          initialVariableId={options?.variableId1}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel> Pick Note variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleNoteVariableChange}
          placeholder="Search for a note  variable"
          initialVariableId={options?.variableId2}
        />
      </VStack>
    </VStack>
  )
}