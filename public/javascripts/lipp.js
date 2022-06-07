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
