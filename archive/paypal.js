import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";


export const createPayPalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: total, // total amount from context
        },
      }],
    });
  };

export const onApprovePayPal = (data, actions) => {
    return actions.order.capture().then(details => {
        // Handle successful PayPal transaction
        console.log('Transaction completed by ' + details.payer.name.given_name);
        // TODO: Additional logic like updating your database
        setOrderCompleted(true);
        clearCart();
    });
};

export const renderPayPalForm = () => (
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

