import React, { useEffect, useState } from 'react';
import { parseVariables } from '@/features/variables';
import { useChat } from '@/providers/ChatProvider';
import { useTypebot } from '@/providers/TypebotProvider';
import { PaymentInputOptions, Variable } from '@typebot.io/schemas';
// import { loadRazorpay } from './loadRazorpay'; // Adjust the path to your loadRazorpay file

type Props = {
  options: PaymentInputOptions;
  onSuccess: () => void;
};

export const RazorpayPaymentForm = ({ options, onSuccess }: Props) => {
  console.log( JSON.stringify(options) );
  const {
    apiHost,
    isPreview,
    typebot: { variables },
    onNewLog,
  } = useTypebot();
  const { scroll } = useChat();
  console.log("payment razorpay loaded");
  const [amount, setAmount] = useState<number>(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchRazorpayData = async () => {
  //     try {
  //       const response = await fetch('/api/razorpay/create-order', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           inputOptions : options,
  //           isPreview,
  //           variables,
  //         }),
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setAmount(data.amount);
  //         setOrderId(data.order_id);
  //       } else {
  //         const errorData = await response.json();
  //         setError(errorData.error.message);
  //       }
  //     } catch (err) {
  //       setError('An error occurred while fetching payment details.');
  //     }
  //   };

  //   fetchRazorpayData();
  //   // replaced input options for options in use effect
  // }, [options, isPreview, variables]);

  const handlePaymentSuccess = () => {
    onSuccess();
  };

  const handlePaymentFailure = () => {
    setError('Payment failed. Please try again.');
  };

  // const openRazorpayPayment = () => {
  //   setIsLoading(true);
  //   loadRazorpay(() => {
  //     // @ts-ignore
  //     const razorpay = new window.Razorpay({
  //       // @ts-ignore
  //       key: isPreview ? options.razorpayTestKey : options.razorpayLiveKey,
  //     });
  //    // @ts-ignore
  //     razorpay.on('payment.success', (response) => {
  //       handlePaymentSuccess();
  //     });
  //    // @ts-ignore
  //     razorpay.on('payment.error', (response) => {
  //       handlePaymentFailure();
  //     });

  //     razorpay.open({
  //       amount,
  //       currency: options.currency,
  //       receipt: parseVariables(variables)(options.additionalInformation?.email),
  //       name: 'Your Company Name',
  //       description: 'Payment for your order',
  //       order_id: orderId,
  //     });
  //   });
  // };

  return (
    <div style={{ background: "red" , border : "1px solid red" , width : "100%" , height : "40px" }}> Razor Pay Modal  </div>
    // <div>
    //   {/* <div> { isLoading &&  } </div> */}
    //   { isLoading && (
    //     <div> Loading  </div>
    //   ) }
    //   {/* {isLoading && <Spinner className="text-blue-500" />} */}
    //   {error && <div className="text-red-500">{error}</div>}
    //   {!isLoading && !error && (
    //     <div>
    //       <button onClick={openRazorpayPayment} className="btn btn-primary">
    //         {options.labels.button}
    //       </button>
    //     </div>
    //   )}
    // </div>
  );
};
