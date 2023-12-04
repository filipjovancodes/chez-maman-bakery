import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaTimes, FaLongArrowAltRight } from 'react-icons/fa'
import { SiteContext, ContextProviderComponent } from '../context/mainContext'
import DENOMINATION from '../utils/currencyProvider'
import { slugify } from '../utils/helpers'
import QuantityPicker from '../components/QuantityPicker'
import Image from '../components/Image'
import Head from 'next/head'
import CartLink from '../components/CartLink'
import { loadStripe } from '@stripe/stripe-js';

const baseUrl = process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : `http://${process.env.NEXT_PUBLIC_BASE_URL}`;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const Cart = ({ context }) => {
  const [renderClientSideComponent, setRenderClientSideComponent] = useState(false)
  useEffect(() => {
    setRenderClientSideComponent(true)
  }, [])
  const {
    numberOfItemsInCart, cart, removeFromCart, total, setItemQuantity
  } = context
  const cartEmpty = numberOfItemsInCart === Number(0)

  function increment(item) {
    item.quantity = item.quantity + 1
    setItemQuantity(item)
  }

  function decrement(item) {
    if (item.quantity === 1) return
    item.quantity = item.quantity - 1
    setItemQuantity(item)
  }

  const handleCheckout = async () => {

    console.log(cart)

    const cartItems = cart.map(item => ({
      name: item.name,
      amount: item.price * 100, // Convert price to cents
      currency: 'usd',
      quantity: item.quantity,
      variant_id: item.variant_id, // Add variant_id in description
    }));

    const stripe = await stripePromise;

    // Call your backend endpoint
    const response = await fetch(`${baseUrl}/api/stripe_checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems: cartItems }), // Send necessary data
    });
    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId });
    
    if (result.error) {
      // Handle any errors that occur during redirection
      console.error(result.error.message);
    }
  };

  if (!renderClientSideComponent) return null

  return <>
    <CartLink />
    <div className="flex flex-col items-center pb-10">
      <Head>
        <title>AutoRoll</title>
        <meta name="description" content={`AutoRoll - Cart`} />
        <meta property="og:title" content="AutoRoll - Cart" key="title" />
      </Head>
      <div className="
        flex flex-col w-full
        c_large:w-c_large
      ">
        <div className="pt-10 pb-8">
          <h1 className="text-5xl font-light">Your Cart</h1>
        </div>

        {
          cartEmpty ? (
            <h3>No items in cart.</h3>
          ) : (
            <div className="flex flex-col">
              <div>
                {
                  cart.map((item) => {
                    return (
                      <div className="border-b py-10" key={item.id}>
                        <div className="flex items-center hidden md:flex">
                          <Link href={`/product/${slugify(item.name)}`} aria-label={item.name}>

                            <Image className="w-32 m-0" src={item.image} alt={item.name} />

                          </Link>
                          <Link href={`/product/${slugify(item.name)}`} aria-label={item.name}>

                            <p className="
                            m-0 pl-10 text-gray-600 w-60
                            ">
                              {item.name}
                            </p>

                          </Link>
                          <div className="ml-4">
                            <QuantityPicker
                              numberOfitems={item.quantity}
                              increment={() => increment(item)}
                              decrement={() => decrement(item)}
                            />
                          </div>
                          <div className="flex flex-1 justify-end">
                            <p className="m-0 pl-10 text-gray-900 tracking-wider">
                              {DENOMINATION + item.price}
                            </p>
                          </div>
                          <div role="button" onClick={() => removeFromCart(item)} className="
                          m-0 ml-10 text-gray-900 text-s cursor-pointer
                          ">
                            <FaTimes />
                          </div>
                        </div>

                        <div className="flex items-center flex md:hidden">
                          <Link href={`/product/${slugify(item.name)}`}>

                            <Image className="w-32 m-0" src={item.image} alt={item.name} />

                          </Link>
                          <div>
                            <Link href={`/product/${slugify(item.name)}`} aria-label={item.name}>

                              <p className="
                              m-0 pl-6 text-gray-600 text-base
                              ">
                                {item.name}
                              </p>

                            </Link>
                            <div className="ml-6 mt-4 mb-2">
                              <QuantityPicker
                                hideQuantityLabel
                                numberOfitems={item.quantity}
                                increment={() => increment(item)}
                                decrement={() => decrement(item)}
                              />
                            </div>
                            <div className="flex flex-1">
                              <p className="text-lg m-0 pl-6 pt-4 text-gray-900 tracking-wider">
                                {DENOMINATION + item.price}
                              </p>
                            </div>
                          </div>
                          <div role="button" onClick={() => removeFromCart(item)} className="
                          m-0 ml-10 text-gray-900 text-s cursor-pointer mr-2
                          ">
                            <FaTimes />
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>  
          </div>
          )
        }
        <div className="flex flex-1 justify-end py-8">
          <p className="text-sm pr-10">Total</p>
          <p className="font-semibold tracking-wide">{DENOMINATION + total}</p>
        </div>
        {!cartEmpty && (
          <div
            onClick={() => handleCheckout(cart, stripePromise)}
            className="cursor-pointer flex items-center justify-end"
            aria-label="Proceed to check out">
              <p className="text-gray-600 text-sm mr-2">Proceed to check out</p>
              <FaLongArrowAltRight className="text-gray-600" />
          </div>
        )}
      </div>
    </div>
  </>;
}

function CartWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {
          context => <Cart {...props} context={context} />
        }
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}


export default CartWithContext