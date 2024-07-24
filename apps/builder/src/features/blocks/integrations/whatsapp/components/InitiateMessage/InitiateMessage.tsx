import React from "react";
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { VStack, FormLabel } from '@chakra-ui/react';
import { Variable } from '@typebot.io/schemas'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const InitiateMessage = ({ options, onOptionsChange }) => {


  return (
    <VStack spacing={4} align={"stretch"} >
      <div> Initiate Message Component </div>
    </VStack>
  )
}