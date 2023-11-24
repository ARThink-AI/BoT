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

import { env  } from "@typebot.io/env";
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
  let conversationContainer : HTMLDivElement | undefined
  let audioQueue : Queue
  let textQueue : Queue
  // let currentAudio: HTMLAudioElement | undefined;
let queueInterval: NodeJS.Timeout;
  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
  })
  const [currentAudio, setCurrentAudio] = createSignal<HTMLAudioElement | undefined>(undefined)
  // function logTextNodes(node) {
  //   if (node.nodeType === Node.TEXT_NODE) {
  //     // console.log('Text node added:', node.textContent);
  //     if ( props.initialChatReply.typebot.settings.general.isVoiceEnabled  && node.textContent.trim() != "" ) {
  //        const textToSpeechText = node.textContent.trim();
  //        console.log("text to speech text",textToSpeechText);
  //        pushAudioInstanceInQueue(textToSpeechText);

  //       // console.log('Text node added:', node.textContent);
  //       // const textToSpeechText = node.textContent.trim();
  //       // audioQueue.enqueue(textToSpeechText); // Enqueue the text to play as audio
  //       // // console.log("audio queueeee",audioQueue);
  //       // playNextAudio("logTextNode"); // Start playing the next audio in the queue
  //     }
     
    
  //   } else if (node.nodeType === Node.ELEMENT_NODE) {
  //     // Recursively check child nodes
  //     node.childNodes.forEach((childNode) => {
  //       logTextNodes(childNode);
  //     });
  //   }
  // }

  const  logTextNodes = async (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // console.log('Text node added:', node.textContent);
      if ( props.initialChatReply.typebot.settings.general.isVoiceEnabled  && node.textContent.trim() != "" ) {
         const textToSpeechText = node.textContent.trim();
         console.log("text to speech text",textToSpeechText);
        //  await pushAudioInstanceInQueue(textToSpeechText);
        textQueue.enqueue(textToSpeechText);
        // await pushAudioInstanceInQueue();
        // console.log('Text node added:', node.textContent);
        // const textToSpeechText = node.textContent.trim();
        // audioQueue.enqueue(textToSpeechText); // Enqueue the text to play as audio
        // // console.log("audio queueeee",audioQueue);
        // playNextAudio("logTextNode"); // Start playing the next audio in the queue
      }
     
    
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Recursively check child nodes
      node.childNodes.forEach(async (childNode) => {
       await  logTextNodes(childNode);
      });
    }
  }
  const pushAudioInstanceInQueue = async ( ) => {
   try {
    let text = textQueue.dequeue();
    const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const result = await response.json();
      const audioBlob = base64toBlob(result.message.audioData, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioQueue.enqueue(audio);
    } else {
     console.log("response error in google request");
      // playNextAudio("response error");
    }
   } catch(err) {
    console.log("error inside pushAudioInstance",err);
   }
  }
  // ...
  createEffect(() => {
    console.log("current audio", currentAudio())
  })
  const observer = new MutationObserver((mutationsList) => {
    // console.log("mutation observer triggered", mutationsList);
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach( async  (addedNode) => {
          // Log text nodes of the added node
          await logTextNodes(addedNode);
        });
      }
    });
  });
  // const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
  //   console.log("mutation observer triggered", mutationsList);
  //   mutationsList.forEach((mutation) => {
  //     if (mutation.type === 'childList') {
  //       mutation.addedNodes.forEach((addedNode) => {
  //         logTextNodes(addedNode);
  //       });
  //     }
  //   });
  // });
  
  // function logTextNodes(node: Node) {
  //   if (node.nodeType === Node.TEXT_NODE) {
  //     console.log('Text node added:', node.textContent);
  //   } else if (node.nodeType === Node.ELEMENT_NODE) {
  //     node.childNodes.forEach((childNode) => {
  //       logTextNodes(childNode);
  //     });
  //   }
  // }
  // const observer = new MutationObserver( (mutationsList: MutationRecord[]) => {
  //   console.log("mutation observer triggered", mutationsList );
  //   mutationsList.forEach((mutation) => {
  //     if (mutation.type === 'childList') {
  //       mutation.addedNodes.forEach((addedNode) => {
  //         if (addedNode.nodeType === Node.TEXT_NODE) {
  //           console.log('Text node added:', addedNode.textContent);
            
  //         } else if (addedNode.nodeType === Node.ELEMENT_NODE) {
           
  //           addedNode.childNodes.forEach((childNode) => {
  //             if (childNode.nodeType === Node.TEXT_NODE) {
  //               console.log('Text node added:', childNode.textContent);
              
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
  // } );


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
    font.href = `https://fonts.bunny.net/css2?family=${
      props.initialChatReply.typebot?.theme?.general?.font ?? 'Open Sans'
    }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');')`
    font.rel = 'stylesheet'
    font.id = 'bot-font'
    document.head.appendChild(font)
  }
 // @ts-ignore
 const  base64toBlob = (base64, type) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: type });
}
// const playAudio = async (text: string) => {
//   try {
//     const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ text }),
//     });

//     if (response.ok) {
//       const result = await response.json();
//       const audioBlob = base64toBlob(result.message.audioData, 'audio/mp3');
//       const audioUrl = URL.createObjectURL(audioBlob);

//       const audio = new Audio(audioUrl);
//       audio.addEventListener('ended', () => {
//         //  let text = audioQueue.dequeue();
//         // setTimeout( () => {
//         //   playNextAudio();
//         //   currentAudio = undefined;
//         // } ,50000);
//         playNextAudio("audio ended");
//         // setCurrentAudio(text);
//       });
//        // Trigger the audio play within a user interaction (e.g., button click)
//       //  document.addEventListener('click', () => {
//         if ( !currentAudio() ) {
//           setCurrentAudio(audio);
//         audio.play().catch(error => {
         
//           playNextAudio("audio play error");
//           setCurrentAudio(undefined);
//         });
//         }
      

//       // });
//       // audio.play();
//       // currentAudio = audio;
//       localStorage.setItem(AUDIO_PLAYING_KEY, "true");
//     } else {
    
//       playNextAudio("response error");
//     }
//   } catch (err) {

//     playNextAudio("code ft gya");
//   }
// };

// const playNextAudio = (source:string) => {
// console.log("running=>1", source);
//   if (audioQueue.isEmpty()) {
//     console.log("running=2", "isEmpty working")
//     clearInterval(queueInterval);
//     return;
//   }
//   console.log("running=>2", source);
//   console.log("running", "consition", currentAudio(), currentAudio()?.ended)
//   if (!currentAudio() || currentAudio().ended) {
//     console.log("running===>", 5)
//     const nextText = audioQueue.dequeue();
//     if (nextText) {
//      console.log("running", "playing next trigger");
//       playAudio(nextText);
//     }
//   }
// };




  // const playAudio = async (text: string ) => {
  //   try {
  //           const response = await fetch(`${ env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE }/api/integrations/texttospeech`,{
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json', // Set the appropriate content type
  //         // Add any other headers as needed
  //       },
  //       body: JSON.stringify({ text }),
  //     });
  //     let result = await response.json();
  //     result = result.message
  //     // console.log("resulttt",result);
  //     if (result.audioData) {
  //       const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
  //       const audioUrl = URL.createObjectURL(audioBlob);

  //       const audio = new Audio(audioUrl);
  //          audio.addEventListener('ended', () => {
  //         playNextAudio(); // Play the next audio when the current one ends
  //       });
  //       audio.play();
  //       currentAudio = audio;
  //       localStorage.setItem(AUDIO_PLAYING_KEY, "true");
        
  //     } else {
  //       console.error('Error in response:', result);
  //          playNextAudio();
  //     }

  //     // const response = await fetch('YOUR_TTS_API_ENDPOINT', {
  //     //   method: 'POST',
  //     //   headers: {
  //     //     'Content-Type': 'application/json',
  //     //   },
  //     //   body: JSON.stringify({ text }),
  //     // });
  
  //     // if (response.ok) {
  //     //   const audioUrl = await response.json();
  //     //   const audio = new Audio(audioUrl);
  //     //   audio.addEventListener('ended', () => {
  //     //     playNextAudio(); // Play the next audio when the current one ends
  //     //   });
  //     //   audio.play();
  //     //   currentAudio = audio;
  //     //   localStorage.setItem(AUDIO_PLAYING_KEY, "true");
  //     // } else {
  //     //   console.error('Error in text-to-speech API:', response.statusText);
  //     //   playNextAudio(); // Move to the next audio even if there is an error
  //     // }
  //   } catch (err) {
  //     console.error('Error in text-to-speech API:', err);
  //     playNextAudio(); // Move to the next audio even if there is an error
  //   }
  // }
  // const playNextAudio = () => {
  //   if (audioQueue.isEmpty()) {
  //     clearInterval(queueInterval); // Stop checking the queue if it's empty
  //     return;
  //   }
  
  //   if (!currentAudio || currentAudio.ended) {
  //     const nextText = audioQueue.dequeue();
  //     if (nextText) {
  //       playAudio(nextText);
  //     }
  //   }
  // }    playAudio(nextText);
  const playAudio = async () => {
   try {
     let audioPlaying = localStorage.getItem(AUDIO_PLAYING_KEY) ? JSON.parse(localStorage.getItem(AUDIO_PLAYING_KEY)) : false;
     if ( !audioPlaying && !textQueue.isEmpty() ) {
      let text = textQueue.dequeue();
      const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
      if (response.ok) {
        const result = await response.json();
        const audioBlob = base64toBlob(result.message.audioData, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);
  
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => {
          localStorage.setItem(AUDIO_PLAYING_KEY,"false");
     // Play the next audio when the current one ends
   });
   audio.play().catch( err => {
    console.log("Error playing audio",err);
   } );
        // audioQueue.enqueue(audio);
      } else {
       console.log("response error in google request");
        // playNextAudio("response error");
      }
      //  let audio = audioQueue.dequeue();
         
     }
   } catch(err) {

   }
  }
  const startQueueMonitoring = () => {

    queueInterval = setInterval(() => {
      // console.log("set interval called");
      playAudio();
      // console.log("set interval being callled");
      // playNextAudio("monitoring");
    },1000); // Adjust the interval as needed
  };
  onMount(() => {
    if (!botContainer) return
    resizeObserver.observe(botContainer)
    if ( !conversationContainer  ) return 
    observer.observe(conversationContainer, { childList: true, subtree: true });
    // observer.observe(conversationContainer,  { childList: true, subtree: true , characterData: true  } )
    // localStorage.setItem(AUDIO_PLAYING_KEY,"false");
    if ( props.initialChatReply.typebot.settings.general.isVoiceEnabled  ) {
      localStorage.setItem(AUDIO_PLAYING_KEY,"false");
       startQueueMonitoring();
       audioQueue = new Queue();
       textQueue = new Queue();
    }
    // if ( props.initialChatReply.typebot.settings.general.isVoiceEnabled ) {
    //   audioQueue = new Queue()
    //   // currentAudio = undefined;
    //   // setCurrentAudio(undefined);
    //   // console.log("Bot mountedd")
    //   startQueueMonitoring();
    // } 

    // navigator.mediaDevices.getUserMedia({ audio: true });
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
    clearInterval(queueInterval);
    
  })
  // console.log("props.initialChatReply",props.initialChatReply.typebot.settings);
  return (
    <>
    <div
      ref={botContainer}
      class={
        'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center typebot-container ' +
        props.class
      }
    >
      <div  ref={conversationContainer} class="flex w-full h-full justify-center">
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
    {/*<div style={{ "margin-left" : "40%" }} > 
       <p> Recording </p>
    </div> */}
    {/* <div> 
      <p> Voice Settings </p>
       </div> */}
    
    <div style={ { "margin-left" : "70%" } } >
      
    <LiteBadge botContainer={botContainer} />
    </div>
    </>
  )
}
