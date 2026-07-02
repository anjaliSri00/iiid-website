import React, { Suspense } from 'react';
import CheckoutPage from './CheckoutPage';

const checkout = () => {
  return (
    <>
    <Suspense>
    <CheckoutPage/>
    </Suspense>
    </>
  );
}

export default checkout;
