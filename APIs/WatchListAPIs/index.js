const express = require("express");
const createHandler = require("azure-function-express").createHandler;
const dotenv = require('dotenv');
// const mongoose = require('azure-functions-mongooser');
const mongoose1 = require('mongoose');
const passport = require("passport");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;
const config = require("../authConfig.json");
const Item = require('./models/Items');

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

// Load .env
dotenv.config();

const db = process.env.DB_CONNECT;
mongoose1.connect(db)
        .then(() => console.log(`Successfully connected to DB....`))
        .catch((err) => console.log(err));

const app = express();

app.use(express.urlencoded({ urlencoded: false }));
app.use(express.json({ type: 'application/*+json' }));
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

app.get("/api/watchlist/test", (req, res) => {
  res.status(200).json({
    status: "Success", 
    message: "Access Watchlist API: Success!",
  });
});


/** Create a new Watchlist item and add it to DB. */
app.post('/api/watchlist/addItem', async (req, res) => {
    console.log(`Brreakpoint 1`);
    console.log(req.header);
    const item = new Item({
        movie_title: req.body.title,
        genre: req.body.genre,
    });

    try {
        const newItem = await item.save();
        res.status(200).json({
            status: "success",
            message: `Item added to watchlist successfully`,
            watchlist_item: {
                movie_title: item.movie_title,
                genre: item.genre, 
            }
        });
    } catch(err) {
        res.status(400).send({status: "failure", error: err});
    }
});

module.exports = createHandler(app);