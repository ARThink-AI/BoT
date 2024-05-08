import {
  SessionState,
  VariableWithValue,
  CardInputBlock,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'

export const injectVariableValuesInCardInputBlock =
  (state: SessionState) =>
  (block: CardInputBlock): CardInputBlock => {
    const { variables } = state.typebotsQueue[0].typebot
    let updatedBlock = { ...block }
    for (let i = 0; i < updatedBlock.options.inputs.length; i++) {
      if (updatedBlock.options.inputs[i].dynamicDataVariableId) {
        const variable = variables.find(
          (variable) =>
            variable.id ===
              updatedBlock.options.inputs[i].dynamicDataVariableId &&
            isDefined(variable.value)
        ) as VariableWithValue | undefined
        if (variable) {
          updatedBlock.options.inputs[i] = {
            ...updatedBlock.options.inputs[i],
            // @ts-ignore
            values: variable.value,
          }
        }
      }

      if (updatedBlock.options.inputs[i].defaultValue) {
        const variable = variables.find(
          (variable) =>
            variable.id === updatedBlock.options.inputs[i].defaultValue &&
            isDefined(variable.value)
        ) as VariableWithValue | undefined
        if (variable) {
          updatedBlock.options.inputs[i] = {
            ...updatedBlock.options.inputs[i],
            // @ts-ignore
            default: variable.value,
          }
        }
      }
    }
    return updatedBlock
  }
