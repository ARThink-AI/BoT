import { byId } from '@typebot.io/lib'
import {
  MakeComBlock,
  PabblyConnectBlock,
  ReplyLog,
  VariableWithUnknowValue,
  WebhookBlock,
  ZapierBlock,
  FlowwiseBlock,
} from '@typebot.io/schemas'
import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'
import { ExecuteIntegrationResponse } from '../../../types'
import { parseVariables } from '../../../variables/parseVariables'
import { updateVariablesInSession } from '../../../variables/updateVariablesInSession'

type Props = {
  state: SessionState
  block:
    | WebhookBlock
    | ZapierBlock
    | MakeComBlock
    | PabblyConnectBlock
    | FlowwiseBlock
  logs?: ReplyLog[]
  response: {
    statusCode: number
    data?: unknown
  }
}

export const resumeWebhookExecution = ({
  state,
  block,
  logs = [],
  response,
}: Props): ExecuteIntegrationResponse => {
  const { typebot } = state.typebotsQueue[0]
  const status = response.statusCode.toString()
  const isError = status.startsWith('4') || status.startsWith('5')

  const responseFromClient = logs.length === 0

  if (responseFromClient)
    logs.push(
      isError
        ? {
            status: 'error',
            description: `Webhook returned error`,
            details: response.data,
          }
        : {
            status: 'success',
            description: `Webhook executed successfully!`,
            details: response.data,
          }
    )

  const newVariables = block.options.responseVariableMapping.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables
    const existingVariable = typebot.variables.find(byId(varMapping.variableId));
    console.log("exisiting variable",  JSON.stringify(existingVariable)   );
    if (!existingVariable) return newVariables
    const func = Function(
      'data',
      `return data.${parseVariables(typebot.variables)(varMapping?.bodyPath)}`
    )
    console.log("func",func);
    try {
      const value: unknown = func(response);
      console.log("valueeeeee",value);
      return [...newVariables, { ...existingVariable, value }]
    } catch (err) {
      return newVariables
    }
  }, [])
  console.log("new variables", JSON.stringify(newVariables) );
  console.log("logs updated", JSON.stringify(logs) );
  if (newVariables.length > 0) {
    const newSessionState = updateVariablesInSession(state)(newVariables)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState,
      logs,
    }
  }

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    logs,
  }
}
