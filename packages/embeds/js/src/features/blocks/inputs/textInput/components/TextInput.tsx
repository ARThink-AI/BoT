import { Textarea, ShortTextInput } from '@/components'
import { SendButton } from '@/components/SendButton'
import { CommandData } from '@/features/commands'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { TextInputBlock } from '@typebot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { env } from "@typebot.io/env";
import TimerComponent from './Timer';
type Props = {
  block: TextInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const TextInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  const [stream, setStream] = createSignal(null);
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordedAudio, setRecordedAudio] = createSignal(null);
  const [recognition, setRecognition] = createSignal(null)
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined

  const handleInput = (inputValue: string) => setInputValue(inputValue)

  const checkIfInputIsValid = () =>
    inputValue() !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid()) props.onSubmit({ value: inputValue() })
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (props.block.options.isLong) return
    if (e.key === 'Enter') submit()
  }

  const submitIfCtrlEnter = (e: KeyboardEvent) => {
    if (!props.block.options.isLong) return
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
  }

  // const startRecordingUserVoice = async () => {
  //   try {
  //     console.log("start recording called");
  //     const audioStream = await navigator.mediaDevices.getUserMedia({
  //       audio: {
  //           deviceId: "default",
  //           sampleRate: 48000, // Adjust to your requirement
  //           sampleSize: 16,
  //           channelCount: 1,
  //       },
  //       video: false,
  //   });

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
  //        console.log("audio data",audioData);
  //       try {
  //         const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           // body: JSON.stringify({ audio: base64Audio }),
  //           body: JSON.stringify({ audio: base64Audio , type : "speechtotext" , text : "Hii" }),
  //         });

  //         if (!response.ok) {
  //           throw new Error('Error converting audio to text');
  //         }

  //         const result = await response.json();
  //         console.log("result transcription", result.message.transcription );
  //         // if ( inputNode() ) {
  //         //   let n = inputNode();
  //         //   n.value = result.transcription
  //         // }
  //         const val = inputValue() + " " +result.message.transcription;
  //         setInputValue(val);
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

  //     //  Handle Edge Case: Stop recording after 10 seconds (adjust as needed)
  //     setTimeout(() => {
  //       if (isRecording()) {
  //         stopRecordingUserVoice()
  //         // mediaRecorder.stop();
  //         // setIsRecording(false);
  //       }
  //     }, 50000);

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
  // }
  // const startRecordingUserVoice = () => {
  //   try {
  //     console.log("start recording called");

  //     // Check if the browser supports the Web Speech API
  //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  //     if (!SpeechRecognition) {
  //       throw new Error('Web Speech API is not supported in this browser.');
  //     }

  //     let recognition = new SpeechRecognition();
  //     setRecognition(recognition)
  //     recognition.continuous = true;
  //     recognition.interimResults = false;
  //     recognition.lang = 'en-US';

  //     recognition.onstart = () => {
  //       console.log("Speech recognition started");
  //       setIsRecording(true);
  //     };

  //     recognition.onresult = (event) => {
  //       const transcript = Array.from(event.results)
  //         .map(result => result[0])
  //         .map(result => result.transcript)
  //         .join('');

  //       console.log("Transcript:", transcript);

  //       const val = transcript;
  //       if (val.length > 1) {
  //         setInputValue(val);
  //       }

  //       // setTimeout(() => {
  //       //   if (val.length > 1) {
  //       //     console.log("user voice", val.length);
  //       //     userInputClicked();
  //       //   }
  //       // }, 4000);
  //     };

  //     recognition.onerror = (event) => {
  //       console.error("Speech recognition error:", event.error);
  //     };

  //     recognition.onend = () => {
  //       console.log("Speech recognition ended");
  //       setIsRecording(false);
  //     };

  //     recognition.onspeechend = () => {
  //       console.log("Speech has stopped being detected");
  //       stopRecordingUserVoice();
  //     };

  //     recognition.start();

  //   } catch (err) {
  //     console.error('Error accessing speech recognition:', err);
  //   }
  // };

  // const stopRecordingUserVoice = () => {
  //   if (recognition()) {
  //     recognition()?.stop();
  //   }
  // };
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

        const val = inputValue() + " " + transcript;
        if (val.length > 1) {
          // setInputValue(val);
          props.onSubmit({ value: val })
        }

        // const val = userInput() + " " + transcript;
        // if (val.length > 1) {
        //   setUserInput(val);
        // }

        // Trigger user input action immediately after speech recognition ends
        // if (val.length > 1) {
        //   console.log("user voice", val.length);
        //   userInputClicked();
        // }
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

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus()
    window.addEventListener('message', processIncomingEvent)
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'setInputValue') setInputValue(data.value)
  }
  console.log("microphonnnnnnnnnnnnnnn", props.block.options.isVoiceMicEnabled)
  return (
    <div
      class={'flex items-end justify-between pr-2 typebot-input w-full'}
      data-testid="input"
      style={{
        'max-width': props.block.options.isLong ? undefined : '350px',
      }}
      onKeyDown={submitWhenEnter}
    >
      {props.block.options.isLong ? (
        <Textarea
          ref={inputRef as HTMLTextAreaElement}
          onInput={handleInput}
          onKeyDown={submitIfCtrlEnter}
          value={inputValue()}
          placeholder={
            props.block.options?.labels?.placeholder ?? 'Type your answer...'
          }
        />
      ) : (
        <ShortTextInput
          ref={inputRef as HTMLInputElement}
          onInput={handleInput}
          value={inputValue()}
          placeholder={
            props.block.options?.labels?.placeholder ?? 'Type your answer...'
          }
        />
      )}

      {/* {  isRecording() &&  <TimerComponent  stopRecordingUserVoice={stopRecordingUserVoice} /> } */}
      {!isRecording() && props.block.options.isVoiceMicEnabled && <button disabled={isRecording()}
        onClick={() => startRecordingUserVoice()}
        style={{ cursor: "pointer" }}
      // onMouseDown={startRecordingUserVoice} 
      ><img style={{ height: "25px", "margin-bottom": "12px" }} src={"https://quadz.blob.core.windows.net/demo1/mic.svg"} /></button>}
      {/* { isRecording() && <button onClick={stopRecordingUserVoice} style={{ cursor : "pointer" }} ><img style={{ height : "30px" , "margin-bottom" : "12px" }} src="https://quadz.blob.core.windows.net/demo1/mic.gif" />  </button> } */}
      {isRecording() && (
        <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center", "margin-bottom": "15px" }} >
          <button onClick={stopRecordingUserVoice} style={{ cursor: "pointer" }} ><img style={{ height: "25px" }} src="https://quadz.blob.core.windows.net/demo1/mic.gif" />  </button>
          {/*<div style={{ "font-size": "8px" }} > Listening... </div> */}
        </div>
      )}

      {/* </div> */}
      {/* { isRecording() && <button disabled={ !isRecording() } 
      
      // onClick={ () => stopRecordingUserVoice() }
      onMouseUp={stopRecordingUserVoice}
      ><img style={{ height : "25px" , "margin-bottom" : "12px" }} src={"https://quadz.blob.core.windows.net/demo1/mic-mute-fill.svg"} /></button> } */}
      <SendButton
        type="button"
        isDisabled={inputValue() === ''}
        class="my-2 ml-2"
        on:click={submit}
      >
        {props.block.options?.labels?.button ?? 'Send'}
      </SendButton>
    </div>
  )
}
