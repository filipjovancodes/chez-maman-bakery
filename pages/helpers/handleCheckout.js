const baseUrl = process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : `http://${process.env.NEXT_PUBLIC_BASE_URL}`;

const handleCheckout = async ({cart, stripePromise}) => {

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


export default handleCheckout