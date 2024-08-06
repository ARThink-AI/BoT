import { byId } from '@typebot.io/lib'

import {
  ReplyLog,
  VariableWithUnknowValue,

  WhatsappBlock
} from '@typebot.io/schemas'

import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'
import { ExecuteIntegrationResponse } from '../../../types'

import { updateVariablesInSession } from '../../../variables/updateVariablesInSession'

type Props = {
  state: SessionState
  block: WhatsappBlock
  logs?: ReplyLog[]
  response: {
    statusCode: number
    data?: unknown
  }
}


export const resumeWhatsappExecution = ({
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
  // @ts-ignore
  let variableId = block.options?.variableId;

  console.log("variable id found", variableId);
  if (variableId && block.options.task == "Initiate Message") {
    const existingVariable = typebot.variables.find(byId(variableId));
    // @ts-ignore
    let newVariables = [{ ...existingVariable, value: response.data.status }];
    // console.log("new variables",newVariables);
    // @ts-ignore
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