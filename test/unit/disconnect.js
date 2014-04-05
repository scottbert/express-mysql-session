/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
/* global describe:false, it:false */
//var chai = require('chai');
//var expect = chai.expect;

global.TestHook = {};
var SessionStore = require('../session-store.js');
//var TestManager = require('../test-manager.js');

describe('SessionStore#Disconnects', function () {
	"use strict";
	it('after the MySQL connection is terminated, the SessionStore should attempt to re-establish the connection', function(done) {

		global.TestHook.connection.destroy();
		global.TestHook.connection.emit('error', {code: 'PROTOCOL_CONNECTION_LOST'});

		var elapsedTime = 0, intervalTime = 100;

		var interval = setInterval(function() {

			elapsedTime += intervalTime;

			if (elapsedTime > 1500)
			{
				clearInterval(interval);
				return done(new Error('Failed to re-establish connection after disconnect'));
			}

			if (SessionStore.getConnectionState() === 'authenticated')
			{
				clearInterval(interval);
				done();
			}

		}, intervalTime);

	});


});