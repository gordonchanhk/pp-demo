paypal.use( ['login'], function (login) {
    login.render ({
            'appid': 'AWLQ-67OV5B-mlDfDiZwR_F3FK2Am0Ymo6drCSImVOYiHu-f1iFTX2OT5lqIwG4jFzeV0HucZtS0McNG',
            'authend': 'sandbox',
            'scopes': 'openid https://uri.paypal.com/services/disputes/create https://uri.paypal.com/services/disputes/read-buyer',
            'containerid': 'cwppButton',
            'locale': 'en-us',
            'buttonType': 'CWP',
            'buttonSize': 'lg',
            'returnurl': 'http://127.0.0.1:3000/lipp/callback'
    });
});



https://www.sandbox.paypal.com/connect/?

flowEntry=lg
client_id=AWLQ-67OV5B-mlDfDiZwR_F3FK2Am0Ymo6drCSImVOYiHu-f1iFTX2OT5lqIwG4jFzeV0HucZtS0McNG
response_type=code
scope=openid%20https%3A%2F%2Furi.paypal.com%2Fservices%2Fdisputes%2Fcreate%20https%3A%2F%2Furi.paypal.com%2Fservices%2Fdisputes%2Fread-buyer
redirect_uri=http%253A%252F%252F127.0.0.1%253A3000%252Flipp%252Fcallback
newUI=Y


https://www.sandbox.paypal.com/connect/?
client_id=AcPvDwo5TY6C8okSGxfp5-vXYsnX4oy3bULY-R2KWa5sFrNNwo-tnkooA7UMJMCiZ-pTVS7gB37newhv
redirect_uri=https%3A%2F%2Fdemo.paypal.com%2Fus%2Fdemo%2Fgo_platform%2Fdisputes%2FvalidateEligibility%3Flocale.x%3Den_US
scope=https%3A%2F%2Furi.paypal.com%2Fservices%2Fdisputes%2Fcreate
