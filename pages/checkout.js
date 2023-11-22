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
const { createCustomer, createOrder } = require('./api/shopify');

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

const InputWithLabel = ({ label, onChange, value, name, type = "text" }) => (
  <div className="mb-3">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      required
      className="mt-2 text-sm shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      placeholder={label}
      onChange={onChange}
      value={value}
    />
  </div>
);

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
    if (errorMessage) setErrorMessage(null)
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const { first_name, last_name, street, city, postal_code, state, email, phone } = input
    const { total, clearCart } = context

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return
    }

    // Basic form validations with regex
    if (!first_name) {
      setErrorMessage("Please enter your first name.");
      return;
    }
    if (!last_name) {
      setErrorMessage("Please enter your last name.");
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!street) {
      setErrorMessage("Please enter a valid street address.");
      return;
    }
    if (!city || !/^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/.test(city)) {
      setErrorMessage("Please enter a valid city.");
      return;
    }
    if (!state || !/^[A-Z]{2}$/.test(state)) {
      setErrorMessage("Please enter a valid state abbreviation (WA, CA, etc.)");
      return;
    }
    if (!postal_code || !/^\d{5}(-\d{4})?$/.test(postal_code)) {
      setErrorMessage("Please enter a valid postal code.");
      return;
    }
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    const cardElement = elements.getElement(CardElement)
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: first_name.concat(" ", last_name),
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

    try {
      // Create payment intent and confirm payment with Stripe
      const stripe_response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: total, payment_method_id: paymentMethod.id }),
      });

      const stripePaymentResponse = await stripe_response.json();

      if (stripePaymentResponse.error) {
        console.log(stripePaymentResponse.error);
        return;
      }

      console.log(stripe_response)

      // Create customer and order in Shopify
      const response = await fetch('/api/shopify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerData: {
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone,
            default_address: {
              name: first_name.concat(" ", last_name),
              address1: street,
              city: city,
              province: state,
              postal_code: postal_code,
              country: "United States",
            },
          },
          lineItems: cart.map(item => ({
            name: item.name,
            variant_id: item.variant_id, // Make sure this corresponds to your data structure
            price: item.price,
            quantity: item.quantity
          }))
        }),
      });

      const shopifyResponse = await response.json();

      console.log(shopifyResponse)

      if (shopifyResponse.errors) {
        // Concatenate all error messages into a single string
        let errorMessages = Object.keys(shopifyResponse.errors)
                                  .map(key => `${key}: ${shopifyResponse.errors[key].join(', ')}`)
                                  .join('; ');
    
        console.log(errorMessages);
        return;
    }

      // Handle successful order creation
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

  const renderStripeForm = () => (
    <div className="flex flex-1 pt-8 flex-col">
      <div className="mt-4 border-t pt-10">
        <form onSubmit={handleSubmit}>
          {errorMessage && <span>{errorMessage}</span>}
  
          {/* Form Inputs */}
          <InputWithLabel label="First Name" onChange={onChange} value={input.first_name} name="first_name" placeholder="First Name" />
          <InputWithLabel label="Last Name" onChange={onChange} value={input.last_name} name="last_name" placeholder="Last Name" />
          <CardElement className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          <InputWithLabel label="Email" onChange={onChange} value={input.email} name="email" placeholder="Email" />
          <InputWithLabel label="Street Address" onChange={onChange} value={input.street} name="street" placeholder="Street Address" />
          <InputWithLabel label="City" onChange={onChange} value={input.city} name="city" placeholder="City" />
          <InputWithLabel label="State" onChange={onChange} value={input.state} name="state" placeholder="State" />
          <InputWithLabel label="Postal Code" onChange={onChange} value={input.postal_code} name="postal_code" placeholder="Postal Code" />
          <InputWithLabel label="Phone" onChange={onChange} value={input.phone} name="phone" placeholder="" />

          {/* Submit Button */}
          <button
            name="submit-button"
            onClick={handleSubmit}
            className="text-center bg-primary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Confirm order
          </button>
        </form>
      </div>
    </div>
  );
  
  const renderPayPalForm = () => (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <div className="my-4">
        <h2 className="text-center text-sm mb-2"> - OR - </h2>
        <PayPalButtons
          createOrder={(data, actions) => createPayPalOrder(data, actions)}
          onApprove={(data, actions) => onApprovePayPal(data, actions)}
          style={{ layout: 'horizontal' }}
          disableFunding="card"
        />
      </div>
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
      {renderStripeForm()}
      {/* {renderPayPalForm()} */}
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