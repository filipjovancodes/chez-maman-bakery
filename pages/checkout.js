import { useEffect, useState } from 'react'
import Head from 'next/head'
import { SiteContext, ContextProviderComponent } from "../context/mainContext"
import DENOMINATION from "../utils/currencyProvider"
import { FaLongArrowAltLeft } from "react-icons/fa"
import Link from "next/link"
import Image from "../components/Image"
import { v4 as uuid } from "uuid"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
function CheckoutWithContext(props) {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    // Dynamically load stripe and set the stripe promise
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
    setStripePromise(stripePromise);
  }, []);

  // Render nothing until stripe is loaded on the client
  if (!stripePromise) return null;

  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {context => (
          <Elements stripe={stripePromise}>
            <Checkout {...props} context={context} />
          </Elements>
        )}
      </SiteContext.Consumer>
    </ContextProviderComponent>
  );
}

const calculateShipping = () => {
  return 0
}

const Input = ({ onChange, value, name, placeholder }) => (
  <input
    onChange={onChange}
    value={value}
    className="mt-2 text-sm shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    type="text"
    placeholder={placeholder}
    name={name}
  />
)

const Checkout = ({ context }) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [input, setInput] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    postal_code: "",
    state: "",
  })

  const stripe = useStripe()
  const elements = useElements()

  const [paymentMethod, setPaymentMethod] = useState('Stripe'); // Default to Stripe

  // PayPal payment handling
  const createPayPalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: total, // total amount from context
        },
      }],
    });
  };

  const onApprovePayPal = (data, actions) => {
    return actions.order.capture().then(details => {
      // Handle successful PayPal transaction
      console.log('Transaction completed by ' + details.payer.name.given_name);
      // TODO: Additional logic like updating your database
      setOrderCompleted(true);
      clearCart();
    });
  };


  const onChange = e => {
    setErrorMessage(null)
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const { name, street, city, postal_code, state, email, phone } = input
    const { total, clearCart } = context

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return
    }

    // Validate input
    if (!name || !email || !street || !city || !postal_code || !state || !phone) {
      setErrorMessage("Please fill in the entire form!");
      return;
    }  

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement)

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: name,
        email: email,              // Customer's email address
        phone: phone,              // Customer's phone number
        address: {                 // Customer's billing address
          line1: street,            // Street address or P.O. Box
          // line2: line2,            // Apartment, suite, unit, building, etc.
          city: city,
          state: state,
          postal_code: postal_code,
          // country: country         // TODO add country to form and only allow US
        }
      },
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    // TODO add to database
    const order = {
      email,
      amount: total, // Ensure this is in the smallest currency unit (e.g., cents for USD)
      address: { street, city, postal_code, state },
      payment_method_id: paymentMethod.id,
      receipt_email: email,
      id: uuid(),
    };

    try {
      // Replace '/api/payment' with your actual server-side endpoint
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({amount: total, payment_method_id: paymentMethod.id}),
      });
  
      const paymentResponse = await response.json();
  
      if (paymentResponse.error) {
        setErrorMessage(paymentResponse.error);
        return;
      }
  
      setOrderCompleted(true);
      clearCart();
    } catch (apiError) {
      setErrorMessage("An error occurred while processing the payment.");
    }
  }

  const { numberOfItemsInCart, cart, total } = context
  const cartEmpty = numberOfItemsInCart === Number(0)

  if (orderCompleted) {
    return (
      <div>
        <h3>Thanks! Your order has been successfully processed.</h3>
      </div>
    )
  }

  const PaymentMethodSelector = () => (
    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mb-4">
      <option value="Stripe">Stripe</option>
      <option value="PayPal">PayPal</option>
    </select>
  );

  const renderStripeForm = () => (
    <div className="flex flex-1 pt-8 flex-col">
      <div className="mt-4 border-t pt-10">
        <form onSubmit={handleSubmit}>
          {errorMessage && <span>{errorMessage}</span>}
  
          {/* Name Input */}
          <Input
            onChange={onChange}
            value={input.name}
            name="name"
            placeholder="Cardholder name"
          />
  
          {/* Stripe Card Element */}
          <CardElement className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
  
          {/* Additional Inputs */}
          <Input onChange={onChange} value={input.email} name="email" placeholder="Email" />
          <Input onChange={onChange} value={input.street} name="street" placeholder="Street Address" />
          <Input onChange={onChange} value={input.city} name="city" placeholder="City" />
          <Input onChange={onChange} value={input.state} name="state" placeholder="State" />
          <Input onChange={onChange} value={input.postal_code} name="postal_code" placeholder="Postal Code" />
          <Input onChange={onChange} value={input.phone} name="phone" placeholder="Phone" />
  
          {/* Submit Button */}
          <button
            name="submit"
            disabled={!stripe}
            onClick={handleSubmit}
            className="hidden md:block bg-primary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Confirm order
          </button>
        </form>
      </div>
    </div>
  );
  
  const renderPayPalForm = () => (
    <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
      <PayPalButtons
        createOrder={(data, actions) => createPayPalOrder(data, actions)}
        onApprove={(data, actions) => onApprovePayPal(data, actions)}
      />
    </PayPalScriptProvider>
  );

  const renderCartItems = () => (
    <div className="flex flex-col">
      {cart.map((item, index) => (
        <div className="border-b py-10" key={index}>
          <div className="flex items-center">
            <Image className="w-32 m-0" src={item.image} alt={item.name} />
            <p className="m-0 pl-10 text-gray-600">{item.name}</p>
            <div className="flex flex-1 justify-end">
              <p className="m-0 pl-10 text-gray-900 font-semibold">
                {DENOMINATION + item.price}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPaymentForm = () => (
    <div className="flex flex-1 flex-col md:flex-row">
      <PaymentMethodSelector />
      {paymentMethod === 'Stripe' ? renderStripeForm() : renderPayPalForm()}
    </div>
  );


  return (
    <div className="flex flex-col items-center pb-10">
      <Head>
        <title>Jamstack ECommerce - Checkout</title>
        <meta name="description" content="Check out" />
        <meta property="og:title" content="Jamstack ECommerce - Checkout" key="title" />
      </Head>
      <div className="flex flex-col w-full c_large:w-c_large">
        <div className="pt-10 pb-8">
          <h1 className="text-5xl font-light mb-6">Checkout</h1>
          <Link href="/cart" aria-label="Cart">
            <div className="cursor-pointer flex items-center">
              <FaLongArrowAltLeft className="mr-2 text-gray-600" />
              <p className="text-gray-600 text-sm">Edit Cart</p>
            </div>
          </Link>
        </div>
  
        {cartEmpty ? <h3>No items in cart.</h3> : renderCartItems()}
        {!cartEmpty && renderPaymentForm()}
      </div>
    </div>
  );
}

export default CheckoutWithContext