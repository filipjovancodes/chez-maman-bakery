import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const { amount, payment_method_id } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount should be in the smallest currency unit (e.g., cents)
      currency: 'usd',
      payment_method: payment_method_id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Optional to explicitly disable redirects
      },
    });
    res.status(200).json({ success: true, paymentIntent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}