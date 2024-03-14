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
      // let loginData = await fetch(`http://20.219.184.176:8118/api/v1/login`,  {
      //   method : "POST",
      //   headers : {
      //     "Content-Type":  "application/json"
      //   },
      //   body : JSON.stringify({ username : "prateek" , password : "1234" })
      // } );
      // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // // @ts-ignore
      // loginData = await loginData.json();
      // console.log("loginData",loginData)
      // if ( sessionId && message  ) {
      //   let  ticketdata = await fetch(`http://20.219.184.176:8118/api/v1/tickets`, {
      //     method : "GET" ,
      //     headers : {
      //       "Content-Type" : "application/json",
      //        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //       "accesstoken" : loginData?.accessToken
      //     }
      //   } );
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   ticketdata = await ticketdata.json();
      //   console.log("ticketData",ticketdata); 
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   const  sessionTicket = ticketdata.filter( ticket => ticket.subject == `Convo for user with sessionId ${sessionId}` );
      //   console.log("sessionTicket", sessionTicket );
      //   if ( sessionTicket.length > 0 ) {
      //     const  sessionTicketId = sessionTicket[0]._id;
      //     console.log("session ticket id",sessionTicketId);
      //     let createNoteData = await fetch(`http://20.219.184.176:8118/api/v1/tickets/addnote`,  {
      //       method : "POST",
      //       headers : {
      //         "Content-Type":  "application/json",
      //          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //         "accesstoken" : loginData?.accessToken
      //       },
      //       body : JSON.stringify({ ticketid : String(sessionTicketId) , note : message  })
      //     } );
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
      //     createNoteData = await createNoteData.json();
      //     console.log("createNoteData",createNoteData);
      //   } else {
      //     let createTicketData = await fetch(`http://20.219.184.176:8118/api/v1/tickets/create`,  {
      //       method : "POST",
      //       headers : {
      //         "Content-Type":  "application/json",
      //          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //         "accesstoken" : loginData?.accessToken
      //       },
      //       body : JSON.stringify({ subject: `Convo for user with sessionId ${sessionId}`,
      //       issue: "Testing6",
      //       owner: "65264cb1cf5011b1d5039073",
      //       group: "65255315e70f67f0a789eb74",
      //       type: "65255315e70f67f0a789eb72",
      //       priority: "652556ce730de448f1c85074"  })
      //     } );
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
      //     createTicketData = await createTicketData.json();
      //     // console.log("createTicketData",createTicketData);
      //     // console.log("create ticket data tickettt", createTicketData["ticket"]  );
      //     // console.log("create ticket data tickettt id", createTicketData["ticket"]["_id"] );
      //     // console.log("post data", JSON.stringify({ ticketid : String(createTicketData["ticket"]["_id"]) , note : message  }) );
      //     let createNoteData = await fetch(`http://20.219.184.176:8118/api/v1/tickets/addnote`,  {
      //       method : "POST",
      //       headers : {
      //         "Content-Type":  "application/json",
      //          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //         "accesstoken" : loginData?.accessToken
      //       },
      //        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //       body : JSON.stringify({ ticketid : String(createTicketData["ticket"]["_id"]) , note : message  })
      //     } );
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
      //     createNoteData = await createNoteData.json();
      //     console.log("createNoteData",createNoteData);
      //   }
      // } 
      const session = sessionId ? await getSession(sessionId) : null
      
      const isSessionExpired =
        session &&
        isDefined(session.state.expiryTimeout) &&
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
      //  if ( typebot?.settings?.general?.isTicketEnabled && typebot?.settings?.general?.ticketInfo?.trim() != "" ) {
      //     try {
      //     console.log("is Ticket enabled");
      //     const key = "4467015e7000fd73d88f1feec4dc801b0612a15e342fcaaeae9c3c62f2fea6b6";
      //     const decipher = crypto.createDecipher('aes-256-cbc', key);
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
      //     let decryptedData = decipher.update( typebot?.settings?.general?.ticketInfo , 'hex', 'utf-8');
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
      //     decryptedData += decipher.final('utf-8');
      //     console.log("decrypted data", decryptedData );
      //     let resp1 = await fetch("https://quadz.arthink.ai/api/v1/login", {
      //       method : "POST",
      //       headers: {
      //         "Content-type" : "application/json"
      //       },
      //       body : decryptedData

      //     });
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
          
      //     resp1=  await resp1.json();
      //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //     // @ts-ignore
      //     console.log("ticket login data", resp1.accessToken );
      //     return {
      //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //       // @ts-ignore
      //       ticketAccessToken : resp1.accessToken,
      //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //       // @ts-ignore
      //       ticketOwnerId : resp1.user._id ,
      //       sessionId: session.id,
      //       typebot: typebot
      //         ? {
      //             id: typebot.id,
      //             theme: typebot.theme,
      //             settings: typebot.settings,
      //           }
      //         : undefined,
      //       messages,
      //       input,
      //       resultId,
      //       dynamicTheme,
      //       logs,
      //       clientSideActions,
      //     }

      //   } catch(err) {
      //     console.log("error happened while login");
      //     return {
      //       sessionId: session.id,
      //       typebot: typebot
      //         ? {
      //             id: typebot.id,
      //             theme: typebot.theme,
      //             settings: typebot.settings,
      //           }
      //         : undefined,
      //       messages,
      //       input,
      //       resultId,
      //       dynamicTheme,
      //       logs,
      //       clientSideActions,
      //     }
      //   } 

      //  } else {
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
      //  }
        // return {
        //   sessionId: session.id,
        //   typebot: typebot
        //     ? {
        //         id: typebot.id,
        //         theme: typebot.theme,
        //         settings: typebot.settings,
        //       }
        //     : undefined,
        //   messages,
        //   input,
        //   resultId,
        //   dynamicTheme,
        //   logs,
        //   clientSideActions,
        // }
      } else {
        console.log("entered elsee after continue bot flow v2 send message start")
        const {
          messages,
          input,
          clientSideActions,
          newSessionState,
          logs,
          lastMessageNewFormat,
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
        // const  replyMessages = [];
        // for ( let i=0; i < messages.length;i++ ) {
        //  if ( messages[i].type == "text" ) {
        //    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        //     for ( let j=0; j < messages[i].content.richText.length ; j++ ) {
        //        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        //       replyMessages.push( messages[i].content.richText[j].children[0].children[0].text );
        //     }
        //  }
        // }
        // console.log("reply messages", replyMessages.join("\n")  );
        // let  ticketdata = await fetch(`http://20.219.184.176:8118/api/v1/tickets`, {
        //   method : "GET" ,
        //   headers : {
        //     "Content-Type" : "application/json",
        //      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        //     "accesstoken" : loginData?.accessToken
        //   }
        // } );
        // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        // ticketdata = await ticketdata.json();
        // console.log("ticketData",ticketdata); 
        //  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        // const  sessionTicket = ticketdata.filter( ticket => ticket.subject == `Convo for user with sessionId ${sessionId}` );
        // const  sessionTicketId = sessionTicket[0]._id;
        //   console.log("session ticket id",sessionTicketId);
        //   let createNoteData = await fetch(`http://20.219.184.176:8118/api/v1/tickets/addnote`,  {
        //     method : "POST",
        //     headers : {
        //       "Content-Type":  "application/json",
        //        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        //       "accesstoken" : loginData?.accessToken
        //     },
        //     body : JSON.stringify({ ticketid : String(sessionTicketId) , note : replyMessages.join("\n")
        //     })
        //   } );
        //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //   // @ts-ignore
        //   createNoteData = await createNoteData.json();
        //   console.log("createNoteData",createNoteData);

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
