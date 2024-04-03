import { createSignal } from 'solid-js';
import './style.css'
export const CardInput = (props) => {

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



  return (

    <>
      <div class="mx-auto">
        <div class="p-3 lg-w-[450px] h-[400px] sm-w-full rounded-md shadow-lg shadow-black-50 overflow-hidden">

          <div class="flex flex-col h-full gap-2">
            <div id="headings">
              <p class="sticky top-0 bg-white text-xl">Lorem ipsum dolor sit amet.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, quos?</p>
              <p class="sticky top-[48px] bg-white text-md">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, quos?</p>
            </div>

            <div class="overflow-y-scroll hide-scrollbar flex-1 mb-2" id="input-container">
              <select class="w-full p-2 appearance-none border rounded-md mb-2">
                <option value="">Option1</option>
                <option value="">Option2</option>
                <option value="">Option3</option>
              </select>
              <input type="text" value={'name'} class="border p-2 rounded-md w-full mb-2" />
              <input
                required
                type="email"
                value={email()}
                class={`border p-2 rounded-md w-full mb-2 ${!emailValid() ? 'border-red-500' : ''
                  }`}
                onInput={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
              />
              <div class="text-red-500 ">{emailError()}</div>
              <input type="text" value={9876543210} class="border p-2 rounded-md w-full mb-2" />
              <div class='flex justify-start flex-col gap-1'>
                <div class='flex justify-start gap-2'><input type="checkbox" class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]" /><label>Lorem ipsum dolor sit amet.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, quos?</label></div>
                <div class='flex justify-start gap-2'><input type="checkbox" class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]" /><label>Lorem ipsum dolor sit amet.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, quos?</label></div>
                <div class='flex justify-start gap-2'><input type="checkbox" class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]" /> <label>Lorem ipsum dolor sit amet.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia, quos?</label></div>
              </div>
              <div class='flex justify-start gap-1 mt-2'>
                <input id="option1" value="option1" name="options" type="radio" class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]" />
                <label for="option1">Option 1</label>
                <input id="option2" value="option2" name="options" type="radio" class="border p-2 h-6 w-6 rounded-md mb-2 accent-[#0077CC]" />
                <label for="option2">Option 2</label>
              </div>


              <textarea class="border p-2 rounded-md w-full" name="" id="" cols="10" rows="5">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque, atque!</textarea>
            </div>

            <div id='buttons' class="flex justify-end mb-2 gap-2">
              <button onClick={() => {
                props.onSubmit({ label: "Submitted", value: JSON.stringify({ "vcdphidsm5nqdeiarvl11dj5g": "Dropdown1", "vj7dviiwtnnday3u8codhdzgc": "checkbox1" }) })
              }} class="rounded-full w-[95px] h-[40px] bg-[#0077CC] text-white mt-2">Submit</button>
            </div>
          </div>

        </div>
      </div>



    </>
  )
}