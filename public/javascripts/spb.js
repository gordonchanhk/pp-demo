paypal.Buttons({
    // Sets up the transaction when a payment button is clicked
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [
            {
                invoice_id: "Your-Invoice-ID",
                amount: {
                    currency_code: document.getElementById('currency').value,
                    value: document.getElementById('amount').value
                },
            }
        ]
      });
    },
    // Finalize the transaction after payer approval
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(orderData) {
        console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
        var transaction = orderData.purchase_units[0].payments.captures[0];
        alert(
            'Transaction '+ transaction.status + ': ' + transaction.id +
            '\n\nSee console for all available details');
      });
    }
  }).render('#paypal-button-container');
