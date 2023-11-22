const SHOPIFY_STORE = 'dc53d9-4.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { customerData, lineItems } = req.body;

            let customerResponse;

            customerResponse = await createCustomer(customerData);

            if (customerResponse.errors.email.includes('has already been taken')) {
                customerResponse = await updateCustomer(customerData.email, customerData);
            }

            const orderResponse = await createOrder(customerData, lineItems);

            res.status(200).json(orderResponse);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

const createCustomer = async (customerData) => {
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2022-01/customers.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ customer: customerData }),
    });

    return response.json();
};

const createOrder = async (customerData, lineItems) => {
    const orderData = {
        line_items: lineItems,
        customer: customerData,
        billing_address: customerData.default_address,
        shipping_address: customerData.default_address,
        financial_status: "paid",
    };

    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2023-04/orders.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ order: orderData }),
    });

    return response.json();
};

// UpdateCustomer now includes logic to fetch the customer ID by email
const updateCustomer = async (email, customerData) => {
    // Fetch the existing customer's ID by email
    const customerId = await fetchCustomerIdByEmail(email);

    // Update the customer details using the fetched ID
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2023-04/customers/${customerId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ customer: customerData }),
    });

    return response.json();
};

// Function to fetch customer ID by email
const fetchCustomerIdByEmail = async (email) => {
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2022-01/customers/search.json?query=email:${email}`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
    });

    const data = await response.json();
    return data.customers[0].id; // Assuming the first customer returned is the one we want
};