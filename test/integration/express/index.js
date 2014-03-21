/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
/* global before:false, after:false, describe:false, it:false, unescape:false */
var app = require('./app');
var express = require('express');
var TestManager = require('../../test-manager');

var chai = require('chai');
var expect = chai.expect;
var http = require('http');

describe('', function () {
	"use strict";
	before(TestManager.tearDown);
	before(TestManager.setUp);
	after(TestManager.tearDown);

	describe('Sessions for a single client', function () {

		it('should persist between requests', function (done) {
			var req = http.get({

				hostname: app.get('host'),
				port: app.get('port'),
				path: '/test'

			}, function (res) {

				expect(res.statusCode).to.equal(200);

				expect(res.headers['set-cookie']).to.be.an('array');

				var cookieJar = res.headers['set-cookie'];
				var sessionCookie = getSessionCookie(cookieJar);

				expect(sessionCookie).to.not.equal(false);

				var req2 = http.get({

					hostname: app.get('host'),
					port: app.get('port'),
					path: '/test',
					headers: {
						'Cookie': cookieJar
					}

				}, function (res2) {

					expect(res2.statusCode).to.equal(200);
					expect(res2.headers['set-cookie']).to.equal(undefined);

					done();

				});

				req2.on('error', function (e) {

					done(new Error('Problem with request: ' + e.message));

				});

			});

			req.on('error', function (e) {

				done(new Error('Problem with request: ' + e.message));

			});

		});

	});

	describe('Sessions for different clients', function () {

		it('should not persist between requests', function (done) {


			var req = http.get({

				hostname: app.get('host'),
				port: app.get('port'),
				path: '/test'

			}, function (res) {

				expect(res.statusCode).to.equal(200);

				expect(res.headers['set-cookie']).to.be.an('array');

				var cookieJar = res.headers['set-cookie'];
				var sessionCookie = getSessionCookie(cookieJar);

				expect(sessionCookie).to.not.equal(false);

				var req2 = http.get({

					hostname: app.get('host'),
					port: app.get('port'),
					path: '/test'

					// Don't pass the cookie jar this time.

				}, function (res2) {

					expect(res2.statusCode).to.equal(200);
					expect(res2.headers['set-cookie']).to.not.equal(undefined);

					done();

				});

				req2.on('error', function (e) {

					done(new Error('Problem with request: ' + e.message));

				});

			});

			req.on('error', function (e) {

				done(new Error('Problem with request: ' + e.message));

			});

		});

	});

});

function getSessionCookie(cookies) {
	"use strict";
	var sessionCookie = false;

	for (var i in cookies) {
		if (cookies.hasOwnProperty(i)) {
			var parts = cookies[i].split(';');

			for (var n = 0; n < parts.length; n++)
			{
				parts[n] = parts[n].split('=');
				parts[n][0] = unescape(parts[n][0].trim().toLowerCase());
			}

			var name = parts[0][0];

			if (name === app.get('session_cookie_name')) {
				return cookies[i];
			}
		}
	}

	return sessionCookie;

}