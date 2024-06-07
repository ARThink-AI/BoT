
import { Text, VStack, Stack, Button, Checkbox } from '@chakra-ui/react'
import {
  CardInputOptions,
  Variable,
  cardInputTypes


} from '@typebot.io/schemas'
import React from 'react'
import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'

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

  const updateVoiceFill = (isVoiceFill: boolean) =>
    onOptionsChange({
      ...options,
      isVoiceFill,
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
      inputs: options.inputs.concat({
        id: createId(), type: "text", label: "", placeholder: "", dynamicDataVariableId: "", answerVariableId: "", buttonType: 'Numbers',
        length: 10,
        labels: { button: "Send" },
        customIcon: { isEnabled: false },
      })
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
      <SwitchWithLabel
        label="Voice Fill Card"
        initialValue={options.isVoiceFill ?? false}
        onCheckChange={updateVoiceFill}
        moreInfoContent="Inputs are automatically filled using voice to speech"
      />
      {options.inputs.map((input, i) => {
        if (input.type == "rating") {
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
              <Stack>
                <FormLabel mb="0" htmlFor="button">
                  Maximum:
                </FormLabel>
                <DropdownList
                  onItemSelect={(val) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    updateInput("length", val, i)
                  }}
                  items={[3, 4, 5, 6, 7, 8, 9, 10]}
                  currentItem={input?.length}
                />
              </Stack>
              <Stack>
                <FormLabel mb="0" htmlFor="button">
                  Type:
                </FormLabel>
                <DropdownList
                  onItemSelect={(val) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    updateInput("buttonType", val, i)
                  }}
                  items={['Icons', 'Numbers'] as const}
                  currentItem={input?.buttonType}
                />
              </Stack>
              {input?.buttonType === 'Icons' && (
                <SwitchWithLabel
                  label="Custom icon?"
                  initialValue={input?.customIcon?.isEnabled ?? false}
                  onCheckChange={(val) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore

                    updateInput("customIcon", { ...input.customIcon, isEnabled: val }, i)
                  }}
                />
              )}
              {input?.buttonType === 'Icons' && input?.customIcon?.isEnabled && (
                <TextInput
                  label="Icon SVG:"
                  defaultValue={input?.customIcon.svg}
                  onChange={(val) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore

                    updateInput("customIcon", { ...input.customIcon, svg: val }, i)
                  }}
                  placeholder="<svg>...</svg>"
                />
              )}
              <TextInput
                label={`${input.buttonType === 'Icons' ? '1' : '0'} label:`}
                defaultValue={input?.labels?.left}
                onChange={(val) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore

                  updateInput("labels", { ...input.labels, left: val }, i)
                }}
                placeholder="Not likely at all"
              />
              <TextInput
                label={`${input.length} label:`}
                defaultValue={input?.labels?.right}
                onChange={(val) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore

                  updateInput("labels", { ...input.labels, right: val }, i)
                }}
                placeholder="Extremely likely"
              />
              <SwitchWithLabel
                label="One click submit"
                moreInfoContent='If enabled, the answer will be submitted as soon as the user clicks on a rating instead of showing the "Send" button.'
                initialValue={input.isOneClickSubmitEnabled ?? false}
                onCheckChange={(val) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  updateInput("isOneClickSubmitEnabled", val, i)
                }}
              />
              {!input.isOneClickSubmitEnabled && (
                <TextInput
                  label="Button label:"
                  defaultValue={input?.labels?.button}
                  onChange={(val) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore

                    updateInput("labels", { ...input.labels, button: val }, i)
                  }}
                />
              )}
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

        } else {
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

              {/* {input.type != "text" && input.type != "email" && input.type != "phone" && input.type != "textarea" && */}
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
              {/* } */}
              {(input.type == "dropdown" || input.type == "checkbox" || input.type == "radio") && (
                <VStack spacing={1} >
                  <FormLabel> Default Value from variable</FormLabel>
                  <VariableSearchInput
                    key={input.id + "defaultValue"}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore

                    onSelectVariable={(v: Variable) => updateInput("defaultValue", v?.id, i)}
                    placeholder="Search for a variable"
                    initialVariableId={input?.defaultValue}
                  />
                </VStack>
              )}
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
        }


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
