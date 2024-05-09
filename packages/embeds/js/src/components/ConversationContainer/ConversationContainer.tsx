import { ChatReply, SendMessageInput, Theme } from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/enums'
import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { sendMessageQuery, storeLiveChatQuery } from '@/queries/sendMessageQuery'
import { ChatChunk } from './ChatChunk'
import {
  BotContext,
  ChatChunk as ChatChunkType,
  InitialChatReply,
  OutgoingLog,
} from '@/types'
import { isNotDefined } from '@typebot.io/lib'
import { executeClientSideAction } from '@/utils/executeClientSideActions'
import { LoadingChunk } from './LoadingChunk'
import { PopupBlockedToast } from './PopupBlockedToast'
import { setStreamingMessage } from '@/utils/streamingMessageSignal'
import {
  formattedMessages,
  setFormattedMessages,
} from '@/utils/formattedMessagesSignal'



import { computePlainText } from '@/features/blocks/bubbles/textBubble/helpers/convertRichTextToPlainText'

import { io } from "socket.io-client";
import { guessApiHost } from '@/utils/guessApiHost'

const parseDynamicTheme = (
  initialTheme: Theme,
  dynamicTheme: ChatReply['dynamicTheme']
): Theme => ({
  ...initialTheme,
  chat: {
    ...initialTheme.chat,
    hostAvatar:
      initialTheme.chat.hostAvatar && dynamicTheme?.hostAvatarUrl
        ? {
          ...initialTheme.chat.hostAvatar,
          url: dynamicTheme.hostAvatarUrl,
        }
        : initialTheme.chat.hostAvatar,
    guestAvatar:
      initialTheme.chat.guestAvatar && dynamicTheme?.guestAvatarUrl
        ? {
          ...initialTheme.chat.guestAvatar,
          url: dynamicTheme?.guestAvatarUrl,
        }
        : initialTheme.chat.guestAvatar,
  },
})

type Props = {
  initialChatReply: InitialChatReply
  context: BotContext
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  socket: any,
  initializeBot: any,
  // liveAgent : Boolean,

}

export const ConversationContainer = (props: Props) => {

  let chatContainer: HTMLDivElement | undefined
  // const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>([
  //   {
  //     input: props.initialChatReply.input,
  //     messages: props.initialChatReply.messages,
  //     clientSideActions: props.initialChatReply.clientSideActions,
  //   },
  // ])

  const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>(!sessionStorage.getItem("chatchunks") ? [
    {
      input: props.initialChatReply.input,
      messages: props.initialChatReply.messages,
      clientSideActions: props.initialChatReply.clientSideActions,
    },
    // @ts-ignore
  ] : JSON.parse(sessionStorage.getItem("chatchunks")))


  const [dynamicTheme, setDynamicTheme] = createSignal<
    ChatReply['dynamicTheme']
  >(props.initialChatReply.dynamicTheme)
  const [theme, setTheme] = createSignal(props.initialChatReply.typebot.theme);
  const [sessionId, setSessionId] = createSignal(null);
  const [userInput, setUserInput] = createSignal("");
  const [isSending, setIsSending] = createSignal(false)
  const [blockedPopupUrl, setBlockedPopupUrl] = createSignal<string>()
  const [hasError, setHasError] = createSignal(false)
  const [liveSocketInstance, setLiveSocketInstance] = createSignal(null);
  // @ts-ignore
  const [lastInput, setLastInput] = createSignal(sessionStorage.getItem("lastinput") ? JSON.parse(sessionStorage.getItem("lastinput")) : null);
  // @ts-ignore
  const [live, setLive] = createSignal(sessionStorage.getItem("live") ? JSON.parse(sessionStorage.getItem("live")) : false);


  // @ts-ignore
  const [liveChatData, setLiveChatData] = createSignal(sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : []);

  // createEffect( () => {
  //   console.log("props live agent changed", props.liveAgent );
  //   if ( props.liveAgent != live()  ) {


  //     console.log("live agent enabled");

  //     let chunks = [...chatChunks()];
  //     // @ts-ignore
  //     setLastInput( chunks[ chunks.length -1 ].input );

  //     console.log("last input",  chunks[ chunks.length -1 ].input );
  //     chunks[ chunks.length -1 ].input = undefined

  //      chunks.push(
  //       {
  //         input:  {
  //           "id": "ow5y1j9yvsp7jo46qaswc38k",
  //           "groupId": "nb24en7liv3s8e959uxtz1h0",
  //           "outgoingEdgeId": "flk0r0n1jb746j1ipuh1zqr9",
  //           // @ts-ignore
  //           "type": "text input",
  //           "options": {
  //             "labels": {
  //               "placeholder": "Ask question",
  //               "button": "Send"
  //             },
  //             "variableId": "vb6co7ry0n84c9tuml9oae2ld",
  //             "isLong": false
  //           },
  //           "prefilledValue": "Hi"
  //         } ,
  //         messages: [
  //           {
  //             id: "unhxagqgd46929s701gnz5z8",
  //             // @ts-ignore
  //             type : "text",
  //             content: {
  //               richText: [
  //                 {
  //                   "type": "variable",
  //                   "children": [
  //                     {
  //                       "type": "p",
  //                       "children": [
  //                         {
  //                           "text": "Enabled live Agent"
  //                         }
  //                       ]
  //                     }
  //                   ]
  //                 }
  //               ]
  //             }
  //           }
  //         ],
  //         clientSideActions: undefined
  //       }
  //      );
  //     setLive(true);
  //     sessionStorage.removeItem("answer");
  //      setChatChunks(chunks); 



  //     }

  //   // } else  {
  //   //  console.log("live agent disabled");
  //   //  let chunks = [...chatChunks()];
  //   //  chunks.push(
  //   //   {
  //   //     // @ts-ignore
  //   //     input:  lastInput(),
  //   //     messages: [
  //   //       {
  //   //         id: "unhxagqgd46929s701gnz5z8",
  //   //         // @ts-ignore
  //   //         type : "text",
  //   //         content: {
  //   //           richText: [
  //   //             {
  //   //               "type": "variable",
  //   //               "children": [
  //   //                 {
  //   //                   "type": "p",
  //   //                   "children": [
  //   //                     {
  //   //                       "text": "Exited live Agent"
  //   //                     }
  //   //                   ]
  //   //                 }
  //   //               ]
  //   //             }
  //   //           ]
  //   //         }
  //   //       }
  //   //     ],
  //   //     clientSideActions: undefined
  //   //   }
  //   //  );
  //   //  setChatChunks(chunks);
  //   // }
  // } , props.liveAgent );



  // createEffect(() => {
  //   console.log("chat chunks changed", chatChunks());
  //   if (sessionStorage.getItem("answer")) {
  //     let chunks = [...chatChunks()];
  //     if (chunks[chunks.length - 2]?.input?.type == "card input") {

  //       if (chunks[chunks.length - 2]?.input) {
  //         // @ts-ignore
  //         chunks[chunks.length - 2]?.input?.answer = "Submitted"
  //       }


  //       sessionStorage.setItem("chatchunks", JSON.stringify(chunks))
  //     } else if (chunks[chunks.length - 2]?.input?.type == "file input") {
  //       if (chunks[chunks.length - 2]?.input) {
  //         // @ts-ignore
  //         chunks[chunks.length - 2]?.input?.answer = "File uploaded"
  //       }

  //       sessionStorage.setItem("chatchunks", JSON.stringify(chunks))
  //     } else {
  //       console.log("entereddd hererr", chunks[chunks.length - 2]?.input)
  //       if (chunks[chunks.length - 2] && chunks[chunks.length - 2]?.input) {
  //         // @ts-ignore
  //         chunks[chunks.length - 2]?.input?.answer = sessionStorage.getItem("answer") ? sessionStorage.getItem("answer") : "";
  //       }
  //       console.log("no error")
  //       sessionStorage.setItem("chatchunks", JSON.stringify(chunks))
  //     }

  //   } else if (sessionStorage.getItem("chatchunks")) {
  //     sessionStorage.setItem("chatchunks", JSON.stringify(chatChunks()))
  //   }

  //   //  sessionStorage.setItem("chatchunks", JSON.stringify( chatChunks() ) );
  // },);

  createEffect(() => {
    console.log("chat chunks changed", chatChunks());
    if (sessionStorage.getItem("answer")) {
      let chunks = [...chatChunks()];
      const input = chunks[chunks.length - 2]?.input;

      if (input) {
        if (input.type === "card input") {
          input.answer = "Submitted";
        } else if (input.type === "file input") {
          input.answer = "File uploaded";
        } else {
          input.answer = sessionStorage.getItem("answer") || "";
        }

        sessionStorage.setItem("chatchunks", JSON.stringify(chunks));
        console.log("no error");
      }
    } else if (sessionStorage.getItem("chatchunks")) {
      sessionStorage.setItem("chatchunks", JSON.stringify(chatChunks()));
    }
  }, []);

  onMount(() => {
    ; (async () => {
      if (props.initialChatReply.typebot.settings.general.isCustomInputEnabled) {
        const response = await fetch("https://typebot.io/api/v1/typebots/openaibot/startChat", {
          method: "POST",
          // @ts-ignore
          headers: {
            "Content-type": "application/json"

          },
          // body : JSON.stringify( {
          //   _id : sessionStorage.getItem("ticketId"),
          //   comment : comments,
          //   note : false ,
          //   ticketid : false 
          // } )
          // body: JSON.stringify({
          //   // @ts-ignore
          //   ticketid: sessionStorage.getItem("ticketId"),
          //   note: comments.join(" ")

          // })
        });
        const sessionResponse = await response.json();
        setSessionId(sessionResponse?.sessionId);
        // console.log("session response", sessionResponse);
        // console.log("session response", sessionResponse);
      }
      // console.log("conversation container", JSON.stringify(props));
      // console.log("session Iddd", props.context.sessionId);
      //  console.log("conversation container mounted", chatChunks() );

      //  setTimeout( () => {
      //   console.log("stream message triggered");
      //   streamMessage({ id : "1234" , message : "this is streamed message" });
      //   // console.log("updated stream message", chatChunks() );
      //  }, 180000 );
      // setTimeout( () => {
      //   console.log("chat cunks")
      //   console.log("timeout executed" );
      //   streamMessage({ id : "1234" , message : "this is streamed message" });
      // } , 10000 )
      if (sessionStorage.getItem("chatchunks")) {
        console.log("chat chunks already present", chatChunks());
        return
      }

      const initialChunk = chatChunks()[0]
      if (initialChunk.clientSideActions) {
        const actionsBeforeFirstBubble = initialChunk.clientSideActions.filter(
          (action) => isNotDefined(action.lastBubbleBlockId)
        )
        for (const action of actionsBeforeFirstBubble) {
          if (
            'streamOpenAiChatCompletion' in action ||
            'webhookToExecute' in action
          )
            setIsSending(true)
          const response = await executeClientSideAction({
            socket: props.socket,
            clientSideAction: action,
            context: {
              apiHost: props.context.apiHost,
              sessionId: props.initialChatReply.sessionId,
            },
            onMessageStream: streamMessage,
          })
          if (response && 'replyToSend' in response) {
            sendMessage(response.replyToSend, response.logs)
            return
          }
          if (response && 'blockedPopupUrl' in response)
            setBlockedPopupUrl(response.blockedPopupUrl)
        }
      }
    })()
  })

  const streamMessage = ({ id, message }: { id: string; message: string }) => {
    setIsSending(false)
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (lastChunk.streamingMessageId !== id)
      setChatChunks((displayedChunks) => [
        ...displayedChunks,
        {
          messages: [],
          streamingMessageId: id,
        },
      ])
    // setTimeout( () => {
    //   console.log("updated chunks", chatChunks() )
    // } ,1000);
    setStreamingMessage({ id, content: message })
  }

  createEffect(() => {
    setTheme(
      parseDynamicTheme(props.initialChatReply.typebot.theme, dynamicTheme())
    )
  })

  const sendLiveAgentMessage = (message: string | undefined) => {
    console.log("send live agent message", message);
    // @ts-ignore
    sessionStorage.setItem("answer", message);
    if (!liveSocketInstance()) {
      const socketInstance = io("http://172.178.92.219:3060", {
        reconnection: true, // Enable reconnection
        reconnectionAttempts: Infinity, // Retry indefinitely
        reconnectionDelay: 1000, // Initial delay (in ms) before the first reconnection attempt
        reconnectionDelayMax: 5000, // Maximum delay (in ms) between reconnection attempts
      });
      socketInstance.on("connect", () => {
        console.log("socket instance connected");
        // @ts-ignore
        setLiveSocketInstance(socketInstance);
        socketInstance.emit("joinRoom", { sessionId: props.initialChatReply.resultId });

        socketInstance.on("responseFromBot", ({ message, id }) => {
          console.log("reply", message);
          let chunks = [...chatChunks()];
          chunks.push(
            {
              input: {
                "id": "ow5y1j9yvsp7jo46qaswc38k",
                "groupId": "nb24en7liv3s8e959uxtz1h0",
                "outgoingEdgeId": "flk0r0n1jb746j1ipuh1zqr9",
                // @ts-ignore
                "type": "text input",
                "options": {
                  "labels": {
                    "placeholder": "Ask question",
                    "button": "Send"
                  },
                  "variableId": "vb6co7ry0n84c9tuml9oae2ld",
                  "isLong": false
                },
                "prefilledValue": "Hi"
              },
              messages: [
                {
                  id: "unhxagqgd46929s701gnz5z8",
                  // @ts-ignore
                  type: "text",
                  content: {
                    richText: [
                      {
                        "type": "variable",
                        "children": [
                          {
                            "type": "p",
                            "children": [
                              {
                                "text": message
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              ],
              clientSideActions: undefined
            }
          );
          setChatChunks(chunks);


          // @ts-ignore
          let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

          livechatData.push({ user: "Support", message: message })
          // @ts-ignore
          sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
          // @ts-ignore
          storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
            console.log("error", err);
          })


          socketInstance.off("responseFromBot")
        })
        socketInstance.emit("sendToQuadz", { message, id: "123", sessionId: props.initialChatReply.resultId });
        let livechatData = [];

        livechatData.push({ user: "User", message: message })
        // @ts-ignore
        sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
        // @ts-ignore
        storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
          console.log("error", err);
        })

      })
    } else {


      let socketInstance = liveSocketInstance();

      // @ts-ignore
      socketInstance.on("responseFromBot", ({ message }) => {
        console.log("reply", message);

        let chunks = [...chatChunks()];
        chunks.push(
          {
            input: {
              "id": "ow5y1j9yvsp7jo46qaswc38k",
              "groupId": "nb24en7liv3s8e959uxtz1h0",
              "outgoingEdgeId": "flk0r0n1jb746j1ipuh1zqr9",
              // @ts-ignore
              "type": "text input",
              "options": {
                "labels": {
                  "placeholder": "Ask question",
                  "button": "Send"
                },
                "variableId": "vb6co7ry0n84c9tuml9oae2ld",
                "isLong": false
              },
              "prefilledValue": "Hi"
            },
            messages: [
              {
                id: "unhxagqgd46929s701gnz5z8",
                // @ts-ignore
                type: "text",
                content: {
                  richText: [
                    {
                      "type": "variable",
                      "children": [
                        {
                          "type": "p",
                          "children": [
                            {
                              "text": message
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            clientSideActions: undefined
          }
        );
        setChatChunks(chunks);

        // @ts-ignore
        let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

        livechatData.push({ user: "Support", message: message })
        // @ts-ignore
        sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
        // @ts-ignore
        storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
          console.log("error", err);
        })
        // @ts-ignore
        socketInstance.off("responseFromBot")
      })
      // @ts-ignore
      socketInstance.emit("sendToQuadz", { message, id: "123", sessionId: props.initialChatReply.resultId });
      // @ts-ignore
      let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

      livechatData.push({ user: "User", message: message })
      // @ts-ignore
      sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
      // @ts-ignore
      storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
        console.log("error", err);
      })
    }







  }

  const sendMessage = async (
    message: string | undefined,
    clientLogs?: SendMessageInput['clientLogs']
  ) => {
    console.log("live value", live());
    if (live()) {
      return sendLiveAgentMessage(message);

    }
    console.log("message by user", message);


    // @ts-ignore
    sessionStorage.setItem("answer", message);
    if (clientLogs) props.onNewLogs?.(clientLogs)
    setHasError(false)
    const currentInputBlock = [...chatChunks()].pop()?.input
    if (currentInputBlock?.id && props.onAnswer && message)
      props.onAnswer({ message, blockId: currentInputBlock.id })
    if (currentInputBlock?.type === InputBlockType.FILE)
      props.onNewLogs?.([
        {
          description: 'Files are not uploaded in preview mode',
          status: 'info',
        },
      ])
    const longRequest = setTimeout(() => {
      setIsSending(true)
    }, 1000)
    const { data, error } = await sendMessageQuery({
      apiHost: props.context.apiHost,
      sessionId: props.initialChatReply.sessionId,
      message,
      clientLogs,
    });
    console.log("send message dataa", data);
    console.log("error sending data", error);
    clearTimeout(longRequest)
    setIsSending(false)
    if (error) {
      if (error.message == "Session expired. You need to start a new session.") {
        console.log("session expireddd");
        sessionStorage.removeItem("intialize");
        sessionStorage.removeItem("initialize_css");
        sessionStorage.removeItem("bot_init");
        sessionStorage.removeItem("chatchunks");
        props.initializeBot();
        return
      }
      setHasError(true)
      props.onNewLogs?.([
        {
          description: 'Failed to send the reply',
          details: error,
          status: 'error',
        },
      ])
    }
    if (!data) return
    if (data.lastMessageNewFormat) {
      setFormattedMessages([
        ...formattedMessages(),
        {
          inputId: [...chatChunks()].pop()?.input?.id ?? '',
          formattedMessage: data.lastMessageNewFormat as string,
        },
      ])
    }
    if (data.logs) props.onNewLogs?.(data.logs)
    if (data.dynamicTheme) setDynamicTheme(data.dynamicTheme)
    if (data.input?.id && props.onNewInputBlock) {
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      })
    }
    if (data.clientSideActions) {
      const actionsBeforeFirstBubble = data.clientSideActions.filter((action) =>
        isNotDefined(action.lastBubbleBlockId)
      )
      for (const action of actionsBeforeFirstBubble) {
        if (
          'streamOpenAiChatCompletion' in action ||
          'webhookToExecute' in action
        )
          setIsSending(true)
        const response = await executeClientSideAction({
          socket: props.socket,
          clientSideAction: action,
          context: {
            apiHost: props.context.apiHost,
            sessionId: props.initialChatReply.sessionId,
          },
          onMessageStream: streamMessage,
        })
        if (response && 'replyToSend' in response) {
          sendMessage(response.replyToSend, response.logs)
          return
        }
        if (response && 'blockedPopupUrl' in response)
          setBlockedPopupUrl(response.blockedPopupUrl)
      }
    }
    console.log("bot reply", data.messages);

    if (sessionStorage.getItem("ticketId") && sessionStorage.getItem("ticketaccess")) {
      try {

        let comments = [`User - /n ${message}`];

        let text = ["/n BoT - /n"];
        for (let i = 0; i < data.messages.length; i++) {
          if (data.messages[i].type == "text") {
            // @ts-ignore
            let plainText = computePlainText(data.messages[i]?.content?.richText);
            text.push(plainText);
          }
        }
        console.log("final text array", text);
        let finalText = text.reduce((a, curr) => a + "/n" + curr);

        comments.push(finalText);

        await fetch("https://quadz.arthink.ai/api/v1/tickets/addnote", {
          method: "POST",
          // @ts-ignore
          headers: {
            "Content-type": "application/json",
            "accessToken": sessionStorage.getItem("ticketaccess")
          },
          // body : JSON.stringify( {
          //   _id : sessionStorage.getItem("ticketId"),
          //   comment : comments,
          //   note : false ,
          //   ticketid : false 
          // } )
          body: JSON.stringify({
            // @ts-ignore
            ticketid: sessionStorage.getItem("ticketId"),
            note: comments.join(" ")

          })
        })



      } catch (err) {
        console.log("error in creating comment on ticket", err);
      }
    }





    setChatChunks((displayedChunks) => [
      ...displayedChunks,
      {
        input: data.input,
        messages: data.messages,
        clientSideActions: data.clientSideActions,
      },
    ])

    console.log("updated chunks",
      [
        ...chatChunks(),
        {
          input: data.input,
          messages: data.messages,
          clientSideActions: data.clientSideActions,
        },
      ]
    );

  }

  const autoScrollToBottom = (offsetTop?: number) => {
    const chunks = chatChunks()
    const lastChunkWasStreaming =
      chunks.length >= 2 && chunks[chunks.length - 2].streamingMessageId
    if (lastChunkWasStreaming) return
    setTimeout(() => {
      chatContainer?.scrollTo(0, offsetTop ?? chatContainer.scrollHeight)
    }, 50)
  }

  const handleAllBubblesDisplayed = async () => {
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (isNotDefined(lastChunk.input)) {
      props.onEnd?.()
    }
  }

  const handleNewBubbleDisplayed = async (blockId: string) => {
    const lastChunk = [...chatChunks()].pop()
    if (!lastChunk) return
    if (lastChunk.clientSideActions) {
      const actionsToExecute = lastChunk.clientSideActions.filter(
        (action) => action.lastBubbleBlockId === blockId
      )
      for (const action of actionsToExecute) {
        if (
          'streamOpenAiChatCompletion' in action ||
          'webhookToExecute' in action
        )
          setIsSending(true)
        const response = await executeClientSideAction({
          socket: props.socket,
          clientSideAction: action,
          context: {
            apiHost: props.context.apiHost,
            sessionId: props.initialChatReply.sessionId,
          },
          onMessageStream: streamMessage,
        })
        if (response && 'replyToSend' in response) {
          sendMessage(response.replyToSend, response.logs)
          return
        }
        if (response && 'blockedPopupUrl' in response)
          setBlockedPopupUrl(response.blockedPopupUrl)
      }
    }
  }

  onCleanup(() => {
    setStreamingMessage(undefined)
    setFormattedMessages([])
  })

  const handleSkip = () => sendMessage(undefined)

  const toggleLiveAgent = () => {
    if (!live()) {


      console.log("live agent enabled");

      let chunks = [...chatChunks()];
      // @ts-ignore
      setLastInput(chunks[chunks.length - 1].input);
      sessionStorage.setItem("lastinput", JSON.stringify(chunks[chunks.length - 1].input));

      console.log("last input", chunks[chunks.length - 1].input);

      chunks[chunks.length - 1] = { ...chunks[chunks.length - 1] };
      chunks[chunks.length - 1].input = undefined

      chunks.push(
        {
          input: {
            "id": "ow5y1j9yvsp7jo46qaswc38k",
            "groupId": "nb24en7liv3s8e959uxtz1h0",
            "outgoingEdgeId": "flk0r0n1jb746j1ipuh1zqr9",
            // @ts-ignore
            "type": "text input",
            "options": {
              "labels": {
                "placeholder": "Ask question",
                "button": "Send"
              },
              "variableId": "vb6co7ry0n84c9tuml9oae2ld",
              "isLong": false
            },
            "prefilledValue": "Hi"
          },
          messages: [
            {
              id: "unhxagqgd46929s701gnz5z8",
              // @ts-ignore
              type: "text",
              content: {
                richText: [
                  {
                    "type": "variable",
                    "children": [
                      {
                        "type": "p",
                        "children": [
                          {
                            "text": "Enabled live Agent"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          ],
          clientSideActions: undefined
        }
      );


      sessionStorage.removeItem("answer");
      console.log("before chat chunk");
      setChatChunks(chunks);
      console.log("after chat chunk");




    } else {
      console.log("live agent disabled");
      let chunks = [...chatChunks()];
      chunks[chunks.length - 1] = { ...chunks[chunks.length - 1] };
      chunks[chunks.length - 1].input = undefined
      chunks.push(
        {
          // @ts-ignore
          input: lastInput(),
          messages: [
            {
              id: "unhxagqgd46929s701gnz5z8",
              // @ts-ignore
              type: "text",
              content: {
                richText: [
                  {
                    "type": "variable",
                    "children": [
                      {
                        "type": "p",
                        "children": [
                          {
                            "text": "Exited live Agent"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          ],
          clientSideActions: undefined
        }
      );
      sessionStorage.removeItem("answer");
      setChatChunks(chunks);
    }
    console.log("live  changeeee");
    let l = live();
    sessionStorage.setItem("live", `${!l}`);
    setLive(!l);
  }
  const userInputClicked = async () => {
    console.log("user input clicked");

    let chunks = [...chatChunks()];
    chunks.push(
      {
        input: {
          "id": "ow5y1j9yvsp7jo46qaswc38k",
          "groupId": "nb24en7liv3s8e959uxtz1h0",
          "outgoingEdgeId": "flk0r0n1jb746j1ipuh1zqr9",
          // @ts-ignore
          "type": "text input",
          "options": {
            "labels": {
              "placeholder": "Ask question",
              "button": "Send"
            },
            "variableId": "vb6co7ry0n84c9tuml9oae2ld",
            "isLong": false
          },
          "prefilledValue": "Hi",
          "answer": userInput()
        },
        messages: [

        ],
        clientSideActions: undefined
      }
    );
    setChatChunks(chunks);

    if (sessionId()) {
      const response = await fetch(`https://typebot.io/api/v1/sessions/${sessionId()}/continueChat`, {
        method: "POST",
        // @ts-ignore
        headers: {
          "Content-type": "application/json"

        },
        body: JSON.stringify({
          message: userInput()
        })

      });
      const messageResp = await response.json();
      console.log("message Resp", messageResp);
      if (messageResp?.messages.length > 0 && messageResp?.messages[0]?.content?.richText.length > 0 && messageResp?.messages[0]?.content?.richText[0]?.children[0]?.children[0]?.text) {
        const botResp = messageResp?.messages[0]?.content?.richText[0]?.children[0]?.children[0]?.text;
        let chunks = [...chatChunks()];
        chunks.push(
          {
            messages: [
              {
                id: "unhxagqgd46929s701gnz5z8",
                // @ts-ignore
                type: "text",
                content: {
                  richText: [
                    {
                      "type": "variable",
                      "children": [
                        {
                          "type": "p",
                          "children": [
                            {
                              "text": botResp
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            clientSideActions: undefined
          }
        );
        setChatChunks(chunks);
      }
      setUserInput("");
      sessionStorage.removeItem("answer");
    } else {
      sessionStorage.removeItem("answer");
      setUserInput("");
    }
  }

  return (
    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-scroll w-full min-h-full px-3 pt-10 relative scrollable-container typebot-chat-view scroll-smooth gap-2"
      style={{ position: "relative" }}
    >
      {/* <div style={{ "margin-top" : "10px" , "cursor" : "pointer" }} >
        
        <div style={{ display : "flex" , "flex-direction" : "row" , "align-items" : "center" , gap : "40" }} >
          <button> <img style={{ height : "25px" , "margin-right":  "10px" }} src={"https://quadz.blob.core.windows.net/demo1/maximize.png"} /> </button>
          <button> <img style={{ height : "25px" ,  "margin-right":  "10px" }} src={"https://quadz.blob.core.windows.net/demo1/stop.png"} /> </button>
          <button onClick={ () => {
toggleLiveAgent();
            // let currentVal = liveAgent();
            // setLiveAgent( !currentVal );
          } } > <img style={{ height : "25px" }} src={"https://quadz.blob.core.windows.net/demo1/live-chat.png"} /> </button>
        </div>
        </div> */}
      <For each={chatChunks()}>
        {(chatChunk, index) => {
          console.log("chat chunk", chatChunk, index);
          return (
            <ChatChunk
              inputIndex={index()}
              messages={chatChunk.messages}
              input={chatChunk.input}
              theme={theme()}
              settings={props.initialChatReply.typebot.settings}
              streamingMessageId={chatChunk.streamingMessageId}
              context={props.context}
              hideAvatar={
                !chatChunk.input &&
                ((chatChunks()[index() + 1]?.messages ?? 0).length > 0 ||
                  chatChunks()[index() + 1]?.streamingMessageId !== undefined ||
                  isSending())
              }
              hasError={hasError() && index() === chatChunks().length - 1}
              onNewBubbleDisplayed={handleNewBubbleDisplayed}
              onAllBubblesDisplayed={handleAllBubblesDisplayed}
              onSubmit={sendMessage}
              onScrollToBottom={autoScrollToBottom}
              onSkip={handleSkip}
            />
          )

        }}
      </For>
      <Show when={isSending()}>
        <LoadingChunk theme={theme()} />
      </Show>
      <Show when={blockedPopupUrl()} keyed>
        {(blockedPopupUrl) => (
          <div class="flex justify-end">
            <PopupBlockedToast
              url={blockedPopupUrl}
              onLinkClick={() => setBlockedPopupUrl(undefined)}
            />
          </div>
        )}
      </Show>
      <Show when={props.initialChatReply.typebot.settings.general.isCustomInputEnabled}>

        <div style="position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); width:45%;">
          <div class="container lg:w-full  flex justify-center gap-2 mx-auto shadow-lg p-2 ">

            <input placeholder='type your message' class="w-full rounded-md text-[#364652] p-1 outline-none" type="text" value={userInput()} onChange={(e) => setUserInput(e?.target?.value)} />
            <div class='flex justify-center items-center'>
              <button class='h-[25px] w-[25px]' style="cursor: pointer;"><img src="https://quadz.blob.core.windows.net/demo1/mic.svg" class='h-[25px] w-[25px]' /></button>
              <button onClick={userInputClicked} class="rounded-full bg-[#0077CC]">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_63_137)">
                    <rect width="36" height="36" rx="18" fill="#0077CC" />
                    <path d="M17.0834 15.0666L14.4251 17.725C14.257 17.893 14.0431 17.977 13.7834 17.977C13.5237 17.977 13.3098 17.893 13.1417 17.725C12.9737 17.5569 12.8896 17.343 12.8896 17.0833C12.8896 16.8236 12.9737 16.6097 13.1417 16.4416L17.3584 12.225C17.5417 12.0416 17.7556 11.95 18.0001 11.95C18.2445 11.95 18.4584 12.0416 18.6417 12.225L22.8584 16.4416C23.0265 16.6097 23.1105 16.8236 23.1105 17.0833C23.1105 17.343 23.0265 17.5569 22.8584 17.725C22.6903 17.893 22.4765 17.977 22.2167 17.977C21.957 17.977 21.7431 17.893 21.5751 17.725L18.9167 15.0666V22.5833C18.9167 22.843 18.8289 23.0607 18.6532 23.2364C18.4775 23.4121 18.2598 23.5 18.0001 23.5C17.7403 23.5 17.5226 23.4121 17.3469 23.2364C17.1712 23.0607 17.0834 22.843 17.0834 22.5833V15.0666Z" fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clip0_63_137">
                      <rect width="36" height="36" rx="18" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>


          </div>
        </div>
      </Show>

      <BottomSpacer />
    </div>
  )
}

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />
}
