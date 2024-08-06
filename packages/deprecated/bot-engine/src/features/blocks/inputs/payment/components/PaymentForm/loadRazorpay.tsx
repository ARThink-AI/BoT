// @ts-ignore
export const loadRazorpay = (callback) => {
  const existingScript = document.getElementById('razorpay-script');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.id = 'razorpay-script';
    script.onload = callback;
    document.body.appendChild(script);
  } else {
    callback();
  }
};
