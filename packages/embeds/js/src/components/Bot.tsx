import { LiteBadge } from './LiteBadge'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { isNotDefined, isNotEmpty } from '@typebot.io/lib'
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery'
import { ConversationContainer } from './ConversationContainer'
import { setIsMobile, isMobile } from '@/utils/isMobileSignal'
import { BotContext, InitialChatReply, OutgoingLog } from '@/types'
import { ErrorMessage } from './ErrorMessage'
import {
  getExistingResultIdFromStorage,
  setResultInStorage,
} from '@/utils/storage'
import { setCssVariablesValue } from '@/utils/setCssVariablesValue'
import immutableCss from '../assets/immutable.css'

import { env } from "@typebot.io/env";
import Queue from "@/utils/queue";
export const AUDIO_PLAYING_KEY = "audio_playing";

import { computePlainText } from '@/features/blocks/bubbles/textBubble/helpers/convertRichTextToPlainText'


export type BotProps = {
  socket?: any;
  socket1?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typebot: string | any
  isPreview?: boolean
  resultId?: string
  startGroupId?: string
  prefilledVariables?: Record<string, unknown>
  apiHost?: string
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onInit?: () => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

export const Bot = (props: BotProps & { class?: string }) => {


  console.log("bot socket1", props.socket1);
  // console.log("prefiled variables", props.prefilledVariables);


  const [initialChatReply, setInitialChatReply] = createSignal<
    InitialChatReply | undefined
  // @ts-ignore
  >(sessionStorage.getItem("intialize") ? JSON.parse(sessionStorage.getItem("intialize")) : undefined)
  const [selectedLanguage, setSelectedLanguage] = createSignal('en-IN');
  // @ts-ignore
  const [customCss, setCustomCss] = createSignal(sessionStorage.getItem("initialize_css") ? JSON.parse(sessionStorage.getItem("initialize_css")) : '')
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [error, setError] = createSignal<Error | undefined>()

  const initializeBot = async () => {
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })
    if (Object.hasOwn(prefilledVariables, 'reset')) {

      sessionStorage.removeItem("intialize");
      sessionStorage.removeItem("initialize_css");
      sessionStorage.removeItem("bot_init");
      sessionStorage.removeItem("chatchunks");

    }
    // @ts-ignore  
    if (!Object.hasOwn(prefilledVariables, 'reset') && sessionStorage.getItem("bot_init") && JSON.parse(sessionStorage.getItem("bot_init")) == true) {
      console.log("return without initializing")
      return
    } else {
      sessionStorage.setItem("bot_init", "true");
    }
    console.log("initialize bot");
    setIsInitialized(true);
    sessionStorage.removeItem("answer");
    sessionStorage.removeItem("live");
    sessionStorage.removeItem("liveChat");
    // sessionStorage.removeItem("resultId");


    const typebotIdFromProps =
      typeof props.typebot === 'string' ? props.typebot : undefined;
    console.log("prefilled vairables", prefilledVariables);

    const { data, error } = await getInitialChatReplyQuery({
      stripeRedirectStatus: urlParams.get('redirect_status') ?? undefined,
      typebot: props.typebot,
      apiHost: props.apiHost,
      isPreview: props.isPreview ?? false,
      resultId: isNotEmpty(props.resultId)
        ? props.resultId
        : getExistingResultIdFromStorage(typebotIdFromProps),
      startGroupId: props.startGroupId,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
    })
    if (error && 'code' in error && typeof error.code === 'string') {
      if (typeof props.typebot !== 'string' || (props.isPreview ?? false)) {
        return setError(
          new Error('An error occurred while loading the bot.', {
            cause: error.message,
          })
        )
      }
      if (['BAD_REQUEST', 'FORBIDDEN'].includes(error.code))
        return setError(new Error('This bot is now closed.'))
      if (error.code === 'NOT_FOUND')
        return setError(new Error("The bot you're looking for doesn't exist."))
    }

    if (!data) {
      if (error) console.error(error)
      return setError(new Error("Error! Couldn't initiate the chat."))
    }

    if (data.resultId && typebotIdFromProps)
      setResultInStorage(data.typebot.settings.general.rememberUser?.storage)(
        typebotIdFromProps,
        data.resultId
      )

    // sessionStorage.setItem("resultId", data.resultId as string);

    setInitialChatReply(data);
    sessionStorage.setItem("intialize", JSON.stringify(data));
    setCustomCss(data.typebot.theme.customCss ?? '')
    sessionStorage.setItem("initialize_css", JSON.stringify(data.typebot.theme.customCss ?? ''));

    if (data.input?.id && props.onNewInputBlock)
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      })
    if (data.logs) props.onNewLogs?.(data.logs)
  }

  // const getSessionCookie = () => {
  //   const cookies = document.cookie.split("; ");
  //   for (const cookie of cookies) {
  //     const [name, value] = cookie.split("=");
  //     if (name === "liveId") {
  //       return value;
  //     }
  //   }
  //   return null;
  // };

  createEffect(() => {
    console.log(" value to run intitalize bot or not  ", isNotDefined(props.typebot) || isInitialized());
    // console.log("session storage", sessionStorage.getItem("aaaa")  );
    // console.log("live agent id", crypto.randomUUID() );
    if (isNotDefined(props.typebot) || isInitialized()) return

    initializeBot().then()
  })

  createEffect(() => {
    if (isNotDefined(props.typebot) || typeof props.typebot === 'string') return
    setCustomCss(props.typebot.theme.customCss ?? '')
  })


  onCleanup(() => {
    setIsInitialized(false)
  })

  return (
    <>
      <style>{customCss()}</style>
      <style>{immutableCss}</style>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={initialChatReply()} keyed>

        {(initialChatReply) => (
          <>
            <BotContent
              initializeBot={initializeBot}
              socket={props.socket}
              class={props.class}
              initialChatReply={{
                ...initialChatReply,
                typebot: {
                  ...initialChatReply.typebot,
                  settings:
                    typeof props.typebot === 'string'
                      ? initialChatReply.typebot?.settings
                      : props.typebot?.settings,
                  theme:
                    typeof props.typebot === 'string'
                      ? initialChatReply.typebot?.theme
                      : props.typebot?.theme,
                },
              }}
              context={{
                selectedLanguage: selectedLanguage(),
                apiHost: props.apiHost,
                isPreview:
                  typeof props.typebot !== 'string' || (props.isPreview ?? false),
                resultId: initialChatReply.resultId,
                sessionId: initialChatReply.sessionId,
                typebot: initialChatReply.typebot,
              }}
              onNewInputBlock={props.onNewInputBlock}
              onNewLogs={props.onNewLogs}
              onAnswer={props.onAnswer}
              onEnd={props.onEnd}
            />
            <Show when={initialChatReply.typebot.settings.general.isVoiceEnabled} >
              <div style={!isMobile() ? { position: "relative", top: "-50%", left: "80%", width: "100px" } : { position: "relative", top: "-20%", left: "5%", width: "20px" }} >
                <select value={selectedLanguage()} onChange={(evt) => {
                  console.log("vall", evt?.target?.value);
                  setSelectedLanguage(evt?.target?.value);
                  initializeBot();
                }} >
                  <option value="en-IN" > English  </option>
                  <option value="hi-IN" > Hindi  </option>
                  <option value="te-IN" > Telugu  </option>
                  <option value="ta-IN">  Tamil </option>
                  <option value="mr-IN" > Marathi  </option>
                  <option value="kn-IN" > Kannada  </option>
                  <option value="ml-IN" > Malayalam  </option>
                  <option value="bn-IN" > Bengali </option>
                </select>
              </div>
            </Show>
          </>
        )}
        {/* <div style={{ position : "relative" , top  :"-50%" , left : "80%" , width : "100px" }} >
      <select>
        <option> English  </option>
        <option> Hindi  </option>
        <option> Telugu  </option>
      </select>
    </div> */}

      </Show>
    </>
  )
}

type BotContentProps = {
  initializeBot: any,
  initialChatReply: InitialChatReply
  context: BotContext
  class?: string
  onNewInputBlock?: (block: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  socket: any
}

const BotContent = (props: BotContentProps) => {
  console.log("props context language", props.context.selectedLanguage)
  let botContainer: HTMLDivElement | undefined
  let conversationContainer: HTMLDivElement | undefined
  let videoRef: HTMLVideoElement | undefined
  let audioQueue: Queue
  let textQueue: Queue
  let audioUrlQueue: Queue
  const [audioInstance, setAudioInstance] = createSignal<HTMLAudioElement | undefined>(undefined);
  const [intervalId, setIntervalId] = createSignal<number | null>(null);
  const [audioRef, setAudioRef] = createSignal();
  const [audioPlaying, setAudioPlaying] = createSignal(false);
  const [audioPermission, setAudioPermission] = createSignal(false);
  // const [audioUrlQueue, setAudioUrlQueue] = createSignal<string[]>([]);
  const [textList, setTextList] = createSignal<string[]>([])

  const [audioText, setAudioText] = createSignal('');
  const [nodeText, setNodeText] = createSignal('');
  const [liveAgent, setLiveAgent] = createSignal(false);

  let queueInterval: NodeJS.Timeout;
  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 500)
  })
  const [currentAudio, setCurrentAudio] = createSignal<HTMLAudioElement | undefined>(undefined)


  const logTextNodes = async (node) => {
    if (node.nodeType === Node.TEXT_NODE) {

      if (props.initialChatReply.typebot.settings.general.isVoiceEnabled && node.textContent.trim() != "") {
        const textToSpeechText = node.textContent.trim();
        console.log("text to speech text", textToSpeechText);
        textQueue.enqueue(textToSpeechText);
        console.log("text Queue print list", textQueue.printQueue())
      }


    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Recursively check child nodes
      node.childNodes.forEach((childNode) => {
        logTextNodes(childNode);
      });
    }
  }
  const waitForAudioNotPlaying = async () => {
    // Check if audio is currently playing
    while (audioPlaying()) {
      // Wait for a short duration before checking again
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  // ...

  const observer = new MutationObserver((mutationsList) => {

    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((addedNode) => {
          // Log text nodes of the added node
          logTextNodes(addedNode);
        });
      }
    });
  });




  const injectCustomFont = () => {
    const existingFont = document.getElementById('bot-font')
    if (
      existingFont
        ?.getAttribute('href')
        ?.includes(
          props.initialChatReply.typebot?.theme?.general?.font ?? 'Open Sans'
        )
    )
      return
    const font = document.createElement('link')
    font.href = `https://fonts.bunny.net/css2?family=${props.initialChatReply.typebot?.theme?.general?.font ?? 'Open Sans'
      }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');')`
    font.rel = 'stylesheet'
    font.id = 'bot-font'
    document.head.appendChild(font)
  }
  // @ts-ignore
  const base64toBlob = (base64, type) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: type });
  }

  const playAudio = async () => {
    try {
      const currentAudio = audioRef();

      if (textQueue.isEmpty()) {

        return
      }
      if (!currentAudio.paused) {
        console.log("audio already playing");
        return
      }

      const text = textQueue.front();

      const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, type: "translate", langCode: props.context.selectedLanguage }),
      });

      if (response.ok && currentAudio.paused) {
        const result = await response.json();
        const audioBlob = base64toBlob(result.message.audioData, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioPlaying(true);
        videoRef?.play()



        // }
        // currentAudio.addEventListener('ended', ended);
        currentAudio.src = audioUrl;
        currentAudio.play().catch((err) => {
          console.log("error playing", textQueue.printQueue());
          if (!textQueue.isEmpty()) {
            const dequeued = textQueue.dequeue();
            console.log("dequeuued", dequeued);
          }
          videoRef?.pause()


        });


        // currentAudio.addEventListener('canplaythrough', onCanPlayThrough);



      } else {
        console.log("audio already playing else");

      }



    } catch (err) {
      console.log("enteredd error", err);

    }
  }




  const handleDocumentClick = (event) => {
    console.log("handle click trigered");
    while (!textQueue.isEmpty()) {
      textQueue.dequeue();
    }
    const currentAudio = audioRef();
    currentAudio.pause();
    currentAudio.currentTime = 0;
    setAudioPlaying(false);
    videoRef?.pause()




  };
  const ended = () => {
    console.log("audio ended for text");
    if (!textQueue.isEmpty()) {
      const dequeuedEnded = textQueue.dequeue();
      console.log("dequeuued endned", dequeuedEnded);
    }
    videoRef?.pause()


    // currentAudio.removeEventListener("ended", ended);
  }
  const requestUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamSource(stream);
      // Do something with the audio source if needed
      setAudioPermission(true);
    } catch (error) {
      console.error('Error accessing user media:', error);
    }
  };
  onMount(() => {
    // console.log("on mount calleddddd", JSON.stringify(props));
    if (!botContainer) return
    resizeObserver.observe(botContainer)
    if (!conversationContainer) return
    observer.observe(conversationContainer, { childList: true, subtree: true });

    if (props.initialChatReply.typebot.settings.general.isVoiceEnabled) {

      // document.addEventListener('click', handleDocumentClick);
      document.addEventListener('mousedown', handleDocumentClick);
      textQueue = new Queue();
      const audio = new Audio();
      audio.addEventListener('ended', ended);
      audioUrlQueue = new Queue();
      setAudioRef(audio);
      const id = setInterval(() => {

        playAudio();

      }, 500);
      setIntervalId(id);
      const invisibleButton = document.createElement('button');
      invisibleButton.style.position = 'absolute';
      invisibleButton.style.width = '0';
      invisibleButton.style.height = '0';
      invisibleButton.style.opacity = '0';
      invisibleButton.style.pointerEvents = 'none';
      invisibleButton.click();
    }
    // console.log("video ref",videoRef);
    if (videoRef) {
      videoRef?.pause()
    }


    // requestUserMedia();
  })

  createEffect(() => {
    injectCustomFont()
    if (!botContainer) return
    setCssVariablesValue(props.initialChatReply.typebot.theme, botContainer)
  })

  onCleanup(() => {
    if (!botContainer) return
    if (!conversationContainer) return
    resizeObserver.unobserve(botContainer)
    observer.disconnect()
    if (props.initialChatReply.typebot.settings.general.isVoiceEnabled) {
      // document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('mousedown', handleDocumentClick);
      const audio = audioRef()
      audio.removeEventListener("ended", ended);
      const id = intervalId();
      if (id !== null) {
        console.log("clearing interval with id", id);
        clearInterval(id);
      }
    }

  })

  return (
    <>
      <div
        ref={botContainer}
        class={
          'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center typebot-container ' +
          props.class
        }
      >
        {/* <div style={{ "margin-top" : "10px" , "cursor" : "pointer" }} >
       
        <div style={{ display : "flex" , "flex-direction" : "row" , "align-items" : "center" , gap : "40" }} >
          <button> <img style={{ height : "25px" , "margin-right":  "10px" }} src={"https://quadz.blob.core.windows.net/demo1/maximize.png"} /> </button>
          <button> <img style={{ height : "25px" ,  "margin-right":  "10px" }} src={"https://quadz.blob.core.windows.net/demo1/stop.png"} /> </button>
          <button onClick={ () => {
            let currentVal = liveAgent();
            setLiveAgent( !currentVal );
          } } > <img style={{ height : "25px" }} src={"https://quadz.blob.core.windows.net/demo1/live-chat.png"} /> </button>
        </div>
        </div> */}
        <div ref={conversationContainer} class="flex w-full h-full justify-center">

          <ConversationContainer
            // liveAgent={liveAgent()}
            initializeBot={props.initializeBot}
            socket={props.socket}
            context={props.context}
            initialChatReply={props.initialChatReply}
            onNewInputBlock={props.onNewInputBlock}
            onAnswer={props.onAnswer}
            onEnd={props.onEnd}
            onNewLogs={props.onNewLogs}
          />
        </div>
        <Show
          when={props.initialChatReply.typebot.settings.general.isBrandingEnabled}
        />
      </div>

      <Show when={props.initialChatReply.typebot.settings.general.isVoiceEnabled}>
        <div style={!isMobile() ? { position: "relative", top: "-60%", left: "77%", width: "250px" } : { position: "relative", top: "-99%", left: "77%", width: "60px" }} >
          <video
            ref={videoRef}
            loop
            // autoplay
            // muted={ audioRef().paused ? true : false }   
            muted={true}
            poster="background.jpg">
            <source src="https://quadz.blob.core.windows.net/demo1/google-oauth2_104041984924534641720_tlk_krcymSptGbArjG0KNZ8Uy_1701406206825.mp4" type="video/mp4">
              Your browser does not support the video tag.
            </source>
          </video>
        </div>
        {/* <div style={{ position : "relative" , top  :"-50%" , left : "80%" , width : "100px" }} >
      <select>
        <option> English  </option>
        <option> Hindi  </option>
        <option> Telugu  </option>
      </select>
    </div> */}
      </Show>

      {/* <div style={{ "margin-left": "70%", position: "relative" }} > */}

      <LiteBadge botContainer={botContainer} />


      {/* </div> */}
    </>
  )
}
