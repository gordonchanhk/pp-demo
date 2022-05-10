initBtn();

function initBtn(){
  paypal.Buttons({
      // Sets up the transaction when a payment button is clicked
      createOrder: function(data, actions) {
        console.log(data);
        return fetch(`/create-payment`, {
          method: 'post',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            amount: document.getElementById('amount').value,
            customerId: document.getElementById('customerId').value
          })
        }).then((res)=>{
          return res.json();
        }).then((data) => {
          return data.id;
        });
      },
      // Finalize the transaction after payer approval
      onApprove: function(data, actions) {
        return fetch(`/capture/order/${data.orderID}`, {
          method: 'post',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            orderID: data.orderID
          })
        }).then((res)=>{
          return res.json();
        }).then((data) => {
          console.log(data);
          alert(
                  'Transaction '+ data.status + ': ' + data.id +
                  '\n\nSee console for all available details');
        });
      }
    }).render('#paypal-button-container');
}
