const processOrder = async (event, billingInput, shippingInput, context, stripe, elements) => {
  event.preventDefault()
  const { first_name, last_name, street, city, postal_code, state, country, email, phone } = billingInput
  const { ship_first_name, ship_last_name, ship_street, ship_city, ship_postal_code, ship_state } = shippingInput
  const { total, clearCart } = context
  
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
        country: country         // TODO add country to form and only allow US
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

      if (shopifyResponse.errors) {
      // Concatenate all error messages into a single string
          let errorMessages = Object.keys(shopifyResponse.errors)
                                  .map(key => `${key}: ${shopifyResponse.errors[key].join(', ')}`)
                                  .join('; ');
      
          return errorMessages
      }
  
      return "success"
  } catch (apiError) {
      return "An error occurred while processing the payment."
  }
}

export default processOrder;