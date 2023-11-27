import { LiteBadge } from './LiteBadge'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { isNotDefined, isNotEmpty } from '@typebot.io/lib'
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery'
import { ConversationContainer } from './ConversationContainer'
import { setIsMobile } from '@/utils/isMobileSignal'
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



export type BotProps = {
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
  const [initialChatReply, setInitialChatReply] = createSignal<
    InitialChatReply | undefined
  >()
  const [customCss, setCustomCss] = createSignal('')
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [error, setError] = createSignal<Error | undefined>()

  const initializeBot = async () => {
    console.log("initialize bot");
    setIsInitialized(true)
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })
    const typebotIdFromProps =
      typeof props.typebot === 'string' ? props.typebot : undefined
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
    setInitialChatReply(data)
    setCustomCss(data.typebot.theme.customCss ?? '')

    if (data.input?.id && props.onNewInputBlock)
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      })
    if (data.logs) props.onNewLogs?.(data.logs)
  }

  createEffect(() => {
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
          <BotContent
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
        )}
      </Show>
    </>
  )
}

type BotContentProps = {
  initialChatReply: InitialChatReply
  context: BotContext
  class?: string
  onNewInputBlock?: (block: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

const BotContent = (props: BotContentProps) => {

  let botContainer: HTMLDivElement | undefined
  let conversationContainer: HTMLDivElement | undefined
  let audioQueue: Queue
  let textQueue: Queue
  let audioUrlQueue: Queue
  const [audioInstance, setAudioInstance] = createSignal<HTMLAudioElement | undefined>(undefined);
  const [intervalId, setIntervalId] = createSignal<number | null>(null);
  const [audioRef, setAudioRef] = createSignal();
  const [audioPlaying, setAudioPlaying] = createSignal(false);
  // const [audioUrlQueue, setAudioUrlQueue] = createSignal<string[]>([]);
  const [textList, setTextList] = createSignal<string[]>([])

  const [audioText, setAudioText] = createSignal('');
  const [nodeText, setNodeText] = createSignal('');

  let queueInterval: NodeJS.Timeout;
  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
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
  // const logTextNodes = async (node) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       if (node.nodeType === Node.TEXT_NODE) {
  //         if (props.initialChatReply.typebot.settings.general.isVoiceEnabled && node.textContent.trim() !== "") {
  //           const textToSpeechText = node.textContent.trim();
  //           console.log("text to speech text", textToSpeechText);
  //           const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
  //             method: 'POST',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({ text: textToSpeechText, type: "translate" }),
  //           });

  //           if (response.ok) {
  //             const result = await response.json();
  //             const audioBlob = base64toBlob(result.message.audioData, 'audio/mp3');
  //             const audioUrl = URL.createObjectURL(audioBlob);
  //             console.log(`audio Url for text ${textToSpeechText}`, audioUrl);
  //             audioUrlQueue.enqueue(audioUrl);
  //             console.log("hey text to speech before play audio", textToSpeechText);
  //             await playAudio();
  //             console.log("hey text to speech after play audio", textToSpeechText);
  //             resolve();
  //             // if (!audioPlaying()) {
  //             //   await playAudio();
  //             // }
  //           } else {
  //             resolve();
  //             console.log("response not right");
  //           }
  //         }
  //       } else if (node.nodeType === Node.ELEMENT_NODE) {
  //         // Recursively check child nodes
  //         for (const childNode of node.childNodes) {
  //           await logTextNodes(childNode);
  //         }
  //       }

  //       resolve(); // Resolve the Promise when done with processing the node
  //     } catch (error) {
  //       reject(error); // Reject the Promise if an error occurs
  //     }
  //   });
  // };
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

  // const observer = new MutationObserver(async (mutationsList) => {
  //   for (const mutation of mutationsList) {
  //     if (mutation.type === 'childList') {
  //       for (const addedNode of mutation.addedNodes) {
  //         // Log text nodes of the added node
  //         try {
  //           await logTextNodes(addedNode);
  //         } catch (error) {
  //           console.error('Error in logTextNodes:', error);
  //         }
  //         // await logTextNodes(addedNode);
  //       }
  //     }
  //   }
  // });




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

      let text = textQueue.front();

      const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, type: "translate" }),
      });

      if (response.ok && currentAudio.paused) {
        const result = await response.json();
        const audioBlob = base64toBlob(result.message.audioData, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioPlaying(true);




        // }
        // currentAudio.addEventListener('ended', ended);
        currentAudio.src = audioUrl;
        currentAudio.play().catch((err) => {
          console.log("error playing", textQueue.printQueue());
          if (!textQueue.isEmpty()) {
            let dequeued = textQueue.dequeue();
            console.log("dequeuued", dequeued);
          }


        });


        // currentAudio.addEventListener('canplaythrough', onCanPlayThrough);



      } else {
        console.log("audio already playing else");

      }



    } catch (err) {
      console.log("enteredd error", err);

    }
  }

  // const playAudio = async () => {
  //   try {
  //     console.log("play audio called");
  //     if (audioUrlQueue.isEmpty()) {

  //       return
  //     }
  //     if (audioPlaying()) {
  //       console.log("audio already playing");
  //       await new Promise(resolve => setTimeout(resolve, 2000));
  //       return await playAudio()
  //     }
  //     const currentAudio = audioRef();


  //     const audioUrl = audioUrlQueue.dequeue();

  //     const onCanPlayThrough = () => {

  //       setAudioPlaying(true);
  //       currentAudio.addEventListener('ended', () => {

  //         setAudioPlaying(false);
  //         return await playAudio();
  //       });
  //       setAudioPlaying(true);
  //       currentAudio.play().catch((err) => {


  //         setAudioPlaying(false);
  //         return await playAudio();

  //       });

  //       // Remove the event listener after it's triggered
  //       currentAudio.removeEventListener('canplaythrough', onCanPlayThrough);
  //     };
  //     currentAudio.addEventListener('canplaythrough', onCanPlayThrough);
  //     currentAudio.src = audioUrl;




  //   } catch (err) {
  //     console.log("Error playing play audio function", err);
  //     setAudioPlaying(false);
  //     return await playAudio();

  //   }
  // }
  // const playAudio = async () => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       console.log("play audio called");
  //       if (audioUrlQueue.isEmpty()) {
  //         resolve(); // Resolve the promise if the queue is empty
  //         return;
  //       }

  //       if (audioPlaying()) {
  //         console.log("audio already playing should never be called");
  //         await new Promise(resolve => setTimeout(resolve, 2000));
  //         await playAudio(); // Continue trying to play audio after a delay
  //         resolve(); // Resolve the promise
  //         return;
  //       }

  //       const currentAudio = audioRef();
  //       const audioUrl = audioUrlQueue.dequeue();

  //       const onCanPlayThrough = () => {
  //         setAudioPlaying(true);

  //         currentAudio.addEventListener('ended', async () => {
  //           console.log("audio playing ended");
  //           setAudioPlaying(false);
  //           currentAudio.removeEventListener('ended', onCanPlayThrough);
  //           await playAudio(); // Continue playing the next audio
  //           resolve(); // Resolve the promise
  //         });

  //         currentAudio.play().catch(async (err) => {
  //           console.log("cant play audio", err);
  //           setAudioPlaying(false);
  //           // await playAudio(); // Continue trying to play audio
  //           resolve(); // Resolve the promise
  //         });

  //         // Remove the event listener after it's triggered
  //         currentAudio.removeEventListener('canplaythrough', onCanPlayThrough);
  //       };

  //       currentAudio.addEventListener('canplaythrough', onCanPlayThrough);
  //       currentAudio.src = audioUrl;

  //     } catch (err) {
  //       console.log("Error playing play audio function", err);
  //       setAudioPlaying(false);
  //       // await playAudio(); // Continue trying to play audio
  //       resolve(); // Resolve the promise
  //     }
  //   });
  // };




  const handleDocumentClick = (event) => {
    console.log("handle click trigered");
    while (!textQueue.isEmpty()) {
      textQueue.dequeue();
    }
    const currentAudio = audioRef();
    currentAudio.pause();
    currentAudio.currentTime = 0;
    setAudioPlaying(false);




  };
  const ended = () => {
    console.log("audio ended for text");
    if (!textQueue.isEmpty()) {
      let dequeuedEnded = textQueue.dequeue();
      console.log("dequeuued endned", dequeuedEnded);
    }


    // currentAudio.removeEventListener("ended", ended);
  }
  onMount(() => {
    if (!botContainer) return
    resizeObserver.observe(botContainer)
    if (!conversationContainer) return
    observer.observe(conversationContainer, { childList: true, subtree: true });

    if (props.initialChatReply.typebot.settings.general.isVoiceEnabled) {

      document.addEventListener('click', handleDocumentClick);

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

    document.removeEventListener('click', handleDocumentClick);
    let audio = audioRef()
    audio.removeEventListener("ended", ended);
    const id = intervalId();
    if (id !== null) {
      console.log("clearing interval with id", id);
      clearInterval(id);
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
        <div ref={conversationContainer} class="flex w-full h-full justify-center">
          <ConversationContainer
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
        >


        </Show>
      </div>



      <div style={{ "margin-left": "70%", position: "relative" }} >

        <LiteBadge botContainer={botContainer} />


      </div>
    </>
  )
}
