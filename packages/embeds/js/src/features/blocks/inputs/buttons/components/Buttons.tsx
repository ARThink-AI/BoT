import { Button } from '@/components/Button'
import { SearchInput } from '@/components/inputs/SearchInput'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { ChoiceInputBlock } from '@typebot.io/schemas'
import { defaultChoiceInputOptions } from '@typebot.io/schemas/features/blocks/inputs/choice'
import { For, Show, createSignal, onMount , onCleanup } from 'solid-js'
import { env  } from "@typebot.io/env";
type Props = {
  inputIndex: number
  defaultItems: ChoiceInputBlock['items']
  options: ChoiceInputBlock['options']
  onSubmit: (value: InputSubmitContent) => void
}

const AUDIO_PLAYING_KEY = 'audioPlaying';

export const Buttons = (props: Props) => {
  let inputRef: HTMLInputElement | undefined
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems)
  
  const [ audioStarted , setAudioStarted ] = createSignal(false);
  const [ audioInstance , setAudioInstance ] = createSignal(null);
 
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

const fetchData = async (text: string ) => {
  try {
        const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(text)}`);
    const result = await response.json();
    
    if (result.audioData) {
      const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      setAudioInstance(audio);
      // setAudioData(audio)
      checkAudioStart(audio);
  } else {
    console.error('Error in response:', result);
  }
  } catch(error) {
    console.error('Error:', error);
    // localStorage.setItem(AUDIO_PLAYING_KEY,  'false');
    localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
setAudioStarted(true);
    // setIsAudioPlaying(false);
  }
} 
const checkAudioStart = (audio) => {
  try {
    console.log("check audio start called",audio);
    if (audioStarted()) {
      console.log("audio already started");
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
    // clearInterval(localStorageCheckInterval);
  }
};

  onMount( async  () => {
    if (!isMobile() && inputRef) inputRef.focus()
    try {
      let finalText = "";
   if ( props.defaultItems.length == 1 ) {
     finalText = props?.defaultItems[0]?.content ? props.defaultItems[0].content :  "";
   } else {
    finalText = "Choose from " +
    props.defaultItems.map((item, index) => {
      if (index === props.defaultItems.length - 1) {
        return "and " + item.content;
      } else {
        return item.content;
      }
    }).join(", ")
   }
  //  const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(finalText)}`);
  //  const result = await response.json();
  const response = await fetch(`${ env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE }/api/integrations/texttospeech`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Set the appropriate content type
      // Add any other headers as needed
    },
    body: JSON.stringify({ text: finalText }),
  });
  let result = await response.json();
  result = result.message
   if (result.audioData) {
     const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
     const audioUrl = URL.createObjectURL(audioBlob);

     const audio = new Audio(audioUrl);
     setAudioInstance(audio);
     // setAudioData(audio)
     checkAudioStart(audio);
 } else {
   console.error('Error in response:', result);
 }

    } catch(error) {
      console.error('Error:', error);
      // localStorage.setItem(AUDIO_PLAYING_KEY,  'false');
      localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  setAudioStarted(true);
      // setIsAudioPlaying(false);
    } 
  })

  const handleClick = (itemIndex: number) =>
    props.onSubmit({ value: filteredItems()[itemIndex].content ?? '' })

  const filterItems = (inputValue: string) => {
    setFilteredItems(
      props.defaultItems.filter((item) =>
        item.content?.toLowerCase().includes((inputValue ?? '').toLowerCase())
      )
    )
  }
  console.log("filtered items", props.defaultItems );
 
  onCleanup(() => {
    console.log("clean up");
    // clearInterval(localStorageCheckInterval);
    
  })
  return (
    <div class="flex flex-col gap-2 w-full">
      <Show when={props.options.isSearchable}>
        <div class="flex items-end typebot-input w-full">
          <SearchInput
            ref={inputRef}
            onInput={filterItems}
            placeholder={
              props.options.searchInputPlaceholder ??
              defaultChoiceInputOptions.searchInputPlaceholder
            }
            onClear={() => setFilteredItems(props.defaultItems)}
          />
        </div>
      </Show>

      <div
        class={
          'flex flex-wrap justify-end gap-2' +
          (props.options.isSearchable
            ? ' overflow-y-scroll max-h-80 rounded-md hide-scrollbar'
            : '')
        }
      >
        <For each={filteredItems()}>
          {(item, index) => (
            <span class={'relative' + (isMobile() ? ' w-full' : '')}>
              <Button
                on:click={() => handleClick(index())}
                data-itemid={item.id}
                class="w-full"
              >
                {item.content}
              </Button>
              {props.inputIndex === 0 && props.defaultItems.length === 1 && (
                <span class="flex h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 ping">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full brightness-200 opacity-75" />
                  <span class="relative inline-flex rounded-full h-3 w-3 brightness-150" />
                </span>
              )}
            </span>
          )}
        </For>
      </div>
    </div>
  )
}
