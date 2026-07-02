// app/payment-success/page

import React, { Suspense } from 'react';
import PaymentSuccess from './PaymentSucess';


const PaymentSuccessPage = () => {

  return (
   <>
   <Suspense>
    <PaymentSuccess/>
    </Suspense>
   </>
  );
};

export default PaymentSuccessPage;