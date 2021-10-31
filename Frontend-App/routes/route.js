const router = require("express").Router();
const msal = require("@azure/msal-node");
const session = require('express-session');
const axios = require('axios');

const authConfig = require('../config/authConfig.json');


const config = {
  auth: {
    clientId: authConfig.authOptions.clientId,
    authority: authConfig.authOptions.authority,
    clientSecret: authConfig.authOptions.clientSecret,
    postLogoutRedirectUri: authConfig.authOptions.postLogoutRedirectUri
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
          console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    }
  }
};

const redApi = `${authConfig.resourceApi.endpoint}/red`;
const greenApi = `${authConfig.resourceApi.endpoint}/green`;

// Create msal application object
const cca = new msal.ConfidentialClientApplication(config);
const msalTokenCache = cca.getTokenCache();
let accounts;



router.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'secretSession',
}));

/** Root */
router.get('/', (req, res) => {
  //console.log(`Session in Root: ${JSON.stringify(req.session.templateParams)}`);
  const user = req.session.templateParams;
  //console.log(`User: ${JSON.stringify(user)}`);
  res.render("index.ejs", {user: user});
});

/** Login Endpoint */
router.get("/login", async (req, res) => {
  accounts = await msalTokenCache.getAllAccounts();

  if(accounts.length > 0) {
    //Build the silent request
    const silentRequest = {
      account: accounts[0],
      scopes: authConfig.request.tokenRequest.scopes,
    }

    cca.acquireTokenSilent(silentRequest).then((response) => {
      const accessToken = response.accessToken;
      res.redirect(response);
    }).catch((error) =>{
      console.log(JSON.stringify(error))
    });
  } else {
    const authCodeUrlParameters = {
      scopes: authConfig.request.authCodeUrlParameters.scopes,
      redirectUri: authConfig.request.authCodeUrlParameters.redirectUri
    };
    // get url to sign user in and consent to scopes needed for application
    cca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
      //console.log("\nAuthCodeURL: \n" + response);
      res.redirect(response);
    }).catch((error) => console.log(JSON.stringify(error)));
  } 
});

/**Refresh Endpoint */
router.get("/refresh", (req, res) => {

});



/** Redirect Endpoint */
router.get("/redirect", (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: authConfig.request.tokenRequest.scopes,
    redirectUri: authConfig.request.tokenRequest.redirectUri
  };

  cca.acquireTokenByCode(tokenRequest).then((response) => {
    console.log("\nResponse: \n", response.account);
    req.session.templateParams = {user: response.account.name, profile: true, idToken: response.account.idTokenClaims};
    console.log(`\nSession Details: \n${JSON.stringify(req.session.templateParams)}`);
    const user = req.session.templateParams;
    res.render('index.ejs', {user: user});
  }).catch((error) => {
    console.log(error);
    res.status(500).send(error);
  });
  
});

/** Logout endpoint */
router.get('/logout', (req, res) => {
  const logoutUri = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?
post_logout_redirect_uri=${authConfig.authOptions.postLogoutRedirectUri}`;
    req.session.destroy(() => {
      res.redirect(logoutUri);
    });  
});


/** API Call Endpoint */
router.get('/callRedApi', async (req, res) => {
  //get Accounts
  accounts = await msalTokenCache.getAllAccounts();
  //console.log(`\nAccounts: \n ${JSON.stringify(accounts[0])}`);

  //Build the silent request
  const silentRequest = {
    account: accounts[0],
    scopes: authConfig.request.tokenRequest.scopes,
  }

  /** Acquire Token Silently - pulling the token from in-memory cache */
  cca.acquireTokenSilent(silentRequest).then((response) => {
    const accessToken = response.accessToken;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    }
    console.log(`\nHeaders: \n ${JSON.stringify(headers)}`);
    console.log(`\nURL: ${redApi}\n`);
    console.log(`\nCalling the API...\n`);
    try{
        axios({
        method: 'get',
        url: redApi,
        headers: headers
      }).then((response) => {
        console.log(`\nResponse from API: \n ${JSON.stringify(response.data)}`);
        req.session.apiData = {data: response.data};
        const user = req.session.templateParams;
        const data = req.session.apiData;
        console.log(`\nData: \n${JSON.stringify(data)}\n`);
        res.render('result.ejs', {user: user, data: data});
        //console.log(`\nSessions: \n ${JSON.stringify(req.session)}`);
        console.log(`\nAPI Call completed...\n`);
      }).catch((error) => {
        console.log(`\nError: \n ${error}\n`);
      });    
    } catch(error) {
      res.status(500).send(error);
    }
  }).catch((error) => {
    console.log(error);
  });  
});


router.get('/callGreenApi', async (req, res) => {
  //get Accounts
  accounts = await msalTokenCache.getAllAccounts();
  console.log(`\nAccounts: \n ${JSON.stringify(accounts[0])}`);

  //Build the silent request
  const silentRequest = {
    account: accounts[0],
    scopes: authConfig.request.tokenRequest.scopes,
  }

  /** Acquire Token Silently - pulling the token from in-memory cache */
  cca.acquireTokenSilent(silentRequest).then((response) => {
    const accessToken = response.accessToken;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    }
    console.log(`\nHeaders: \n ${JSON.stringify(headers)}`);
    console.log(`\nURL: ${redApi}\n`);
    console.log(`\nCalling the API...\n`);
    try{
        axios({
        method: 'get',
        url: greenApi,
        headers: headers
      }).then((response) => {
        console.log(`\nResponse from API: \n ${JSON.stringify(response.data)}`);
        req.session.apiData = {data: response.data};
        const user = req.session.templateParams;
        const data = req.session.apiData;
        console.log(`\nData: \n${JSON.stringify(data)}\n`);
        res.render('result.ejs', {user: user, data: data});
        //console.log(`\nSessions: \n ${JSON.stringify(req.session)}`);
        console.log(`\nAPI Call completed...\n`);
      }).catch((error) => {
        console.log(`\nError: \n ${error}\n`);
      });    
    } catch(error) {
      res.status(500).send(error);
    }
  }).catch((error) => {
    console.log(error);
  });  
});


module.exports = router;
