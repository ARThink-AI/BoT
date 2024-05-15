// import { createSignal, For } from 'solid-js';
// import './style.css'

// export const CardInput = (props: any) => {
//   const [inputs, setInputs] = createSignal(props?.block?.options?.inputs ? props?.block?.options?.inputs : [])



//   const updateInput = (property: string, value: any, index: number) => {
//     // @ts-ignore
//     const inputss = inputs().map((inp, ind) => {
//       if (ind != index) return inp
//       const modified = { ...inputs()[ind] };

//       modified[property] = value;
//       return modified
//     });
//     setInputs(inputss);
//   }

//   const handleSubmit = () => {
//     const ans = {};
//     inputs().forEach(input => {
//       ans[input?.answerVariableId] = input.userInput;
//     });
//     console.log("Submitted:", ans);



//     if (props.onSubmit) {
//       props.onSubmit({ label: "Submitted", value: JSON.stringify(ans) });
//     } else {
//       console.error("onSubmit prop is not provided.");
//     }
//   };


//   console.log("card props", props)

//   return (

//     <>
//       <div class="mx-auto">
//         <div class="p-6 lg-w-[450px] h-[400px] sm-w-full rounded-md shadow-lg shadow-black-50 overflow-hidden">
//           <div class="flex flex-col h-full gap-2">
//             <div id="headings">
//               <p class="sticky top-0 bg-white text-xl">{props.block.options.heading}</p>
//               <p class="sticky top-[48px] bg-white text-md">
//                 {props.block.options.subHeading}
//               </p>
//             </div>
//             <div class="overflow-y-scroll hide-scrollbar flex-1 mb-2" id="input-container">

//               {inputs().map((input: any, i: number) => {
//                 switch (input.type) {
//                   case "text":
//                     return (
//                       <>
//                         <label for="">{input.label}</label>
//                         <input

//                           type={input.type}
//                           placeholder={input.placeholder}
//                           class={`border p-2 rounded-md w-full mb-2`}
//                           value={input?.userInput ? input?.userInput : ""}
//                           onChange={(e) =>
//                             updateInput("userInput", e.target.value, i)
//                           }



//                           required={input.required}
//                         />
//                       </>
//                     );
//                   case "email":
//                     return (
//                       <>
//                         <label for="">{input.label}</label>
//                         <input
//                           type={input.type}
//                           placeholder={input.placeholder}
//                           class={`border p-2 rounded-md w-full mb-2`}
//                           value={input?.userInput ? input?.userInput : ""}
//                           onChange={(e) =>
//                             updateInput("userInput", e.target.value, i)
//                           }

//                           required={input.required}
//                         />
//                       </>
//                     );
//                   case "phone":
//                     return (
//                       <>
//                         <label for="">{input.label}</label>
//                         <input
//                           type={input.type}
//                           placeholder={input.placeholder}
//                           class={`border p-2 rounded-md w-full mb-2`}
//                           value={input?.userInput ? input?.userInput : ""}
//                           onChange={(e) =>
//                             updateInput("userInput", e.target.value, i)
//                           }

//                           required={input.required}
//                         />
//                       </>
//                     );

//                   case "dropdown":
//                     return (
//                       <>
//                         <label for="">{input.label}</label>
//                         <select
//                           class="w-full p-2 appearance-none border rounded-md mb-2"
//                           value={input?.userInput ? input?.userInput : ""}
//                           onChange={(e) => updateInput("userInput", e.target.value, i)}
//                           required={input.required}
//                         >
//                           <option value="" disabled selected>
//                             {input.placeholder}
//                           </option>
//                           <For each={input.values}>{(value) => (
//                             <option value={value}>{value}</option>
//                           )}</For>
//                         </select >
//                       </>
//                     )

//                   case "textarea":
//                     return (
//                       <>
//                         <label>{input.label}</label>
//                         < textarea
//                           class="border p-2 rounded-md w-full"
//                           placeholder={input.placeholder}
//                           value={input?.userInput ? input?.userInput : ""}
//                           onChange={(e) =>
//                             updateInput("userInput", e.target.value, i)}
//                           required={input.required}
//                         />
//                       </>
//                     )
//                   case "radio":
//                     return (
//                       <><label for="">{input.label}</label>
//                         <div class="flex justify-start gap-1 mt-2">

//                           <For each={input.values}>{(value) => (
//                             <>
//                               <input
//                                 id={value}
//                                 type="radio"
//                                 class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
//                                 value={value}
//                                 checked={input.userInput === value}
//                                 onChange={(e) =>
//                                   updateInput("userInput", e.target.value, i)}
//                                 required={input.required}
//                               />
//                               <label for={value}>{value}</label>
//                             </>
//                           )}</For>
//                         </div>
//                       </>)

//                   case "checkbox":
//                     return (
//                       <>
//                         <label for="">{input.label}</label>
//                         <div class="flex justify-start flex-col gap-1">
//                           <For each={input.values}>{(value) => (
//                             <div class="flex justify-start gap-2">
//                               <input
//                                 type="checkbox"
//                                 class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
//                                 value={value}
//                                 onChange={(e) => {
//                                   const isChecked = e.target.checked;
//                                   let updatedValues;
//                                   if (!input.userInput) {
//                                     updatedValues = isChecked ? [value] : [];
//                                   } else {
//                                     updatedValues = isChecked
//                                       ? [...input.userInput, value]
//                                       : input.userInput.filter((item) => item !== value);
//                                   }
//                                   updateInput("userInput", updatedValues, i);
//                                 }}
//                                 checked={input.userInput && input.userInput.includes(value)}
//                               />
//                               <label>{value}</label>
//                             </div>
//                           )}</For>

//                         </div >
//                       </>
//                     )



//                   default:
//                     return null;
//                 }
//               })}
//             </div>
//             <div id="buttons" class="flex justify-end mb-2 gap-2">
//               {/* onClick={() => {
//                 // props.onSubmit({ label: "Submitted", value: JSON.stringify({ "vcdphidsm5nqdeiarvl11dj5g": "Dropdown1", "vj7dviiwtnnday3u8codhdzgc": "checkbox1" }) })
//                 let ans = {};
//                 for (let i = 0; i < props?.block?.options?.inputs?.length; i++) {
//                   ans[props?.block?.options?.inputs[i].answerVariableId] =
//                 }
//               }}  */}
//               <button onClick={handleSubmit} class="rounded-full w-[95px] h-[40px] bg-[#0077CC] text-white mt-2">
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div >
//       </div >


//     </>
//   )
// }

import { createSignal, For, createEffect, onCleanup } from 'solid-js';
import './style.css'
import singleTonTextQueue from "@/global/textQueue";
import { env } from "@typebot.io/env";
import Queue from '@/utils/queue';

export const CardInput = (props: any) => {
  const [inputs, setInputs] = createSignal(props?.block?.options?.inputs ? props?.block?.options?.inputs : [])

  const [emailValid, setEmailValid] = createSignal(true);
  const [phoneValidation, setPhoneValidation] = createSignal(true);
  const [voiceArray, setVoiceArray] = createSignal([]);
  const [audioRef, setAudioRef] = createSignal();
  const [currentPlayIndex, setCurrentPlayIndex] = createSignal(null);
  const [isRecording, setIsRecording] = createSignal(false);
  const [stream, setStream] = createSignal(null);
  const [timeoutId, setTimeoutId] = createSignal(null);
  createEffect(() => {
    console.log("card component rendered", JSON.stringify(props));
    if (props?.block?.options?.isVoiceFill) {

      // const audioElements = document.querySelectorAll("audio");
      // console.log("audio elements", audioElements);
      // audioElements.forEach(audio => {
      //   audio.pause();
      // });
      const audio = new Audio();
      audio.addEventListener('ended', ended);

      setAudioRef(audio);
      setTimeout(() => {
        console.log("timeout called");
        let textQueue = singleTonTextQueue.getInstance();
        console.log("text queue", textQueue);
        while (!textQueue.isEmpty()) {
          const dequeuedEnded = textQueue.dequeue();
          console.log("dequeuued endned", dequeuedEnded);
        }
        let arr = [];
        for (let i = 0; i < props?.block?.options?.inputs?.length; i++) {
          if (props?.block?.options?.inputs[i]?.required && !props?.block?.options.inputs[i].values && (props?.block?.options?.inputs[i]?.type == "text" || props?.block?.options?.inputs[i]?.type == "email" || props?.block?.options?.inputs[i]?.type == "phone")) {
            arr.push({ label: props?.block?.options?.inputs[i]?.label, index: i, set: "values" });
          } else {
            console.log("not entered anything")
          }
        }
        console.log("arr validation", arr);
        if (arr.length > 0) {
          setTimeout(() => {
            setVoiceArray(arr);

            setCurrentPlayIndex(0);
            playAudio();
          }, 200)



        }


      }, 200);


    }
  }, []);

  createEffect(() => {
    console.log("voice array changed", voiceArray());
  }, [voiceArray()]);

  const ended = async () => {
    try {
      console.log("audio ended");
      let index = currentPlayIndex();
      if (index == voiceArray().length) {
        console.log("index return ");
        return
      }

      console.log("start recording called");


      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: "default",
          sampleRate: 48000, // Adjust to your requirement
          sampleSize: 16,
          channelCount: 1,
        },
        video: false,
      });

      setStream(audioStream);
      const mediaRecorder = new MediaRecorder(audioStream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("on data aviaalble", event);
        chunks.push(event.data);

      };
      mediaRecorder.onstop = async () => {
        console.log("on stop");
        const blob = new Blob(chunks, { type: 'audio/wav' });
        // setRecordedAudio(URL.createObjectURL(blob));

        // Convert the recorded audio to text using Google Cloud Speech-to-Text API
        const audioData = await blob.arrayBuffer();
        const base64Audio = Buffer.from(audioData).toString('base64');
        console.log("audio data", audioData);
        try {
          const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // body: JSON.stringify({ audio: base64Audio }),
            body: JSON.stringify({ audio: base64Audio, type: "speechtotext", text: "Hii" }),
          });

          if (!response.ok) {
            throw new Error('Error converting audio to text');
          }

          const result = await response.json();
          console.log("result transcription", result.message.transcription);
          // if ( inputNode() ) {
          //   let n = inputNode();
          //   n.value = result.transcription
          // }

          // set card input 
          // const val = inputValue() + " " +result.message.transcription;
          // setInputValue(val);
          // const index = currentPlayIndex();
          const val = result.message.transcription;
          const inputIndex = voiceArray()[index].index;
          console.log("input index", inputIndex);
          handleInputChange2(val, inputIndex);
          // setIsRecording(false);
          stopRecordingUserVoice();
          if (timeoutId()) {
            console.log("terminate manually");
            clearTimeout(timeoutId());
            setTimeoutId(null);
          }


          let newIndex = index + 1;
          setCurrentPlayIndex(newIndex);
          playAudio();
          // node.value = result.transcription;
          // setRecordedText(result.transcription);
        } catch (error) {
          console.error('Error calling Speech-to-Text API:', error);
        }
      };
      // mediaRecorder.onstop = () => {
      //   console.log("on stop");
      //   const blob = new Blob(chunks, { type: 'audio/wav' });
      //   setRecordedAudio(URL.createObjectURL(blob));
      // };
      console.log("media recorder", mediaRecorder);
      mediaRecorder.start()

      setIsRecording(true);

      //  Handle Edge Case: Stop recording after 10 seconds (adjust as needed)
      let id = setTimeout(() => {
        console.log("automatic terminate called");
        if (isRecording()) {
          setTimeoutId(null);
          stopRecordingUserVoice();
          // mediaRecorder.stop();
          // setIsRecording(false);
        }
      }, 9000);
      setTimeoutId(id);



    } catch (err) {
      console.log("error accessing microphone", err);
    }


  }
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
      const index = currentPlayIndex();
      console.log("current index", index);
      // if (index == voiceArray().length) {
      //   console.log("index return ");
      //   return
      // }
      if (!voiceArray()[index]) {
        console.log("this is empty");
        return
      }
      const text = voiceArray()[index].label;
      console.log("text", text);
      const response = await fetch(`${env.NEXT_PUBLIC_INTERNAL_VIEWER_ROUTE}/api/integrations/texttospeech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, type: "translate", langCode: "en-IN" }),
      });
      if (response.ok) {
        const result = await response.json();
        const audioBlob = base64toBlob(result.message.audioData, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudio.src = audioUrl;
        currentAudio.play().catch((err) => {
          console.log("error playing ", err);



        });

      }
    } catch (err) {
      console.log("error playing audio", err);
    }

  }


  // createEffect(() => {
  //   const emailInput = inputs().find((input: any) => input.type === "email");
  //   if (emailInput) {
  //     const isValid = validateEmail(emailInput.userInput);
  //     setEmailValid(isValid);
  //   }
  //   const phoneInput = inputs().find((input: any) => input.type === "phone");
  //   if (phoneInput) {
  //     const isValid = validatePhone(phoneInput.userInput)
  //     setPhoneValidation(isValid)
  //   }

  // });

  const isAnyRequiredFieldEmpty = () => {
    return inputs().some((input: any) => {
      if (input.required) {
        if (input.type === "email" && !validateEmail(input.values)) {
          return true; // Email field is required and incomplete
        }
        if (input.type === "phone" && !validatePhone(input.values)) {
          return true; // Phone field is required and incomplete
        }
        if (input.type === "checkbox" && (!input.default)) {
          return true; // Checkbox is required and no option is selected
        }
        return !input.values; // Other required fields
      }
      return false;
    });
  };

  // function validateEmail() {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   const isValid = emailRegex.test(email());
  //   setEmailValid(isValid);

  // }
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  const validatePhone = (phoneNumber: string){
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber)
  }

  const handleInputChange = (e: any, index: any) => {
    const { value } = e.target;
    updateInput("values", value, index);
    console.log("handle change index", index)

    // Perform validation based on input type
    const inputType = inputs()[index].type;
    console.log("input typeeee", inputType)
    if (inputType === "email") {
      setEmailValid(validateEmail(value));
    } else if (inputType === "phone") {
      setPhoneValidation(validatePhone(value));
    }

  }
  const handleInputChange2 = (value: string, index: any) => {
    updateInput("values", value, index);
    console.log("handle change index", index)

    // Perform validation based on input type
    const inputType = inputs()[index].type;
    console.log("input typeeee", inputType)
    if (inputType === "email") {
      setEmailValid(validateEmail(value));
    } else if (inputType === "phone") {
      setPhoneValidation(validatePhone(value));
    }
  }


  const updateInput = (property: string, value: any, index: number) => {
    // @ts-ignore
    const inputss = inputs().map((inp, ind) => {
      if (ind != index) return inp
      const modified = { ...inputs()[ind] };

      modified[property] = value;
      return modified
    });
    setInputs(inputss);
  }

  const handleSubmit = () => {
    const ans = {};
    inputs().forEach(input => {
      console.log("input", input)
      // ans[input.answerVariableId] = input.userInput ? input?.default : input?.userInput;
      if (input.type == "text" || input.type == "phone" || input.type == "email") {
        ans[input.answerVariableId] = input.values
      } else {
        ans[input.answerVariableId] = input.default
      }

    });
    console.log("Submitted:", ans);
    if (props.onSubmit) {
      props.onSubmit({ label: "Submitted", value: JSON.stringify(ans) });
    } else {
      console.error("onSubmit prop is not provided.");
    }
  };


  console.log("card props", props)

  const stopRecordingUserVoice = async () => {
    console.log("stop recording callled");
    if (stream()) {
      stream().getTracks().forEach((track) => {
        track.stop();
      });
    }
    setIsRecording(false);
  }


  onCleanup(() => {

    if (props?.block?.options?.isVoiceFill && audioRef()) {
      const audio = audioRef()
      audio.removeEventListener("ended", ended);
    }

  })

  return (

    <>
      <div class="mx-auto">
        <div class="p-6 lg:min-w-[450px] min-h-[480px] sm-w-full rounded-md shadow-lg shadow-black-50">
          <div class="flex flex-col h-full gap-2">
            <div id="headings">
              <p class="sticky top-0 bg-white text-xl">{props.block.options.heading}</p>
              <p class="sticky top-[48px] bg-white text-md">
                {props.block.options.subHeading}
              </p>
            </div>
            <div class="p-3  flex-1 mb-2" id="input-container">

              {/* {inputs().map((input: any, i: number) => {
                switch (input.type) {
                  case "text":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <input

                          type={input.type}
                          placeholder={input.placeholder}
                          class={`border p-2 rounded-md w-full mb-2`}
                          value={input?.values ? input?.values : ""}
                          onChange={(e) => handleInputChange(e, i)}







                          required={input.required}
                        />
                      </>
                    );
                  case "email":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          // class={`border p-2 rounded-md w-full mb-2`}
                          value={input?.values ? input?.values : ""}
                          onChange={(e) => handleInputChange(e, i)}
                          class={`border p-2 rounded-md w-full mb-2 ${input.type === 'email' && !emailValid() ? 'border-red-500' : ''}`}

                          required={input.required}
                        />
                        {input.type === 'email' && !emailValid() && (
                          <p class="text-red-500 text-sm">Please enter a valid email address.</p>
                        )}
                      </>
                    );
                  case "phone":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          // class={`border p-2 rounded-md w-full mb-2`}
                          class={`border p-2 rounded-md w-full mb-2 ${input.type === 'phone' && !phoneValidation() ? 'border-red-500' : ''}`}
                          value={input?.values ? input?.values : ""}
                          onChange={(e) => handleInputChange(e, i)}

                          required={input.required}
                        />
                        {input.type === 'phone' && !phoneValidation() && (
                          <p class="text-red-500 text-sm">Please enter a valid 10 digit phone number.</p>
                        )}

                      </>
                    );

                  case "dropdown":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <select
                          class="w-full p-2 appearance-none border rounded-md mb-2"
                          value={input?.default ? input?.default : ""}
                          onChange={(e) => updateInput("default", e.target.value, i)}
                          required={input.required}
                        >
                          <option value="" disabled selected>
                            {input.placeholder}
                          </option>
                          <For each={JSON.parse(input.values)}>{(value) => (
                            <option value={value}>{value}</option>
                          )}</For>
                        </select >
                      </>
                    )

                  case "textarea":
                    return (
                      <>
                        <label>{input.label}</label>
                        < textarea
                          class="border p-2 rounded-md w-full"
                          placeholder={input.placeholder}
                          value={input?.userInput ? input?.userInput : ""}
                          onChange={(e) =>
                            updateInput("userInput", e.target.value, i)}
                          required={input.required}
                        />
                      </>
                    )
                  case "radio":
                    return (
                      <><label for="">{input.label}</label>
                        <div class="flex justify-start gap-1 mt-2">

                          <For each={JSON.parse(input.values)}>{(value) => (
                            <>
                              <input
                                id={value}
                                type="radio"
                                class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
                                value={value}
                                checked={input.userInput === value || (!input.userInput && input.default === value)}
                                onChange={(e) =>
                                  updateInput("userInput", e.target.value, i)}
                                required={input.required}
                              />
                              <label for={value}>{value}</label>
                            </>
                          )}</For>
                        </div>
                      </>)

                  case "checkbox":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <div class="flex justify-start flex-col gap-1">
                          <For each={JSON.parse(input.values)}>{(value) => (
                            <div class="flex justify-start gap-2">
                              <input
                                type="checkbox"
                                class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
                                value={value}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let updatedValues;
                                  if (!input.userInput) {
                                    updatedValues = isChecked ? [value] : [];
                                  } else {
                                    updatedValues = isChecked
                                      ? [...input.userInput, value]
                                      : input.userInput.filter((item) => item !== value);
                                  }
                                  updateInput("userInput", updatedValues, i);
                                }}
                                checked={input.userInput && input.userInput.includes(value) || (!input.userInput && input.default === value)}
                                required={input.required}
                              />
                              <label>{value}</label>
                            </div>
                          )}</For>

                        </div >
                      </>
                    )



                  default:
                    return null;
                }
              })} */}
              <For each={inputs()}>{(input, i) => {
                switch (input.type) {
                  case "text":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          class={`border p-2 rounded-md w-full mb-2`}
                          value={input?.values ? input?.values : ""}
                          onChange={(e) => handleInputChange(e, i())}
                          required={input.required}
                        />
                      </>
                    );
                  case "email":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          class={`border p-2 rounded-md w-full mb-2 ${input.type === 'email' && !emailValid() ? 'border-red-500' : ''}`}
                          value={input?.values ? input?.values : ""}
                          onChange={(e) => handleInputChange(e, i())}
                          required={input.required}
                        />
                        {input.type === 'email' && !emailValid() && (
                          <p class="text-red-500 text-sm">Please enter a valid email address.</p>
                        )}
                      </>
                    );
                  case "phone":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          class={`border p-2 rounded-md w-full mb-2 ${input.type === 'phone' && !phoneValidation() ? 'border-red-500' : ''}`}
                          value={input?.values ? input?.values : ""}
                          onChange={(e) => handleInputChange(e, i())}
                          required={input.required}
                        />
                        {input.type === 'phone' && !phoneValidation() && (
                          <p class="text-red-500 text-sm">Please enter a valid 10 digit phone number.</p>
                        )}
                      </>
                    );
                  case "dropdown":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <select
                          class="w-full p-2 appearance-none border rounded-md mb-2"
                          value={input?.default ? input?.default : ""}
                          onChange={(e) => updateInput("default", e.target.value, i())}
                          required={input.required}
                        >
                          <option value="" disabled selected>
                            {input.placeholder}
                          </option>
                          <For each={JSON.parse(input.values)}>{(value) => (
                            <option value={value}>{value}</option>
                          )}</For>
                        </select >
                      </>
                    )
                  case "textarea":
                    return (
                      <>
                        <label>{input.label}</label>
                        < textarea
                          class="border p-2 rounded-md w-full"
                          placeholder={input.placeholder}
                          value={input?.userInput ? input?.userInput : ""}
                          onChange={(e) =>
                            updateInput("userInput", e.target.value, i())}
                          required={input.required}
                        />
                      </>
                    )
                  case "radio":
                    return (
                      <><label for="">{input.label}</label>
                        <div class="flex justify-start gap-1 mt-2">

                          <For each={JSON.parse(input.values)}>{(value) => (
                            <>
                              <input
                                id={value}
                                type="radio"
                                class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
                                value={value}
                                checked={input.userInput === value || (!input.userInput && input.default === value)}
                                onChange={(e) =>
                                  updateInput("userInput", e.target.value, i())}
                                required={input.required}
                              />
                              <label for={value}>{value}</label>
                            </>
                          )}</For>
                        </div>
                      </>)
                  case "checkbox":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <div class="flex justify-start flex-col gap-1">
                          <For each={JSON.parse(input.values)}>{(value) => (
                            <div class="flex justify-start gap-2">
                              <input
                                type="checkbox"
                                class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
                                value={value}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let updatedValues;
                                  if (!input.userInput) {
                                    updatedValues = isChecked ? [value] : [];
                                  } else {
                                    updatedValues = isChecked
                                      ? [...input.userInput, value]
                                      : input.userInput.filter((item) => item !== value);
                                  }
                                  updateInput("userInput", updatedValues, i());
                                }}
                                checked={input.userInput && input.userInput.includes(value) || (!input.userInput && input.default === value)}
                                required={input.required}
                              />
                              <label>{value}</label>
                            </div>
                          )}</For>

                        </div >
                      </>
                    )

                  // Other cases omitted for brevity

                  default:
                    return null;
                }
              }}</For>


            </div>
            <div id="buttons" class="flex justify-end mb-2 gap-2">
              {/* onClick={() => {
                // props.onSubmit({ label: "Submitted", value: JSON.stringify({ "vcdphidsm5nqdeiarvl11dj5g": "Dropdown1", "vj7dviiwtnnday3u8codhdzgc": "checkbox1" }) })
                let ans = {};
                for (let i = 0; i < props?.block?.options?.inputs?.length; i++) {
                  ans[props?.block?.options?.inputs[i].answerVariableId] =
                }
              }}  */}
              {/* {props?.block?.options?.isVoiceFill && (
                <button> Disable Voice </button>
              )} */}
              {props?.block?.options?.isVoiceFill && isRecording() && (
                <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", "justify-content": "center" }} >
                  <button onClick={stopRecordingUserVoice} style={{ cursor: "pointer" }} ><img style={{ height: "25px" }} src="https://quadz.blob.core.windows.net/demo1/mic.gif" />  </button>
                  <div style={{ "font-size": "8px" }} > Listening... </div>
                </div>
              )}
              <button onClick={handleSubmit} class={`rounded-full w-[95px] h-[40px] bg-[#0077CC] text-white mt-2 ${isAnyRequiredFieldEmpty() ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isAnyRequiredFieldEmpty()}>
                Submit
              </button>
            </div>
          </div>
        </div >
      </div >


    </>
  )
}