import { Show , onCleanup, createSignal , onMount } from 'solid-js'
import { Avatar } from '../avatars/Avatar'


type Props = {
  message: string
  showAvatar: boolean
  avatarSrc?: string
}
const AUDIO_PLAYING_KEY = 'audioPlaying';
// export const GuestBubble = (props: Props) => (
//   <div
//     class="flex justify-end items-end animate-fade-in gap-2 guest-container"
//     style={{ 'margin-left': '50px' }}
//   >
//     <span
//       class="px-4 py-2 whitespace-pre-wrap max-w-full typebot-guest-bubble"
//       data-testid="guest-bubble"
//     >
//       {props.message}
//     </span>
//     <Show when={props.showAvatar}>
//       <Avatar initialAvatarSrc={props.avatarSrc} />
//     </Show>
//   </div>
// )
export const GuestBubble = (props: Props) => {
  console.log("guest bubble", props.message );
  // const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
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
onMount( async  () => {
  try {
    console.log("props message guest bubble", props.message );
    let modifiedText = props.message.split("payment payload")[0]; 
    const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(modifiedText)}`);
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
})
  // const fetchData = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(props.message)}`);
  //     const result = await response.json();

  //     if (result.audioData) {
  //       const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
  //       const audioUrl = URL.createObjectURL(audioBlob);

  //       const audio = new Audio(audioUrl);
  //       audio.play();
  //     } else {
  //       console.error('Error in response:', result);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };
  // fetchData();
  // const fetchData = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(props.message)}`);
  //     const result = await response.json();

  //     if (result.audioData) {
  //       const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
  //       const audioUrl = URL.createObjectURL(audioBlob);

  //       const audio = new Audio(audioUrl);

  //       // Check if an audio is currently playing
  //       const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
  //       const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
  //       setIsAudioPlaying(currentIsAudioPlaying);

  //       if (!currentIsAudioPlaying) {
  //         audio.addEventListener('ended', () => {
  //           localStorage.setItem(AUDIO_PLAYING_KEY, 'false'); // Reset the flag when audio playback is finished
  //           setIsAudioPlaying(false);
  //         });

  //         audio.play();
  //         localStorage.setItem(AUDIO_PLAYING_KEY, 'true'); // Set the flag to true
  //         setIsAudioPlaying(true);
  //       } else {
  //         console.log('Audio is currently playing. Wait for it to finish.');
  //       }
  //     } else {
  //       console.error('Error in response:', result);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  // const checkLocalStorage = () => {
  //   const localStorageValue = localStorage.getItem(AUDIO_PLAYING_KEY);
  //   const currentIsAudioPlaying = localStorageValue ? JSON.parse(localStorageValue) : false;
  //   setIsAudioPlaying(currentIsAudioPlaying);
  // };

  // // Check localStorage every 1000 milliseconds (1 second)
  // const localStorageCheckInterval = setInterval(checkLocalStorage, 1000);

  // onCleanup(() => {
  //   clearInterval(localStorageCheckInterval); // Cleanup the interval when the component is unmounted
  //   // Other cleanup logic if needed
  // });
  // const fetchData = async () => {
  //   try {
  //         const response = await fetch(`http://localhost:3006/data/${encodeURIComponent(props.message)}`);
  //     const result = await response.json();
      
  //     if (result.audioData) {
  //       const audioBlob = base64toBlob(result.audioData, 'audio/mp3');
  //       const audioUrl = URL.createObjectURL(audioBlob);

  //       const audio = new Audio(audioUrl);
  //       setAudioInstance(audio);
  //       // setAudioData(audio)
  //       checkAudioStart(audio);
  //   } else {
  //     console.error('Error in response:', result);
  //   }
  //   } catch(error) {
  //     console.error('Error:', error);
  //     // localStorage.setItem(AUDIO_PLAYING_KEY,  'false');
  //     localStorage.setItem(AUDIO_PLAYING_KEY, 'false');
  // setAudioStarted(true);
  //     // setIsAudioPlaying(false);
  //   }
  // }
  // fetchData();
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
  // const localStorageCheckInterval = setInterval(() => checkAudioStart(audioInstance()), 500);
  // const localStorageCheckInterval = setInterval(() => checkAudioStart(audioInstance), 500);
  onCleanup(() => {
    console.log("clean up");
    // clearInterval(localStorageCheckInterval);
    
  })
  return (
  <div
    class="flex justify-end items-end animate-fade-in gap-2 guest-container"
    style={{ 'margin-left': '50px' }}
  >
    <span
      class="px-4 py-2 whitespace-pre-wrap max-w-full typebot-guest-bubble"
      data-testid="guest-bubble"
    >
      {props.message}
    </span>
    <Show when={props.showAvatar}>
      <Avatar initialAvatarSrc={props.avatarSrc} />
    </Show>
  </div>
)
  }
