/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
/* global before:false, after:false, describe:false, it:false */
var async = require('async');
var chai = require('chai');
var expect = chai.expect;

var SessionStore = require('../session-store.js');
var TestManager = require('../test-manager.js');

describe('SessionStore#get(session_id, cb)', function () {
	"use strict";
	before(TestManager.tearDown);
	before(TestManager.setUp);
	after(TestManager.tearDown);

	var fixtures = require('../fixtures/sessions');

	describe(', when a session exists,', function () {

		before(TestManager.populateSessions);

		it('should return its session data', function (done) {

			async.each(fixtures, function (fixture, nextFixture) {

				var session_id = fixture.session_id;
				var data = fixture.data;

				SessionStore.get(session_id, function (error, session) {

					expect(error).to.equal(null);
					expect(JSON.stringify(session)).to.equal(JSON.stringify(data));

					nextFixture();

				});

			}, done);

		});

	});

	describe(', when a session does not exist,', function () {

		before(TestManager.clearSessions);

		it('should return null', function (done) {

			async.each(fixtures, function (fixture, nextFixture) {

				var session_id = fixture.session_id;

				SessionStore.get(session_id, function (error, session) {

					expect(error).to.equal(null);
					expect(session).to.equal(null);

					nextFixture();

				});

			}, done);

		});

	});

});