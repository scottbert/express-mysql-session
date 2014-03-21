/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
var async = require('async');
var fs = require('fs');

var SessionStore = require('./session-store');
(function () {
	"use strict";
	module.exports = {

		setUp: function (done) {

			SessionStore.sync(function (error) {

				if (error) {
					return done(new Error(error));
				}
				done();
			});
		},
		tearDown: function (done) {
			var sql = fs.readFileSync(__dirname + '/tear-down.sql', 'utf-8');
			SessionStore.connection.query(sql, function (error) {
				if (error) {
					return done(new Error(error));
				}
				done();
			});
		},
		populateSessions: function (done) {
			var fixtures = require('./fixtures/sessions');
			async.each(fixtures, function (fixture, nextFixture) {
				var session_id = fixture.session_id;
				var data = fixture.data;
				SessionStore.set(session_id, data, nextFixture);
			}, function (error) {
				if (error) {
					return done(new Error(error));
				}
				done();
			});
		},
		clearSessions: function (done) {
			SessionStore.clear(function (error) {
				if (error) {
					return done(new Error(error));
				}
				done();
			});
		}
	};
}());