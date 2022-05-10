paypal.use( ['login'], function (login) {
  console.log('inside login callback');
    login.render ({
      "appid":"AVsopbUuTUZPkRHcgY5sIXGHzrGn4PfCOTRpUbxd8kyWXgRgFa3I9qVTTa1J6zDtXjmPjyevku9aDkN8",
      "authend":"sandbox",
      "scopes": "openid",
      "containerid":"lwpp",
      "responseType":"code",
      "locale":"en-us",
      "returnurl":"https://se-pp-demo.herokuapp.com/lwpp-callback"
    });
  });
