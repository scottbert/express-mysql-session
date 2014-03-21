/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
/* global before:false, after:false, describe:false, it:false */
var chai = require('chai');
var expect = chai.expect;

var SessionStore = require('../session-store.js');
var TestManager = require('../test-manager.js');

describe('SessionStore#clear(cb)', function () {
	"use strict";
	before(TestManager.tearDown);
	before(TestManager.setUp);
	after(TestManager.tearDown);

	describe(', when sessions exist,', function () {

		before(TestManager.populateSessions);

		it('should delete all existing sessions', function (done) {

			SessionStore.clear(function (error) {

				expect(error).to.equal(undefined);

				SessionStore.length(function (error, count) {

					expect(error).to.equal(null);
					expect(count).to.equal(0);
					done();

				});

			});

		});

	});

});