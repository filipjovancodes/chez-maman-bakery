import { useEffect, useState } from 'react'
import Head from 'next/head'
import { SiteContext, ContextProviderComponent } from "../context/mainContext"
import DENOMINATION from "../utils/currencyProvider"
import { FaLongArrowAltLeft } from "react-icons/fa"
import Link from "next/link"
import Image from "../components/Image"
import { v4 as uuid } from "uuid"
import { onApprovePayPal, createPayPalOrder, renderPayPalForm } from "./helpers/paypal"
// import { processOrder } from "./orderHandler"
import { useRouter } from 'next/router'; // Import useRouter

import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
const { createCustomer, createOrder } = require('./api/shopify');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#000", // Changed to black for higher contrast
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#6b7280" // Darker placeholder text for better visibility
      },
      iconColor: "#000", // Icons also set to black for visibility
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  },
  hidePostalCode: true,
};

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

const DropdownWithLabel = ({ label, onChange, value, name, options }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <select
        id={name}
        name={name}
        required
        className="appearance-none block w-full bg-white text-gray-700 border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 pr-8"
        onChange={onChange}
        value={value}
      >
        <option value="" disabled>Select a Country</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.5 7.5l4.5 4.5 4.5-4.5H5.5z"/>
        </svg>
      </div>
    </div>
  </div>
);

const Checkout = ({ context }) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [orderProcessing, setOrderProcessing] = useState(false)
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const stripe = useStripe()
  const elements = useElements()
  const [billingInput, setBillingInput] = useState({
    first_name: "",
    last_name: "",
    email: "",
    street: "",
    city: "",
    postal_code: "",
    state: "",
    country: ""
  });
  const [shippingInput, setShippingInput] = useState({
    ship_first_name: "",
    ship_last_name: "",
    ship_street: "",
    ship_city: "",
    ship_postal_code: "",
    ship_state: "",
    ship_country: ""
  });
  const router = useRouter(); // Initialize useRouter
 
  // if cart is empty, redirect to home
  if (context.numberOfItemsInCart === Number(0)) {
      router.push("/");
  }

  const toggleShipToDifferentAddress = () => {
    setShipToDifferentAddress(!shipToDifferentAddress);
  };

  const handleBillingChange = e => {
    setBillingInput({ ...billingInput, [e.target.name]: e.target.value });
    console.log(billingInput)
  };
  
  const handleShippingChange = e => {
    setShippingInput({ ...shippingInput, [e.target.name]: e.target.value });
  };

  const handleSubmit = async event => {
    console.log(billingInput)

    setOrderProcessing(true)
    const response = await processOrder(event, billingInput, shippingInput, context.total, stripe, elements)
    setOrderProcessing(false)

    if (response != "success") {
      setErrorMessage(response)
    } else {
      // Handle successful order creation
      setOrderCompleted(true);
      context.clearCart();
    }
  }

  const processOrder = async (event, billingInput, shippingInput, total, stripe, elements) => {
    event.preventDefault()
    const { first_name, last_name, street, city, postal_code, state, country, email, phone } = billingInput
    const { ship_first_name, ship_last_name, ship_street, ship_city, ship_postal_code, ship_state, ship_country } = shippingInput

    console.log(billingInput)

    if (!stripe || !elements) {
        // Stripe.js has not loaded yet. Make sure to disable
        // form submission until Stripe.js has loaded.
        return "Stripe has not loaded yet."
    }

    // Basic form validations with regex
    if (!first_name) {
        return"Please enter your first name."
    }
    if (!last_name) {
        return "Please enter your last name."
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return "Please enter a valid email address."
    }
    if (!street) {
        return "Please enter a valid street address."
    }
    if (!city || !/^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/.test(city)) {
        return "Please enter a valid city."
    }
    if (!state || !/^[A-Z]{2}$/.test(state)) {
        return "Please enter a valid state abbreviation (WA, CA, etc.)"
    }
    if (!country) {
        return "Please select your country."
    }
    if (!postal_code || !/^\d{5}(-\d{4})?$/.test(postal_code)) {
      return "Please enter a valid postal code."
    }
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return "Please enter a valid phone number."
    }

    if (shipToDifferentAddress === true) {
      if (!ship_first_name) {
        return"Please enter your shipping first name."
      }
      if (!ship_last_name) {
          return "Please enter your shipping last name."
      }
      if (!ship_street) {
          return "Please enter a valid shipping street address."
      }
      if (!ship_city || !/^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/.test(city)) {
          return "Please enter a valid shipping city."
      }
      if (!ship_state || !/^[A-Z]{2}$/.test(state)) {
          return "Please enter a valid shipping state abbreviation (WA, CA, etc.)"
      }
      if (!ship_country) {
          return "Please select your shipping country."
      }
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
          country: "US"         // TODO add country to form and only allow US
        }
      },
    })

    if (error) {
        return error.message
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
        return stripePaymentResponse.error
      }

      const billing_address = {
        name: first_name.concat(" ", last_name),
        address1: street,
        city: city,
        province: state,
        zip: postal_code,
        country: country,
      }

      let shipping_address
      if (ship_first_name != "") {
        shipping_address = {
          name: ship_first_name.concat(" ", ship_last_name),
          address1: ship_street,
          city: ship_city,
          province: ship_state,
          zip: ship_postal_code,
          country: ship_country,
        }
      } else {
        shipping_address = {...billing_address}
      }

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
            billing_address: billing_address,
            shipping_address: shipping_address,
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

        if (shopifyResponse.errors) {
        // Concatenate all error messages into a single string
            let errorMessages = Object.keys(shopifyResponse.errors)
                                    .map(key => `${key}: ${shopifyResponse.errors[key].join(', ')}`)
                                    .join('; ');
        
            return errorMessages
        }
    
        return "success"
    } catch (apiError) {
        return `An error occurred while processing the payment. ${apiError}`
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
  
  const BillingShippingForm = () => (
    <div>
      <div>
        <InputWithLabel label="First Name" onChange={handleBillingChange} value={billingInput.first_name} name="first_name" />
        <InputWithLabel label="Last Name" onChange={handleBillingChange} value={billingInput.last_name} name="last_name" />
        <DropdownWithLabel label="Country" onChange={handleBillingChange} value={billingInput.country} name="country" options={[{ value: 'United States', label: 'United States' }]} />
        <InputWithLabel label="Street Address" onChange={handleBillingChange} value={billingInput.street} name="street" />
        <InputWithLabel label="City" onChange={handleBillingChange} value={billingInput.city} name="city" />
        <InputWithLabel label="State" onChange={handleBillingChange} value={billingInput.state} name="state" />
        <InputWithLabel label="Postal Code" onChange={handleBillingChange} value={billingInput.postal_code} name="postal_code" />
        <InputWithLabel label="Phone" onChange={handleBillingChange} value={billingInput.phone} name="phone" />
        <InputWithLabel label="Email Address" onChange={handleBillingChange} value={billingInput.email} name="email" />
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input type="checkbox" className="form-checkbox" checked={shipToDifferentAddress} onChange={toggleShipToDifferentAddress} />
          <span className="ml-2">Ship to a different address?</span>
        </label>
      </div>

      {
        shipToDifferentAddress && 
        <div>
          <InputWithLabel label="First Name" onChange={handleShippingChange} value={shippingInput.ship_first_name} name="ship_first_name" />
          <InputWithLabel label="Last Name" onChange={handleShippingChange} value={shippingInput.ship_last_name} name="ship_last_name" />
          <DropdownWithLabel label="Country" onChange={handleShippingChange} value={shippingInput.ship_country} name="ship_country" options={[{ value: 'United States', label: 'United States' }]} />
          <InputWithLabel label="Street Address" onChange={handleShippingChange} value={shippingInput.ship_street} name="ship_street" />
          <InputWithLabel label="City" onChange={handleShippingChange} value={shippingInput.ship_city} name="ship_city" />
          <InputWithLabel label="State" onChange={handleShippingChange} value={shippingInput.ship_state} name="ship_state" />
          <InputWithLabel label="Postal Code" onChange={handleShippingChange} value={shippingInput.ship_postal_code} name="ship_postal_code" />
        </div>
      }

      <div className="mb-4">
        <label htmlFor="orderNotes" className="block text-sm font-medium text-gray-700">
          Order notes (optional)
        </label>
        <textarea
          id="orderNotes"
          name="orderNotes"
          rows="4"
          className="mt-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
          placeholder="Notes about your order, e.g. special notes for delivery."
          onChange={(e) => setOrderNotes(e.target.value)}
          value={orderNotes}
        />
      </div>
    </div>
  );

  const renderCartItems = () => (
    <div className="flex flex-col">
      {cart.map((item, index) => (
        <div 
          key={index}
          className={`pt-2 pb-2 ${index === cart.length - 1 ? 'border-b' : ''}`}
        >
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600">{item.name} <span className="text-black font-semibold">× {item.quantity}</span></p>
              <p className="text-gray-500">{item.variant}</p> {/* Assuming 'variant' is a property on your item that might represent something like 'Length: 45"' */}
            </div>
            <div className="text-gray-900">
              {DENOMINATION + (item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOrderSummary = () => {
    const subtotal = parseFloat(context.total).toFixed(2)
    const shipping = parseFloat(4.95).toFixed(2)
    const tax = (parseFloat(subtotal) * 0.12).toFixed(2)
    const grand_total = (parseFloat(subtotal) + parseFloat(shipping) + parseFloat(tax)).toFixed(2)

    return (
      <div className="bg-gray-100 p-4 rounded-md">
        <div className="flex justify-between border-b border-gray-200 pt-4 pb-4">
          <p>Product</p>
          <p>Subtotal</p>
        </div>
        {renderCartItems()}
        <div className="flex justify-between border-b border-gray-200 pt-4 pb-4">
          <p>Subtotal</p>
          <p>{DENOMINATION + subtotal}</p>
        </div>
        <div className="flex justify-between border-b border-gray-200 pt-4 pb-4">
          <p>Shipping</p>
          <p>{DENOMINATION + shipping}</p> {/* TODO context.shipping.toFixed(2) */}
        </div>
        <div className="flex justify-between border-b border-gray-200 pt-4 pb-4">
          <p>Tax</p>
          <p>{DENOMINATION + tax}</p> {/* Define tax somewhere else taxCost.toFixed(2) */}
        </div>
        <div className="flex justify-between pt-4 pb-8">
          <p>Total</p>
          <p className="text-2xl text-black font-semibold">{DENOMINATION + grand_total}</p>
        </div>
        <div className="mt-4 pb-4">
          <label htmlFor="card-element" className="block text-lg font-medium text-gray-700 mb-2">
            Credit card / debit card
          </label>
          <div className="border p-3 rounded-md">
            <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} className="mt-2" />
          </div>
        </div>
        <button 
          className="text-center bg-black text-white font-bold py-2 px-4 mt-4 w-full focus:outline-none focus:shadow-outline hover:bg-white hover:text-black border border-black"
          name="submit-button" 
          type="submit"
        >
          Place Order
        </button>
        {orderProcessing === true ? 
          <div className="text-center mt-2">
            Processing...
          </div>
          : null}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center pb-10">
      <div className="flex flex-col w-full c_large:w-c_large">
        <form onSubmit={handleSubmit}>
          {errorMessage && <span className="text-red-500">{errorMessage}</span>}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
              {BillingShippingForm()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Your order</h2>
              {renderOrderSummary()}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutWithContext