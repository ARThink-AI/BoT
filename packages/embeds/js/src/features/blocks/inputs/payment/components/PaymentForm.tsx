import { BotContext } from '@/types'
import type { PaymentInputOptions, RuntimeOptions } from '@typebot.io/schemas'
import { PaymentProvider } from '@typebot.io/schemas/features/blocks/inputs/payment/enums'
import { Match, Switch } from 'solid-js'
import { StripePaymentForm } from './StripePaymentForm'
import { RazorpayPaymentForm  } from "./RazorpayPaymentForm";

type Props = {
  context: BotContext
  options: PaymentInputOptions & RuntimeOptions
  onSuccess: () => any 
}

export const PaymentForm = (props: Props) => (
  <Switch>
    <Match when={props.options.provider === PaymentProvider.STRIPE}>
      <StripePaymentForm
        onSuccess={props.onSuccess}
        options={props.options}
        context={props.context}
      />
    </Match>
    <Match when={props.options.provider === PaymentProvider.RAZORPAY}>
      <RazorpayPaymentForm
      
        onSuccess={props.onSuccess}
        options={props.options}
        context={props.context}
      />
    </Match>
  </Switch>
)
