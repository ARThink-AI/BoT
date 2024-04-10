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

      return
    } else {
      sessionStorage.setItem("bot_init", "true");
    }
    console.log("initialize bot");
    setIsInitialized(true);
    sessionStorage.removeItem("answer");
    sessionStorage.removeItem("live");
    sessionStorage.removeItem("liveChat");


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
  const [burgerMenu, setBurgerMenu] = createSignal(false)
  const toggleBurgerIcon = () => {
    setBurgerMenu(!burgerMenu())
  }

  return (
    <>
      <header class="bg-blue-500 text-white p-3 h-10  w-[100%]" >
        <div class="flex justify-between items-center">
          <div class="">
            <button id="burgerIcon" onClick={toggleBurgerIcon} class="text-white focus:outline-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18C3.71667 18 3.47917 17.9042 3.2875 17.7125C3.09583 17.5208 3 17.2833 3 17C3 16.7167 3.09583 16.4792 3.2875 16.2875C3.47917 16.0958 3.71667 16 4 16H15C15.2833 16 15.5208 16.0958 15.7125 16.2875C15.9042 16.4792 16 16.7167 16 17C16 17.2833 15.9042 17.5208 15.7125 17.7125C15.5208 17.9042 15.2833 18 15 18H4ZM18.9 16.3L15.3 12.7C15.1 12.5 15 12.2667 15 12C15 11.7333 15.1 11.5 15.3 11.3L18.9 7.7C19.0833 7.51667 19.3167 7.425 19.6 7.425C19.8833 7.425 20.1167 7.51667 20.3 7.7C20.4833 7.88333 20.575 8.11667 20.575 8.4C20.575 8.68333 20.4833 8.91667 20.3 9.1L17.4 12L20.3 14.9C20.4833 15.0833 20.575 15.3167 20.575 15.6C20.575 15.8833 20.4833 16.1167 20.3 16.3C20.1167 16.4833 19.8833 16.575 19.6 16.575C19.3167 16.575 19.0833 16.4833 18.9 16.3ZM4 13C3.71667 13 3.47917 12.9042 3.2875 12.7125C3.09583 12.5208 3 12.2833 3 12C3 11.7167 3.09583 11.4792 3.2875 11.2875C3.47917 11.0958 3.71667 11 4 11H12C12.2833 11 12.5208 11.0958 12.7125 11.2875C12.9042 11.4792 13 11.7167 13 12C13 12.2833 12.9042 12.5208 12.7125 12.7125C12.5208 12.9042 12.2833 13 12 13H4ZM4 8C3.71667 8 3.47917 7.90417 3.2875 7.7125C3.09583 7.52083 3 7.28333 3 7C3 6.71667 3.09583 6.47917 3.2875 6.2875C3.47917 6.09583 3.71667 6 4 6H15C15.2833 6 15.5208 6.09583 15.7125 6.2875C15.9042 6.47917 16 6.71667 16 7C16 7.28333 15.9042 7.52083 15.7125 7.7125C15.5208 7.90417 15.2833 8 15 8H4Z" fill="white" />
              </svg>
            </button>
            {burgerMenu() && (
              <div onMouseLeave={() => setBurgerMenu(false)} class="absolute w-[275px] h-[248px] z-50 top-10 left-0 rounded-r-2xl bg-white text-black p-4">
                <div class='p-3 flex gap-2.5 text-[#ABB4C4]'>Menu</div>
                <ul>
                  <li><a class='rounded-xl p-3 hover:bg-[#E6F1FA] flex gap-3 no-underline' href="#">Download Chat</a></li>
                  <li><a class='rounded-xl p-3 hover:bg-[#E6F1FA] flex gap-3 no-underline' href="#">Email Chat</a></li>
                  <li><a class='rounded-xl p-3 hover:bg-[#E6F1FA] flex gap-3 no-underline' href="#">Live Support Agent</a></li>
                  {/* Add more menu items as needed */}
                </ul>
                {/* <button onClick={closeBurgerMenu} class="text-black focus:outline-none mt-2">Close</button> */}
              </div>

            )}
          </div>
          <div />

        </div>
      </header>
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
      <Show when={props.initialChatReply.typebot.settings.general.isInputEnabled}>
        <footer class="bg-blue-200 text-white  p-[10px] absolute bottom-[20px] w-full ">
          <div class="container flex justify-center gap-2 lg:w-[70%] md:1/3 sm:w-full mx-auto">
            <input placeholder='type your message' class="w-50 lg:w-2/3 md:w-2/3 sm:w-full rounded-md pl-2 text-[#364652]" type="text" />
            <button class="rounded-full bg-blue-500 ml-2"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div class="mt-[2px] text-center text-[10px] text-[#343741]">Quadz bot can make mistakes. Consider checking
            <a class="text-blue-400 ml-[4px]" href="#">important information</a> .
          </div>
        </footer> </Show>
      <LiteBadge botContainer={botContainer} />


      {/* </div> */}
    </>
  )
}
