import { createSignal, For } from 'solid-js';
import './style.css'

export const CardInput = (props) => {
  const [options, setoptions] = createSignal(props?.block?.options?.inputs ? props?.block?.options?.inputs : [])
  const [email, setEmail] = createSignal('');
  const [emailValid, setEmailValid] = createSignal(true);
  const [emailError, setEmailError] = createSignal('');

  // function validateEmail() {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   setEmailValid(emailRegex.test(email()));
  // }
  function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email());
    setEmailValid(isValid);
    setEmailError(isValid ? '' : 'Please enter a valid email address');
  }



  // const onSubmit = () => {
  //   const formData = {
  //     name: name(),
  //     email: email(),
  //     mobile: mobile(),
  //     dropdownValue: dropdownValue(),
  //     checkboxValues: checkboxValues(),
  //     radioValue: radioValue(),
  //     textAreaValue: textAreaValue(),
  //   };
  //   console.log(formData);
  //   // You can call props.onSubmit(formData) here to submit the form data
  // };

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
              <For each={props.block.options.inputs}>{(input) => {
                switch (input.type) {
                  case "text":
                  case "email":
                  case "phone":
                    return (
                      <input
                        type={input.type}
                        placeholder={input.placeholder}
                        class={`border p-2 rounded-md w-full mb-2 ${input.type === "email" && !emailValid() ? "border-red-500" : ""
                          }`}
                        value={input.type === "text" ? name() : input.type === "email" ? email() : mobile()}
                        onInput={(e) =>
                          input.type === "text"
                            ? setName(e.target.value)
                            : input.type === "email"
                              ? setEmail(e.target.value)
                              : setMobile(e.target.value)
                        }
                        onBlur={input.type === "email" ? validateEmail : undefined}
                        required={input.required}
                      />

                    );
                  case "dropdown":
                    return (
                      <select
                        class="w-full p-2 appearance-none border rounded-md mb-2"
                        value={dropdownValue()}
                        onChange={(e) => setDropdownValue(e.target.value)}
                        required={input.required}
                      >
                        <option value="" disabled selected>
                          {input.placeholder}
                        </option>
                        <For each={input.values}>{(value) => (
                          <option value={value}>{value}</option>
                        )}</For>
                      </select>
                    );
                  case "checkbox":
                    return (
                      <div class="flex justify-start flex-col gap-1">
                        <For each={input.values}>{(value) => (
                          <div class="flex justify-start gap-2">
                            <input
                              type="checkbox"
                              class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
                              onChange={(e) =>
                                e.target.checked
                                  // @ts-ignore
                                  ? setCheckboxValues((prev) => [...prev, value])
                                  : setCheckboxValues((prev) =>
                                    prev.filter((item) => item !== value)
                                  )
                              }
                              // @ts-ignore
                              checked={checkboxValues().includes(value)}
                            />
                            <label>{value}</label>
                          </div>
                        )}</For>
                      </div>
                    );
                  case "textarea":
                    return (
                      <textarea
                        class="border p-2 rounded-md w-full"
                        placeholder={input.placeholder}
                        value={textAreaValue()}
                        onInput={(e) => setTextAreaValue(e.target.value)}
                        required={input.required}
                      />
                    );
                  case "radio":
                    return (
                      <div class="flex justify-start gap-1 mt-2">
                        <For each={input.values}>{(value) => (
                          <>
                            <input
                              id={value}
                              type="radio"
                              class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]"
                              value={value}
                              checked={radioValue() === value}
                              onChange={() => setRadioValue(value)}
                              required={input.required}
                            />
                            <label for={value}>{value}</label>
                          </>
                        )}</For>
                      </div>
                    );
                  default:
                    return null;
                }
              }}</For>
            </div>
            <div id="buttons" class="flex justify-end mb-2 gap-2">
              <button onClick={() => {
                // props.onSubmit({ label: "Submitted", value: JSON.stringify({ "vcdphidsm5nqdeiarvl11dj5g": "Dropdown1", "vj7dviiwtnnday3u8codhdzgc": "checkbox1" }) })
                let ans = {};
                for (let i = 0; i < props?.block?.options?.inputs?.length; i++) {
                  ans[props?.block?.options?.inputs[i].answerVariableId] =
                }
              }} class="rounded-full w-[95px] h-[40px] bg-[#0077CC] text-white mt-2">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>


    </>
  )
}
