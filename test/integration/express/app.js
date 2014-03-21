/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
(function () {
	"use strict";
	var express = require('express');
	var app = module.exports = express();

	var SessionStore = require('../../session-store');

	var session_cookie_name = 'express.sid';
	var session_cookie_secret = 'some_secret';

	app.set('host', 'localhost');
	app.set('port', 3000);
	app.set('session_cookie_name', session_cookie_name);
	app.set('session_cookie_secret', session_cookie_secret);

	app.configure(function () {

		app.use(express.logger());
		app.use(express.cookieParser());
		app.use(express.bodyParser());

		app.use(express.session({

			key: session_cookie_name,
			secret: session_cookie_secret,
			store: SessionStore

		}));

	});

	app.listen(app.get('port'));

	app.get('/test', function (req, res) {

		res.json(200, 'hi!');

	});
}());