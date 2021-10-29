const express = require("express");
const createHandler = require("azure-function-express").createHandler;
const passport = require("passport");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;
const config = require("../authConfig.json");

const options = {
  identityMetadata: `https://${config.authority}/${config.tenantID}/${config.version}/${config.discovery}`,
  issuer: `https://${config.authority}/${config.tenantID}/${config.version}`,
  clientID: config.clientID,
  audience: config.audience,
  validateIssuer: config.validateIssuer,
  passReqToCallback: config.passReqToCallback,
  loggingLevel: config.loggingLevel,
  scope: config.scope,
};

const bearerStrategy = new BearerStrategy(options, function (token, done) {
  done(null, {}, token);
});

const app = express();

app.use(express.urlencoded({ urlencoded: false }));
app.use(express.json());
app.use(passport.initialize());
passport.use(bearerStrategy);

// Enable CORS (for local testing only -remove in production/deployment)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    status: "200",
    message: "Access API: Test Passed",
  });
});

// Expose and protect API endpoint
app.get("/api/red", passport.authenticate("oauth-bearer", { session: false }), (req, res) => {
    console.log(`\nRequest: \n ${JSON.stringify(req.headers.authorization)}`);
    const request = req.headers.authorization;
    const token = request.split(' ');
    console.log(token[1]);
    try {
      res.status(200).json({
        "name": req.authInfo["name"],
        "issued-by": req.authInfo["iss"],
        "issued-for": req.authInfo["aud"],
        "using-scope": req.authInfo["scope"],
        "output": "red",
        "message": "You called the Red api.",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
);

app.get("/api/green", passport.authenticate("oauth-bearer", { session: false }), (req, res) => {
    console.log(`\nRequest: \n ${JSON.stringify(req.headers.authorization)}`);
    const request = req.headers.authorization;
    const token = request.split(' ');
    console.log(token[1]);
    try {
      res.status(200).json({
        "name": req.authInfo["name"],
        "issued-by": req.authInfo["iss"],
        "issued-for": req.authInfo["aud"],
        "using-scope": req.authInfo["scope"],
        "output": "green",
        "message": "You called the Green api.",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }
);

module.exports = createHandler(app);
