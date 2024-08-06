export const loadRazorpay = (razorpayKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    if (window.Razorpay) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (window.Razorpay) {
          resolve();
        } else {
          reject(new Error('Razorpay SDK failed to load.'));
        }
      };
      document.body.appendChild(script);
    }
  });
};