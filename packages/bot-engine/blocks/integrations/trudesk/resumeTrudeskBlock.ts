import { byId } from '@typebot.io/lib'

import {
  ReplyLog,
  VariableWithUnknowValue,
  TrudeskBlock
} from '@typebot.io/schemas'

import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'
import { ExecuteIntegrationResponse } from '../../../types'

import { updateVariablesInSession } from '../../../variables/updateVariablesInSession'

type Props = {
  state: SessionState
  block: TrudeskBlock
  logs?: ReplyLog[]
  response: {
    statusCode: number
    data?: unknown
  }
}


export const resumeTrudeskExecution = ({
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
    
    console.log("variable id found",variableId);
    if ( variableId && block.options.task == "Create Ticket" ) {
      const existingVariable = typebot.variables.find(byId(variableId));
      const existingUidVariable = typebot.variables.find( byId(block.options?.variableId1) );
      // @ts-ignore
      let newVariables = [ { ...existingVariable , value : response.data.id } , { ...existingUidVariable , value:  response.data.uid } ];
      console.log("new variables",newVariables);
      // @ts-ignore
      const newSessionState = updateVariablesInSession(state)(newVariables)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState,
      logs,
    }
    } else if ( block.options.task == "Create Customer" && block.options?.variableCustomerId ) {
      const existingVariable = typebot.variables.find(byId(block.options?.variableCustomerId));
        // @ts-ignore
      let newVariables = [ { ...existingVariable , value : response.data.id  } ]
      // @ts-ignore
      const newSessionState = updateVariablesInSession(state)(newVariables)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState,
      logs,
    }
        
    } else {
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs,
      }
    }
}