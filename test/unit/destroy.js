/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
/* global before:false, after:false, describe:false, it:false */
var async = require('async');
var chai = require('chai');
var expect = chai.expect;

var SessionStore = require('../session-store.js');
var TestManager = require('../test-manager.js');

describe('SessionStore#destroy(session_id, cb)', function () {
	"use strict";
	before(TestManager.tearDown);
	before(TestManager.setUp);
	after(TestManager.tearDown);

	var fixtures = require('../fixtures/sessions');

	describe(', when the session exists,', function () {

		before(TestManager.populateSessions);

		it('should delete the session', function (done) {

			async.each(fixtures, function (fixture, nextFixture) {

				var session_id = fixture.session_id;

				SessionStore.destroy(session_id, function (error) {

					expect(error).to.equal(undefined);

					SessionStore.get(session_id, function (error, session) {

						if (error) {
							return nextFixture(new Error(error));
						}

						expect(session).to.equal(null);

						nextFixture();

					});

				});

			}, done);

		});

	});

	describe(', when the session does not exist,', function () {

		before(TestManager.clearSessions);

		it('should do nothing', function (done) {

			async.each(fixtures, function (fixture, nextFixture) {

				var session_id = fixture.session_id;

				SessionStore.destroy(session_id, function (error) {

					expect(error).to.equal(undefined);

					nextFixture();

				});

			}, done);

		});

	});

});