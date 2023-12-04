import Stripe from 'stripe';
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export const config = {
    api: {
        bodyParser: false,
    },
};

const baseUrl = process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : `http://${process.env.NEXT_PUBLIC_BASE_URL}`;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const buffers = [];
        req.on('data', (chunk) => {
            buffers.push(chunk);
        });
        req.on('end', async () => {
            const rawBody = Buffer.concat(buffers).toString('utf-8');
            const sig = req.headers['stripe-signature'];

            let event;

            try {
                event = stripe.webhooks.constructEvent(
                    rawBody,
                    sig,
                    process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET
                );
            } catch (err) {
                console.error(`Webhook Error: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;

                console.log("EVENT", event)
                console.log("DATA", event.data)
                console.log("SESSION", session)

                // Extract shipping address from Stripe session
                const shippingAddress = {
                    name: session.customer_details.name,
                    address1: session.shipping_details.address.line1,
                    address2: session.shipping_details.address.line2 || '',
                    city: session.shipping_details.address.city,
                    province: session.shipping_details.address.state,
                    zip: session.shipping_details.address.postal_code,
                    country: session.shipping_details.address.country,
                }

                console.log(shippingAddress)

                // Retrieve line items for the session
                const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

                console.log(lineItemsResponse)

                 // Assume the second last item is shipping and the last item is tax
                const shipping = lineItemsResponse.data.slice(-2, -1)[0].amount_total / 100;
                const tax = lineItemsResponse.data.slice(-1)[0].amount_total / 100;
                
                // Remove the shipping and tax items from the line items array
                const shopifyLineItems = lineItemsResponse.data.slice(0, -2).map(item => ({
                    name: item.description.split("-")[0],
                    variant_id: item.description.split("-")[1],
                    price: (item.amount_total / 100) / item.quantity, // Convert amount from cents to dollars
                    quantity: item.quantity
                }));

                // Shopify API call to process the order (replace with your actual API endpoint)
                // TODO
                const shopifyResponse = await fetch(`${baseUrl}/api/shopify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        customerData: {
                            email: session.customer_details.email,
                            shipping_address: shippingAddress,
                        }, 
                        lineItems: shopifyLineItems,
                        shipping: shipping,
                        tax: tax,
                    }),
                });

                // Handle response from Shopify
                const shopifyData = await shopifyResponse.json();
                console.log(shopifyData); // Log or handle Shopify response data

                res.status(200).json({ received: true });
            } else {
                res.setHeader('Allow', ['POST']);
                res.status(405).end('Method Not Allowed');
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end('Method Not Allowed');
    }
}
