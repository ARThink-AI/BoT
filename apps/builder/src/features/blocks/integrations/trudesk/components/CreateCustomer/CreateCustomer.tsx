import React from "react";
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { VStack, FormLabel } from '@chakra-ui/react';
import { Variable } from '@typebot.io/schemas'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const CreateCustomer = ({ options, onOptionsChange }) => {
  const handleVariableNameChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableNameId: variable?.id
    })
  }

  const handleVariableEmailChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableEmailId: variable?.id
    })
  }
  const handleVariablePhoneChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variablePhoneId: variable?.id
    })
  }

  const handleVariableAddressChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableAddressId: variable?.id
    })
  }
  const handleVariableCustomerIdChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      variableCustomerId: variable?.id
    })
  }


  return (
    <VStack spacing={4} align={"stretch"} >
      <VStack spacing={1} >
        <FormLabel> Customer Name  variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableNameChange}
          placeholder="Search for a name  variable"
          initialVariableId={options?.variableNameId}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel> Customer Email   variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableEmailChange}
          placeholder="Search for a email   variable"
          initialVariableId={options?.variableEmailId}
        />
      </VStack>

      <VStack spacing={1} >
        <FormLabel> Customer Phone   variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariablePhoneChange}
          placeholder="Search for a phone  variable"
          initialVariableId={options?.variablePhoneId}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel> Customer Address    variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableAddressChange}
          placeholder="Search for a address  variable"
          initialVariableId={options?.variableAddressId}
        />
      </VStack>
      <VStack spacing={1} >
        <FormLabel> Save Customer Id in variable</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableCustomerIdChange}
          placeholder="Search for a customerId  variable"
          initialVariableId={options?.variableCustomerId}
        />
      </VStack>
    </VStack>
  )
}