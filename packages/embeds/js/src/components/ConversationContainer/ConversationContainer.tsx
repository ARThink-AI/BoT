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
import { initiateCall, sendMessageQuery, storeLiveChatQuery } from '@/queries/sendMessageQuery'
import { getTicketIdQuery } from '@/queries/sendMessageQuery'
// import { initiateCall, sendMessageQuery } from '@/queries/sendMessageQuery'
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

import { env } from "@typebot.io/env";

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
  // @ts-ignore
  // const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>(!sessionStorage.getItem("chatchunks") ? ([
  //   {
  //     input: props.initialChatReply.input,
  //     messages: props.initialChatReply.messages,
  //     clientSideActions: props.initialChatReply.clientSideActions,
  //   },
  //   // @ts-ignore
  // ]) : sessionStorage.getItem('live') && JSON.parse(sessionStorage.getItem('live')) == false ?
  //   [
  //     {
  //       input: props.initialChatReply.input,
  //       messages: props.initialChatReply.messages,
  //       clientSideActions: props.initialChatReply.clientSideActions,
  //     },
  //     // @ts-ignore
  //   ] : JSON.parse(sessionStorage.getItem("chatchunks")))

  const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>(
    // @ts-ignore
    JSON.parse(sessionStorage.getItem('live')) === true ?
      JSON.parse(sessionStorage.getItem("chatchunks") || '[]') :
      [
        {
          input: props.initialChatReply.input,
          messages: props.initialChatReply.messages,
          clientSideActions: props.initialChatReply.clientSideActions,
        }
      ]
  );

  // const [chatChunks, setChatChunks] = createSignal<ChatChunkType[]>([
  //   {
  //     input: props.initialChatReply.input,
  //     messages: props.initialChatReply.messages,
  //     clientSideActions: props.initialChatReply.clientSideActions,
  //   },
  //   // @ts-ignore
  // ])


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
  const [userMessage, setUserMessage] = createSignal("");
  // @ts-ignore
  const [lastInput, setLastInput] = createSignal(sessionStorage.getItem("lastinput") ? JSON.parse(sessionStorage.getItem("lastinput")) : null);
  // @ts-ignore
  const [live, setLive] = createSignal(sessionStorage.getItem("live") ? JSON.parse(sessionStorage.getItem("live")) : false);

  const [stream, setStream] = createSignal(null);
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordedAudio, setRecordedAudio] = createSignal(null);
  const [inputValue, setInputValue] = createSignal('')

  const [isOpen, setIsOpen] = createSignal(false);
  const [phoneValidation, setPhoneValidation] = createSignal(true);

  // @ts-ignore
  const [liveChatData, setLiveChatData] = createSignal(sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : []);
  const [phoneNumber, setPhoneNumber] = createSignal("")

  const [isVisible, setIsVisible] = createSignal(false);
  const [recognition, setRecognition] = createSignal(null)



  const [burgerMenu, setBurgerMenu] = createSignal(false)
  const toggleBurgerIcon = () => {
    setBurgerMenu(!burgerMenu())
  }

  createEffect(() => {
    window.addEventListener('beforeunload', function (e) {
      e.preventDefault();
      // @ts-ignore
      liveSocketInstance()?.emit('userDisconnect', { sessionId: props.initialChatReply.resultId });

      // @ts-ignore
      liveSocketInstance()?.on('userDisconnected', (data) => {

        // @ts-ignore
        let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

        livechatData.push({ event_name: "user_disconnected", message: "User disconnected", label: true })
        // @ts-ignore
        sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
        storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
          console.log("error", err);
        })
        // @ts-ignore
        liveSocketInstance()?.disconnect()
        setLiveSocketInstance(null)
      })

    });
  }, [])
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
        const response = await fetch("/api/v2/sendMessage", {
          method: "POST",
          // @ts-ignore
          headers: {
            "Content-type": "application/json"

          },
          body: JSON.stringify({
            startParams: {
              typebot: props.initialChatReply.typebot.settings.general.publicId
            }
          })
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
      const socketInstance = io("https://socket.quadz.ai", {
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
        // sessionStorage.removeItem("intialize");
        // sessionStorage.removeItem("initialize_css");
        // sessionStorage.removeItem("bot_init");
        // sessionStorage.removeItem("chatchunks");
        // props.initializeBot();
        setIsVisible(true)
        setTimeout(() => {
          setIsVisible(false)
          console.log("set timeout called session timout")
          sessionStorage.removeItem("intialize");
          sessionStorage.removeItem("initialize_css");
          sessionStorage.removeItem("bot_init");
          sessionStorage.removeItem("chatchunks");
          sessionStorage.removeItem("live");
          sessionStorage.removeItem("chatchunks");
          sessionStorage.removeItem("event_message");
          props.initializeBot();
        }, 3000)
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
    if (!data.input && (props.initialChatReply.typebot.settings.general.isAutoRefreshEnabled ?? true)) {
      setTimeout(() => {
        console.log("its the end and auto refresh enabled");
        sessionStorage.removeItem("intialize");
        sessionStorage.removeItem("initialize_css");
        sessionStorage.removeItem("bot_init");
        sessionStorage.removeItem("chatchunks");
        sessionStorage.removeItem("event_message");
        props.initializeBot();
        return
      }, 2000);


    }
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

    // window.addEventListener('beforeunload', function (e) {
    //   e.preventDefault();
    //   liveSocketInstance()?.emit('userDisconnect', { sessionId: props.initialChatReply.resultId });
    //   // @ts-ignore
    //   // liveSocketInstance()?.on('userDisconnected', (data) => {
    //   //   // let eventMessage = sessionStorage.getItem("event_message") ? JSON.parse(sessionStorage.getItem("event_message")) : [];

    //   //   // eventMessage.push({ event: data.message })

    //   //   // sessionStorage.setItem("event_message", JSON.stringify(eventMessage))
    //   //   // @ts-ignore
    //   //   let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

    //   //   livechatData.push({ event_name: "user_disconnected", message: "User disconnected", label: true })
    //   //   // @ts-ignore
    //   //   sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
    //   //   storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
    //   //     console.log("error", err);
    //   //   })
    //   //   // @ts-ignore
    //   //   liveSocketInstance()?.disconnect()
    //   //   setLiveSocketInstance(null)

    //   // })
    //   // e.returnValue = '';
    // });

    // let hasEmitted = false;

    // window.addEventListener('beforeunload', function (e) {
    //   if (!hasEmitted) {
    //     e.preventDefault();
    //     liveSocketInstance()?.emit('userDisconnect', { sessionId: props.initialChatReply.resultId }, () => {
    //       hasEmitted = true;
    //     });
    //   }
    // });

    // let event_message = [];
    // @ts-ignore
    // let eventMessage = sessionStorage.getItem("event_message") ? JSON.parse(sessionStorage.getItem("event_message")) : [];
    try {
      console.log("live changedd", live());
      if (!live()) {
        // @ts-ignore
        liveSocketInstance()?.emit('userDisconnect', { sessionId: props.initialChatReply.resultId });
        // @ts-ignore
        liveSocketInstance()?.on('userDisconnected', (data) => {
          // let eventMessage = sessionStorage.getItem("event_message") ? JSON.parse(sessionStorage.getItem("event_message")) : [];

          // eventMessage.push({ event: data.message })

          // sessionStorage.setItem("event_message", JSON.stringify(eventMessage))
          // @ts-ignore
          let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

          livechatData.push({ event_name: "user_disconnected", message: "User disconnected", label: true })
          // @ts-ignore
          sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
          storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
            console.log("error", err);
          })
          // @ts-ignore
          liveSocketInstance()?.disconnect()
          setLiveSocketInstance(null)

        })
      }
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
          if (chunks[chunks.length - 1].input != undefined) {
            sessionStorage.setItem("lastinput", JSON.stringify(chunks[chunks.length - 1].input));
          }


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
          const socketInstance = io(`https://socket.quadz.ai`, {
            // const socketInstance = io(`https://socket.quadz.ai`, {
            reconnection: true, // Enable reconnection
            reconnectionAttempts: Infinity, // Retry indefinitely
            reconnectionDelay: 1000, // Initial delay (in ms) before the first reconnection attempt
            reconnectionDelayMax: 5000, // Maximum delay (in ms) between reconnection attempts
          });
          socketInstance.on("connect", () => {
            // @ts-ignore
            setLiveSocketInstance(socketInstance);
            socketInstance.emit("joinRoom", { sessionId: props.initialChatReply.resultId });
            // socketInstance.on('disconnect', () => {
            //   console.log('A user disconnected');
            //   // @ts-ignore
            //   let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

            //   livechatData.push({ event_name: "user_disconnected_refresh", message: "User disconnected", label: true })
            //   // @ts-ignore
            //   sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
            //   storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
            //     console.log("error", err);
            //   })

            // });
            socketInstance.emit('userConnected', { sessionId: props.initialChatReply.resultId });
            socketInstance.on('connected', (data) => {
              console.log("socket connection message", data.message)
              // event_message.push({ event: data.message })
              // sessionStorage.setItem("event_message", JSON.stringify(data.message))
              // storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: event_message }).then().catch(err => {
              //   console.log("error", err);
              // })
              // let eventData = sessionStorage.getItem("eventMessage") ? JSON.parse(sessionStorage.getItem("eventMessage")) : [];
              // // @ts-ignore
              // eventData.push({ event: data.message })
              // // @ts-ignore
              // sessionStorage.setItem("eventMessage", JSON.stringify(eventData))
              // // @ts-ignore
              // storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: eventData }).then().catch(err => {
              //   console.log("error", err);
              // }) 
              // @ts-ignore
              // let eventMessage = sessionStorage.getItem("event_message") ? JSON.parse(sessionStorage.getItem("event_message")) : [];

              let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

              livechatData.push({ event_name: "user_connected", message: "User connected", label: true })
              // @ts-ignore
              sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
              storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
                console.log("error", err);
              })

            })



            socketInstance.on("sessionRestarted", () => {
              console.log("session restarting");
              sessionStorage.removeItem("intialize");
              sessionStorage.removeItem("initialize_css");
              sessionStorage.removeItem("bot_init");
              sessionStorage.removeItem("chatchunks");
              sessionStorage.removeItem("live");
              sessionStorage.removeItem("event_message");
              // @ts-ignore
              let livechatData = sessionStorage.getItem("liveChat") ? JSON.parse(sessionStorage.getItem("liveChat")) : [];

              livechatData.push({ event_name: "session_restart", message: "You have restarted session", label: true })
              // @ts-ignore
              sessionStorage.setItem("liveChat", JSON.stringify(livechatData))
              storeLiveChatQuery({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, resultId: props.initialChatReply.resultId, livechat: livechatData }).then().catch(err => {
                console.log("error", err);
              })
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
  // const userInputClicked = async () => {
  //   try {
  //     console.log("user input clicked");
  //     let userr = userInput();
  //     setUserInput("");
  //     let chunks = [...chatChunks()];
  //     chunks.push(
  //       {
  //         input: {
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
  //           "prefilledValue": "Hi",
  //           "answer": userr
  //         },
  //         messages: [

  //         ],
  //         clientSideActions: undefined
  //       }
  //     );
  //     setChatChunks(chunks);

  //     if (sessionId()) {
  //       const response = await fetch(`/api/v2/sendMessage`, {
  //         method: "POST",
  //         // @ts-ignore
  //         headers: {
  //           "Content-type": "application/json"


  //         },
  //         body: JSON.stringify({
  //           message: userr,
  //           sessionId: sessionId()
  //         })

  //       });
  //       const messageResp = await response.json();
  //       console.log("message Resp", messageResp);
  //       if (messageResp?.message == "Session expired. You need to start a new session.") {
  //         console.log("session expired restating...");
  //         const response = await fetch("/api/v2/sendMessage", {
  //           method: "POST",
  //           // @ts-ignore
  //           headers: {
  //             "Content-type": "application/json"

  //           },
  //           body: JSON.stringify({
  //             startParams: {
  //               typebot: props.initialChatReply.typebot.settings.general.publicId
  //             }
  //           })
  //           // body : JSON.stringify( {
  //           //   _id : sessionStorage.getItem("ticketId"),
  //           //   comment : comments,
  //           //   note : false ,
  //           //   ticketid : false 
  //           // } )
  //           // body: JSON.stringify({
  //           //   // @ts-ignore
  //           //   ticketid: sessionStorage.getItem("ticketId"),
  //           //   note: comments.join(" ")

  //           // })
  //         });
  //         const sessionResponse = await response.json();
  //         // setSessionId(sessionResponse?.sessionId);
  //         const responsee = await fetch(`/api/v2/sendMessage`, {
  //           method: "POST",
  //           // @ts-ignore
  //           headers: {
  //             "Content-type": "application/json"


  //           },
  //           body: JSON.stringify({
  //             message: userr,
  //             sessionId: sessionResponse?.sessionId
  //           })

  //         });
  //         const messageResp = await responsee.json();
  //         let chunks = [...chatChunks()];
  //         chunks.push({
  //           messages: messageResp?.messages,
  //           clientSideActions: undefined
  //         })

  //         setChatChunks(chunks);

  //         // setUserInput("");
  //         sessionStorage.removeItem("answer");
  //         setSessionId(sessionResponse?.sessionId);


  //       } else {
  //         let chunks = [...chatChunks()];
  //         chunks.push({
  //           messages: messageResp?.messages,
  //           clientSideActions: undefined
  //         })

  //         setChatChunks(chunks);

  //         // setUserInput("");
  //         sessionStorage.removeItem("answer");
  //       }


  //     } else {
  //       sessionStorage.removeItem("answer");
  //       // setUserInput("");
  //     }
  //   } catch (err) {
  //     console.log("Error happened inside userInputClicked", err?.message);
  //   }
  // }



  // const startRecordingUserVoice = async () => {
  //   try {
  //     console.log("start recording called");
  //     const audioStream = await navigator.mediaDevices.getUserMedia({
  //       audio: {
  //         deviceId: "default",
  //         sampleRate: 48000, // Adjust to your requirement
  //         sampleSize: 16,
  //         channelCount: 1,
  //       },
  //       video: false,
  //     });

  //     setStream(audioStream);
  //     const mediaRecorder = new MediaRecorder(audioStream);
  //     const chunks = [];

  //     mediaRecorder.ondataavailable = (event) => {
  //       console.log("on data aviaalble", event);
  //       chunks.push(event.data);

  //     };
  //     mediaRecorder.onstop = async () => {
  //       console.log("on stop");
  //       const blob = new Blob(chunks, { type: 'audio/wav' });
  //       setRecordedAudio(URL.createObjectURL(blob));

  //       // Convert the recorded audio to text using Google Cloud Speech-to-Text API
  //       const audioData = await blob.arrayBuffer();
  //       const base64Audio = Buffer.from(audioData).toString('base64');
  //       console.log("audio data", audioData);
  //       try {
  //         const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           // body: JSON.stringify({ audio: base64Audio }),
  //           body: JSON.stringify({ audio: base64Audio, type: "speechtotext", text: "Hii" }),
  //         });

  //         if (!response.ok) {
  //           throw new Error('Error converting audio to text');
  //         }

  //         const result = await response.json();
  //         console.log("result transcription", result.message.transcription);
  //         // if ( inputNode() ) {
  //         //   let n = inputNode();
  //         //   n.value = result.transcription
  //         // }
  //         const val = userInput() + " " + result.message.transcription;
  //         // setInputValue(val);

  //         console.log("microphone recorded", userInput())

  //         if (val.length > 1) {
  //           setUserInput(val)
  //         }

  //         setTimeout(() => {
  //           if (val.length > 1) {
  //             console.log("user voice", val.length)
  //             userInputClicked()
  //           }
  //         }, 4000)

  //         // node.value = result.transcription;
  //         // setRecordedText(result.transcription);
  //       } catch (error) {
  //         console.error('Error calling Speech-to-Text API:', error);
  //       }
  //     };
  //     // mediaRecorder.onstop = () => {
  //     //   console.log("on stop");
  //     //   const blob = new Blob(chunks, { type: 'audio/wav' });
  //     //   setRecordedAudio(URL.createObjectURL(blob));
  //     // };
  //     console.log("media recorder", mediaRecorder);
  //     mediaRecorder.start()

  //     setIsRecording(true);
  //     // const stopRecordingUserVoice = async () => {
  //     //   console.log("stop recording callled");
  //     //   if (stream()) {
  //     //     stream().getTracks().forEach((track) => {
  //     //       track.stop();
  //     //     });
  //     //   }
  //     //   setIsRecording(false);
  //     // }

  //     //  Handle Edge Case: Stop recording after 10 seconds (adjust as needed)
  //     setTimeout(() => {
  //       if (isRecording()) {
  //         stopRecordingUserVoice()
  //         // setInputValue('')
  //         // mediaRecorder.stop();
  //         // setIsRecording(false);




  //       }
  //     }, 4000);

  //   } catch (err) {
  //     // setError('Permission to access the microphone was denied.');
  //     console.error('Error accessing microphone:', err);
  //   }
  // }
  // const stopRecordingUserVoice = async () => {
  //   console.log("stop recording callled");
  //   if (stream()) {
  //     stream().getTracks().forEach((track) => {
  //       track.stop();

  //     });
  //   }
  //   setIsRecording(false);

  //   // if (userInput()) {
  //   //   console.log("userInput value", isRecording())
  //   //   userInputClicked()

  //   // }


  //   // userInputClicked()
  // }
  const startRecordingUserVoice = () => {
    try {
      console.log("start recording called");

      // Check if the browser supports the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Web Speech API is not supported in this browser.');
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false; // Change to false to allow speechend detection
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log("Speech recognition started");
        setIsRecording(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        console.log("Transcript:", transcript);

        const val = userInput() + " " + transcript;
        if (val.length > 1) {
          setUserInput(val);
        }

        // Trigger user input action immediately after speech recognition ends
        if (val.length > 1) {
          console.log("user voice", val.length);
          userInputClicked();
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          stopRecordingUserVoice();
        }
      };

      recognitionInstance.onspeechend = () => {
        console.log("Speech has stopped being detected");
        stopRecordingUserVoice();
      };

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
      recognitionInstance.start();

    } catch (err) {
      console.error('Error accessing speech recognition:', err);
    }
  };

  const stopRecordingUserVoice = () => {
    if (recognition()) {
      recognition()?.stop();
      setIsRecording(false);

    }
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setPhoneNumber("");
    setPhoneValidation(true);
    setIsOpen(false);
  }

  const handleSubmit = async () => {
    // Logic for handling submit action
    try {
      // console.log("Submit clicked!");
      await initiateCall({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, phoneNumber: `+91${phoneNumber()}` })
      setPhoneNumber("");
      closeModal();
    } catch (err) {
      console.log("error", err);
    }


  };
  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber)
  }

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setPhoneNumber(value)
    // console.log("call inputttttttttttttt", value)
    setPhoneValidation(validatePhone(value))

  }
  const inputPhoneTenDigitHandle = (e: any) => {
    let { value } = e.target;
    const maxLength = 9; // Maximum allowed length

    if (value.length > maxLength) {
      e.preventDefault()

      return;
    }
  };

  // const handleSubmitOnEnter = (e) => {
  //   // console.log("enter clickedd", e)
  //   if (e.key === 'Enter') {
  //     e.preventDefault()
  //     userInputClicked()
  //   }

  // }

  const closeSnackbar = () => {
    setIsVisible(false);
  };



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
  const userInputClicked = async () => {
    try {
      console.log("user input clicked");
      let userr = userInput();
      setUserInput("");
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
            "answer": userr
          },
          messages: [

          ],
          clientSideActions: undefined
        }
      );
      setChatChunks(chunks);

      if (sessionId()) {
        const response = await fetch(`/api/v2/sendMessage`, {
          method: "POST",
          // @ts-ignore
          headers: {
            "Content-type": "application/json"


          },
          body: JSON.stringify({
            message: userr,
            sessionId: sessionId()
          })

        });
        const messageResp = await response.json();
        console.log("message Resp", messageResp);
        if (messageResp?.message == "Session expired. You need to start a new session.") {
          console.log("session expired restating...");
          const response = await fetch("/api/v2/sendMessage", {
            method: "POST",
            // @ts-ignore
            headers: {
              "Content-type": "application/json"

            },
            body: JSON.stringify({
              startParams: {
                typebot: props.initialChatReply.typebot.settings.general.publicId
              }
            })
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
          // setSessionId(sessionResponse?.sessionId);
          const responsee = await fetch(`/api/v2/sendMessage`, {
            method: "POST",
            // @ts-ignore
            headers: {
              "Content-type": "application/json"


            },
            body: JSON.stringify({
              message: userr,
              sessionId: sessionResponse?.sessionId
            })

          });
          const messageResp = await responsee.json();
          let chunks = [...chatChunks()];
          chunks.push({
            messages: messageResp?.messages,
            clientSideActions: undefined
          })

          setChatChunks(chunks);

          // setUserInput("");
          sessionStorage.removeItem("answer");
          setSessionId(sessionResponse?.sessionId);


        } else {
          let chunks = [...chatChunks()];
          chunks.push({
            messages: messageResp?.messages,
            clientSideActions: undefined
          })

          setChatChunks(chunks);

          // setUserInput("");
          sessionStorage.removeItem("answer");
        }


      } else {
        sessionStorage.removeItem("answer");
        // setUserInput("");
      }
    } catch (err) {
      console.log("Error happened inside userInputClicked", err?.message);
    }
  }



  // const startRecordingUserVoice = async () => {
  //   try {
  //     console.log("start recording called");
  //     const audioStream = await navigator.mediaDevices.getUserMedia({
  //       audio: {
  //         deviceId: "default",
  //         sampleRate: 48000, // Adjust to your requirement
  //         sampleSize: 16,
  //         channelCount: 1,
  //       },
  //       video: false,
  //     });

  //     setStream(audioStream);
  //     const mediaRecorder = new MediaRecorder(audioStream);
  //     const chunks = [];

  //     mediaRecorder.ondataavailable = (event) => {
  //       console.log("on data aviaalble", event);
  //       chunks.push(event.data);

  //     };
  //     mediaRecorder.onstop = async () => {
  //       console.log("on stop");
  //       const blob = new Blob(chunks, { type: 'audio/wav' });
  //       setRecordedAudio(URL.createObjectURL(blob));

  //       // Convert the recorded audio to text using Google Cloud Speech-to-Text API
  //       const audioData = await blob.arrayBuffer();
  //       const base64Audio = Buffer.from(audioData).toString('base64');
  //       console.log("audio data", audioData);
  //       try {
  //         const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           // body: JSON.stringify({ audio: base64Audio }),
  //           body: JSON.stringify({ audio: base64Audio, type: "speechtotext", text: "Hii" }),
  //         });

  //         if (!response.ok) {
  //           throw new Error('Error converting audio to text');
  //         }

  //         const result = await response.json();
  //         console.log("result transcription", result.message.transcription);
  //         // if ( inputNode() ) {
  //         //   let n = inputNode();
  //         //   n.value = result.transcription
  //         // }
  //         const val = userInput() + " " + result.message.transcription;
  //         // setInputValue(val);

  //         console.log("microphone recorded", userInput())

  //         if (val.length > 1) {
  //           setUserInput(val)
  //         }

  //         setTimeout(() => {
  //           if (val.length > 1) {
  //             console.log("user voice", val.length)
  //             userInputClicked()
  //           }
  //         }, 4000)

  //         // node.value = result.transcription;
  //         // setRecordedText(result.transcription);
  //       } catch (error) {
  //         console.error('Error calling Speech-to-Text API:', error);
  //       }
  //     };
  //     // mediaRecorder.onstop = () => {
  //     //   console.log("on stop");
  //     //   const blob = new Blob(chunks, { type: 'audio/wav' });
  //     //   setRecordedAudio(URL.createObjectURL(blob));
  //     // };
  //     console.log("media recorder", mediaRecorder);
  //     mediaRecorder.start()

  //     setIsRecording(true);
  //     // const stopRecordingUserVoice = async () => {
  //     //   console.log("stop recording callled");
  //     //   if (stream()) {
  //     //     stream().getTracks().forEach((track) => {
  //     //       track.stop();
  //     //     });
  //     //   }
  //     //   setIsRecording(false);
  //     // }

  //     //  Handle Edge Case: Stop recording after 10 seconds (adjust as needed)
  //     setTimeout(() => {
  //       if (isRecording()) {
  //         stopRecordingUserVoice()
  //         // setInputValue('')
  //         // mediaRecorder.stop();
  //         // setIsRecording(false);




  //       }
  //     }, 4000);

  //   } catch (err) {
  //     // setError('Permission to access the microphone was denied.');
  //     console.error('Error accessing microphone:', err);
  //   }
  // }
  // const stopRecordingUserVoice = async () => {
  //   console.log("stop recording callled");
  //   if (stream()) {
  //     stream().getTracks().forEach((track) => {
  //       track.stop();

  //     });
  //   }
  //   setIsRecording(false);

  //   // if (userInput()) {
  //   //   console.log("userInput value", isRecording())
  //   //   userInputClicked()

  //   // }


  //   // userInputClicked()
  // }
  // const startRecordingUserVoice = () => {
  //   try {
  //     console.log("start recording called");

  //     // Check if the browser supports the Web Speech API
  //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  //     if (!SpeechRecognition) {
  //       throw new Error('Web Speech API is not supported in this browser.');
  //     }

  //     const recognitionInstance = new SpeechRecognition();
  //     recognitionInstance.continuous = false; // Change to false to allow speechend detection
  //     recognitionInstance.interimResults = false;
  //     recognitionInstance.lang = 'en-US';

  //     recognitionInstance.onstart = () => {
  //       console.log("Speech recognition started");
  //       setIsRecording(true);
  //     };

  //     recognitionInstance.onresult = (event) => {
  //       const transcript = Array.from(event.results)
  //         .map(result => result[0])
  //         .map(result => result.transcript)
  //         .join('');

  //       console.log("Transcript:", transcript);

  //       const val = userInput() + " " + transcript;
  //       if (val.length > 1) {
  //         setUserInput(val);
  //       }

  //       // Trigger user input action immediately after speech recognition ends
  //       if (val.length > 1) {
  //         console.log("user voice", val.length);
  //         userInputClicked();
  //       }
  //     };

  //     recognitionInstance.onerror = (event) => {
  //       console.error("Speech recognition error:", event.error);
  //       if (event.error === 'no-speech' || event.error === 'audio-capture') {
  //         stopRecordingUserVoice();
  //       }
  //     };

  //     recognitionInstance.onspeechend = () => {
  //       console.log("Speech has stopped being detected");
  //       stopRecordingUserVoice();
  //     };

  //     recognitionInstance.onend = () => {
  //       console.log("Speech recognition ended");
  //       setIsRecording(false);
  //     };

  //     setRecognition(recognitionInstance);
  //     recognitionInstance.start();

  //   } catch (err) {
  //     console.error('Error accessing speech recognition:', err);
  //   }
  // };

  // const stopRecordingUserVoice = () => {
  //   if (recognition()) {
  //     recognition()?.stop();
  //     setIsRecording(false);

  //   }
  // };

  // const openModal = () => setIsOpen(true);
  // const closeModal = () => {
  //   setPhoneNumber("");
  //   setPhoneValidation(true);
  //   setIsOpen(false);
  // }

  // const handleSubmit = async () => {
  //   // Logic for handling submit action
  //   try {
  //     // console.log("Submit clicked!");
  //     await initiateCall({ apiHost: props.context.apiHost, typebotId: props.context.typebot.id, phoneNumber: `+91${phoneNumber()}` })
  //     setPhoneNumber("");
  //     closeModal();
  //   } catch (err) {
  //     console.log("error", err);
  //   }


  // };
  // const validatePhone = (phoneNumber: string) => {
  //   const phoneRegex = /^\d{10}$/;
  //   return phoneRegex.test(phoneNumber)
  // }

  // const handleInputChange = (e: any) => {
  //   const { value } = e.target;
  //   setPhoneNumber(value)
  //   // console.log("call inputttttttttttttt", value)
  //   setPhoneValidation(validatePhone(value))

  // }
  // const inputPhoneTenDigitHandle = (e: any) => {
  //   let { value } = e.target;
  //   const maxLength = 9; // Maximum allowed length

  //   if (value.length > maxLength) {
  //     e.preventDefault()

  //     return;
  //   }
  // };

  const handleSubmitOnEnter = (e) => {
    // console.log("enter clickedd", e)
    if (e.key === 'Enter') {
      e.preventDefault()
      userInputClicked()
    }

  }

  // const closeSnackbar = () => {
  //   setIsVisible(false);
  // };




  return (


    <div
      ref={chatContainer}
      class="flex flex-col overflow-y-scroll w-full min-h-full  relative scrollable-container typebot-chat-view scroll-smooth gap-2"
      style={{ position: "relative" }}
    >
      {props.context.typebot.settings.general.isLiveChatEnabled && <header class="bg-blue-500 text-white p-3 h-10  w-full" >
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
                      sessionStorage.removeItem("event_message");
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
                            //removed lastinput
                            input: '',
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
      </header >
      }

      <div class='wrapper-container px-3 mt-[5%]'>




        {/* snackbar for session timout */}
        <div class={`fixed bottom-[90px] right-[-125px]   transform -translate-x-1/2 ${isVisible() ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
          <div class="bg-[#0077CC] text-white px-4 py-2 rounded shadow-lg flex items-center">
            <span>{"Session timeout restart to continue"}</span>
            <button class="ml-3   text-white" onClick={closeSnackbar}>
              {/* ✖ */}
              X
            </button>
          </div>
        </div >

        {/* snackbar for session timout */}
        <div class={`fixed bottom-[90px] right-[-125px]   transform -translate-x-1/2 ${isVisible() ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
          <div class="bg-[#0077CC] text-white px-4 py-2 rounded shadow-lg flex items-center">
            <span>{"Session timeout restart to continue"}</span>
            <button class="ml-3   text-white" onClick={closeSnackbar}>
              {/* ✖ */}
              X
            </button>
          </div>
        </div>


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
        {
          live() && liveSocketInstance() != null && <div style={{ display: "flex", "justify-content": 'center', width: "100%", "align-items": "center", "flex-direction": "inherit", "margin-top": "15px" }} >
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
          </div>
        }

        <Show when={props.initialChatReply.typebot.settings.general.isCustomInputEnabled}>

          <div style="position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); width:45%;">
            <div class="container lg:w-full bg-white flex justify-center gap-2 mx-auto shadow-lg p-2 ">

              <input placeholder='Ask' onKeyDown={handleSubmitOnEnter} class="w-full rounded-md text-[#364652] p-1 outline-none" type="text" value={userInput()} onInput={(e) => setUserInput(e?.target?.value)} />
              <div class='flex justify-center items-center gap-[5px]'>
                {!isRecording() && <button onClick={() => startRecordingUserVoice()} class='h-[25px] w-[25px]' style="cursor: pointer;"><img src="https://quadz.blob.core.windows.net/demo1/mic.svg" class='h-[25px] w-[25px]' /></button>}
                {isRecording() && (

                  <button class='h-[40px] w-[40px]' onClick={stopRecordingUserVoice} style={{ cursor: "pointer" }} ><img src="https://quadz.blob.core.windows.net/demo1/mic.gif" class='h-[40px] w-[40px]' />  </button>
                  // {/* <div style={{ "font-size": "8px" }} > Listening... </div> */}

                )}
                <button disabled={userInput() ? false : true} onClick={userInputClicked} class={`${!userInput() ? 'cursor-not-allowed opacity-50' : ''} `}>
                  {/* <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_63_137)">
                    <rect width="36" height="36" rx="18" fill="#0077CC" />
                    <path d="M17.0834 15.0666L14.4251 17.725C14.257 17.893 14.0431 17.977 13.7834 17.977C13.5237 17.977 13.3098 17.893 13.1417 17.725C12.9737 17.5569 12.8896 17.343 12.8896 17.0833C12.8896 16.8236 12.9737 16.6097 13.1417 16.4416L17.3584 12.225C17.5417 12.0416 17.7556 11.95 18.0001 11.95C18.2445 11.95 18.4584 12.0416 18.6417 12.225L22.8584 16.4416C23.0265 16.6097 23.1105 16.8236 23.1105 17.0833C23.1105 17.343 23.0265 17.5569 22.8584 17.725C22.6903 17.893 22.4765 17.977 22.2167 17.977C21.957 17.977 21.7431 17.893 21.5751 17.725L18.9167 15.0666V22.5833C18.9167 22.843 18.8289 23.0607 18.6532 23.2364C18.4775 23.4121 18.2598 23.5 18.0001 23.5C17.7403 23.5 17.5226 23.4121 17.3469 23.2364C17.1712 23.0607 17.0834 22.843 17.0834 22.5833V15.0666Z" fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clip0_63_137">
                      <rect width="36" height="36" rx="18" fill="white" />
                    </clipPath>
                  </defs>
                </svg> */}
                  <svg xmlns="
http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512" width="25px" height="25px" fill="" color="white" class="send-icon flex ">
                    <path d="M476.59 227.05l-.16-.07L49.35 49.84A23.56 23.56 0 0027.14 52 24.65 24.65 0 0016 72.59v113.29a24 24 0 0019.52 23.57l232.93 43.07a4 4 0 010 7.86L35.53 303.45A24 24 0 0016 327v113.31A23.57 23.57 0 0026.59 460a23.94 23.94 0 0013.22 4 24.55 24.55 0 009.52-1.93L476.4 285.94l.19-.09a32 32 0 000-58.8z"></path>
                  </svg>
                </button>
              </div>


            </div>
          </div>
        </Show>
        <Show when={props.initialChatReply.typebot.settings.general?.isTwilioEnabled}>
          <div class='fixed bottom-[100px] right-[40px]'>
            <button onclick={openModal} class='transition-all duration-500 transform'>
              <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.3545 22.2323C15.3344 21.7262 11.1989 20.2993 7.44976 16.5502C3.70065 12.8011 2.2738 8.66559 1.76767 6.6455C1.47681 5.48459 2.00058 4.36434 2.88869 3.72997L5.21694 2.06693C6.57922 1.09388 8.47432 1.42407 9.42724 2.80051L10.893 4.91776C11.5152 5.8165 11.3006 7.0483 10.4111 7.68365L9.24234 8.51849C9.41923 9.1951 9.96939 10.5846 11.6924 12.3076C13.4154 14.0306 14.8049 14.5807 15.4815 14.7576L16.3163 13.5888C16.9517 12.6994 18.1835 12.4847 19.0822 13.1069L21.1995 14.5727C22.5759 15.5257 22.9061 17.4207 21.933 18.783L20.27 21.1113C19.6356 21.9994 18.5154 22.5232 17.3545 22.2323ZM8.86397 15.136C12.2734 18.5454 16.0358 19.8401 17.8405 20.2923C18.1043 20.3583 18.4232 20.2558 18.6425 19.9488L20.3056 17.6205C20.6299 17.1665 20.5199 16.5348 20.061 16.2171L17.9438 14.7513L17.0479 16.0056C16.6818 16.5182 16.0047 16.9202 15.2163 16.7501C14.2323 16.5378 12.4133 15.8569 10.2782 13.7218C8.1431 11.5867 7.46219 9.7677 7.24987 8.7837C7.07977 7.9953 7.48181 7.31821 7.99439 6.95208L9.24864 6.05618L7.78285 3.93893C7.46521 3.48011 6.83351 3.37005 6.37942 3.6944L4.05117 5.35744C3.74413 5.57675 3.64162 5.89565 3.70771 6.15943C4.15989 7.96418 5.45459 11.7266 8.86397 15.136Z" fill="#0F0F0F" />
              </svg>
            </button>
          </div>
        </Show>

        {/* twillio calling modal */}
        <div class={`${isOpen() ? 'block' : 'hidden'} fixed z-10 inset-0 overflow-y-auto`}>
          <div class="flex items-center justify-center min-h-screen ">
            <div class="relative bg-white w-96 rounded-lg border-2 border-solid border-slate-400">
              <div class="p-8">
                <h2 class="text-xl font-bold p-2 mb-4">Enter Your Phone Number</h2>
                {!phoneValidation() && (
                  <p class="text-red-500 text-sm">Please enter a valid 10 digit phone number.</p>
                )}
                <input onKeyPress={inputPhoneTenDigitHandle} value={phoneNumber()} onInput={(e) => handleInputChange(e)} class='call-input w-full mb-2 p-2' type="number" placeholder='enter your phone number' />
                {/* <p class="mb-8">Modal content goes here.</p> */}
                <div class="flex justify-end">
                  <button class="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-all duration-500 transform" onClick={closeModal}>
                    Cancel
                  </button>
                  <button disabled={!phoneNumber()} class="px-4 py-2 transition-all duration-500 transform bg-blue-500 text-white hover:bg-blue-600 rounded" onClick={handleSubmit}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>


        </div >




        < BottomSpacer />
      </div>
    </div >

  )
}

const BottomSpacer = () => {
  return <div class="w-full h-32 flex-shrink-0" />
}
