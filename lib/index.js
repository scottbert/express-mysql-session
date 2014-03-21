/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
var fs = require('fs'),
	mysql,
	express,
	DEBUG = false,
	CHECK_EXPIRATION_INTERVAL = 900000,// 15 Minutes
	EXPIRATION = 86400000, // 1 Day
	RECONNECT_DELAY = 100; // We wait for this many milliseconds before trying to reconnect if our first (immediate) reconnect attempt fails.
/**
 * Extends Express's built in session store to handle MySQL.
 * @param {Object} options    {
 *          database: <database name>, // 'mydb'
			password: <database password>, // 'password'
			user: <database user>, // 'root'
			host: <database url>, // 'localhost'
			port: <database port>, // 3306
			express: <pass in a reference to express to save loading it again>, // optional
			mysql: <pass in a reference to mysql to save loading it again> // optional
		
 * }
 * @param {Object} connection optional connection. Used for unit testing.
 */
function SessionStore(options, connection) {
	"use strict";
	var expirationInterval;
	mysql = options.mysql || require('mysql');
	express = options.express || require('express');
	var sessionStore = new express.session.Store();
	options.debug = options.debug || DEBUG;

	/**
	 * Connects and reconnects the database if an unexpected disconnection occurs.
	 * @param  {Boolean} quiet omits console log.
	 */
	function reconnect(quiet) {
		if (!quiet) {
			console.log('express-mysql-session disconnected from MySQL. Reconnecting');
		}
		connection = connection || mysql.createConnection(options);
		connection.connect(function (err) {
			if (err) {
				setTimeout(function () {
					reconnect();
				}, options.reconnectDelay || RECONNECT_DELAY);
			} else {
				console.log('express-mysql-session connected to MySQL');
			}
		});
		connection.on('error', function (err) {
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				reconnect();
			}
		});
	}
	if (!connection) {
		reconnect(true);
	}
	/**
	 * Sync session store with database
	 * @param  {Function} callback function
	 */
	sessionStore.sync = function sync(callback) {
		fs.readFile(__dirname + '/../schema.sql', 'utf-8', function (error, sql) {
			connection.query(sql, function (error) {
				if (error) {
					if (options.debug) {
						console.log('Failed to initialize SessionStore');
						console.log(error);
					}
					return callback && callback(error);
				}
				sessionStore.clearExpiredSessions();
				sessionStore.setExpirationInterval();
				if (callback) {
					callback();
				}
			});
		});
	};
	/**
	 * get a session from the database
	 * @param  {String}   session_id 
	 * @param  {Function} callback
	 */
	sessionStore.get = function get(session_id, callback) {
		var sql = 'SELECT `data` FROM `sessions` WHERE `session_id` = ? LIMIT 1';
		var params = [ session_id ];
		connection.query(sql, params, function (error, rows) {
			if (error) {
				return callback(error, null);
			}
			var session = !!rows[0] ? JSON.parse(rows[0].data) : null;
			callback(null, session);
		});
	};

	/**
	 * set session data in the database
	 * @param {String}   session_id 
	 * @param {Object}   data       JSON object containing the data.
	 */
	sessionStore.set = function set(session_id, data, callback) {
		var sql = 'REPLACE INTO `sessions` SET ?';
		var expires = (data.cookie || {}).expires || Date.now() + (options.expiration || EXPIRATION);
		var params = {
			session_id: session_id,
			expires: Math.round(expires / 1000), // Use whole seconds.
			data: JSON.stringify(data)
		};
		connection.query(sql, params, function (error) {
			if (error) {
				return callback && callback(error);
			}
			if (callback) {
				callback();
			}
		});
	};
	/**
	 * Destroy a session
	 * @param  {String}   session_id 
	 * @param  {Function} callback   
	 */
	sessionStore.destroy = function destroy(session_id, callback) {
		var sql = 'DELETE FROM `sessions` WHERE `session_id` = ? LIMIT 1';
		var params = [ session_id ];
		connection.query(sql, params, function (error) {
			if (error) {
				if (options.debug) {
					console.log('Failed to destroy session: \'' + session_id + '\'');
					console.log(error);
				}
				return callback && callback(error);
			}
			if (callback) {
				callback();
			}
		});
	};
	/**
	 * Get number of sessions in database.
	 * @param  {Function} callback
	 */
	sessionStore.length = function length(callback) {
		var sql = 'SELECT COUNT(*) FROM `sessions`';
		connection.query(sql, function (error, rows) {
			if (error) {
				if (options.debug) {
					console.log('Failed to get number of sessions:');
					console.log(error);
				}
				return callback && callback(error);
			}
			var count = !!rows[0] ? rows[0]['COUNT(*)'] : 0;
			callback(null, count);
		});
	};
	/**
	 * Clear all sessions in database.
	 * @param  {Function} callback 
	 */
	sessionStore.clear = function clear(callback) {
		var sql = 'DELETE FROM `sessions`';
		connection.query(sql, function (error) {
			if (error) {
				return callback && callback(error);
			}
			if (callback) {
				callback();
			}
		});
	};
	/**
	 * Clear expired sessions from database.
	 * @param  {Function} callback 
	 */
	sessionStore.clearExpiredSessions = function clearExpiredSessions(callback) {
		var sql = 'DELETE FROM `sessions` WHERE `expires` < ?';
		var params = [ Math.round(Date.now() / 1000) ];
		connection.query(sql, params, function (error) {
			if (error) {
				if (options.debug) {
					console.log('Failed to delete expired sessions:\n', error);
				}
				return callback && callback(error);
			}
			if (callback) {
				callback();
			}
		});
	};
	sessionStore.setExpirationInterval = function setExpirationInterval(interval) {
		clearInterval(expirationInterval);
		expirationInterval = setInterval(sessionStore.clearExpiredSessions, options.checkExpirationInterval = (interval || options.checkExpirationInterval || CHECK_EXPIRATION_INTERVAL));
	};
	sessionStore.sync();
	sessionStore.connection = connection;
	return sessionStore;
}
module.exports = SessionStore;
