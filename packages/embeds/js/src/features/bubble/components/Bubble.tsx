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

  onMount(() => {
    console.log("checking socket connection");
    const socketInstance = io("http://localhost:3050", {
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
          height: 'calc(100% - 80px)',
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
          'fixed rounded-lg w-full sm:w-[600px] max-h-[704px]' +
          (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none') +
          (props.theme?.button?.size === 'large'
            ? ' bottom-24'
            : ' bottom-20') +
          (props.theme?.placement === 'left' ? ' sm:left-5' : ' sm:right-5')
        }
      >
        <Show when={isBotStarted()}>
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
