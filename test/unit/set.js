/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
/* global before:false, after:false, describe:false, it:false */
var async = require('async');
var chai = require('chai');
var expect = chai.expect;

var SessionStore = require('../session-store.js');
var TestManager = require('../test-manager.js');

describe('SessionStore#set(session_id, data, cb)', function () {
	"use strict";
	before(TestManager.tearDown);
	before(TestManager.setUp);
	after(TestManager.tearDown);

	var fixtures = require('../fixtures/sessions');

	describe(', when the session does not exist yet,', function () {

		after(TestManager.clearSessions);

		it('should create a new session', function (done) {

			async.each(fixtures, function (fixture, nextFixture) {

				var session_id = fixture.session_id;
				var data = fixture.data;

				SessionStore.set(session_id, data, function (error) {

					expect(error).to.equal(undefined);

					SessionStore.get(session_id, function (error, session) {

						if (error) {
							return nextFixture(new Error(error));
						}

						expect(error).to.equal(null);
						expect(JSON.stringify(session)).to.equal(JSON.stringify(data));

						nextFixture();

					});

				});

			}, done);

		});

	});

	describe(', when the session already exists,', function () {

		before(TestManager.populateSessions);

		it('should update the existing session with the new data', function (done) {

			async.each(fixtures, function (fixture, nextFixture) {

				var session_id = fixture.session_id;
				var data = fixture.data;

				data.new_attr = 'A new attribute!';
				data.and_another = 'And another attribute..';
				data.some_date = (new Date()).toString();
				data.an_int_attr = 55;

				SessionStore.set(session_id, data, function (error) {

					expect(error).to.equal(undefined);

					SessionStore.get(session_id, function (error, session) {

						if (error) {
							return nextFixture(new Error(error));
						}

						expect(error).to.equal(null);
						expect(JSON.stringify(session)).to.equal(JSON.stringify(data));

						nextFixture();

					});

				});

			}, done);

		});

	});

});