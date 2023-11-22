const SHOPIFY_STORE = 'dc53d9-4.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = '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';

const fetch = require('node-fetch');

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
        billing_address: customerData.addresses[0],
        shipping_address: {
            name: "John Doe",
            address1: "123 Elm Street",
            city: "Anytown",
            province: "New York", // State or Province abbreviation
            postal_code: "12345", // Postal code
            country: "United States", // Country name
        },
        financial_status: "paid",
        // Add other order related information as required
    };

    console.log(orderData)

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
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2022-01/customers/${customerId}.json`, {
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

const customerData = {
    first_name: "Alex",
    last_name: "Doe",
    email: "johndoe@example.com",
    phone: "7786289207",
    addresses: [
        {
            address1: "123 Elm Street",
            city: "Anytown",
            province: "New York", // State or Province abbreviation
            zip: "12345", // Postal code
            country: "United States", // Country name
            phone: "7786289207",
            default: true // Indicates this is the default address
        }
    ],
};

const lineItems = [{
    name: "test",
    variant_id: 47335617986881, // Make sure this corresponds to your data structure
    price: 10,
    quantity: 1
}];

const test = async () => {
    let response = await updateCustomer(customerData.email, customerData);
    console.log(response);
};

test();