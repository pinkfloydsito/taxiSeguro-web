// import openSocket from 'socket.io-client';

// const socket = openSocket('http://localhost:9000');
var socket = require('socket.io-client')('http://localhost:9000');

export { socket };
