#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var io = require('socket.io-client');
var jwt = require('jsonwebtoken');

var generateAccessToken = function(payload, secret, expiration) {
    var token = jwt.sign(payload, secret, {
        expiresIn: expiration
    });

    return token;
};

// Get secret key from the config file and generate an access token
var getUserHome = function () {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports = function(options) {
	var cncrc = path.resolve(getUserHome(), '.cncrc');
	var config = JSON.parse(fs.readFileSync(cncrc, 'utf8'));
	var token = generateAccessToken({ id: '', name: 'pendant' }, config.secret, '30d');

	socket = io.connect('ws://' + options.socketAddress + ':' + options.socketPort, {
        'query': 'token=' + token
	});
    socket.on('connect', () => {
        console.log('[socket.io] Connected to ' + options.socketAddress + ':' + options.socketPort);

		// Open port
		socket.emit('open', options.port, {
			baudrate: Number(options.baudrate),
			controllerType: options.controllerType
		});
    });

    socket.on('error', () => {
        console.error('[socket.io] Error');
        if (socket) {
            socket.destroy();
            socket = null;
        }
    });

    socket.on('close', () => {
        console.log('[socket.io] Connection close');
    });

	socket.on('serialport:open', function (options) {
		const { controllerType, port, baudrate, inuse } = options;
		console.log('[pendant] Connected to port "' + options.port + '" (Baud rate: ' + options.baudrate + ')');
	});

	socket.on('Grbl:state', function(state) {
        console.log('[Grbl]', state.status.raw || '');
	});
};
