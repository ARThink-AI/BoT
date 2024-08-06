// import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack , Select , Text } from '@chakra-ui/react'
import {
  BarCodeInputOptions ,
  
  Variable,
  
} from '@typebot.io/schemas'
import React , { ChangeEvent } from 'react'

const types = [ { label : "Camera" , value : "camera" } , { label : "Bar Code" , value : "barCode" } , { label:  "QR Code" , value: "qrCode"} ]

type Props = {
  options: BarCodeInputOptions
  onOptionsChange: (options: BarCodeInputOptions) => void
}

export const BarCodeInputSettings = ({ options, onOptionsChange }: Props) => {
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
    const updateType = (e : ChangeEvent<HTMLSelectElement> ) => {
    //  console.log("modeee",mode);
     onOptionsChange({
      ...options,
      mode : e?.target?.value ,
    })
    }
    

  return (
    <Stack spacing={4}>
      <Stack>
          <Text>Type :</Text>
          <Select
            placeholder="Select option"
            value={options.mode}
            onChange={updateType}
          >
            {types.map((currency) => (
              <option value={currency.value} key={currency.value}>
                {currency.label}
              </option>
            ))}
          </Select>
        </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
