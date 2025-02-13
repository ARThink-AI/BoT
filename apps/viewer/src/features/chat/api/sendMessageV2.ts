import { publicProcedure } from '@/helpers/server/trpc'
import {
  chatReplySchema,
  sendMessageInputSchema,
} from '@typebot.io/schemas/features/chat/schema'
import { TRPCError } from '@trpc/server'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'
import { continueBotFlow } from '@typebot.io/bot-engine/continueBotFlow'
import { parseDynamicTheme } from '@typebot.io/bot-engine/parseDynamicTheme'
import { isDefined } from '@typebot.io/lib/utils'

export const sendMessageV2 = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/sendMessage',
      summary: 'Send a message',
      description:
        'To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.',
    },
  })
  .input(sendMessageInputSchema)
  .output(chatReplySchema)
  .mutation(
    async ({
      input: { sessionId, message, startParams, clientLogs },
      ctx: { user },
    }) => {
      console.log("send message v2 called", sessionId , message );
  
      const session = sessionId ? await getSession(sessionId) : null
      console.log("session init",session);
      const isSessionExpired =
        session &&
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 
        isDefined(session.state.expiryTimeout) &&
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 
        session.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

      if (isSessionExpired)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session expired. You need to start a new session.',
        })

      if (!session) {
        if (!startParams)
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Missing startParams',
          })
        const {
          typebot,
          messages,
          input,
          resultId,
          dynamicTheme,
          logs,
          clientSideActions,
          newSessionState,
        } = await startSession({
          version: 2,
          startParams,
          userId: user?.id,
          message,
        })

        const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs

        const session = startParams?.isOnlyRegistering
          ? await restartSession({
              state: newSessionState,
            })
          : await saveStateToDatabase({
              session: {
                state: newSessionState,
              },
              input,
              logs: allLogs,
              clientSideActions,
            })
       console.log("restarting session");
    
        return {
          sessionId: session.id,
          typebot: typebot
            ? {
                id: typebot.id,
                theme: typebot.theme,
                settings: typebot.settings,
              }
            : undefined,
          messages,
          input,
          resultId,
          dynamicTheme,
          logs,
          clientSideActions,
        }
      
      } else {
        console.log("entered elsee after continue bot flow v2 send message start")
        const {
          messages,
          input,
          clientSideActions,
          newSessionState,
          logs,
          lastMessageNewFormat,
           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore 
        } = await continueBotFlow(message, { version: 2, state: session.state })
        console.log("entered elsee after continue bot flow v2 send message end")
        const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs

        if (newSessionState)
          await saveStateToDatabase({
            session: {
              id: session.id,
              state: newSessionState,
            },
            input,
            logs: allLogs,
            clientSideActions,
          })
        console.log("messages after continue bot flow",JSON.stringify(messages));
        

        return {
          messages,
          input,
          clientSideActions,
          dynamicTheme: parseDynamicTheme(newSessionState),
          logs,
          lastMessageNewFormat,
        }
      }
    }
  )
