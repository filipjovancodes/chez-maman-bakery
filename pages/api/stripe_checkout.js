import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

const baseUrl = process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : `http://${process.env.NEXT_PUBLIC_BASE_URL}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    // Extract cart items or other data necessary for your order from the request body
    const { cartItems } = req.body;

    // Create line items for Stripe Checkout
    const lineItems = cartItems.map(item => ({
        price_data: {
            currency: item.currency,
            product_data: {
                name: item.name.concat("-".concat(String(item.variant_id))),
            },
            unit_amount: item.amount,
        },
        quantity: item.quantity,
    }));

    // Add a flat shipping fee as an additional line item
    lineItems.push({
      price_data: {
        currency: 'usd', // Assuming USD for currency
        product_data: {
            name: 'Shipping',
        },
        unit_amount: 495, // $4.95 expressed in cents
      },
      quantity: 1,
    });

    // Calculate the subtotal of the cart items
    const subtotal = lineItems.reduce((total, item) => {
        return total + (item.price_data.unit_amount * item.quantity);
    }, 0);

    // Calculate 12% tax based on the subtotal
    const taxAmount = Math.round(subtotal * 0.12); // Round to nearest integer for currency in cents

    // Add the tax as an additional line item
    lineItems.push({
        price_data: {
            currency: 'usd', // Assuming USD for currency
            product_data: {
                name: 'Tax',
            },
            unit_amount: taxAmount,
        },
        quantity: 1,
    });

    // Create a Checkout Session
    let session;
    try {
        session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/success`,
            cancel_url: `${baseUrl}/cart`,
            shipping_address_collection: { allowed_countries: ['US'] },
        });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        // Handle the error (e.g., send a response back to the client)
        return;
    }

    res.status(200).json({ success: true, sessionId: session.id });

    // TODO process order to shopify, clear cart, show success page.
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}