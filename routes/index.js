var express = require('express');
var axios = require('axios')
const paypal = require('paypal-rest-sdk');
const url = require('url');
var router = express.Router();
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'
require("dotenv").config();

// Gordon PP REST APP for HK Vaulting test
const PAYPAL_EMAIL = process.env.PAYPAL_EMAIL;
const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;

require('axios-debug-log')

let global_access_token = '';



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PayPal code demo' });
});


router.get('/spb', function(req, res, next) {
  res.render('spb', { title: 'SPB', PAYPAL_API_CLIENT });
});

router.get('/lipp', function(req, res, next) {
  res.render('lipp', { title: 'LIPP', PAYPAL_API_CLIENT });
});

router.post('/lipp/callback', function(req, res, next) {
  console.log('/lipp/callback being called')
  res.render('lipp', { title: 'LIPP', PAYPAL_API_CLIENT });
});


router.get('/spb-vault', async function(req, res, next) {
  await getAccessToken();

  let tokenResponse = await getClientToken();
  console.log("response.data:");
  console.log(tokenResponse.data);
  res.render('spb-vault', { title: 'SPB Vault', PAYPAL_API_CLIENT, clientToken: tokenResponse.data.client_token });
});

router.post('/spb-vault', async function(req, res, next) {
  await getAccessToken();
  let customerId = req.body.customerId;
  console.log('customerId: '+customerId);
  let tokenResponse = await getClientToken(customerId);
  console.log("response.data:");
  console.log(tokenResponse.data);
  res.render('spb-vault', { title: `SPB Vault (${customerId})`, PAYPAL_API_CLIENT, clientToken: tokenResponse.data.client_token, customer_id: customerId });
});

async function getAccessToken(){
  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")

  try{
    const { data: {access_token} } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
      headers: {
          'Content-Type': 'application/x-www-form-url-urlencoded',
      },
      auth: {
          username: PAYPAL_API_CLIENT,
          password: PAYPAL_API_SECRET,
      }
    });

    global_access_token = access_token;
  } catch( e ){
    console.log(e);
  }
  return global_access_token;
}

async function getClientToken(customerId){
  let param = {}
  if (customerId !== '') {
    param = { "customer_id": customerId }
  }
  const response = await axios.post(`${PAYPAL_API}/v1/identity/generate-token`, JSON.stringify(param), {
    headers: {
        Authorization: `Bearer ${global_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
    }
  });
  return response;
}

router.post('/create-payment', async function(req, res, next) {
  let requestID = getRequestId();
  var create_payment_json = {
    intent: 'CAPTURE',
    application_context:{
      "brand_name":"Gordon Store",
      "shipping_preference": "NO_SHIPPING",
      "return_url": "http://127.0.0.1:3000/return-url",
      "cancel_url": "http://127.0.0.1:3000/cancel-url"
    },
    "payment_source": {
      "paypal": {
        "attributes": {
          "customer": {
            "id": req.body.customerId
          },
          "vault": {
            "confirm_payment_token": "ON_ORDER_COMPLETION",
            "usage_type": "MERCHANT",
            "customer_type": "CONSUMER",
            "permit_multiple_payment_tokens": true
          }
        }
      }
    },
    "purchase_units": [{
      "reference_id": "REFID-"+Date.now(),
      amount: {
        currency_code: process.env.CURRENCY,
        value: req.body.amount
      }
    }]
  };
  let response = { data: {} };
  try{
    response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, create_payment_json, {
      headers: {
          Authorization: `Bearer ${global_access_token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': requestID
      }
    });
  }catch(e){
    console.log(e.response.data)
  }
  res.json(response.data);
});

router.post('/capture/order/:orderId', async function(req, res, next) {

  const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${req.params.orderId}/capture`, {}, {
    headers: {
        Authorization: `Bearer ${global_access_token}`,
        'Content-Type': 'application/json',
    }
  });
  // Check transaction response + further business logic
  console.log(response.data);
  res.json(response.data);
});


router.get('/create-order', function(req, res, next) {
  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://127.0.0.1:3000/return-url",
        "cancel_url": "http://127.0.0.1:3000/cancel-url"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": "1.00",
                "currency": process.env.CURRENCY,
                "quantity": 1
            }]
        },
        "amount": {
            "currency": process.env.CURRENCY,
            "total": "1.00"
        },
        "description": "This is the payment description."
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        console.log("Create Payment Response");
        console.log(payment);
    }
  });
  res.render('create-order', { title: 'Create Order' });
});

router.get('/return-url', function(req, res, next) {
  console.log('/return-url is called');
  const { paymentId, token, PayerID } = req.query;
  var execute_payment_json = {
    "payer_id": PayerID,
    "transactions": [{
        "amount": {
            "currency": process.env.CURRENCY,
            "total": "1.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log("Get Payment Response");
          console.log(JSON.stringify(payment));
      }
  });
  res.render('return-url', { title: 'SPB', PAYPAL_API_CLIENT });
});


router.get('/create-payment-token', async function(req, res, next) {
  await getAccessToken();
  let requestID = getRequestId();
  let data = {
    "customer_id": "testcustomer3",
    "source": {
      "paypal": {
         "usage_type": "MERCHANT"
      }
    },
    "application_context": {
      "permit_multiple_payment_tokens": true,
      "locale": "en-US",
      "return_url": "http://127.0.0.1:3000/vault-returnUrl",
      "cancel_url": "http://127.0.0.1:3000/vault-cancelUrl?status=failed"
    }
  };
  const response = await axios.post(`${PAYPAL_API}/v2/vault/payment-tokens`, data, {
    headers: {
        Authorization: `Bearer ${global_access_token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': requestID
    }
  });
  // Check transaction response + further business logic
  console.log(response.data);
  res.redirect(response.data.links[0].href);
});

router.get('/get-payment-tokens/:customerId', async function(req, res, next) {
  console.log('/get-payment-tokens');
  let requestID = getRequestId();
  await getAccessToken();
  try{

    const response = await axios.get(`${PAYPAL_API}/v2/vault/payment-tokens?customer_id=${req.params.customerId}`, {
      headers: {
          Authorization: `Bearer ${global_access_token}`,
          'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch ( e ){
    console.log(e);
  }
});

router.get('/pay-w-payment-tokens/:tokenId/:amount', async function(req, res, next) {
  console.log('/pay-w-payment-tokens');
  let requestID = getRequestId();
  await getAccessToken();
  let paymentConfig = {
    "intent": "CAPTURE",
    "payment_source": {
        "token": {
          "type": "PAYMENT_METHOD_TOKEN",
          "id": req.params.tokenId
        }
      },
    "purchase_units": [
      {
        "amount": {
          "currency_code": process.env.CURRENCY,
          "value": req.params.amount
        }
      }
    ]
  }
  try{

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, paymentConfig, {
      headers: {
          Authorization: `Bearer ${global_access_token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': getRequestId()
      }
    });
    res.json(response.data);
  } catch ( e ){
    console.log(e);
  }
});

router.get('/vault-returnUrl', async function(req, res, next) {
  getAccessToken();
  console.log(req.url);
  const urlParams = url.parse(req.url,true).query;
  console.log('urlParams:');
  console.log(`${PAYPAL_API}/v2/vault/approval-tokens/${urlParams.approval_token_id}/confirm-payment-token`);
  try{

    const response = await axios.post(`${PAYPAL_API}/v2/vault/approval-tokens/${urlParams.approval_token_id}/confirm-payment-token`, {}, {
      headers: {
          Authorization: `Bearer ${global_access_token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': getRequestId()
      }
    });
    console.log('vault-returnUrl reached');
    console.log('response:');
    console.log(response.data);
    res.json(response.data);
  } catch(e){
    console.log(e);
    res.json(e.response.data);
  }

});
router.get('/vault-cancelUrl', function(req, res, next) {
  console.log(req);
  console.log("==========");
  console.log(req.url);
  console.log('vault-cancelUrl reached');
});

router.get('/cancel-url', function(req, res, next) {
  console.log('/return-url is called');
  res.render('cancel-url', { title: 'SPB', PAYPAL_API_CLIENT });
});

router.get('/pay-later', function(req, res, next) {
  res.render('pay-later', { title: 'Pay Later', PAYPAL_API_CLIENT });
});

router.get('/lwpp', function(req, res, next) {
  res.render('lwpp', { title: 'Login with PayPal' });
});

router.get('/lwpp-callback', function(req, res, next) {
  const { code, access_token, refresh_token, id_token } = req.body;
  console.log("code:" + code);
  console.log("access_token:" + access_token);
  console.log("refresh_token:" + refresh_token);
  console.log("id_token:" + id_token);

  // Make a call to PayPal's tokenservice endpoint:
  // https://api-m.sandbox.paypal.com/v1/oauth2/token
  // w/ params:
  //    - Authorization
  //    - grant_type
  //    - code

  
  res.render('lwpp-callback', { title: 'Login with PayPal' });
});

router.post('/webhook', async function(req, res, next) {

});

router.get('/disputes/list', async function(req, res, next) {
  let response;
  let accessToken = await getAccessToken();

  try{

    response = await axios.get(`${PAYPAL_API}/v1/customer/disputes`, {
      headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
    });
  } catch (e) {
    console.log(e.response.data);
  }
  // Check transaction response + further business logic
  res.json(response.data);
});

function getRequestId(){
  const nowDate = new Date();
  dd = String(nowDate.getDate()).padStart(2, '0');
  mm = String(nowDate.getMonth() + 1).padStart(2, '0');
  yyyy = nowDate.getFullYear();

  let requestID = 'Req-' + Date.now();
  return requestID;
}

module.exports = router;
