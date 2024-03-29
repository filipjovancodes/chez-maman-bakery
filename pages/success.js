import React from 'react';
import Link from 'next/link';
import { useContext, useEffect } from 'react'
import { SiteContext } from '../context/mainContext';
import Head from 'next/head';


const OrderSuccessPage = () => {
  const { clearCart } = useContext(SiteContext); 

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Chez Maman Bakery - Success</title>
        <meta name="description" content={`Chez Maman Bakery - Success`} />
        <meta property="og:title" content="Chez Maman Bakery - Success" key="title" />
      </Head>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Thank you for your order!</h1>
          <p className="text-xl mt-2">Your order has been placed successfully.</p>
        </div>

        <div className="flex justify-between items-center">
          <Link href="/">
            <p className="text-blue-500 hover:text-blue-700 text-xl">Continue Shopping</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
