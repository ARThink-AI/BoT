import { createSignal, For } from 'solid-js';
import './style.css'

export const CardInput = (props: any) => {
  const [inputs, setInputs] = createSignal(props?.block?.options?.inputs ? props?.block?.options?.inputs : [])

  const [emailValid, setEmailValid] = createSignal(true);




  // function validateEmail() {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   const isValid = emailRegex.test(email());
  //   setEmailValid(isValid);

  // }


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
      ans[input.answerVariableId] = input.userInput;
    });
    console.log("Submitted:", ans);
    if (props.onSubmit) {
      props.onSubmit({ label: "Submitted", value: JSON.stringify(ans) });
    } else {
      console.error("onSubmit prop is not provided.");
    }
  };


  console.log("card props", props)

  return (

    <>
      <div class="mx-auto">
        <div class="p-6 lg-w-[450px] h-[400px] sm-w-full rounded-md shadow-lg shadow-black-50 overflow-hidden">
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
                      <>
                        <label for="">{input.label}</label>
                        <input

                          type={input.type}
                          placeholder={input.placeholder}
                          class={`border p-2 rounded-md w-full mb-2`}
                          value={input?.userInput ? input?.userInput : ""}
                          onChange={(e) =>
                            updateInput("userInput", e.target.value, i)
                          }



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
                          class={`border p-2 rounded-md w-full mb-2`}
                          value={input?.userInput ? input?.userInput : ""}
                          onChange={(e) =>
                            updateInput("userInput", e.target.value, i)
                          }

                          required={input.required}
                        />
                      </>
                    );
                  case "phone":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <input
                          type={input.type}
                          placeholder={input.placeholder}
                          class={`border p-2 rounded-md w-full mb-2`}
                          value={input?.userInput ? input?.userInput : ""}
                          onChange={(e) =>
                            updateInput("userInput", e.target.value, i)
                          }

                          required={input.required}
                        />
                      </>
                    );

                  case "dropdown":
                    return (
                      <>
                        <label for="">{input.label}</label>
                        <select
                          class="w-full p-2 appearance-none border rounded-md mb-2"
                          value={input?.userInput ? input?.userInput : ""}
                          onChange={(e) => updateInput("userInput", e.target.value, i)}
                          required={input.required}
                        >
                          <option value="" disabled selected>
                            {input.placeholder}
                          </option>
                          <For each={input.values}>{(value) => (
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

                          <For each={input.values}>{(value) => (
                            <>
                              <input
                                id={value}
                                type="radio"
                                class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
                                value={value}
                                checked={input.userInput === value}
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
                          <For each={input.values}>{(value) => (
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
                                checked={input.userInput && input.userInput.includes(value)}
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
              <button onClick={handleSubmit} class="rounded-full w-[95px] h-[40px] bg-[#0077CC] text-white mt-2">
                Submit
              </button>
            </div>
          </div>
        </div >
      </div >


    </>
  )
}
