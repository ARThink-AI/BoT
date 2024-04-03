import { createSignal, For, createEffect } from 'solid-js';
import './style.css'

export const CardInput = (props: any) => {
  const [inputs, setInputs] = createSignal(props?.block?.options?.inputs ? props?.block?.options?.inputs : [])

  const [emailValid, setEmailValid] = createSignal(true);




  // function validateEmail() {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   const isValid = emailRegex.test(email());
  //   setEmailValid(isValid);

  // }


  const updateInput = (property: string, value: any, index: Number) => {
    // @ts-ignore
    let inputss = inputs().map((inp, ind) => {
      if (ind != index) return inp
      let modified = { ...inputs()[ind] };

      modified[property] = value;
      return modified
    });
    setInputs(inputss);
  }

  createEffect(() => {

  }, updateInput)

  console.log("card props", props)

  return (

    <>
      <div class="mx-auto">
        <div class="p-3 lg-w-[450px] h-[400px] sm-w-full rounded-md shadow-lg shadow-black-50 overflow-hidden">
          <div class="flex flex-col h-full gap-2">
            <div id="headings">
              <p class="sticky top-0 bg-white text-xl">{props.block.options.heading}</p>
              <p class="sticky top-[48px] bg-white text-md">
                {props.block.options.subHeading}
              </p>
            </div>
            <div class="overflow-y-scroll hide-scrollbar flex-1 mb-2" id="input-container">
              {inputs().map((input: any, i: number) => {
                switch (input.type) {
                  case "text":
                    return (
                      <input

                        type={input.type}
                        placeholder={input.placeholder}
                        class={`border p-2 rounded-md w-full mb-2`}
                        value={input?.userInput ? input?.userInput : ""}
                        onInput={(e) =>
                          updateInput("userInput", e.target.value, i)
                        }
                        autofocus


                        required={input.required}
                      />

                    );
                  case "email":
                    return (
                      <input
                        type={input.type}
                        placeholder={input.placeholder}
                        class={`border p-2 rounded-md w-full mb-2`}
                        value={input?.userInput ? input?.userInput : ""}
                        onInput={(e) =>
                          updateInput("userInput", e.target.value, i)
                        }

                        required={input.required}
                      />

                    );
                  case "phone":
                    return (
                      <input
                        type={input.type}
                        placeholder={input.placeholder}
                        class={`border p-2 rounded-md w-full mb-2`}
                        value={input?.userInput ? input?.userInput : ""}
                        onInput={(e) =>
                          updateInput("userInput", e.target.value, i)
                        }

                        required={input.required}
                      />

                    );



                  default:
                    return null;
                }
              })}
            </div>
            <div id="buttons" class="flex justify-end mb-2 gap-2">
              {/* onClick={() => {
                // props.onSubmit({ label: "Submitted", value: JSON.stringify({ "vcdphidsm5nqdeiarvl11dj5g": "Dropdown1", "vj7dviiwtnnday3u8codhdzgc": "checkbox1" }) })
                let ans = {};
                for (let i = 0; i < props?.block?.options?.inputs?.length; i++) {
                  ans[props?.block?.options?.inputs[i].answerVariableId] =
                }
              }}  */}
              <button class="rounded-full w-[95px] h-[40px] bg-[#0077CC] text-white mt-2">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>


    </>
  )
}
