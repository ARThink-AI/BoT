import {
  createSignal,
  onMount,
  Show,
  splitProps,
  onCleanup,
  createEffect,
} from 'solid-js'
import styles from '../../../assets/index.css'
import { CommandData } from '../../commands'
import { BubbleButton } from './BubbleButton'
import { PreviewMessage, PreviewMessageProps } from './PreviewMessage'
import { isDefined } from '@typebot.io/lib'
import { BubbleParams } from '../types'
import { Bot, BotProps } from '../../../components/Bot'
import { getPaymentInProgressInStorage } from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import { io } from "socket.io-client";
// import jsPDF from 'jspdf/dist/jspdf.umd.js'

export type BubbleProps = BotProps &
  BubbleParams & {
    onOpen?: () => void
    onClose?: () => void
    onPreviewMessageClick?: () => void
  }

export const Bubble = (props: BubbleProps) => {
  console.log("this bubble file is called before rendering");
  const [bubbleProps, botProps] = splitProps(props, [
    'onOpen',
    'onClose',
    'previewMessage',
    'onPreviewMessageClick',
    'theme',
    'autoShowDelay',
  ])
  const [prefilledVariables, setPrefilledVariables] = createSignal(
    // eslint-disable-next-line solid/reactivity
    botProps.prefilledVariables
  )
  const [isPreviewMessageDisplayed, setIsPreviewMessageDisplayed] =
    createSignal(false)
  const [previewMessage, setPreviewMessage] = createSignal<
    Pick<PreviewMessageProps, 'avatarUrl' | 'message'>
  >({
    message: bubbleProps.previewMessage?.message ?? '',
    avatarUrl: bubbleProps.previewMessage?.avatarUrl,
  })

  const [isBotOpened, setIsBotOpened] = createSignal(false)
  const [isBotStarted, setIsBotStarted] = createSignal(false)
  const [socketInstance, setSocketInstance] = createSignal(null);

  const [burgerMenu, setBurgerMenu] = createSignal(false)
  const [isClicked, setIsClicked] = createSignal(false);

  const handleClick = () => {
    setIsClicked(!isClicked());
  };

  const toggleBurgerIcon = () => {
    setBurgerMenu(!burgerMenu())
  }
  // const closeBurgerMenu = () => {
  //   setBurgerMenu(false)
  // }

  onMount(() => {
    console.log("checking socket connection");
    const socketInstance = io("https://socket.quadz.ai", {
      reconnection: true, // Enable reconnection
      reconnectionAttempts: Infinity, // Retry indefinitely
      reconnectionDelay: 1000, // Initial delay (in ms) before the first reconnection attempt
      reconnectionDelayMax: 5000, // Maximum delay (in ms) between reconnection attempts
    });
    socketInstance.on("connect", () => {
      console.log("socket instance connected for bubble", socketInstance.id);
      // @ts-ignore
      setSocketInstance(socketInstance);
    });




    window.addEventListener('message', processIncomingEvent)
    const autoShowDelay = bubbleProps.autoShowDelay
    const previewMessageAutoShowDelay =
      bubbleProps.previewMessage?.autoShowDelay
    const paymentInProgress = getPaymentInProgressInStorage()
    if (paymentInProgress) openBot()
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        openBot()
      }, autoShowDelay)
    }
    if (isDefined(previewMessageAutoShowDelay)) {
      setTimeout(() => {
        showMessage()
      }, previewMessageAutoShowDelay)
    }
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent);
    // @ts-ignore
    socketInstance.disconnect();
  })

  createEffect(() => {
    if (!props.prefilledVariables) return
    setPrefilledVariables((existingPrefilledVariables) => ({
      ...existingPrefilledVariables,
      ...props.prefilledVariables,
    }))
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'open') openBot()
    if (data.command === 'close') closeBot()
    if (data.command === 'toggle') toggleBot()
    if (data.command === 'showPreviewMessage') showMessage(data.message)
    if (data.command === 'hidePreviewMessage') hideMessage()
    if (data.command === 'setPrefilledVariables')
      setPrefilledVariables((existingPrefilledVariables) => ({
        ...existingPrefilledVariables,
        ...data.variables,
      }))
  }

  const openBot = () => {
    if (!isBotStarted()) setIsBotStarted(true)
    hideMessage()
    setIsBotOpened(true)
    if (isBotOpened()) bubbleProps.onOpen?.()
  }

  const closeBot = () => {
    setIsBotOpened(false)
    if (isBotOpened()) bubbleProps.onClose?.()
  }

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot()
  }

  const handlePreviewMessageClick = () => {
    bubbleProps.onPreviewMessageClick?.()
    openBot()
  }

  const showMessage = (
    previewMessage?: Pick<PreviewMessageProps, 'avatarUrl' | 'message'>
  ) => {
    if (previewMessage) setPreviewMessage(previewMessage)
    if (isBotOpened()) return
    setIsPreviewMessageDisplayed(true)
  }

  const hideMessage = () => {
    setIsPreviewMessageDisplayed(false)
  }


  // a4 pdf the convertHTMLtoPDF function
  // function convertHTMLtoPDF() {
  //   // Select the typebot-standard element
  //   const typebotStandard = document.querySelector('typebot-bubble');

  //   // Check if the typebot-standard element exists
  //   if (typebotStandard) {
  //     // Access the shadow root of typebot-standard
  //     const shadowRoot = typebotStandard.shadowRoot;

  //     // Check if the shadow root exists
  //     if (shadowRoot) {
  //       // Select the chatContainerDiv element inside the shadow root
  //       const chatContainer = shadowRoot.querySelector('#chatContainerDiv');

  //       // Check if the chatContainerDiv element exists
  //       if (chatContainer) {
  //         // Create a new jsPDF instance
  //         let doc = new jsPDF('p', 'px', 'a4');

  //         // Get the dimensions of the content
  //         let containerWidth = chatContainer.offsetWidth;
  //         let containerHeight = chatContainer.offsetHeight;

  //         // Get the dimensions of the PDF page
  //         let pageWidth = doc.internal.pageSize.getWidth();
  //         let pageHeight = doc.internal.pageSize.getHeight();

  //         // Set the desired margin from the top and sides
  //         let marginTop = 20;
  //         let marginLeft = 20;
  //         let marginRight = 20;

  //         // Calculate the position to center the content horizontally
  //         // let xPos = marginLeft;
  //         let xPos = marginLeft + ((pageWidth - marginLeft - marginRight - containerWidth) / 2);

  //         // Calculate the position to start the content vertically
  //         let yPos = marginTop;

  //         // Add the chatContainerDiv content to PDF
  //         doc.html(chatContainer, {
  //           callback: function (doc) {
  //             doc.save("chat_history.pdf");
  //           },
  //           x: xPos,
  //           y: yPos,
  //           width: pageWidth - marginLeft - marginRight
  //         });
  //       } else {
  //         console.log("chatContainerDiv not found inside shadow root");
  //       }
  //     } else {
  //       console.log("Shadow root not found for typebot-standard");
  //     }
  //   } else {
  //     console.log("typebot-standard not found in the DOM");
  //   }
  // }



  return (
    <>
      <style>{styles}</style>
      <Show when={isPreviewMessageDisplayed()}>
        <PreviewMessage
          {...previewMessage()}
          placement={bubbleProps.theme?.placement}
          previewMessageTheme={bubbleProps.theme?.previewMessage}
          buttonSize={bubbleProps.theme?.button?.size}
          onClick={handlePreviewMessageClick}
          onCloseClick={hideMessage}
        />
      </Show>
      <BubbleButton
        {...bubbleProps.theme?.button}
        placement={bubbleProps.theme?.placement}
        toggleBot={toggleBot}
        isBotOpened={isBotOpened()}
      />
      <div
        part="bot"
        style={{
          height: 'calc(100% - 48px)',
          transition:
            'transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out',
          'transform-origin':
            props.theme?.placement === 'left' ? 'bottom left' : 'bottom right',
          transform: isBotOpened() ? 'scale3d(1, 1, 1)' : 'scale3d(0, 0, 1)',
          'box-shadow': 'rgb(0 0 0 / 16%) 0px 5px 40px',
          'background-color': bubbleProps.theme?.chatWindow?.backgroundColor,
          'z-index': 42424242,
        }}
        class={
          'fixed rounded-lg w-full sm:w-[400px] max-h-[604px]' +
          (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none') +
          (props.theme?.button?.size === 'large'
            ? ' bottom-24'
            : ' bottom-20') +
          (props.theme?.placement === 'left' ? ' sm:left-5' : ' sm:right-5') +
          (isClicked() ? ' lg:w-[600px] lg:h-[506px]' : '')
        }
      >
        <Show when={isBotStarted()}>
          {/* <header class="bg-blue-500 text-white p-4 h-12 absolute top-[-50px]  w-[100%]" >
            <div class="flex justify-between items-center">
              <div class="">
                <button id="burgerIcon" onClick={toggleBurgerIcon} class="text-white focus:outline-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 18C3.71667 18 3.47917 17.9042 3.2875 17.7125C3.09583 17.5208 3 17.2833 3 17C3 16.7167 3.09583 16.4792 3.2875 16.2875C3.47917 16.0958 3.71667 16 4 16H15C15.2833 16 15.5208 16.0958 15.7125 16.2875C15.9042 16.4792 16 16.7167 16 17C16 17.2833 15.9042 17.5208 15.7125 17.7125C15.5208 17.9042 15.2833 18 15 18H4ZM18.9 16.3L15.3 12.7C15.1 12.5 15 12.2667 15 12C15 11.7333 15.1 11.5 15.3 11.3L18.9 7.7C19.0833 7.51667 19.3167 7.425 19.6 7.425C19.8833 7.425 20.1167 7.51667 20.3 7.7C20.4833 7.88333 20.575 8.11667 20.575 8.4C20.575 8.68333 20.4833 8.91667 20.3 9.1L17.4 12L20.3 14.9C20.4833 15.0833 20.575 15.3167 20.575 15.6C20.575 15.8833 20.4833 16.1167 20.3 16.3C20.1167 16.4833 19.8833 16.575 19.6 16.575C19.3167 16.575 19.0833 16.4833 18.9 16.3ZM4 13C3.71667 13 3.47917 12.9042 3.2875 12.7125C3.09583 12.5208 3 12.2833 3 12C3 11.7167 3.09583 11.4792 3.2875 11.2875C3.47917 11.0958 3.71667 11 4 11H12C12.2833 11 12.5208 11.0958 12.7125 11.2875C12.9042 11.4792 13 11.7167 13 12C13 12.2833 12.9042 12.5208 12.7125 12.7125C12.5208 12.9042 12.2833 13 12 13H4ZM4 8C3.71667 8 3.47917 7.90417 3.2875 7.7125C3.09583 7.52083 3 7.28333 3 7C3 6.71667 3.09583 6.47917 3.2875 6.2875C3.47917 6.09583 3.71667 6 4 6H15C15.2833 6 15.5208 6.09583 15.7125 6.2875C15.9042 6.47917 16 6.71667 16 7C16 7.28333 15.9042 7.52083 15.7125 7.7125C15.5208 7.90417 15.2833 8 15 8H4Z" fill="white" />
                  </svg>
                </button>
                {burgerMenu() && (
                  <div onMouseLeave={() => setBurgerMenu(false)} class="absolute w-[275px] h-[248px] z-50 top-10 left-0 rounded-r-2xl bg-white text-black p-4">
                    <div class='p-3 flex gap-2.5 text-[#ABB4C4]'>Menu</div>
                    <ul>
                      <li><button onClick={() => convertHTMLtoPDF()} class='rounded-xl p-3 w-full hover:bg-[#E6F1FA] flex gap-3 no-underline' >Download Chat</button></li>
                      <li><a class='rounded-xl p-3 hover:bg-[#E6F1FA] flex gap-3 no-underline' href="#">Live Support Agent</a></li>
                      <li><button class='rounded-xl p-3 w-full hover:bg-[#E6F1FA] flex gap-3 no-underline' onClick={() => {
                        console.log("stop clicked restart");
                        sessionStorage.removeItem("intialize");
                        sessionStorage.removeItem("initialize_css");
                        sessionStorage.removeItem("bot_init");
                        sessionStorage.removeItem("chatchunks");
                        sessionStorage.removeItem("live");

                      }} >Restart  </button></li>
                      <li><a class='rounded-xl p-3 hover:bg-[#E6F1FA] flex gap-3 no-underline' href="#">Restart</a></li>
                
                    </ul>
                    <button onClick={closeBurgerMenu} class="text-black focus:outline-none mt-2">Close</button>
                  </div>

                )}
              </div>
              <div />
              <div class="flex space-x-4">
                <button id="minimizeButton" onClick={handleClick} class="text-white focus:outline-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 21C3.71667 21 3.47917 20.9042 3.2875 20.7125C3.09583 20.5208 3 20.2833 3 20V14C3 13.7167 3.09583 13.4792 3.2875 13.2875C3.47917 13.0958 3.71667 13 4 13C4.28333 13 4.52083 13.0958 4.7125 13.2875C4.90417 13.4792 5 13.7167 5 14V17.6L17.6 5H14C13.7167 5 13.4792 4.90417 13.2875 4.7125C13.0958 4.52083 13 4.28333 13 4C13 3.71667 13.0958 3.47917 13.2875 3.2875C13.4792 3.09583 13.7167 3 14 3H20C20.2833 3 20.5208 3.09583 20.7125 3.2875C20.9042 3.47917 21 3.71667 21 4V10C21 10.2833 20.9042 10.5208 20.7125 10.7125C20.5208 10.9042 20.2833 11 20 11C19.7167 11 19.4792 10.9042 19.2875 10.7125C19.0958 10.5208 19 10.2833 19 10V6.4L6.4 19H10C10.2833 19 10.5208 19.0958 10.7125 19.2875C10.9042 19.4792 11 19.7167 11 20C11 20.2833 10.9042 20.5208 10.7125 20.7125C10.5208 20.9042 10.2833 21 10 21H4Z" fill="white" />
                  </svg>

                </button>
                <button id="closeButton" onClick={toggleBot} class="text-white focus:outline-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.9998 13.4L7.0998 18.3C6.91647 18.4834 6.68314 18.575 6.3998 18.575C6.11647 18.575 5.88314 18.4834 5.6998 18.3C5.51647 18.1167 5.4248 17.8834 5.4248 17.6C5.4248 17.3167 5.51647 17.0834 5.6998 16.9L10.5998 12L5.6998 7.10005C5.51647 6.91672 5.4248 6.68338 5.4248 6.40005C5.4248 6.11672 5.51647 5.88338 5.6998 5.70005C5.88314 5.51672 6.11647 5.42505 6.3998 5.42505C6.68314 5.42505 6.91647 5.51672 7.0998 5.70005L11.9998 10.6L16.8998 5.70005C17.0831 5.51672 17.3165 5.42505 17.5998 5.42505C17.8831 5.42505 18.1165 5.51672 18.2998 5.70005C18.4831 5.88338 18.5748 6.11672 18.5748 6.40005C18.5748 6.68338 18.4831 6.91672 18.2998 7.10005L13.3998 12L18.2998 16.9C18.4831 17.0834 18.5748 17.3167 18.5748 17.6C18.5748 17.8834 18.4831 18.1167 18.2998 18.3C18.1165 18.4834 17.8831 18.575 17.5998 18.575C17.3165 18.575 17.0831 18.4834 16.8998 18.3L11.9998 13.4Z" fill="white" />
                  </svg>

                </button>
              </div>
            </div>
          </header> */}
          <Bot
            {...botProps}
            socket1={socketInstance()}
            prefilledVariables={prefilledVariables()}
            class="rounded-lg"
          />
        </Show>
      </div>
    </>
  )
}
