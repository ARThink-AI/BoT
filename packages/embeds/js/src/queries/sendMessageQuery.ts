import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatReply, SendMessageInput } from '@typebot.io/schemas'
import { isNotEmpty, sendRequest } from '@typebot.io/lib'

export const sendMessageQuery = ({
  apiHost,
  ...body
}: SendMessageInput & { apiHost?: string }) =>
  sendRequest<ChatReply>({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/v2/sendMessage`,
    body,
  })


export const storeLiveChatQuery = ({
  // @ts-ignore
  apiHost,
  // @ts-ignore
  typebotId,
  // @ts-ignore
  resultId,
  ...body
}) =>
  sendRequest({
    method: 'PATCH',
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/typebots/${typebotId}/results/${resultId}`,
    body,
  })

export const getTicketIdQuery = ({
  // @ts-ignore
  apiHost,
  // @ts-ignore
  typebotId,
  // @ts-ignore
  resultId,
  // @ts-ignore
  ticketIdVariable,
  // @ts-ignore 
  accessTokenVariable
}) =>
  sendRequest({
    method: "GET",
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/typebots/${typebotId}/results/${resultId}/ticket/${ticketIdVariable}/get?accessTokenVariable=${accessTokenVariable}`

  })
export const initiateCall = ({
  // @ts-ignore
  apiHost,

  // @ts-ignore
  ...body
}) =>
  sendRequest({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/integrations/twilio/call`,
    body,
  })  
