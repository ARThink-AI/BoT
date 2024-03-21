
import { Text, VStack, Button } from '@chakra-ui/react'
import {
  CardInputOptions,
  cardInputTypes


} from '@typebot.io/schemas'
import React, { ChangeEvent } from 'react'

import { TextInput } from '@/components/inputs'



type Props = {
  options: CardInputOptions
  onOptionsChange: (options: CardInputOptions) => void
}

export const CardInputSettings = ({ options, onOptionsChange }: Props) => {
  const updateHeading = (heading?: string) =>
    onOptionsChange({
      ...options,
      heading,
    })

  const updateSubHeading = (subHeading?: string) =>
    onOptionsChange({
      ...options,
      subHeading,
    })

  const updateInput = (property: string, value: string, index: Number) => {

    onOptionsChange({
      ...options,
      inputs: options.inputs.map((inp, ind) => {
        if (ind != index) return inp
        let modified = { ...options.inputs[ind] };
        // @ts-ignore
        modified[property] = value;
        return modified
      })
    })
  }
  const addInput = () => {
    onOptionsChange({
      ...options,
      inputs: options.inputs.concat({ type: "text", label: "", placeholder: "", dynamicDataVariableId: "", answerVariableId: "" })
    })
  }
  const removeInput = (index: number) => {

    onOptionsChange({
      ...options,
      inputs: options.inputs.filter((inp, i) => i != index)
    })
  }



  return (
    <VStack spacing={4}>
      <Text> Card Settings </Text>
      <TextInput
        label="Card Heading"
        onChange={updateHeading}
        defaultValue={options.heading ?? ''}
        placeholder="Heading..."
        withVariableButton={false}
      />
      <TextInput
        label="Card SubHeading"
        onChange={updateSubHeading}
        defaultValue={options.subHeading ?? ''}
        placeholder="SubHeading..."
        withVariableButton={false}
      />
      {options.inputs.map((input, i) => {

        return (
          <VStack spacing={2} >
            <input
              type="text"
              defaultValue={input?.label ?? ''}
              onChange={(e) => {
                updateInput("label", e.target.value, i)
              }}
            />
            {/* <TextInput
              label="Label"
              // @ts-ignore
              onChange={(e) => {
                updateInput("label", e, i)
              }}
              defaultValue={input?.label ?? ''}
              placeholder="Label..."
              withVariableButton={false}
            /> */}
            <Button onClick={() => removeInput(i)} > Remove </Button>
          </VStack>
        )

      })}
      <Button onClick={addInput} > Add Input </Button>

    </VStack>
  )
}
