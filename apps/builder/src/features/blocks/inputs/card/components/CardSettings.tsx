
import { Text, VStack, Stack, Button, Checkbox } from '@chakra-ui/react'
import {
  CardInputOptions,
  Variable,
  cardInputTypes


} from '@typebot.io/schemas'
import React from 'react'

import { TextInput } from '@/components/inputs'

import { createId } from '@paralleldrive/cuid2'
import { Select, FormLabel } from "@chakra-ui/react";
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'

type Props = {
  options: CardInputOptions
  onOptionsChange: (options: CardInputOptions) => void
}

export const CardInputSettings = ({ options, onOptionsChange }: Props) => {
  console.log("options input", options.inputs);
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

  const updateInput = (property: string, value: string, index: number) => {

    onOptionsChange({
      ...options,
      inputs: options.inputs.map((inp, ind) => {
        if (ind != index) return inp
        const modified = { ...options.inputs[ind] };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        modified[property] = value;
        return modified
      })
    })
  }
  const addInput = () => {
    onOptionsChange({
      ...options,
      inputs: options.inputs.concat({ id: createId(), type: "text", label: "", placeholder: "", dynamicDataVariableId: "", answerVariableId: "" })
    })
  }
  const removeInput = (index: number) => {
    const inputs = [...options.inputs];
    inputs.splice(index, 1)
    onOptionsChange({
      ...options,
      inputs: inputs
    })
  }
  // const handleVariableChange = (variable?: Variable) =>

  //   onOptionsChange({ ...options, variableId: variable?.id })



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
          <VStack spacing={2} key={i} >
            <VStack spacing={1} >
              <FormLabel> Input type </FormLabel>
              <Select

                placeholder="Select Type"
                value={input?.type}
                onChange={(e) => {
                  updateInput("type", e.target.value, i)
                }}
              >
                {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore */ }
                {cardInputTypes.map(usr => {
                  return (
                    <option value={usr} key={usr}>
                      {usr}
                    </option>
                  )
                })}
              </Select>
            </VStack>
            <TextInput
              key={input.id + "label"}
              label="Label"
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={(e) => {
                updateInput("label", e, i)
              }}
              defaultValue={input?.label ?? ''}
              placeholder="Label..."
              withVariableButton={false}
            />
            <TextInput
              key={input.id + "placeholder"}
              label="Placeholder"
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={(e) => {
                updateInput("placeholder", e, i)
              }}
              defaultValue={input?.placeholder ?? ''}
              placeholder="Placeholder..."
              withVariableButton={false}
            />
            <Stack spacing={2} flexDirection={"row"} >
              <Checkbox
                key={input.id + "checkbox"}
                defaultChecked={input?.required ?? false}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  updateInput("required", e.target.checked, i)
                }}
              />
              <Text> Required  </Text>
            </Stack>

            {input.type != "text" && input.type != "email" && input.type != "phone" && input.type != "textarea" &&
              <VStack spacing={1} >
                <FormLabel> Load dynamic data from variable</FormLabel>
                <VariableSearchInput
                  key={input.id + "dynamicDataVariableId"}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  onSelectVariable={(v: Variable) => updateInput("dynamicDataVariableId", v?.id, i)}
                  placeholder="Search for a variable"
                  initialVariableId={input?.dynamicDataVariableId}
                />
              </VStack>
            }
            <VStack spacing={1} >
              <FormLabel>  Save answer  </FormLabel>
              <VariableSearchInput
                key={input.id + "answerVariableId"}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                onSelectVariable={(v: Variable) => updateInput("answerVariableId", v?.id, i)}
                placeholder="Search for a variable"
                initialVariableId={input?.answerVariableId}
              />
            </VStack>
            <Button onClick={() => removeInput(i)} > Remove </Button>
          </VStack>
        )

      })}
      <Button onClick={addInput} > Add Input </Button>

      {/* <Stack>

        <FormLabel mb="0" htmlFor="variable">

          Save status  in a variable:

        </FormLabel>

        <VariableSearchInput

          initialVariableId={options.variableId}

          onSelectVariable={handleVariableChange}

        />

      </Stack> */}

    </VStack>
  )
}
