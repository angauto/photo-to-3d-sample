/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

//-------------------------------------------------------------------
// These packages are included in package.json.
// Run `npm install` to install them.
// 'path' is part of Node.js and thus not inside package.json.
//-------------------------------------------------------------------
var express = require('express');           // For web server
var Axios = require('axios');               // A Promised base http client
var bodyParser = require('body-parser');    // Receive JSON format

// Set up Express web server
var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/www'));

// This is for web server to start listening to port 5000
app.set('port', 5000);
var server = app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + server.address().port);
});

//-------------------------------------------------------------------
// Configuration for your Forge account
// Initialize the 3-legged OAuth2 client, and
// set specific scopes
//-------------------------------------------------------------------
var FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID;          // Get from env or replace with your ID
var FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET;  // Get from env or replace with your secret
var FORGE_CALLBACK_URL = 'http://localhost:5000/callback';
var scopes = 'data:read data:write';
const querystring = require('querystring');

// Route /auth
// Redirect to Autodesk sign in page for end user to login
app.get('/auth', function (req, res) {
    var redirect_uri = 'https://developer.api.autodesk.com/authentication/v1/authorize?'
    + 'response_type=code'
    + '&client_id=' + FORGE_CLIENT_ID
    + '&redirect_uri=' + encodeURIComponent(FORGE_CALLBACK_URL)
    + '&scope=' + encodeURIComponent(scopes);
    res.redirect(redirect_uri);
});

// Route /callback
// Get Authorization code from Autodesk signin
app.get('/callback', function (req, res) {
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/gettoken',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: querystring.stringify({
            client_id: FORGE_CLIENT_ID,
            client_secret: FORGE_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: FORGE_CALLBACK_URL
        })
    })
        .then(function (response) {
            // Success
            access_token = response.data.access_token;
            console.log(response);
            res.send('<p>Authentication success! Here is your token:</p>' + access_token);
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});
