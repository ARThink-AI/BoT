import {
  SessionState,
  VariableWithValue,
  ChoiceInputBlock,
  ItemType,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { filterChoiceItems } from './filterChoiceItems'
import { deepParseVariables } from '../../../variables/deepParseVariables'
import { transformStringVariablesToList } from '../../../variables/transformVariablesToList'
import { updateVariablesInSession } from '../../../variables/updateVariablesInSession'

export const injectVariableValuesInButtonsInputBlock =
  (state: SessionState) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
    const { variables } = state.typebotsQueue[0].typebot
    if (block.options.dynamicVariableId) {
      const variable = variables.find(
        (variable) =>
          variable.id === block.options.dynamicVariableId &&
          isDefined(variable.value)
      ) as VariableWithValue | undefined
      if (!variable) return block;
      

      const value = getVariableValue(state)(variable)
      return {
        ...block,
        items: value.filter(isDefined).map((item, idx) => ({
          id: idx.toString(),
          type: ItemType.BUTTON,
          blockId: block.id,
          content: item,
        })),
      }
    }
    return deepParseVariables(variables)(filterChoiceItems(variables)(block))
  }

const getVariableValue =
  (state: SessionState) =>
  (variable: VariableWithValue): (string | null)[] => {
    if (!Array.isArray(variable.value)) {
      const { variables } = state.typebotsQueue[0].typebot
      const [transformedVariable] = transformStringVariablesToList(variables)([
        variable.id,
      ])
      
      updateVariablesInSession(state)([transformedVariable])
      return transformedVariable.value as string[]
    }
   
    return variable.value
  }
