// INCLUDES
var express = require('express');
var app = express();                                    // create our app w/ express
var session = require('express-session');

var bodyParser = require('body-parser');                // pull information from HTML POST (express4)
var path = require('path');
var morgan = require('morgan');                         // log requests to the console (express4)

global.app_domain = "https://safexchange.herokuapp.com" //"http://localhost:8080"

// CONFIGURATION
app.use(session({ secret: 'ssshhhhh', resave: true, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));        // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({ extended: true }));             // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json

// Choose what port to use. If deployed on heroku process.env.PORT will be set and therefore used
const PORT = process.env.PORT || 8080

/** middleware route to support CORS and preflighted requests */
app.use(function (req, res, next) {
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Credentials", false);
        res.header("Access-Control-Max-Age", '86400'); // 24 hours
        res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    }
    else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }

    next();
});


// Include DATABASE routes
var db_routes = require('./services/database/database_routes.js');
app.use('/database', db_routes);

// Include INTERFACE routes
var interface_module = require('./services/interface/interface_routes.js');
interface_module.setup_env(app);
app.use('/interface', interface_module.router);

// Include REDIRECT routes
var redirect_module = require('./services/redirect/redirect_routes.js');
app.use('/redirect', redirect_module);

// Include ACTION routes
var action_module = require('./services/action/action_routes.js');
app.use('/action', action_module);

// Include ACCOUNT routes
var account_module = require('./services/account/account_routes.js');
app.use('/account', account_module);

// Include USER routes
var user_routes = require('./services/user/user_routes.js');
app.use('/user', user_routes);

// Include PLANNED ACTION routes
var plannedaction_routes = require('./services/plannedaction/plannedaction_routes.js');
app.use('/plannedaction', plannedaction_routes);

// Include PRICE routes
var price_routes = require('./services/price/price_routes.js');
app.use('/price', price_routes);

// Include TRANSACTION routes
var transaction_routes = require('./services/transaction/transaction_routes.js');
app.use('/transaction', transaction_routes);



// listen (start app with node server.js) ======================================
app.listen(PORT, function () {
    console.log('App listening on port ' + PORT);
});