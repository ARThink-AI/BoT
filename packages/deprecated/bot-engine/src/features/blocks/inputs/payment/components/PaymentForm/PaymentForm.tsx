import { PaymentInputOptions, PaymentProvider } from '@typebot.io/schemas'
import React from 'react'
import { StripePaymentForm } from './StripePaymentForm'
import { RazorpayPaymentForm } from "./RazorpayPaymentForm"

type Props = {
  onSuccess: () => void
  options: PaymentInputOptions
}

export const PaymentForm = ({ onSuccess, options }: Props): JSX.Element => {
  console.log("entered payment formmmmm");
  switch (options.provider) {
    case PaymentProvider.STRIPE:
      return <StripePaymentForm onSuccess={onSuccess} options={options} />
    case PaymentProvider.RAZORPAY:
      return <RazorpayPaymentForm onSuccess={onSuccess} options={options} />

  }
}
