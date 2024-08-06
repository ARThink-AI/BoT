import { SendButton } from '@/components/SendButton'
import { createSignal, onMount, Show } from 'solid-js'
import type { Stripe, StripeElements } from '@stripe/stripe-js'
import { BotContext } from '@/types'
import type { PaymentInputOptions, RuntimeOptions } from '@typebot.io/schemas'
import { loadStripe } from '@/lib/stripe'
import {
  removePaymentInProgressFromStorage,
  setPaymentInProgressInStorage,
} from '../helpers/paymentInProgressStorage'
// import Razorpay from 'razorpay';
import {  loadRazorpay } from "@/lib/razorpay";

type Props = {
  context: BotContext
  options: PaymentInputOptions & RuntimeOptions
  onSuccess: () => void
}

const slotName = 'stripe-payment-form'

let paymentElementSlot: HTMLSlotElement
const stripe: Stripe | null = null
const elements: StripeElements | null = null

export const RazorpayPaymentForm = (props: Props) => {
  const [message, setMessage] = createSignal<string>()
  const [isMounted, setIsMounted] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)

  onMount(async () => {
    console.log("razorpay mounted")
    await loadRazorpay(props.options.publicKey);
    openRazorpayModal();
    // initShadowMountPoint(paymentElementSlot)
    // stripe = await loadStripe(props.options.publicKey)
    // if (!stripe) return
    // elements = stripe.elements({
    //   appearance: {
    //     theme: 'stripe',
    //     variables: {
    //       colorPrimary: getComputedStyle(paymentElementSlot).getPropertyValue(
    //         '--typebot-button-bg-color'
    //       ),
    //     },
    //   },
    //   clientSecret: props.options.paymentIntentSecret,
    // })
    // const paymentElement = elements.create('payment', {
    //   layout: 'tabs',
    // })
    // paymentElement.mount('#payment-element')
    // setTimeout(() => setIsMounted(true), 1000)
  })
  const openRazorpayModal = () => {
    // @ts-ignore
    console.log("razorpay", window.Razorpay )
    setPaymentInProgressInStorage({
      sessionId: props.context.sessionId,
      typebot: props.context.typebot,
    });
  
    const options = {
      key: props.options.publicKey.trim(), // Your Razorpay API key
      // @ts-ignore
      amount: props.options.amount * 100, // Amount in paise or smallest currency unit
      currency: props.options.currency,
      name: props.options.additionalInformation?.name,
      description: props.options.additionalInformation?.description,
      order_id: props.options.paymentIntentSecret, // The orderId you want to process
      // @ts-ignore
      handler: (response) => {
        // Handle the response after the payment is completed
        removePaymentInProgressFromStorage();
  
        if (response.razorpay_payment_id) {
          // Payment successful, call onSuccess
          console.log("typebot context", props.context );
          console.log("optionsss", props.options );
          console.log("response razorpay", response );
          // @ts-ignore
          // props.paymentPayload = response;
          props.onSuccess(JSON.stringify(response));
        } else {
          
          // Payment failed, display an error message
          setMessage('Payment failed. Please try again.');
        }
      },
    };
    // @ts-ignore
    const razorpay = new window.Razorpay(options);
    // @ts-ignore
    razorpay.open();
  };
  const handleSubmit = async (event: Event & { submitter: HTMLElement }) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    setPaymentInProgressInStorage({
      sessionId: props.context.sessionId,
      typebot: props.context.typebot,
    })
    const { postalCode, ...address } =
      props.options.additionalInformation?.address ?? {}
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
        payment_method_data: {
          billing_details: {
            name: props.options.additionalInformation?.name,
            email: props.options.additionalInformation?.email,
            phone: props.options.additionalInformation?.phoneNumber,
            address: {
              ...address,
              postal_code: postalCode,
            },
          },
        },
      },
      redirect: 'if_required',
    })
    removePaymentInProgressFromStorage()

    setIsLoading(false)
    if (error?.type === 'validation_error') return
    if (error?.type === 'card_error') return setMessage(error.message)
    if (!error && paymentIntent.status === 'succeeded') return props.onSuccess()
  }


  return (
    <form
    id="payment-form"
    onSubmit={handleSubmit}
    class="flex flex-col p-4 typebot-input w-full items-center"
  >
    {/* <div> Razor pay element  </div> */}
    </form>
  )
}


