import { TypingBubble } from '@/components'
import type { TextBubbleContent, TypingEmulation } from '@typebot.io/schemas'
import { For, createSignal, onCleanup, onMount } from 'solid-js'
import { PlateElement } from './plate/PlateBlock'
import { computePlainText } from '../helpers/convertRichTextToPlainText'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { computeTypingDuration } from '@typebot.io/bot-engine/computeTypingDuration'
import { env  } from "@typebot.io/env";
type Props = {
  content: TextBubbleContent
  typingEmulation: TypingEmulation
  onTransitionEnd: (offsetTop?: number) => void
}

export const showAnimationDuration = 400

let typingTimeout: NodeJS.Timeout

const AUDIO_PLAYING_KEY = 'audioPlaying';

export const TextBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)
  
  const [ audioData , setAudioData  ] = createSignal(null);
  const [ audioStarted , setAudioStarted ] = createSignal(false);
  const [ audioInstance , setAudioInstance ] = createSignal(null);
  const onTypingEnd = () => {
    if (!isTyping()) return
    setIsTyping(false)
    setTimeout(() => {
      props.onTransitionEnd(ref?.offsetTop)
    }, showAnimationDuration)
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
// @ts-ignore
const base64toBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
 // @ts-ignore
  return new (window.AudioContext || window.webkitAudioContext)().decodeAudioData(bytes.buffer);
};
  
  onMount( async  () => {
    console.log("on mount called");
    if (!isTyping) return
    const plainText = computePlainText(props.content.richText)
    console.log("plain text",plainText,window);

    


  //   try {
  //     const response = await fetch(`${ env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE }/api/integrations/texttospeech`,{
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json', // Set the appropriate content type
  //         // Add any other headers as needed
  //       },
  //       body: JSON.stringify({ text: plainText }),
  //     });
  //     let result = await response.json();
  //     result = result.message
  //     // console.log("resulttt",result);
  //     if (result.audioData) {
  //       const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
  //       const audioUrl = URL.createObjectURL(audioBlob);

  //       const audio = new Audio(audioUrl);
  //       setAudioInstance(audio);
       
  //       checkAudioStart(audio);
        
  //     } else {
  //       console.error('Error in response:', result);
  //     }
  // } catch (error) {
  //     console.error('Error:', error);
      
  //     localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  // setAudioStarted(true);
    
  // }


    const typingDuration =
      props.typingEmulation?.enabled === false
        ? 0
        : computeTypingDuration({
            bubbleContent: plainText,
            typingSettings: props.typingEmulation,
          })
    typingTimeout = setTimeout(onTypingEnd, typingDuration)
  })
  
  // const checkAudioStart = (audio) => {
  //   try {
  //     console.log("check audio start called",audio);
  //     if (audioStarted()) {
  //       console.log("audio already started");

  //       localStorage.setItem(AUDIO_PLAYING_KEY, 'false');

        
  //     } else {
  //       const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
  //       const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
  //       if (!currentIsAudioPlaying) {
  //         audio.addEventListener('ended', () => {
  //           console.log("audio has ended");
  //           localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  //           setAudioStarted(true);
           
  //         });
  
  //         audio.play().then( result => {
  //           console.log("play successfull");
  //         } ).catch( err => {
  //           console.log("error",err);
  //           localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
      

  //         } );
  //         localStorage.setItem(AUDIO_PLAYING_KEY, 'true'); // Set the flag to true
          
  //       } else {
  //         console.log('Audio is currently playing. Wait for it to finish.');
  //         setTimeout( () => {
  //           checkAudioStart(audio);
  //         }, 500 );
  //       }
  //     }
  //   } catch (err) {
  //     console.log("error inside check Audio start", err);
  //     localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
     
  //   }
  // };


  // new version
  // @ts-ignore
  // const checkAudioStart = (audio) => {
  //   try {
  //     console.log("check audio start called", audio);
  
  //     if (audioStarted()) {
  //       console.log("audio already started");
  //       localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  //     } else {
  //       const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
  //       const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
  
  //       if (!currentIsAudioPlaying) {
  //         audio.play().then(() => {
  //           console.log("play successful");
  //           const checkEnded = () => {
  //             if (audio.currentTime === audio.duration) {
  //               console.log("audio has ended");
  //               localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  //               setAudioStarted(true);
  //             } else {
  //               setTimeout(checkEnded, 500);
  //             }
  //           };
  
  //           checkEnded();
  //         }).catch((err) => {
  //           console.log("error", err);
  //           localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  //         });
  
  //         localStorage.setItem(AUDIO_PLAYING_KEY, 'true'); // Set the flag to true
  //       } else {
  //         console.log('Audio is currently playing. Wait for it to finish.');
  //         setTimeout(() => {
  //           checkAudioStart(audio);
  //         }, 500);
  //       }
  //     }
  //   } catch (err) {
  //     console.log("error inside check Audio start", err);
  //     localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  //   }
  // };
  


  onCleanup(() => {
    console.log("clean up");
  
    if (typingTimeout) clearTimeout(typingTimeout)
  })

  return (
    <div class="flex flex-col animate-fade-in" ref={ref}>
      <div class="flex w-full items-center">
        <div class="flex relative items-start typebot-host-bubble max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing "
            style={{
              width: isTyping() ? '64px' : '100%',
              height: isTyping() ? '32px' : '100%',
            }}
            data-testid="host-bubble"
          >
            {isTyping() && <TypingBubble />}
          </div>
          <div
            class={clsx(
              'overflow-hidden text-fade-in mx-4 my-2 whitespace-pre-wrap slate-html-container relative text-ellipsis',
              isTyping() ? 'opacity-0' : 'opacity-100'
            )}
            style={{
              height: isTyping() ? (isMobile() ? '16px' : '20px') : '100%',
            }}
          >
            <For each={props.content.richText}>
              {(element) => <PlateElement element={element} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}
