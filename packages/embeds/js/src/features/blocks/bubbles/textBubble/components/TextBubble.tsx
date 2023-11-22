import { TypingBubble } from '@/components'
import type { TextBubbleContent, TypingEmulation } from '@typebot.io/schemas'
import { For, createSignal, onCleanup, onMount } from 'solid-js'
import { PlateElement } from './plate/PlateBlock'
import { computePlainText } from '../helpers/convertRichTextToPlainText'
import { clsx } from 'clsx'
import { isMobile } from '@/utils/isMobileSignal'
import { computeTypingDuration } from '@typebot.io/bot-engine/computeTypingDuration'

type Props = {
  content: TextBubbleContent
  typingEmulation: TypingEmulation
  onTransitionEnd: (offsetTop?: number) => void
}

export const showAnimationDuration = 400

let typingTimeout: NodeJS.Timeout

const AUDIO_PLAYING_KEY = 'audioPlaying';
//const AUDIO_CACHE_KEY_PREFIX = 'audioCache:';
export const TextBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [isTyping, setIsTyping] = createSignal(true)
  // const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
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
  // const  getSampleRateFromAudioData  = (audioData) => {
  //   // Check the audio data format
  //   if (audioData.byteLength < 4) {
  //     throw new Error('Invalid audio data format');
  //   }
  
  //   // Read the first 4 bytes to get the sample rate
  //   const sampleRate = new Buffer(audioData.slice(0, 4)).readUInt32BE();
  
  //   // Check if the sample rate is within the valid range
  //   if (sampleRate < 3000 || sampleRate > 768000) {
  //     throw new Error('Invalid sample rate');
  //   }
  
  //   return sampleRate;
  // }
  onMount( async  () => {
    console.log("on mount called");
    if (!isTyping) return
    const plainText = computePlainText(props.content.richText)
    console.log("plain text",plainText,window);

    


    try {
      const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(plainText)}`);
      const result = await response.json();

      if (result.audioData) {
        const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        setAudioInstance(audio);
        // setAudioData(audio)
        checkAudioStart(audio);
        // Check if an audio is currently playing
        // const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
        // const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
        // setIsAudioPlaying(currentIsAudioPlaying);

        // if (!currentIsAudioPlaying) {
        //   audio.addEventListener('ended', () => {
        //     localStorage.setItem(AUDIO_PLAYING_KEY, 'false'); // Reset the flag when audio playback is finished
        //     setIsAudioPlaying(false);
        //   });

        //   audio.play();
        //   localStorage.setItem(AUDIO_PLAYING_KEY, 'true'); // Set the flag to true
        //   setIsAudioPlaying(true);
        // } else {
        //   console.log('Audio is currently playing. Wait for it to finish.');
        // }
      } else {
        console.error('Error in response:', result);
      }
  } catch (error) {
      console.error('Error:', error);
      // localStorage.setItem(AUDIO_PLAYING_KEY,  'false');
      localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  setAudioStarted(true);
      // setIsAudioPlaying(false);
  }

  //   try {
  //     const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(plainText)}`);
  //     const result = await response.json();

  //     if (result.audioData) {
  //         const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
  //         const audioUrl = URL.createObjectURL(audioBlob);

  //         const audio = new Audio(audioUrl);
  //           // audio.play();
  //           setTimeout(() => {
  //             audio.play();
  //           }, 600);
  //     } else {
  //         console.error('Error in response:', result);
  //     }
  // } catch (error) {
  //     console.error('Error:', error);
  // }




    // fetch(`http://localhost:3006/data/${plainText}`).then(response => response.json())
    // .then(  response => {
    //   const base64Audio = response.audioData;

    //   // const arrayBuffer = Buffer.from(base64Audio, 'base64');
    //   // const audioContext = new AudioContext();
    //   // const audioSource = audioContext.createBufferSource();
    //   // const audioBuffer = audioContext.createBuffer(1, arrayBuffer.byteLength, true);
    //   // audioBuffer.copyFromChannel(new Float32Array(arrayBuffer), 0);
    //   // audioSource.buffer = audioBuffer;
    //   // audioSource.connect(audioContext.destination);
    //   // audioSource.start();
    //   // console.log("res",res);
    //   // const audioDataRegexp = /audio_data:\s*([^\s]+)/;
    //   // const audioDataMatch = audioDataRegexp.exec(data);
    //   // if (!audioDataMatch) {
    //   //   throw new Error('Could not find audio data');
    //   // }
  
    //   // const audioBuffer = Buffer.from(audioDataMatch[1], 'base64');
    //   // const audioContext = new AudioContext();
    //   // const audioSource = audioContext.createBufferSource();
    //   // // @ts-ignore
    //   // audioSource.buffer = audioBuffer;
    //   // audioSource.connect(audioContext.destination);
    //   // audioSource.start();
    // }  ).catch( err => {
    //   console.log("error",err);
    // } ) 
    const typingDuration =
      props.typingEmulation?.enabled === false
        ? 0
        : computeTypingDuration({
            bubbleContent: plainText,
            typingSettings: props.typingEmulation,
          })
    typingTimeout = setTimeout(onTypingEnd, typingDuration)
  })
  // const checkLocalStorage = () => {
  //   const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
  //   const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
  //   // setIsAudioPlaying(currentIsAudioPlaying);
  // };
  // @ts-ignore
  // const checkAudioStart = (audio ) => {
  //   try {
  //     console.log("check audio start called");
  //     if (  audioStarted() ) {
  //        console.log("audio already started");
  //        clearInterval(localStorageCheckInterval);
  //     } else {
  //         const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
  //       const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
  //       if (!currentIsAudioPlaying) {
  //         audio.addEventListener('ended', () => {
  //           console.log("audio has ended");
  //           localStorage.setItem(AUDIO_PLAYING_KEY, 'false'); 
  //           setAudioStarted(true);
  //           // Reset the flag when audio playback is finished
  //           // setIsAudioPlaying(false);
  //         });

  //         audio.play();
  //         localStorage.setItem(AUDIO_PLAYING_KEY, 'true'); // Set the flag to true
  //         // setIsAudioPlaying(true);
  //       } else {
  //         console.log('Audio is currently playing. Wait for it to finish.');
  //       }
  //     }
  //   } catch (err) {
  //     console.log("error inside check Audio start",err);
  //     clearInterval(localStorageCheckInterval);
  //   }
  // }
  const checkAudioStart = (audio) => {
    try {
      console.log("check audio start called",audio);
      if (audioStarted()) {
        console.log("audio already started");

        localStorage.setItem(AUDIO_PLAYING_KEY, 'false');

        // clearInterval(localStorageCheckInterval);
      } else {
        const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
        const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
        if (!currentIsAudioPlaying) {
          audio.addEventListener('ended', () => {
            console.log("audio has ended");
            localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
            setAudioStarted(true);
            // Reset the flag when audio playback is finished
            // setIsAudioPlaying(false);
          });
  
          audio.play().then( result => {
            console.log("play successfull");
          } ).catch( err => {
            console.log("error",err);
            localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
      // clearInterval(localStorageCheckInterval);

          } );
          localStorage.setItem(AUDIO_PLAYING_KEY, 'true'); // Set the flag to true
          // setIsAudioPlaying(true);
        } else {
          console.log('Audio is currently playing. Wait for it to finish.');
          setTimeout( () => {
            checkAudioStart(audio);
          }, 500 );
        }
      }
    } catch (err) {
      console.log("error inside check Audio start", err);
      localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
      // clearInterval(localStorageCheckInterval);
    }
  };
  

  // Check localStorage every 1000 milliseconds (1 second)
  // const localStorageCheckInterval = setInterval(checkAudioStart.bind( null , audioInstance()), 500);
  // const localStorageCheckInterval = setInterval(() => checkAudioStart(audioInstance()), 500);
  // const localStorageCheckInterval = setInterval(() => checkAudioStart(audioInstance), 500);
  onCleanup(() => {
    console.log("clean up");
    // clearInterval(localStorageCheckInterval);
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
