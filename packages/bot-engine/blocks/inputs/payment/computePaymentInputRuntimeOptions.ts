import { TRPCError } from '@trpc/server'
import {
  PaymentInputOptions,
  PaymentInputRuntimeOptions,
  SessionState,
  StripeCredentials,
  RazorpayCredentials,
} from '@typebot.io/schemas'
import Stripe from 'stripe'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { parseVariables } from '../../../variables/parseVariables'
import prisma from '@typebot.io/lib/prisma'
import Razorpay from 'razorpay';
// export const computePaymentInputRuntimeOptions =
//   (state: SessionState) => (options: PaymentInputOptions) =>
//     createStripePaymentIntent(state)(options)

export const computePaymentInputRuntimeOptions =
  (state: SessionState) => (options: PaymentInputOptions) => {
    // (state: SessionState) => (options: any) => {
    // if (options.provider === 'Stripe') {
    //   return createStripePaymentIntent(state)(options);
    // } else if (options.provider === 'Razorpay') {
    //   return createRazorpayOrder(state)(options);
    // }
    if ( options.provider === 'Razorpay' ) {
      return createRazorpayOrder(state)(options);
    } else {
    return createStripePaymentIntent(state)(options);
    }
  };

  

  const createRazorpayOrder =
  (state: SessionState) =>
  async (options: PaymentInputOptions): Promise<PaymentInputRuntimeOptions> => {
    const {
      resultId,
      typebot: { variables },
    } = state.typebotsQueue[0];
    const isPreview = !resultId;
    if (!options.credentialsId)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing credentialsId',
      })
    const razorPayKeys = await getRazorPayInfo(options.credentialsId)
      if (!razorPayKeys)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Credentials not found',
        })
   console.log(" razorPayKeys", razorPayKeys ); 

  //  return {
  //   paymentIntentSecret: paymentIntent.client_secret,
  //   publicKey:
  //     isPreview && stripeKeys.test?.publicKey
  //       ? stripeKeys.test.publicKey
  //       : stripeKeys.live.publicKey,
  //   amountLabel: priceFormatter.format(
  //     amount / (isZeroDecimalCurrency(options.currency) ? 1 : 100)
  //   ),
  // }
    // return {
    //   razorpayOrderID : 1234
    // }
    // Add Razorpay-specific handling code here
    // You should create a Razorpay order, get the order ID, and other relevant information
    // console.log("before razor pay connection");


    const razorpay = new Razorpay({
      // @ts-ignore
      key_id: isPreview ?  razorPayKeys.test.publicKey?.trim() : razorPayKeys.live.publicKey.trim() ,
      key_secret: isPreview
        ? razorPayKeys.test.secretKey?.trim()
        :  razorPayKeys.live.secretKey.trim() ,
    });




    // console.log("after razorpay connection");

    // Use the Razorpay API to create an order and get the order_id
    // Replace the placeholders with actual data from your options
    const amount = Math.round(
      Number(parseVariables(variables)(options.amount)) *
        (isZeroDecimalCurrency(options.currency) ? 1 : 100)
    )
    if (isNaN(amount))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Could not parse amount, make sure your block is configured correctly',
      })
    const razorpayOrderData = {
      amount, // Amount in paise or smallest currency unit
      currency: options.currency,
      // id : isPreview ?  razorPayKeys.test.publicKey?.trim() : razorPayKeys.live.publicKey?.trim(),
      // secret : isPreview
      //     ? razorPayKeys.test.secretKey?.trim()
      //     :  razorPayKeys.live.secretKey?.trim()
      // receipt: parseVariables(variables)(options.additionalInformation?.email),
      // Add other relevant details
    };
    // receipt: parseVariables(variables)(options.additionalInformation?.email),
    console.log("before razorpay order create", razorpayOrderData );
    // @ts-ignore
     const order = await razorpay.orders.create(razorpayOrderData);
    
    // const response  = await fetch("http://172.178.92.219:3010/razorpay/create_order", {
    //   method : "POST",
    //   headers : {
    //     "Content-Type" : "application/json"
    //   } ,
    //   body : JSON.stringify(razorpayOrderData)
    // });
    // const responseData = await response.json();
    // console.log("response dataaaaaa", responseData )
    // let order =  responseData.data;

    //  console.log("razorpay order",order);

     // @ts-ignore
    if (!order.id) {
      console.log("could not create order");
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Could not create Razorpay order',
      });
    }
    
    const priceFormatter = new Intl.NumberFormat(
      options.currency === 'EUR' ? 'fr-FR' : undefined,
      {
        style: 'currency',
        currency: options.currency,
      }
    )
    console.log("its the endddd");
    // console.log(" payment Intent secret for razorpay",order.id );
    return {
      paymentIntentSecret: order.id,
      publicKey:
        isPreview && razorPayKeys.test?.publicKey
          ? razorPayKeys.test.publicKey
          : razorPayKeys.live.publicKey,
      amountLabel: priceFormatter.format(
        amount / (isZeroDecimalCurrency(options.currency) ? 1 : 100)
      ),

    }

    // return {
    //   paymentIntentSecret: "1234",
    //   publicKey:
    //     isPreview && razorPayKeys.test?.publicKey
    //       ? razorPayKeys.test.publicKey
    //       : razorPayKeys.live.publicKey,
    //   amountLabel: "200"
    // }

    // const priceFormatter = new Intl.NumberFormat(
    //   options.currency === 'EUR' ? 'fr-FR' : undefined,
    //   {
    //     style: 'currency',
    //     currency: options.currency,
    //   }
    // );

    // return {
    //   razorpayOrderID: order.id,
    //   // Add other relevant Razorpay-specific properties here
    // };
  };







const createStripePaymentIntent =
  (state: SessionState) =>
  async (options: PaymentInputOptions): Promise<PaymentInputRuntimeOptions> => {
    console.log("computePaymentInputRuntimeOptions file entereddd", JSON.stringify(options ));


    const {
      resultId,
      typebot: { variables },
    } = state.typebotsQueue[0]
    const isPreview = !resultId
    if (!options.credentialsId)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing credentialsId',
      })
    const stripeKeys = await getStripeInfo(options.credentialsId)
    if (!stripeKeys)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })
    const stripe = new Stripe(
      isPreview && stripeKeys?.test?.secretKey
        ? stripeKeys.test.secretKey
        : stripeKeys.live.secretKey,
      { apiVersion: '2022-11-15' }
    )
    const amount = Math.round(
      Number(parseVariables(variables)(options.amount)) *
        (isZeroDecimalCurrency(options.currency) ? 1 : 100)
    )
    if (isNaN(amount))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Could not parse amount, make sure your block is configured correctly',
      })
    // Create a PaymentIntent with the order amount and currency
    const receiptEmail = parseVariables(variables)(
      options.additionalInformation?.email
    )
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: options.currency,
      receipt_email: receiptEmail === '' ? undefined : receiptEmail,
      description: options.additionalInformation?.description,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    if (!paymentIntent.client_secret)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Could not create payment intent',
      })

    const priceFormatter = new Intl.NumberFormat(
      options.currency === 'EUR' ? 'fr-FR' : undefined,
      {
        style: 'currency',
        currency: options.currency,
      }
    )
     console.log("ended compute payment input run time options");


    return {
      paymentIntentSecret: paymentIntent.client_secret,
      publicKey:
        isPreview && stripeKeys.test?.publicKey
          ? stripeKeys.test.publicKey
          : stripeKeys.live.publicKey,
      amountLabel: priceFormatter.format(
        amount / (isZeroDecimalCurrency(options.currency) ? 1 : 100)
      ),
    }
  }

const getStripeInfo = async (
  credentialsId: string
): Promise<StripeCredentials['data'] | undefined> => {
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return (await decrypt(
    credentials.data,
    credentials.iv
  )) as StripeCredentials['data']
}

const getRazorPayInfo = async (
  credentialsId: string
): Promise< RazorpayCredentials['data'] | undefined> => {
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return (await decrypt(
    credentials.data,
    credentials.iv
  )) as RazorpayCredentials['data']
}

// https://stripe.com/docs/currencies#zero-decimal
const isZeroDecimalCurrency = (currency: string) =>
  [
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
  ].includes(currency)
