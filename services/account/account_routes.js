var express = require('express');
router = express.Router();

const axios = require('axios')

var { OAuth2Client } = require('google-auth-library');
var verifier = require('google-id-token-verifier');


//LOGIN ROUTES /////////////////////////////////////////////////////////

// Google login
router.post('/googleSignIn', function (req, res) {
    // Get token from page
    var token = req.body.tokenid;
    //console.log(token);

    var clientId = "533024552572-ltbl4ks1kib5qod9cgihc2ppjhcdem2l.apps.googleusercontent.com";

    verifier.verify(token, clientId, async function (err, tokenInfo) {
        if (!err) {
            // Token is valid

            tokenInfo.logged = true

            // Get user data from Google
            var _user = req.body.user

            try {
                // Get user from /user -> Create if not exists
                var user = (await axios.put(app_domain + '/user/id_google', _user)).data;
            }
            catch (err) {
                console.log(err)
            }

            // Set session variable
            req.session.user = user
            req.session.logged_with = "GOOGLE"

            // Send data to page
            res.json(tokenInfo);
        }
        else {
            console.log(err)
            res.json({ logged: false });
        }
    });
});

// Facebook login
router.post('/facebookSignIn', async function (req, res) {
    // Get token from page
    var token = req.body.tokenid;
    //console.log(token);

    //get app token
    var app_token = (await axios.get("https://graph.facebook.com/oauth/access_token?client_id=2178730182445130&client_secret=ea1da7f5d63016176122012d80b2be4c&grant_type=client_credentials")).data.access_token;
    console.log("GOT APP TOKEN");

    //check token validity
    var token_validity = (await axios.get("https://graph.facebook.com/debug_token?input_token=" + token + "&access_token=" + app_token)).data;

    if (token_validity.data.is_valid == true) {
        console.log("TOKEN IS VALID");
        var _user = req.body.user
        console.log(_user);

        try {
            // Get user from /user -> Create if not exists
            var user = (await axios.put(app_domain + '/user/id_facebook', _user)).data;
        }
        catch (err) {
            console.log(err)
        }

        req.session.user = user;
        req.session.logged_with = "FACEBOOK";

        res.json(token_validity);
    }
    else {
        res.json({ logged: false });
    }
});

// Mail register
router.post('/mailRegister', async function (req, res) {
    //get mail, name and password
    var userData = req.body.userdata;

    //check if the mail is already present
    try {
        var users = (await axios.get(app_domain + '/user/mail/' + userData.email, userData)).data;
    }
    catch (err) {
        console.log(err)
    }

    //If it is already present, he can not register
    if (users.length > 0) {
        res.json({ registered: false });
    }
    else {
        //add them to the database to initialize the user
        try {
            var user = (await axios.put(app_domain + '/user/mail', userData)).data;
        }
        catch (err) {
            console.log(err)
        }

        //log the user in
        try {
            user = (await axios.post(app_domain + '/account/mailSignIn', userData)).data;
        }
        catch (err) {
            console.log(err)
        }

        res.json({ registered: true });
    }


});

// Mail login
router.post('/mailSignIn', async function (req, res) {
    //get mail and password
    /* var userData = req.body.userdata;
 
     //check if the user exists
     try {
         var userInDB = (await axios.get(app_domain + '/user/mail/' + userData.email)).data;
     }
     catch (err) {
         console.log(err)
     }
 
     //if it exists, check if the password is correct, log him in
     if(userInDB.password == userData.password)
     {
         req.session.user = userInDB;
         req.session.logged_with = "MAIL"
         res.json({ logged: true });
     }
     else
         res.json({ logged: false });
 */
    try {
        var user = (await axios.get(app_domain + '/user/' + '5c49e7f329202200177264e7')).data;
        req.session.user = user
        req.session.logged_with = "MAIL"
    }
    catch (err) {
        console.log(err)
    }

    res.json({ logged: true });
});


// EXPORT
module.exports.router = router;