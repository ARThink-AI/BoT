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
import { sendMessageQuery, storeLiveChatQuery, getTicketIdQuery } from '@/queries/sendMessageQuery'
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
  // console.log("props conversation container", JSON.stringify(props));
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
  const [theme, setTheme] = createSignal(props.initialChatReply.typebot.theme)
  const [isSending, setIsSending] = createSignal(false);

  // const [userMessage, setMessage] = createSignal("");

  const [blockedPopupUrl, setBlockedPopupUrl] = createSignal<string>()
  const [hasError, setHasError] = createSignal(false)
  const [liveSocketInstance, setLiveSocketInstance] = createSignal(null);
  const [userMessage, setUserMessage] = createSignal("");
  // @ts-ignore
  const [lastInput, setLastInput] = createSignal(sessionStorage.getItem("lastinput") ? JSON.parse(sessionStorage.getItem("lastinput")) : null);
  // @ts-ignore
  const [live, setLive] = createSignal(sessionStorage.getItem("live") ? JSON.parse(sessionStorage.getItem("live")) : false);


  // @ts-ignore
  const [liveChatData, setLiveChatData] = createSignal(sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : []);


  const [burgerMenu, setBurgerMenu] = createSignal(false)
  const toggleBurgerIcon = () => {
    setBurgerMenu(!burgerMenu())
  }
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



  createEffect(() => {
    console.log("chat chunks changed", chatChunks());
    if (sessionStorage.getItem("answer")) {
      let chunks = [...chatChunks()];
      if (chunks[chunks.length - 2].input?.type == "card input") {
        // @ts-ignore
        chunks[chunks.length - 2].input.answer = "Submitted"

        sessionStorage.setItem("chatchunks", JSON.stringify(chunks))
      } else {
        // @ts-ignore
        chunks[chunks.length - 2].input.answer = sessionStorage.getItem("answer");

        sessionStorage.setItem("chatchunks", JSON.stringify(chunks))
      }

    } else if (sessionStorage.getItem("chatchunks")) {
      sessionStorage.setItem("chatchunks", JSON.stringify(chatChunks()))
    }
    //  sessionStorage.setItem("chatchunks", JSON.stringify( chatChunks() ) );
  },);


  onMount(() => {
    ; (async () => {
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
      const socketInstance = io("http://localhost:3080", {
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

        socketInstance.on("responseFromQuadz", ({ message, id }) => {
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


          socketInstance.off("responseFromQuadz")
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
        sessionStorage.removeItem("live");
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

  // main section
  createEffect(async () => {
    console.log("live chatttt messssssg", userMessage())


    try {
      console.log("live changedd", live());
      if (live() && !liveSocketInstance()) {
        console.log("live if statement");
        const ticketIdResponse = await getTicketIdQuery({

          apiHost: props.context.apiHost,

          typebotId: props.context.typebot.id,
          resultId: props.initialChatReply.resultId,
          ticketIdVariable: props.context.typebot.settings.general.ticketVariableName,
          accessTokenVariable: props.context.typebot.settings.general.accessTokenVariableName
        });
        console.log("ticket id response", ticketIdResponse);

        // @ts-ignore
        if (ticketIdResponse?.data?.ticketId && ticketIdResponse?.data?.accessToken && props.context.typebot.settings.general.quadzBaseUrl) {
          let liveAgentConnection = await fetch(`${props.context.typebot.settings.general.quadzBaseUrl}/api/v1/livechat`, {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              // @ts-ignore
              'accessToken': ticketIdResponse?.data?.accessToken
            },
            body: JSON.stringify({
              // @ts-ignore
              ticketId: ticketIdResponse?.data?.ticketId,
              roomId: props.initialChatReply.resultId,
              typebotId: props.context.typebot.id,
              message: ''
            })
          });
          liveAgentConnection = await liveAgentConnection.json();
          console.log("live agent connection response", liveAgentConnection);
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
          setLive(true);
          const socketInstance = io(`http://localhost:3080`, {
            // const socketInstance = io(`http://localhost:3080`, {
            reconnection: true, // Enable reconnection
            reconnectionAttempts: Infinity, // Retry indefinitely
            reconnectionDelay: 1000, // Initial delay (in ms) before the first reconnection attempt
            reconnectionDelayMax: 5000, // Maximum delay (in ms) between reconnection attempts
          });
          socketInstance.on("connect", () => {
            // @ts-ignore
            setLiveSocketInstance(socketInstance);
            socketInstance.emit("joinRoom", { sessionId: props.initialChatReply.resultId });

            socketInstance.on("sessionRestarted", () => {
              console.log("session restarting");
              sessionStorage.removeItem("intialize");
              sessionStorage.removeItem("initialize_css");
              sessionStorage.removeItem("bot_init");
              sessionStorage.removeItem("chatchunks");
              sessionStorage.removeItem("live");
              props.initializeBot()
            })

            socketInstance.on("responseFromQuadz", ({ message, id }) => {
              console.log("response from quadz");
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
              fetch(`${props.context.typebot.settings.general.quadzBaseUrl}/api/v1/tickets/addnote`, {
                method: "POST",
                // @ts-ignore
                headers: {
                  "Content-type": "application/json",
                  // @ts-ignore
                  "accessToken": ticketIdResponse?.data?.accessToken
                },
                // body : JSON.stringify( {
                //   _id : sessionStorage.getItem("ticketId"),
                //   comment : comments,
                //   note : false ,
                //   ticketid : false 
                // } )
                body: JSON.stringify({
                  // @ts-ignore
                  ticketid: ticketIdResponse?.data?.ticketId,
                  note: `Live Chat Support ${message}`

                })
              }).then().catch(err => {
                console.log("error", err);
              })
            });
          });

        } else {
          throw new Error("Improperly configured");
        }


      }
    } catch (err) {
      console.log("error", err);
    }

  }, [live()]);

  const userMessageLiveChat = async (message: string) => {

    let socketInstance = liveSocketInstance();
    // @ts-ignore
    socketInstance.emit("sendToQuadz", { message, id: "123", sessionId: props.initialChatReply.resultId });
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
          "answer": message
        },
        messages: [

        ],
        clientSideActions: undefined
      }
    );
    setChatChunks(chunks);
    setUserMessage("");

    // @ts-ignore
    let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

    livechatData.push({ user: "User", message: message })
    // @ts-ignore
    sessionStorage.setItem("liveChat", JSON.stringify(livechatData))

    // @ts-ignore
    storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
      console.log("error", err);
    })

    const ticketIdResponse = await getTicketIdQuery({

      apiHost: props.context.apiHost,

      typebotId: props.context.typebot.id,
      resultId: props.initialChatReply.resultId,
      ticketIdVariable: props.context.typebot.settings.general.ticketVariableName,
      accessTokenVariable: props.context.typebot.settings.general.accessTokenVariableName
    });

    fetch(`${props.context.typebot.settings.general.quadzBaseUrl}/api/v1/tickets/addnote`, {
      method: "POST",
      // @ts-ignore
      headers: {
        "Content-type": "application/json",
        // @ts-ignore
        "accessToken": ticketIdResponse?.data?.accessToken
      },
      // body : JSON.stringify( {
      //   _id : sessionStorage.getItem("ticketId"),
      //   comment : comments,
      //   note : false ,
      //   ticketid : false 
      // } )
      body: JSON.stringify({
        // @ts-ignore
        ticketid: ticketIdResponse?.data?.ticketId,
        note: `Live Chat User ${message}`

      })
    }).then().catch(err => {
      console.log("error", err);
    })




  }



  const toggleLiveAgent = async () => {
    try {
      if (!live()) {
        console.log("props resultId", props);
        const ticketIdResponse = await getTicketIdQuery({

          apiHost: props.context.apiHost,

          typebotId: props.context.typebot.id,
          resultId: props.initialChatReply.resultId,
          ticketIdVariable: props.context.typebot.settings.general.ticketVariableName,
          accessTokenVariable: props.context.typebot.settings.general.accessTokenVariableName
        });
        console.log("ticket id response", ticketIdResponse);
        // @ts-ignore
        if (ticketIdResponse?.data?.ticketId && ticketIdResponse?.data?.accessToken && props.context.typebot.settings.general.quadzBaseUrl) {
          let liveAgentConnection = await fetch(`${props.context.typebot.settings.general.quadzBaseUrl}/api/v1/livechat`, {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              // @ts-ignore
              'accessToken': ticketIdResponse?.data?.accessToken
            },
            body: JSON.stringify({
              // @ts-ignore
              ticketId: ticketIdResponse?.data?.ticketId,
              roomId: props.initialChatReply.resultId,
              message: 'abcd'
            })
          });
          liveAgentConnection = await liveAgentConnection.json();
          console.log("live agent connection response", liveAgentConnection);
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
          throw new Error("Improperly configured");
        }





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
    } catch (err) {
      console.log("error happened inside toggleLiveAgent");
    }

  }




  return (


    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-scroll w-full min-h-full px-3  relative scrollable-container typebot-chat-view scroll-smooth gap-2"
      style={{ position: "relative" }}
    >

      <header class="bg-blue-500 text-white p-3 h-10  w-full" >
        {props.context.typebot.settings.general.isLiveChatEnabled && (
          // <div style={{ "margin-top": "10px", "cursor": "pointer" }} >

          < >
            {/* <button> <img style={{ height: "25px", "margin-right": "10px" }} src={"https://quadz.blob.core.windows.net/demo1/maximize.png"} /> </button> */}
            {/* <button onClick={() => {
              console.log("stop clicked restart");
              sessionStorage.removeItem("intialize");
              sessionStorage.removeItem("initialize_css");
              sessionStorage.removeItem("bot_init");
              sessionStorage.removeItem("chatchunks");
              sessionStorage.removeItem("live");
              props.initializeBot()
            }} > <img style={{ height: "25px", "margin-right": "10px" }} src={"https://quadz.blob.core.windows.net/demo1/stop.png"} /> </button> */}
            {/* <button onClick={() => {
              // toggleLiveAgent();
              // setLive();
              let liveVal = live();
              // @ts-ignore
              sessionStorage.setItem("live", !liveVal)
              setLive(!liveVal);
              if (liveVal) {
                console.log("enrtered exitt")
                let chunks = [...chatChunks()];
                // chunks[chunks.length - 1] = { ...chunks[chunks.length - 1] };
                // chunks[chunks.length - 1].input = undefined
                console.log("last input", lastInput())
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
              // let currentVal = liveAgent();
              // setLiveAgent( !currentVal );
            }} > <img style={{ height: "25px" }} src={"https://quadz.blob.core.windows.net/demo1/live-chat.png"} /> </button> */}
          </>
          // </div>
        )}

        <div class="flex justify-between items-center">
          <div class="">
            <button id="burgerIcon" onClick={toggleBurgerIcon} class="text-white focus:outline-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18C3.71667 18 3.47917 17.9042 3.2875 17.7125C3.09583 17.5208 3 17.2833 3 17C3 16.7167 3.09583 16.4792 3.2875 16.2875C3.47917 16.0958 3.71667 16 4 16H15C15.2833 16 15.5208 16.0958 15.7125 16.2875C15.9042 16.4792 16 16.7167 16 17C16 17.2833 15.9042 17.5208 15.7125 17.7125C15.5208 17.9042 15.2833 18 15 18H4ZM18.9 16.3L15.3 12.7C15.1 12.5 15 12.2667 15 12C15 11.7333 15.1 11.5 15.3 11.3L18.9 7.7C19.0833 7.51667 19.3167 7.425 19.6 7.425C19.8833 7.425 20.1167 7.51667 20.3 7.7C20.4833 7.88333 20.575 8.11667 20.575 8.4C20.575 8.68333 20.4833 8.91667 20.3 9.1L17.4 12L20.3 14.9C20.4833 15.0833 20.575 15.3167 20.575 15.6C20.575 15.8833 20.4833 16.1167 20.3 16.3C20.1167 16.4833 19.8833 16.575 19.6 16.575C19.3167 16.575 19.0833 16.4833 18.9 16.3ZM4 13C3.71667 13 3.47917 12.9042 3.2875 12.7125C3.09583 12.5208 3 12.2833 3 12C3 11.7167 3.09583 11.4792 3.2875 11.2875C3.47917 11.0958 3.71667 11 4 11H12C12.2833 11 12.5208 11.0958 12.7125 11.2875C12.9042 11.4792 13 11.7167 13 12C13 12.2833 12.9042 12.5208 12.7125 12.7125C12.5208 12.9042 12.2833 13 12 13H4ZM4 8C3.71667 8 3.47917 7.90417 3.2875 7.7125C3.09583 7.52083 3 7.28333 3 7C3 6.71667 3.09583 6.47917 3.2875 6.2875C3.47917 6.09583 3.71667 6 4 6H15C15.2833 6 15.5208 6.09583 15.7125 6.2875C15.9042 6.47917 16 6.71667 16 7C16 7.28333 15.9042 7.52083 15.7125 7.7125C15.5208 7.90417 15.2833 8 15 8H4Z" fill="white" />
              </svg>
            </button>
            {burgerMenu() && (
              <div onMouseLeave={() => setBurgerMenu(false)} class="absolute w-[275px] h-[248px] z-50  left-0 rounded-r-2xl bg-white text-black p-4">
                <div class='p-3 flex gap-2.5 text-[#ABB4C4]'>Menu</div>
                <ul>
                  <li>
                    <button class='rounded-xl p-3 w-full hover:bg-[#E6F1FA] flex gap-3 no-underline' onClick={() => {
                      console.log("stop clicked restart");
                      sessionStorage.removeItem("intialize");
                      sessionStorage.removeItem("initialize_css");
                      sessionStorage.removeItem("bot_init");
                      sessionStorage.removeItem("chatchunks");
                      sessionStorage.removeItem("live");
                      props.initializeBot()
                    }} >Restart  </button>
                  </li>
                  {/* <li><a class='rounded-xl p-3 hover:bg-[#E6F1FA] flex gap-3 no-underline' href="">Download Chat</a></li> */}
                  <li><a ></a>
                    <button class='rounded-xl w-full p-3 hover:bg-[#E6F1FA] flex gap-3 no-underline' onClick={() => {
                      // toggleLiveAgent();
                      // setLive();
                      let liveVal = live();
                      // @ts-ignore
                      sessionStorage.setItem("live", !liveVal)
                      setLive(!liveVal);
                      if (liveVal) {
                        console.log("enrtered exitt")
                        let chunks = [...chatChunks()];
                        // chunks[chunks.length - 1] = { ...chunks[chunks.length - 1] };
                        // chunks[chunks.length - 1].input = undefined
                        console.log("last input", lastInput())
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
                      // let currentVal = liveAgent();
                      // setLiveAgent( !currentVal );
                    }} >
                      {!live() ? 'Live chat connect' : 'Live chat disconnect'}
                    </button>
                  </li>
                  {/* Add more menu items as needed */}
                </ul>

              </div>

            )}
          </div>
          <div />

        </div>
      </header>

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
      {live() && liveSocketInstance() != null && <div style={{ display: "flex", "justify-items": "center", width: "100%", "align-items": "center", "flex-direction": "inherit", "margin-top": "15px" }} >
        <div style={{ display: "flex", "flex-direction": "row", "gap": "4" }} >
          <input value={userMessage()} type="text" placeholder='type your message' style={{ border: '1px solid black' }} class=" w-[200px] mr-2 lg:w-full md:w-full sm:w-full rounded-md text-[#364652] p-1" onChange={e => setUserMessage(e.target.value)} />
          <button class="rounded-full bg-[#0077CC]" onClick={() => userMessageLiveChat(userMessage())} >
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
            </svg>  </button>
        </div>
      </div>}
      <BottomSpacer />
    </div>

  )
}

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />
}
